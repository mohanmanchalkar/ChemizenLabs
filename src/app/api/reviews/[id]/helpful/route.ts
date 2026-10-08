import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { boundedJson, sameOrigin } from "@/lib/security";
import { markHelpful } from "@/lib/reviews";
import { isFormError } from "@/lib/form-error";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Request not accepted." },
      { status: 403 },
    );
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  let liked: boolean;
  try {
    liked = z
      .object({ liked: z.boolean() })
      .strict()
      .parse(await boundedJson(request)).liked;
  } catch {
    return NextResponse.json({ error: "Invalid reaction." }, { status: 400 });
  }
  const prior = request.cookies.get("review_visitor")?.value;
  const visitor = z.uuid().safeParse(prior).success ? prior! : randomUUID();
  try {
    const data = await markHelpful(id, visitor, liked, request);
    const response = NextResponse.json(data);
    response.cookies.set("review_visitor", visitor, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (e) {
    return NextResponse.json(
      {
        error: isFormError(e)
          ? e.message
          : "Unable to save reaction. Please try again.",
      },
      { status: isFormError(e) ? e.status : 503 },
    );
  }
}
