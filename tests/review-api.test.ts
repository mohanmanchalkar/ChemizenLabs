import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, writeFile, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextRequest } from "next/server";

test("Local review APIs accept a fourth test review and persist idempotent Helpful reactions", async () => {
  const originalCwd = process.cwd();
  const originalFetch = globalThis.fetch;
  const dir = await mkdtemp(join(tmpdir(), "chemizen-review-api-"));
  const keys = [
    "NODE_ENV",
    "APP_ORIGIN",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
  ];
  const original = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );
  keys.forEach((key) => delete process.env[key]);
  Object.assign(process.env, { NODE_ENV: "development" });
  process.env.APP_ORIGIN = "http://localhost:3000";
  process.chdir(dir);
  try {
    const { POST: submit } = await import("../src/app/api/reviews/route");
    const { POST: react } =
      await import("../src/app/api/reviews/[id]/helpful/route");
    const { localReviews } = await import("../src/lib/local-reviews");
    const body = () => ({
      name: "Test Learner",
      rating: 5,
      text: "The practical examples helped me understand protein preparation.",
      submissionToken: randomUUID(),
      website: "",
    });
    const request = (url: string, data: unknown, cookie = "") =>
      new NextRequest(`http://localhost:3000${url}`, {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          "Content-Type": "application/json",
          cookie,
        },
        body: JSON.stringify(data),
      });
    let id = "";
    for (let n = 0; n < 4; n++) {
      const response = await submit(request("/api/reviews", body()));
      assert.equal(response.status, 201);
      const data = await response.json();
      assert.doesNotMatch(data.message, /approval/i);
      id = data.id;
    }
    await localReviews.moderate(id, "approved");
    const reaction = (liked: boolean, cookie = "") =>
      react(request(`/api/reviews/${id}/helpful`, { liked }, cookie), {
        params: Promise.resolve({ id }),
      });
    const first = await reaction(true);
    assert.equal(first.status, 200);
    assert.deepEqual(await first.json(), { liked: true, count: 1 });
    const cookie = first.headers.get("set-cookie")!.split(";")[0];
    assert.match(first.headers.get("set-cookie")!, /HttpOnly/i);
    assert.deepEqual(await (await reaction(true, cookie)).json(), {
      liked: true,
      count: 1,
    });
    assert.deepEqual(await (await reaction(false, cookie)).json(), {
      liked: false,
      count: 0,
    });
    await localReviews.moderate(id, "rejected");
    const removed = await reaction(true, cookie);
    assert.equal(removed.status, 404);
    assert.match((await removed.json()).error, /not found/i);

    Object.assign(process.env, {
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "public-key",
      TURNSTILE_SECRET_KEY: "private-key",
    });
    let verified = 0;
    globalThis.fetch = async () =>
      Response.json({
        success: true,
        hostname: "localhost",
        action: ++verified === 1 ? "review" : "enquiry",
      });
    const protectedReview = await submit(
      request("/api/reviews", { ...body(), captchaToken: "verified-token" }),
    );
    assert.equal(protectedReview.status, 201);
    const { POST: enquire } = await import("../src/app/api/enquiries/route");
    const { serviceOptions } = await import("../src/lib/content");
    const protectedEnquiry = await enquire(
      request("/api/enquiries", {
        name: "Test Learner",
        email: "test@example.com",
        service: serviceOptions[0],
        message: "Please share information about your next training workshop.",
        consent: true,
        website: "",
        submissionToken: randomUUID(),
        captchaToken: "verified-token",
      }),
    );
    assert.equal(protectedEnquiry.status, 201);
    assert.equal(verified, 2);
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;

    // Verify that hitting a real limit returns the intended message, not generic 503.
    const path = join(dir, ".local", "reviews.json");
    const stored = JSON.parse(await readFile(path, "utf8"));
    stored.limits = Array.from({ length: 100 }, () => ({
      key: "review:local",
      at: Date.now(),
    }));
    await writeFile(path, JSON.stringify(stored));
    const limited = await submit(request("/api/reviews", body()));
    assert.equal(limited.status, 429);
    assert.match((await limited.json()).error, /Too many reviews/);
  } finally {
    process.chdir(originalCwd);
    globalThis.fetch = originalFetch;
    keys.forEach((key) => {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    });
    await unlink(join(dir, ".local", "reviews.json")).catch(() => {});
    await rmdir(join(dir, ".local")).catch(() => {});
    await rmdir(dir);
  }
});
