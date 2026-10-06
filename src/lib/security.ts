import { createHmac } from "node:crypto";
export function sameOrigin(request: Request) {
  try {
    const expected = process.env.APP_ORIGIN
      ? new URL(process.env.APP_ORIGIN).origin
      : new URL(request.url).origin;
    return request.headers.get("origin") === expected;
  } catch {
    return false;
  }
}
export function rateKey(request: Request, purpose: string) {
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown"
    : "local";
  if (!process.env.RATE_LIMIT_SECRET)
    throw new Error("Rate limiting is not configured");
  return createHmac("sha256", process.env.RATE_LIMIT_SECRET)
    .update(`${purpose}:${ip}`)
    .digest("hex");
}
export function hashedEmail(email: string) {
  return createHmac("sha256", process.env.RATE_LIMIT_SECRET!)
    .update(`email:${email}`)
    .digest("hex");
}
export async function boundedJson(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new Error("Content type");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Empty body");
  const parts: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16000) {
      await reader.cancel();
      throw new Error("Body too large");
    }
    parts.push(value);
  }
  return JSON.parse(Buffer.concat(parts).toString("utf8")) as unknown;
}
