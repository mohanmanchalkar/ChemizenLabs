import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin-auth";
import { adminReviews } from "@/lib/reviews";
import { reviewStatuses } from "@/lib/review-schema";
import { RatingStars } from "@/components/ReviewCard";
import { AdminReviewActions } from "@/components/AdminReviewActions";
import { LogoutButton } from "@/components/AdminActions";
export const dynamic = "force-dynamic";
export const metadata = { title: "Review moderation" };
export default async function AdminReviews({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  if (!(await getAdmin())) redirect("/admin/login");
  const params = await searchParams;
  const status = reviewStatuses.find((s) => s === params.status) || "pending";
  const page = Math.max(
    1,
    Math.min(10000, parseInt(params.page || "1", 10) || 1),
  );
  const result = await adminReviews(status, page);
  const url = (p: number) => `/admin/reviews?status=${status}&page=${p}`;
  return (
    <main id="main" className="page-main admin-main">
      <div className="wrap">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">PRIVATE WORKSPACE</span>
            <h1>
              Review <em>moderation.</em>
            </h1>
            <p>Read each submission before deciding whether to publish it.</p>
          </div>
          <LogoutButton />
        </div>
        <nav className="admin-filters" aria-label="Filter reviews">
          {reviewStatuses.map((s) => (
            <Link
              key={s}
              href={`/admin/reviews?status=${s}`}
              aria-current={s === status ? "page" : undefined}
            >
              {s}
            </Link>
          ))}
        </nav>
        {result.error ? (
          <p className="notice" role="alert">
            Unable to load reviews. Please check the reviews database migration
            and refresh.
          </p>
        ) : result.rows.length ? (
          <div className="moderation-list">
            {result.rows.map((r) => (
              <article key={r.id} className="moderation-card">
                <div className="moderation-heading">
                  <div>
                    <h2>{r.name}</h2>
                    <time dateTime={r.created_at}>
                      {new Date(r.created_at).toLocaleString("en-GB", {
                        timeZone: "UTC",
                      })}{" "}
                      UTC
                    </time>
                  </div>
                  <RatingStars rating={r.rating} />
                </div>
                <p className="moderation-text">{r.text}</p>
                <AdminReviewActions id={r.id} status={r.status} />
              </article>
            ))}
          </div>
        ) : (
          <div className="reviews-empty">
            <h2>No {status} reviews.</h2>
            <p>New submissions appear here for your review.</p>
          </div>
        )}
        <div className="pagination">
          <span>
            {result.count} {status} reviews · Page {page}
          </span>
          <div>
            {page > 1 && (
              <Link className="button button-outline" href={url(page - 1)}>
                Previous
              </Link>
            )}
            {page * 20 < result.count && (
              <Link className="button button-outline" href={url(page + 1)}>
                Next
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
