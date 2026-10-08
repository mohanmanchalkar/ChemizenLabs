import { test } from "node:test";
import assert from "node:assert/strict";
import {
  localAdminConfigured,
  localAdminCredentialsMatch,
  createLocalAdminSession,
  validLocalAdminSession,
  LOCAL_ADMIN_SESSION_SECONDS,
} from "../src/lib/local-admin";
import { devStore } from "../src/lib/dev-store";

test("Local admin credentials and signed sessions are private, rotatable, and disabled in production", () => {
  const keys = [
    "NODE_ENV",
    "LOCAL_ADMIN_EMAIL",
    "LOCAL_ADMIN_PASSWORD",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ];
  const original = keys.map((key) => [key, process.env[key]] as const);
  try {
    Object.assign(process.env, {
      NODE_ENV: "development",
      LOCAL_ADMIN_EMAIL: "private-admin@example.com",
      LOCAL_ADMIN_PASSWORD: "test-only-random-password!42",
    });
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    assert.equal(localAdminConfigured(), true);
    assert.equal(
      localAdminCredentialsMatch(
        "PRIVATE-ADMIN@example.com",
        "test-only-random-password!42",
      ),
      true,
    );
    assert.equal(
      localAdminCredentialsMatch("admin@chemizenlabs.com", "chemizen2025"),
      false,
    );
    assert.equal(
      localAdminCredentialsMatch("private-admin@example.com", "incorrect"),
      false,
    );
    const now = Date.now();
    const session = createLocalAdminSession(now);
    assert.equal(validLocalAdminSession(session, now), true);
    assert.notEqual(session, createLocalAdminSession(now));
    assert.equal(validLocalAdminSession("dev-chemizen-admin", now), false);
    assert.equal(validLocalAdminSession(`${session}tampered`, now), false);
    assert.equal(
      validLocalAdminSession(session, now + LOCAL_ADMIN_SESSION_SECONDS * 1000),
      false,
    );
    process.env.LOCAL_ADMIN_PASSWORD = "rotated-password";
    assert.equal(validLocalAdminSession(session, now), false);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    assert.equal(localAdminConfigured(), false);
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    Object.assign(process.env, { NODE_ENV: "production" });
    assert.equal(localAdminConfigured(), false);
    assert.equal(
      localAdminCredentialsMatch(
        "private-admin@example.com",
        "rotated-password",
      ),
      false,
    );
    assert.equal(validLocalAdminSession(session, now), false);
    assert.throws(() => createLocalAdminSession());
  } finally {
    for (const [key, value] of original) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("A fresh local enquiry inbox has no seeded submissions", () => {
  assert.equal(devStore.getAll().count, 0);
});
