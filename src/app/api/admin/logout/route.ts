import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/security";
import { authConfigured, sessionClient } from "@/lib/supabase";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Request not accepted." },
      { status: 403 },
    );
  try {
    if (authConfigured()) {
      const { error } = await (await sessionClient()).auth.signOut();
      if (error) throw error;
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.delete("admin_session");
    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not sign out. Please try again." },
      { status: 503 },
    );
  }
}
