import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { publicReviews, reviewsAvailable } from "@/lib/reviews";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Workshop reviews",
  description:
    "Read learner feedback on Chemizen Labs training and share your own workshop experience.",
};
export default async function Reviews({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(
    1,
    Math.min(10000, parseInt(params.page || "1", 10) || 1),
  );
  const top = params.sort !== "latest";
  const result = await publicReviews(page, 12, top);
  const url = (p: number) =>
    `/reviews?sort=${top ? "top" : "latest"}&page=${p}`;
  return (
    <PageShell
      eyebrow="FROM OUR LEARNERS"
      title={
        <>
          Small steps.
          <br />
          <em className="script-accent">Shared experiences.</em>
        </>
      }
      intro="What learners have to say about their time with Chemizen Labs. Browse their experiences or share your own."
    >
      <section className="wrap reviews-page">
        <div className="reviews-toolbar">
          <nav aria-label="Sort reviews">
            <Link href="/reviews" aria-current={top ? "page" : undefined}>
              Top rated
            </Link>
            <Link
              href="/reviews?sort=latest"
              aria-current={!top ? "page" : undefined}
            >
              Latest reviews
            </Link>
          </nav>
          <ReviewForm available={reviewsAvailable()} />
        </div>
        {result.error ? (
          <p className="notice" role="alert">
            We couldn’t load reviews. Please refresh to try again.
          </p>
        ) : result.rows.length ? (
          <>
            <p className="review-count">
              {result.count} published{" "}
              {result.count === 1 ? "review" : "reviews"}
            </p>
            <div className="reviews-grid">
              {result.rows.map((r) => (
                <ReviewCard review={r} key={r.id} />
              ))}
            </div>
          </>
        ) : (
          <div className="reviews-empty">
            <span className="eyebrow">THE CONVERSATION STARTS HERE</span>
            <h2>
              {page > 1
                ? "No reviews on this page."
                : "Your experience could help the next learner."}
            </h2>
            <p>
              {page > 1
                ? "Return to the first page to read published reviews."
                : "Attended a workshop? Tell us what you learned and what we could improve."}
            </p>
          </div>
        )}
        <div className="pagination">
          <span>Page {page}</span>
          <div>
            {page > 1 && (
              <Link className="button button-outline" href={url(page - 1)}>
                Previous
              </Link>
            )}
            {page * 12 < result.count && (
              <Link className="button button-outline" href={url(page + 1)}>
                Next
              </Link>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
