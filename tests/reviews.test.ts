import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, writeFile, unlink, rmdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { PGlite } from "@electric-sql/pglite";
import { validateReview } from "../src/lib/review-schema";
import { LocalReviews } from "../src/lib/local-reviews";
import { POST as submit } from "../src/app/api/reviews/route";
import { PATCH as moderate } from "../src/app/api/admin/reviews/[id]/route";

const input = () => ({
  name: "Test Learner",
  rating: 4,
  text: "The practical preparation exercise helped me follow the docking workflow.",
  submissionToken: randomUUID(),
  website: "",
});
test("Review validation rejects invalid ratings, spam and attempts to self-approve", () => {
  assert.equal(
    validateReview({ ...input(), name: "  Test Learner  " }).name,
    "Test Learner",
  );
  for (const rating of [0, 6, 2.5, "5"])
    assert.throws(() => validateReview({ ...input(), rating }));
  assert.throws(() => validateReview({ ...input(), name: " ", text: "short" }));
  assert.throws(() => validateReview({ ...input(), website: "spam.example" }));
  assert.throws(() => validateReview({ ...input(), status: "approved" }));
});
test("Local review submission, approval, persistence, reactions and limits", async () => {
  const dir = await mkdtemp(join(tmpdir(), "chemizen-review-test-"));
  const path = join(dir, "reviews.json");
  try {
    const store = new LocalReviews(path);
    const body = input();
    const first = await store.submit(body, "hash", "network");
    assert.equal((await store.list("approved")).count, 0);
    assert.equal((await store.list("pending")).count, 1);
    assert.deepEqual(await store.submit(body, "hash", "network"), {
      id: first.id,
      duplicate: true,
    });
    await assert.rejects(
      store.submit(body, "changed", "network"),
      /already submitted/,
    );
    await assert.rejects(
      store.helpful(first.id, "voter", true, "reactions"),
      /not found/,
    );
    await store.moderate(first.id, "approved");
    const restarted = new LocalReviews(path);
    const approved = await restarted.list("approved");
    assert.equal(approved.rows[0].id, first.id);
    assert.equal("token" in approved.rows[0], false);
    assert.equal("hash" in approved.rows[0], false);
    assert.equal(
      (await restarted.helpful(first.id, "voter", true, "reactions")).count,
      1,
    );
    assert.equal(
      (await restarted.helpful(first.id, "voter", true, "reactions")).count,
      1,
    );
    assert.equal(
      (await restarted.helpful(first.id, "voter", false, "reactions")).count,
      0,
    );
    await restarted.moderate(first.id, "rejected");
    assert.equal((await restarted.list("approved")).count, 0);
    await restarted.submit(input(), "b", "network");
    await restarted.submit(input(), "c", "network");
    await assert.rejects(
      restarted.submit(input(), "d", "network"),
      /Too many reviews/,
    );
    assert.equal((await restarted.list("pending")).count, 2);
  } finally {
    await unlink(path).catch(() => {});
    await rmdir(dir);
  }
});
test("Separate server module instances share writes, migrate older stores and select only highly rated reviews", async () => {
  const dir = await mkdtemp(join(tmpdir(), "chemizen-review-reload-"));
  const path = join(dir, "reviews.json");
  try {
    const pageStore = new LocalReviews(path, 100);
    const apiStore = new LocalReviews(path, 100);
    const ratings = [2, 5, 3, 4];
    const saved = await Promise.all(
      ratings.map((rating, i) =>
        (i % 2 ? apiStore : pageStore).submit(
          { ...input(), rating },
          `hash-${i}`,
          "network",
        ),
      ),
    );
    await Promise.all(
      saved.map((r, i) =>
        (i % 2 ? pageStore : apiStore).moderate(r.id, "approved"),
      ),
    );
    assert.equal((await apiStore.list("approved")).count, 4);
    assert.deepEqual(
      (await pageStore.list("approved", 1, 3, true, 4)).rows.map(
        (r) => r.rating,
      ),
      [5, 4],
    );
    const old = JSON.parse(await readFile(path, "utf8"));
    delete old.votes;
    await writeFile(path, JSON.stringify(old));
    assert.deepEqual(
      await apiStore.helpful(saved[0].id, "visitor", true, "reactions"),
      { liked: true, count: 1 },
    );
    assert.equal(
      (await pageStore.list("approved")).rows.find((r) => r.id === saved[0].id)
        ?.helpful_count,
      1,
    );
  } finally {
    await unlink(path).catch(() => {});
    await rmdir(dir);
  }
});

test("PostgreSQL review RLS, moderation, idempotency and helpful votes", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to public;",
    );
    await db.exec(
      await readFile("supabase/migrations/001_enquiries.sql", "utf8"),
    );
    await db.exec(
      await readFile("supabase/migrations/002_reviews.sql", "utf8"),
    );
    const admin = randomUUID(),
      other = randomUUID(),
      token = randomUUID();
    await db.query("insert into auth.users(id) values($1),($2)", [
      admin,
      other,
    ]);
    await db.query("insert into public.admin_members(user_id) values($1)", [
      admin,
    ]);
    const save = async (tok: string, hash = "hash", key = "network") =>
      (
        await db.query<{ result: { id: string; duplicate: boolean } }>(
          "select public.submit_review($1,'Test Learner',4,'A useful hands-on workshop with clear preparation steps.',$2,$3) as result",
          [tok, hash, key],
        )
      ).rows[0].result;
    const first = await save(token);
    await t.test(
      "Submission starts pending and retries remain unique",
      async () => {
        assert.equal(
          (
            await db.query<{ status: string }>(
              "select status from public.reviews where id=$1",
              [first.id],
            )
          ).rows[0].status,
          "pending",
        );
        assert.deepEqual(await save(token), { id: first.id, duplicate: true });
        await assert.rejects(save(token, "different"), /TOKEN_CONFLICT/);
      },
    );
    await t.test(
      "Anonymous readers cannot see pending records or modify them",
      async () => {
        await db.exec("set role anon");
        assert.equal(
          (await db.query("select id,name,text from public.reviews")).rows
            .length,
          0,
        );
        await assert.rejects(
          db.query("select submission_token,payload_hash from public.reviews"),
          /permission denied/,
        );
        await assert.rejects(
          db.query("update public.reviews set status='approved'"),
          /permission denied/,
        );
        await assert.rejects(save(randomUUID()), /permission denied/);
        await db.exec("reset role");
      },
    );
    await t.test(
      "A signed-in non-admin cannot approve or read drafts",
      async () => {
        await db.exec(
          `set role authenticated;set request.jwt.claim.sub='${other}'`,
        );
        assert.equal(
          (await db.query("select id from public.reviews")).rows.length,
          0,
        );
        assert.equal(
          (
            await db.query(
              "update public.reviews set status='approved' returning id",
            )
          ).rows.length,
          0,
        );
        await db.exec("reset role");
      },
    );
    await t.test(
      "Admin approval publishes; rejection removes public visibility",
      async () => {
        await db.exec(
          `set role authenticated;set request.jwt.claim.sub='${admin}'`,
        );
        assert.equal(
          (await db.query("select id from public.reviews")).rows.length,
          1,
        );
        await db.query(
          "update public.reviews set status='approved' where id=$1",
          [first.id],
        );
        await assert.rejects(
          db.query("update public.reviews set name='Edited'"),
          /permission denied/,
        );
        await db.exec("reset role;set role anon");
        assert.equal(
          (await db.query("select id,name,rating,text from public.reviews"))
            .rows.length,
          1,
        );
        await db.exec(
          `reset role;set role authenticated;set request.jwt.claim.sub='${admin}'`,
        );
        await db.query(
          "update public.reviews set status='rejected' where id=$1",
          [first.id],
        );
        await db.exec("reset role;set role anon");
        assert.equal(
          (await db.query("select id from public.reviews")).rows.length,
          0,
        );
        await db.exec("reset role");
      },
    );
    await t.test(
      "Reactions are unique, reversible and restricted to approved reviews",
      async () => {
        const vote = async (liked: boolean) =>
          (
            await db.query<{ result: { count: number } }>(
              "select public.set_review_helpful($1,'hashed-voter',$2,'reaction-network') as result",
              [first.id, liked],
            )
          ).rows[0].result;
        await assert.rejects(vote(true), /NOT_FOUND/);
        await db.query(
          "update public.reviews set status='approved' where id=$1",
          [first.id],
        );
        assert.equal((await vote(true)).count, 1);
        assert.equal((await vote(true)).count, 1);
        assert.equal((await vote(false)).count, 0);
        await db.exec("set role anon");
        await assert.rejects(
          db.query("select * from public.review_helpful_votes"),
          /permission denied/,
        );
        await assert.rejects(vote(true), /permission denied/);
        await db.exec("reset role");
      },
    );
    await t.test(
      "Rate limits reject excess submissions without publishing any",
      async () => {
        await save(randomUUID(), "b");
        await save(randomUUID(), "c");
        await assert.rejects(save(randomUUID(), "d"), /RATE_LIMIT/);
        await assert.rejects(
          db.query(
            "insert into public.reviews(submission_token,payload_hash,name,rating,text) values($1,'hash','Name',6,'This is a sufficiently long review.')",
            [randomUUID()],
          ),
          /check constraint/,
        );
      },
    );
  } finally {
    await db.close();
  }
});
test("Review API rejects cross-origin submissions and unauthorised moderation", async () => {
  const keys = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "APP_ORIGIN",
    "NODE_ENV",
  ];
  const previous = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  keys.forEach((k) => delete process.env[k]);
  Object.assign(process.env, {
    NODE_ENV: "test",
    APP_ORIGIN: "http://localhost:3000",
  });
  const req = (method: string, origin = "http://localhost:3000") =>
    new Request("http://localhost:3000/api/reviews", {
      method,
      headers: { origin, "Content-Type": "application/json" },
      body: JSON.stringify(input()),
    });
  try {
    assert.equal(
      (await submit(req("POST", "https://elsewhere.example"))).status,
      403,
    );
    assert.equal((await submit(req("POST"))).status, 503);
    assert.equal(
      (
        await moderate(req("PATCH"), {
          params: Promise.resolve({ id: randomUUID() }),
        })
      ).status,
      401,
    );
  } finally {
    keys.forEach((k) => {
      if (previous[k] === undefined) delete process.env[k];
      else process.env[k] = previous[k];
    });
  }
});
