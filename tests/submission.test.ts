import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { submitEnquiry, SubmissionError } from "../src/lib/submission";
import { serviceOptions } from "../src/lib/content";
import { googleFormUrl } from "../src/lib/registration";
import { sameOrigin, boundedJson } from "../src/lib/security";
const valid = () => ({
  name: "Test Researcher",
  email: "researcher@example.com",
  phone: "",
  institution: "",
  service: serviceOptions[0],
  message: "I would like to discuss a molecular docking workshop.",
  consent: true,
  submissionToken: randomUUID(),
  website: "",
});
test("Invalid inputs, missing consent and spam do not reach storage", async () => {
  let saves = 0;
  const deps = {
    save: async () => {
      saves++;
      return { id: "x", duplicate: false };
    },
    notify: async () => {},
  };
  for (const body of [
    { ...valid(), email: "invalid" },
    { ...valid(), consent: false },
    { ...valid(), message: "short" },
    { ...valid(), website: "spam" },
    { ...valid(), service: "Unknown" },
    { ...valid(), submissionToken: "invalid" },
  ])
    await assert.rejects(
      submitEnquiry(body, deps),
      (e: unknown) => e instanceof SubmissionError && e.status === 400,
    );
  assert.equal(saves, 0);
});
test("Persistence precedes notification and email failure does not lose enquiry", async () => {
  const events: string[] = [];
  const result = await submitEnquiry(valid(), {
    save: async () => {
      events.push("saved");
      return { id: "saved-id", duplicate: false };
    },
    notify: async () => {
      events.push("notification");
      throw new Error("Provider down");
    },
  });
  assert.deepEqual(events, ["saved", "notification"]);
  assert.equal(result.id, "saved-id");
});
test("A database failure is not reported as a successful submission", async () => {
  let notified = false;
  await assert.rejects(
    submitEnquiry(valid(), {
      save: async () => {
        throw new SubmissionError(503, "Storage unavailable");
      },
      notify: async () => {
        notified = true;
      },
    }),
    { status: 503 },
  );
  assert.equal(notified, false);
});
test("An idempotent retry does not send a second notification", async () => {
  let notifications = 0;
  const result = await submitEnquiry(valid(), {
    save: async () => ({ id: "existing-id", duplicate: true }),
    notify: async () => {
      notifications++;
    },
  });
  assert.equal(result.id, "existing-id");
  assert.equal(notifications, 0);
});
test("Rate-limited submissions remain rejected", async () => {
  await assert.rejects(
    submitEnquiry(valid(), {
      save: async () => {
        throw new SubmissionError(429, "Slow down");
      },
      notify: async () => {},
    }),
    { status: 429 },
  );
});
test("Registration accepts only HTTPS Google Forms destinations", () => {
  assert.equal(
    googleFormUrl("https://forms.gle/example"),
    "https://forms.gle/example",
  );
  assert.equal(
    googleFormUrl("https://docs.google.com/forms/d/e/example/viewform"),
    "https://docs.google.com/forms/d/e/example/viewform",
  );
  for (const url of [
    undefined,
    "javascript:alert(1)",
    "http://forms.gle/example",
    "https://forms.gle.evil.test/a",
    "https://example.com",
    "https://docs.google.com/document/x",
  ])
    assert.equal(googleFormUrl(url), null);
});
test("Mutations reject cross-origin and missing-origin requests", () => {
  const original = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = "https://chemizen.example";
  try {
    assert.equal(
      sameOrigin(
        new Request("https://chemizen.example/api", {
          headers: { origin: "https://evil.example" },
        }),
      ),
      false,
    );
    assert.equal(
      sameOrigin(new Request("https://chemizen.example/api")),
      false,
    );
    assert.equal(
      sameOrigin(
        new Request("https://chemizen.example/api", {
          headers: { origin: "https://chemizen.example" },
        }),
      ),
      true,
    );
  } finally {
    if (original === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = original;
  }
});
test("Request size is bounded before parsing", async () => {
  await assert.rejects(
    boundedJson(
      new Request("https://example.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "x".repeat(17000) }),
      }),
    ),
  );
});
