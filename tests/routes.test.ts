import { test } from "node:test";
import assert from "node:assert/strict";
import { POST as submit } from "../src/app/api/enquiries/route";
import { POST as login } from "../src/app/api/admin/login/route";
import { PATCH as changeStatus } from "../src/app/api/admin/enquiries/[id]/route";
import { POST as retryEmail } from "../src/app/api/admin/enquiries/[id]/retry/route";
const base = "http://localhost:3000";
const request = (path: string, method: string, origin = base) =>
  new Request(base + path, {
    method,
    headers: { origin, "Content-Type": "application/json" },
    body: "{}",
  });
test("API handlers fail closed without backend configuration or authorization", async () => {
  const keys = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "APP_ORIGIN",
  ] as const;
  const original = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  keys.forEach((k) => delete process.env[k]);
  process.env.APP_ORIGIN = base;
  try {
    assert.equal((await submit(request("/api/enquiries", "POST"))).status, 503);
    assert.equal(
      (await login(request("/api/admin/login", "POST"))).status,
      503,
    );
    const params = Promise.resolve({
      id: "00000000-0000-4000-8000-000000000000",
    });
    assert.equal(
      (
        await changeStatus(request("/api/admin/enquiries/id", "PATCH"), {
          params,
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await retryEmail(request("/api/admin/enquiries/id/retry", "POST"), {
          params,
        })
      ).status,
      401,
    );
    assert.equal(
      (await submit(request("/api/enquiries", "POST", "https://other.example")))
        .status,
      403,
    );
    assert.equal(
      (
        await changeStatus(
          request("/api/admin/enquiries/id", "PATCH", "https://other.example"),
          { params },
        )
      ).status,
      403,
    );
  } finally {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
});
