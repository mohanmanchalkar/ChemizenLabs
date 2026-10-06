import { enquirySchema, type EnquiryInput } from "./enquiry-schema";
export class SubmissionError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export type SavedSubmission = { id: string; duplicate: boolean };
export type SubmissionDependencies = {
  save: (input: EnquiryInput) => Promise<SavedSubmission>;
  notify: (id: string) => Promise<void>;
};
export async function submitEnquiry(
  body: unknown,
  deps: SubmissionDependencies,
) {
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success)
    throw new SubmissionError(
      400,
      parsed.error.issues[0]?.message || "Please check your details.",
    );
  if (parsed.data.website)
    throw new SubmissionError(400, "Unable to accept this submission.");
  const saved = await deps.save(parsed.data);
  if (!saved.duplicate) {
    try {
      await deps.notify(saved.id);
    } catch {
      /* A durable enquiry remains accepted even if email is unavailable. */
    }
  }
  return { id: saved.id };
}
