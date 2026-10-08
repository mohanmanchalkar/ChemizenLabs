import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin } from "@/lib/admin-auth";
import { boundedJson, sameOrigin } from "@/lib/security";
import { moderateReview } from "@/lib/reviews";
import { reviewStatuses } from "@/lib/review-schema";
import { isFormError } from "@/lib/form-error";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Request not accepted." },
      { status: 403 },
    );
  if (!(await getAdmin()))
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 401 },
    );
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await boundedJson(request));
  } catch {
    return NextResponse.json(
      { error: "Invalid moderation status." },
      { status: 400 },
    );
  }
  try {
    await moderateReview(id, input.status);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      {
        error: isFormError(e) ? e.message : "Unable to update review.",
      },
      { status: isFormError(e) ? e.status : 503 },
    );
  }
}
const schema = z.object({ status: z.enum(reviewStatuses) }).strict();
