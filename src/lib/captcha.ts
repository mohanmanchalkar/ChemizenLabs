import { FormError } from "./form-error";

export function captchaSubmission(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    return { payload: body, token: undefined };
  const { captchaToken, ...payload } = body as Record<string, unknown>;
  return { payload, token: captchaToken };
}

/** Validate on the server, before either form is allowed to persist anything. */
export async function verifyCaptcha(
  token: unknown,
  request: Request,
  action: "review" | "enquiry",
) {
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Optional until the owner configures a widget; honeypots and limits still apply.
  if (!sitekey && !secret) return;
  const testKey =
    /^[123]x0+/.test(secret || "") || /^[123]x0+/.test(sitekey || "");
  if (!sitekey || !secret || (testKey && process.env.NODE_ENV === "production"))
    throw new FormError(
      503,
      "Verification is temporarily unavailable. Please contact us by email.",
    );
  if (typeof token !== "string" || !token || token.length > 2048)
    throw new FormError(
      400,
      "Please complete the verification and submit again.",
    );
  let result: {
    success?: boolean;
    action?: string;
    hostname?: string;
    "error-codes"?: string[];
  };
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({ secret, response: token }),
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error("Verification service unavailable");
    result = await response.json();
  } catch {
    throw new FormError(
      503,
      "Verification could not connect. Your details are still here; please try again.",
    );
  }
  if (
    result?.["error-codes"]?.some((code) =>
      [
        "missing-input-secret",
        "invalid-input-secret",
        "internal-error",
      ].includes(code),
    )
  )
    throw new FormError(
      503,
      "Verification is temporarily unavailable. Please try again later.",
    );
  const hostname = new URL(process.env.APP_ORIGIN || request.url).hostname;
  if (
    result?.success !== true ||
    (!testKey && (result.action !== action || result.hostname !== hostname))
  )
    throw new FormError(
      400,
      "Verification expired or could not be completed. Please verify again.",
    );
}
