import { createClient } from "@supabase/supabase-js";
import { createHash, createHmac } from "node:crypto";
import {
  authConfigured,
  enquiriesConfigured,
  serviceClient,
  sessionClient,
} from "./supabase";
import { localReviews } from "./local-reviews";
import { rateKey } from "./security";
import {
  ReviewError,
  validateReview,
  type ModeratedReview,
  type PublicReview,
  type ReviewStatus,
} from "./review-schema";

const fields = "id,name,rating,text,created_at,helpful_count";
export function localReviewsEnabled() {
  return process.env.NODE_ENV === "development" && !authConfigured();
}
export function reviewsAvailable() {
  return enquiriesConfigured() || localReviewsEnabled();
}
export async function publicReviews(
  page = 1,
  limit = 12,
  top = false,
  minRating = 1,
): Promise<{ rows: PublicReview[]; count: number; error: boolean }> {
  try {
    if (localReviewsEnabled())
      return {
        ...(await localReviews.list("approved", page, limit, top, minRating)),
        error: false,
      };
    if (!authConfigured()) return { rows: [], count: 0, error: false };
    // An anonymous client ensures drafts remain private even for signed-in admins.
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let query = db
      .from("reviews")
      .select(fields, { count: "exact" })
      .eq("status", "approved");
    query = query.gte("rating", minRating);
    if (top) query = query.order("rating", { ascending: false });
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw error;
    return { rows: data || [], count: count || 0, error: false };
  } catch {
    return { rows: [], count: 0, error: true };
  }
}
export async function adminReviews(
  status: ReviewStatus,
  page: number,
): Promise<{ rows: ModeratedReview[]; count: number; error: boolean }> {
  try {
    if (localReviewsEnabled())
      return { ...(await localReviews.list(status, page, 20)), error: false };
    const { data, count, error } = await (
      await sessionClient()
    )
      .from("reviews")
      .select(`${fields},status`, { count: "exact" })
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range((page - 1) * 20, page * 20 - 1);
    if (error) throw error;
    return { rows: data || [], count: count || 0, error: false };
  } catch {
    return { rows: [], count: 0, error: true };
  }
}
export async function saveReview(body: unknown, request: Request) {
  const input = validateReview(body);
  if (!reviewsAvailable())
    throw new ReviewError(
      503,
      "Review submissions are not available yet. Please try again later.",
    );
  const hash = createHash("sha256")
    .update(
      JSON.stringify({
        name: input.name,
        rating: input.rating,
        text: input.text,
      }),
    )
    .digest("hex");
  if (localReviewsEnabled())
    return localReviews.submit(input, hash, "review:local");
  const { data, error } = await serviceClient().rpc("submit_review", {
    p_token: input.submissionToken,
    p_name: input.name,
    p_rating: input.rating,
    p_text: input.text,
    p_hash: hash,
    p_rate_key: rateKey(request, "review"),
  });
  if (error) {
    if (error.message.includes("RATE_LIMIT"))
      throw new ReviewError(
        429,
        "Too many reviews. Please try again in an hour.",
      );
    if (error.message.includes("TOKEN_CONFLICT"))
      throw new ReviewError(
        409,
        "This review was already submitted with different content. Reopen the form to write a new review.",
      );
    throw new ReviewError(
      503,
      "Your review could not be saved. Your text is still here; please try again.",
    );
  }
  return data as { id: string; duplicate: boolean };
}
export async function moderateReview(id: string, status: ReviewStatus) {
  if (localReviewsEnabled()) return localReviews.moderate(id, status);
  const { data, error } = await (
    await sessionClient()
  )
    .from("reviews")
    .update({ status })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new ReviewError(503, "Unable to update this review.");
  if (!data) throw new ReviewError(404, "Review not found.");
  return data;
}
export async function markHelpful(
  id: string,
  visitor: string,
  liked: boolean,
  request: Request,
) {
  if (!reviewsAvailable())
    throw new ReviewError(503, "Review reactions are currently unavailable.");
  const voter = createHmac(
    "sha256",
    localReviewsEnabled()
      ? "local-development"
      : process.env.RATE_LIMIT_SECRET!,
  )
    .update(`review-voter:${visitor}`)
    .digest("hex");
  if (localReviewsEnabled())
    return localReviews.helpful(id, voter, liked, "helpful:local");
  const { data, error } = await serviceClient().rpc("set_review_helpful", {
    p_id: id,
    p_voter: voter,
    p_liked: liked,
    p_rate_key: rateKey(request, "review-helpful"),
  });
  if (error) {
    if (error.message.includes("NOT_FOUND"))
      throw new ReviewError(404, "Review not found.");
    if (error.message.includes("RATE_LIMIT"))
      throw new ReviewError(429, "Too many requests. Please try again later.");
    throw new ReviewError(
      503,
      "Unable to save your reaction. Please try again.",
    );
  }
  return data as { liked: boolean; count: number };
}
