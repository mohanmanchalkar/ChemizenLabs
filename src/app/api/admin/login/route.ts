import { NextResponse } from "next/server";
import { z } from "zod";
import { boundedJson, sameOrigin, rateKey } from "@/lib/security";
import {
  enquiriesConfigured,
  serviceClient,
  sessionClient,
} from "@/lib/supabase";
const schema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(256),
});
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Request not accepted." },
      { status: 403 },
    );
  if (!enquiriesConfigured())
    return NextResponse.json(
      { error: "Administrator sign-in has not been configured." },
      { status: 503 },
    );
  try {
    const input = schema.safeParse(await boundedJson(request));
    if (!input.success)
      return NextResponse.json(
        { error: "Enter your email and password." },
        { status: 400 },
      );
    const { data: allowed, error: rateError } = await serviceClient().rpc(
      "consume_rate_limit",
      { p_key: rateKey(request, "login"), p_limit: 15 },
    );
    if (rateError)
      return NextResponse.json(
        { error: "Sign-in is temporarily unavailable." },
        { status: 503 },
      );
    if (!allowed)
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    const db = await sessionClient();
    const { data, error } = await db.auth.signInWithPassword(input.data);
    if (error || !data.user)
      return NextResponse.json(
        { error: "Unable to sign in with these credentials." },
        { status: 401 },
      );
    const { data: member, error: memberError } = await db
      .from("admin_members")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (memberError || !member) {
      await db.auth.signOut();
      return NextResponse.json(
        { error: "Unable to sign in with these credentials." },
        { status: 403 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable." },
      { status: 503 },
    );
  }
}
