import { z } from "zod";
import { FormError } from "./form-error";

export const reviewStatuses = ["pending", "approved", "rejected"] as const;
export const reviewSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    rating: z.number().int().min(1).max(5),
    text: z.string().trim().min(20).max(2000),
    submissionToken: z.uuid(),
    website: z.string().max(200).optional().default(""),
  })
  .strict();
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReviewStatus = (typeof reviewStatuses)[number];
export type PublicReview = {
  id: string;
  name: string;
  rating: number;
  text: string;
  created_at: string;
  helpful_count: number;
};
export type ModeratedReview = PublicReview & { status: ReviewStatus };
export class ReviewError extends FormError {}
export function validateReview(body: unknown): ReviewInput {
  const result = reviewSchema.safeParse(body);
  if (!result.success)
    throw new ReviewError(
      400,
      "Enter your name, a rating from 1 to 5, and a review of 20–2,000 characters.",
    );
  if (result.data.website)
    throw new ReviewError(400, "Unable to accept this submission.");
  return result.data;
}
