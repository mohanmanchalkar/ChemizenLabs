import { NextResponse } from "next/server";
import { boundedJson, sameOrigin } from "@/lib/security";
import { saveReview } from "@/lib/reviews";
import { validateReview } from "@/lib/review-schema";
import { isFormError } from "@/lib/form-error";
import { captchaSubmission, verifyCaptcha } from "@/lib/captcha";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Request not accepted." },
      { status: 403 },
    );
  let body: unknown;
  try {
    body = await boundedJson(request);
  } catch {
    return NextResponse.json(
      { error: "Unable to read your review." },
      { status: 400 },
    );
  }
  try {
    const { payload, token } = captchaSubmission(body);
    validateReview(payload);
    await verifyCaptcha(token, request, "review");
    const result = await saveReview(payload, request);
    return NextResponse.json(
      {
        id: result.id,
        message:
          "Thank you for sharing your experience. Your review has been received.",
      },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: isFormError(e)
          ? e.message
          : "Unable to save your review. Please try again.",
      },
      { status: isFormError(e) ? e.status : 503 },
    );
  }
}
