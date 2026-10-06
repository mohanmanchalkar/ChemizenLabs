import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
test("PostgreSQL migration: persistence, deduplication, limits, RLS and notification claims", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to public;`,
    );
    await db.exec(
      await readFile("supabase/migrations/001_enquiries.sql", "utf8"),
    );
    const payload = {
      name: "Test Researcher",
      email: "researcher@example.com",
      phone: "",
      institution: "",
      service: "CADD & molecular docking",
      message: "Please discuss research training opportunities with me.",
      consent: true,
    };
    const token = randomUUID();
    let id = "";
    async function save(
      tok: string,
      hash: string,
      ip = "ip1",
      email = "email1",
    ) {
      const r = await db.query<{ result: { id: string; duplicate: boolean } }>(
        "select public.submit_enquiry($1,$2::jsonb,$3,$4,$5) as result",
        [tok, JSON.stringify(payload), hash, ip, email],
      );
      return r.rows[0].result;
    }
    await t.test("Save, retry and payload conflict", async () => {
      const first = await save(token, "hash");
      id = first.id;
      assert.equal(first.duplicate, false);
      const again = await save(token, "hash");
      assert.equal(again.id, id);
      assert.equal(again.duplicate, true);
      await assert.rejects(save(token, "changed"), /TOKEN_CONFLICT/);
      assert.equal(
        (
          await db.query<{ n: number }>(
            "select count(*)::int as n from public.enquiries",
          )
        ).rows[0].n,
        1,
      );
    });
    await t.test(
      "Email limit and network limit are enforced atomically",
      async () => {
        await save(randomUUID(), "a");
        await save(randomUUID(), "b");
        await assert.rejects(save(randomUUID(), "c"), /RATE_LIMIT/);
        for (let i = 0; i < 5; i++)
          await save(randomUUID(), "hash" + i, "ip2", "other" + i);
        await assert.rejects(
          save(randomUUID(), "over", "ip2", "other6"),
          /RATE_LIMIT/,
        );
      },
    );
    await t.test("Anonymous access and RPC calls are denied", async () => {
      await db.exec("set role anon");
      try {
        await assert.rejects(
          db.query("select * from public.enquiries"),
          /permission denied/,
        );
        await assert.rejects(save(randomUUID(), "h"), /permission denied/);
      } finally {
        await db.exec("reset role");
      }
    });
    await t.test(
      "Authenticated non-admin cannot see or modify enquiries",
      async () => {
        const user = randomUUID();
        await db.query("insert into auth.users(id) values($1)", [user]);
        await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
          user,
        ]);
        await db.exec("set role authenticated");
        try {
          assert.equal(
            (await db.query("select * from public.enquiries")).rows.length,
            0,
          );
          assert.equal(
            (
              await db.query(
                "update public.enquiries set status='closed' returning id",
              )
            ).rows.length,
            0,
          );
          await assert.rejects(
            db.query(
              "insert into public.admin_members(user_id) values(auth.uid())",
            ),
            /permission denied/,
          );
        } finally {
          await db.exec("reset role");
        }
      },
    );
    await t.test(
      "Admin can read and change status but cannot rewrite contact data",
      async () => {
        const admin = randomUUID();
        await db.query("insert into auth.users(id) values($1)", [admin]);
        await db.query("insert into public.admin_members(user_id) values($1)", [
          admin,
        ]);
        await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
          admin,
        ]);
        await db.exec("set role authenticated");
        try {
          assert.ok(
            (await db.query("select id from public.enquiries")).rows.length > 0,
          );
          await db.query(
            "update public.enquiries set status='contacted' where id=$1",
            [id],
          );
          assert.equal(
            (
              await db.query<{ status: string }>(
                "select status from public.enquiries where id=$1",
                [id],
              )
            ).rows[0].status,
            "contacted",
          );
          await assert.rejects(
            db.query(
              "update public.enquiries set email='changed@example.com' where id=$1",
              [id],
            ),
            /permission denied/,
          );
        } finally {
          await db.exec("reset role");
        }
      },
    );
    await t.test(
      "Only one sender can claim an email; failures can be retried",
      async () => {
        const claim = async () =>
          (
            await db.query<{ claimed: boolean }>(
              "select public.claim_enquiry_notification($1) as claimed",
              [id],
            )
          ).rows[0].claimed;
        assert.equal(await claim(), true);
        assert.equal(await claim(), false);
        await db.query(
          "update public.enquiries set email_status='failed' where id=$1",
          [id],
        );
        assert.equal(await claim(), true);
        await db.query(
          "update public.enquiries set email_status='sent' where id=$1",
          [id],
        );
        assert.equal(await claim(), false);
      },
    );
  } finally {
    await db.close();
  }
});
