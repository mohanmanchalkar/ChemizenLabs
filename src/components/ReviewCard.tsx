import { Star } from "lucide-react";
import Link from "next/link";
import type { PublicReview } from "@/lib/review-schema";
import { ReviewHelpful } from "./ReviewHelpful";
export function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="rating-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={17}
          fill={n <= rating ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
export function ReviewCard({
  review,
  preview = false,
}: {
  review: PublicReview;
  preview?: boolean;
}) {
  return (
    <article
      id={preview ? undefined : `review-${review.id}`}
      className={`review-card${preview ? " review-card-preview" : ""}`}
    >
      <RatingStars rating={review.rating} />
      <blockquote>{review.text}</blockquote>
      {preview && (
        <Link
          className="review-full-link"
          href={`/reviews?sort=top#review-${review.id}`}
        >
          Read full review
        </Link>
      )}
      <div className="review-person">
        <span className="review-initial" aria-hidden="true">
          {review.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <strong>{review.name}</strong>
          <time dateTime={review.created_at}>
            {new Date(review.created_at).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              timeZone: "UTC",
            })}
          </time>
        </div>
      </div>
      <ReviewHelpful id={review.id} initialCount={review.helpful_count} />
    </article>
  );
}
