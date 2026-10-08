import Link from "next/link";
import { ArrowUpRight, MessageSquareQuote } from "lucide-react";
import { publicReviews, reviewsAvailable } from "@/lib/reviews";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
export async function Testimonials() {
  const { rows, error } = await publicReviews(1, 3, true, 4);
  return (
    <section className="testimonials section learner-reviews">
      <div className="wrap">
        <div className="section-top">
          <div>
            <span className="eyebrow">03 / TOP-RATED REVIEWS</span>
            <h2>
              Learning, in
              <br />
              <em className="script-accent">their own words.</em>
            </h2>
          </div>
          <div className="review-section-intro">
            <p>Feedback from the people who have joined our training.</p>
            <div className="review-section-actions">
              <ReviewForm available={reviewsAvailable()} />
              <Link href="/reviews" className="text-link">
                See all reviews <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
        {error ? (
          <p className="notice">
            Reviews couldn’t be loaded. Please try again shortly.
          </p>
        ) : rows.length ? (
          <div className="reviews-grid">
            {rows.map((r) => (
              <ReviewCard key={r.id} review={r} preview />
            ))}
          </div>
        ) : (
          <div className="review-empty-feature">
            <MessageSquareQuote size={42} strokeWidth={1} />
            <div>
              <h3>Every learning experience has a story.</h3>
              <p>
                Attended a Chemizen Labs workshop? Share what helped you and
                what we can do better.
              </p>
            </div>
            <Link href="/reviews" className="text-link">
              Visit the review page <ArrowUpRight size={17} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
