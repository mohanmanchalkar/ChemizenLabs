import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

export const LOCAL_ADMIN_SESSION_SECONDS = 8 * 60 * 60;

// This login is only for local development. Deployed sites use Supabase.
export function localAdminConfigured() {
  return Boolean(
    process.env.NODE_ENV === "development" &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    process.env.LOCAL_ADMIN_EMAIL &&
    process.env.LOCAL_ADMIN_PASSWORD,
  );
}

function equal(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

export function localAdminCredentialsMatch(email: string, password: string) {
  if (!localAdminConfigured()) return false;
  const emailMatches = equal(
    email.toLowerCase(),
    process.env.LOCAL_ADMIN_EMAIL!.toLowerCase(),
  );
  const passwordMatches = equal(password, process.env.LOCAL_ADMIN_PASSWORD!);
  return emailMatches && passwordMatches;
}

function signature(payload: string) {
  return createHmac("sha256", process.env.LOCAL_ADMIN_PASSWORD!)
    .update(`${process.env.LOCAL_ADMIN_EMAIL!.toLowerCase()}:${payload}`)
    .digest("base64url");
}

export function createLocalAdminSession(now = Date.now()) {
  if (!localAdminConfigured()) throw new Error("Local admin is not configured");
  const payload = `${now + LOCAL_ADMIN_SESSION_SECONDS * 1000}:${randomBytes(24).toString("base64url")}`;
  return `${payload}.${signature(payload)}`;
}

export function validLocalAdminSession(
  value: string | undefined,
  now = Date.now(),
) {
  if (!localAdminConfigured() || !value || value.length > 200) return false;
  const [payload, supplied, extra] = value.split(".");
  if (!payload || !supplied || extra !== undefined) return false;
  const [expires, nonce, trailing] = payload.split(":");
  const expiry = Number(expires);
  return Boolean(
    trailing === undefined &&
    nonce?.length === 32 &&
    Number.isSafeInteger(expiry) &&
    expiry > now &&
    expiry <= now + LOCAL_ADMIN_SESSION_SECONDS * 1000 &&
    equal(signature(payload), supplied),
  );
}
