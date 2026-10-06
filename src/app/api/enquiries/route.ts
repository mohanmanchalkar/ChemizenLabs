import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { enquiriesConfigured, serviceClient } from "@/lib/supabase";
import { boundedJson, sameOrigin, rateKey, hashedEmail } from "@/lib/security";
import { submitEnquiry, SubmissionError } from "@/lib/submission";
import { notifyAdmin } from "@/lib/notifications";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Request origin not accepted." },
      { status: 403 },
    );
  if (!enquiriesConfigured())
    return NextResponse.json(
      {
        error:
          "Online enquiries are temporarily unavailable. Please email chemizenlabs@gmail.com.",
      },
      { status: 503 },
    );
  let body: unknown;
  try {
    body = await boundedJson(request);
  } catch {
    return NextResponse.json(
      { error: "Unable to read the submission." },
      { status: 400 },
    );
  }
  try {
    const result = await submitEnquiry(body, {
      save: async (input) => {
        const { submissionToken, website, ...payload } = input;
        void website;
        const hash = createHash("sha256")
          .update(JSON.stringify(payload))
          .digest("hex");
        const { data, error } = await serviceClient().rpc("submit_enquiry", {
          p_token: submissionToken,
          p_payload: payload,
          p_hash: hash,
          p_rate_key: rateKey(request, "enquiry"),
          p_email_key: hashedEmail(input.email),
        });
        if (error) {
          if (error.message.includes("RATE_LIMIT"))
            throw new SubmissionError(
              429,
              "Too many enquiries. Please wait an hour or contact us by email.",
            );
          if (error.message.includes("TOKEN_CONFLICT"))
            throw new SubmissionError(
              409,
              "This submission changed after it was saved. Please start a new enquiry.",
            );
          throw new SubmissionError(
            503,
            "Your enquiry could not be saved. Please try again.",
          );
        }
        return data as { id: string; duplicate: boolean };
      },
      notify: notifyAdmin,
    });
    return NextResponse.json(
      {
        id: result.id,
        message: "Your enquiry has been saved. Our team will contact you.",
      },
      { status: 201 },
    );
  } catch (e) {
    const status = e instanceof SubmissionError ? e.status : 503;
    return NextResponse.json(
      {
        error:
          e instanceof SubmissionError
            ? e.message
            : "Unable to save your enquiry. Please try again.",
      },
      { status },
    );
  }
}
