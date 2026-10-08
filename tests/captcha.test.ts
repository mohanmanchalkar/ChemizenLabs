import { test } from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { captchaSubmission, verifyCaptcha } from "../src/lib/captcha";
import { isFormError } from "../src/lib/form-error";
import { POST as submitReview } from "../src/app/api/reviews/route";
import { POST as submitEnquiry } from "../src/app/api/enquiries/route";

test("Form errors survive server bundle boundaries without losing their status", () => {
  const foreign = runInNewContext(
    'Object.assign(new Error("Too many reviews. Please try again in an hour."), {kind:"chemizen-form-error",status:429})',
  );
  assert.equal(foreign instanceof Error, false);
  assert.equal(isFormError(foreign), true);
  assert.equal(isFormError({ status: 500, message: "Internal secret" }), false);
});

test("CAPTCHA rejects missing, invalid, expired and mismatched tokens before either form saves", async () => {
  const keys = [
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
    "APP_ORIGIN",
    "NODE_ENV",
  ];
  const original = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );
  const originalFetch = globalThis.fetch;
  const request = new Request("https://chemizen.example/api/reviews");
  const fail = (status: number) => (error: unknown) =>
    isFormError(error) && error.status === status;
  let called = 0;
  const mock = (result: unknown, status = 200) => {
    globalThis.fetch = async (_url, options) => {
      called++;
      assert.equal(options?.method, "POST");
      assert.equal(
        (options?.body as URLSearchParams).get("secret"),
        "private-key",
      );
      return Response.json(result, { status });
    };
  };
  Object.assign(process.env, {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "public-key",
    TURNSTILE_SECRET_KEY: "private-key",
    APP_ORIGIN: "https://chemizen.example",
    NODE_ENV: "development",
  });
  try {
    assert.deepEqual(
      captchaSubmission({ name: "Name", captchaToken: "token" }),
      { payload: { name: "Name" }, token: "token" },
    );
    await assert.rejects(verifyCaptcha("", request, "review"), fail(400));
    await assert.rejects(
      verifyCaptcha("x".repeat(2049), request, "review"),
      fail(400),
    );
    assert.equal(called, 0);
    mock({ success: false, "error-codes": ["timeout-or-duplicate"] });
    await assert.rejects(verifyCaptcha("token", request, "review"), fail(400));
    mock({ success: true, action: "enquiry", hostname: "chemizen.example" });
    await assert.rejects(verifyCaptcha("token", request, "review"), fail(400));
    mock({ success: true, action: "review", hostname: "another.example" });
    await assert.rejects(verifyCaptcha("token", request, "review"), fail(400));
    mock({ success: true, action: "review", hostname: "chemizen.example" });
    await verifyCaptcha("token", request, "review");
    mock({ success: true, action: "enquiry", hostname: "chemizen.example" });
    await verifyCaptcha("token", request, "enquiry");
    mock({}, 502);
    await assert.rejects(verifyCaptcha("token", request, "review"), fail(503));
    globalThis.fetch = async () => {
      throw new Error("Network timeout");
    };
    await assert.rejects(verifyCaptcha("token", request, "review"), fail(503));
    const apiRequest = (path: string, body: unknown) =>
      new Request(`https://chemizen.example${path}`, {
        method: "POST",
        headers: {
          origin: "https://chemizen.example",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    const reviewResponse = await submitReview(
      apiRequest("/api/reviews", {
        name: "Test Name",
        text: "This is a sufficiently long review for validation.",
        rating: 5,
        website: "",
        submissionToken: "00000000-0000-4000-8000-000000000000",
      }),
    );
    assert.equal(reviewResponse.status, 400);
    assert.match((await reviewResponse.json()).error, /verification/i);
    const enquiryResponse = await submitEnquiry(
      apiRequest("/api/enquiries", {}),
    );
    assert.equal(enquiryResponse.status, 400);
    assert.match((await enquiryResponse.json()).error, /verification/i);
    delete process.env.TURNSTILE_SECRET_KEY;
    await assert.rejects(verifyCaptcha("token", request, "review"), fail(503));
    process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
    Object.assign(process.env, { NODE_ENV: "production" });
    await assert.rejects(verifyCaptcha("token", request, "review"), fail(503));
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    await verifyCaptcha(undefined, request, "review");
  } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key) => {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    });
  }
});
