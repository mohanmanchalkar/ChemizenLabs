import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin-auth";
import { AdminActions, LogoutButton } from "@/components/AdminActions";
export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiry inbox" };
export default async function Inbox({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; id?: string }>;
}) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  const params = await searchParams;
  const page = Math.max(
    1,
    Math.min(10000, parseInt(params.page || "1", 10) || 1),
  );
  const status = ["new", "contacted", "closed"].includes(params.status || "")
    ? params.status!
    : "all";
  let query = admin.client
    .from("enquiries")
    .select("id,created_at,name,email,service,status,email_status", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((page - 1) * 20, page * 20 - 1);
  if (status !== "all") query = query.eq("status", status);
  const { data: rows, error, count } = await query;
  const selected = params.id
    ? /^[0-9a-f-]{36}$/i.test(params.id)
      ? await admin.client
          .from("enquiries")
          .select(
            "id,created_at,name,email,phone,institution,service,message,status,email_status,consent",
          )
          .eq("id", params.id)
          .maybeSingle()
      : null
    : null;
  const record = selected?.data;
  function url(nextPage: number) {
    return `/admin/enquiries?status=${status}&page=${nextPage}`;
  }
  return (
    <main id="main" className="page-main admin-main">
      <div className="wrap">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">PRIVATE WORKSPACE</span>
            <h1>
              Enquiry <em>inbox.</em>
            </h1>
            <p>Signed in as {admin.user.email}</p>
          </div>
          <LogoutButton />
        </div>
        <nav className="admin-filters" aria-label="Filter enquiries">
          {["all", "new", "contacted", "closed"].map((s) => (
            <Link
              key={s}
              href={`/admin/enquiries?status=${s}`}
              aria-current={s === status ? "page" : undefined}
            >
              {s}
            </Link>
          ))}
        </nav>
        {error ? (
          <p className="notice" role="alert">
            Unable to load enquiries. Please refresh to try again.
          </p>
        ) : (
          <>
            <div className="inbox-table">
              <table>
                <thead>
                  <tr>
                    <th>Received</th>
                    <th>Contact</th>
                    <th>Interest</th>
                    <th>Status</th>
                    <th>Email</th>
                    <th>
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows?.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {new Date(row.created_at).toLocaleDateString("en-GB", {
                          timeZone: "UTC",
                        })}
                      </td>
                      <td>
                        <strong>{row.name}</strong>
                        <span>{row.email}</span>
                      </td>
                      <td>{row.service}</td>
                      <td>
                        <span className={`status-badge status-${row.status}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>{row.email_status}</td>
                      <td>
                        <Link
                          className="text-link"
                          href={`${url(page)}&id=${row.id}`}
                        >
                          View ↗
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!rows?.length && (
                <div className="empty-inbox">
                  <h2>No enquiries here yet.</h2>
                  <p>
                    Submitted enquiries will appear here once they are saved.
                  </p>
                </div>
              )}
            </div>
            <div className="pagination">
              <span>
                {count || 0} enquiries · Page {page}
              </span>
              <div>
                {page > 1 && (
                  <Link className="button button-outline" href={url(page - 1)}>
                    Previous
                  </Link>
                )}
                {page * 20 < (count || 0) && (
                  <Link className="button button-outline" href={url(page + 1)}>
                    Next
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
        {params.id && !record && (
          <p className="notice">
            {selected?.error
              ? "Unable to load this enquiry."
              : "This enquiry could not be found."}
          </p>
        )}
        {record && (
          <section className="enquiry-detail">
            <div className="admin-heading">
              <div>
                <span className="eyebrow">ENQUIRY DETAILS</span>
                <h2>{record.name}</h2>
              </div>
              <Link className="text-link" href={url(page)}>
                Close details
              </Link>
            </div>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${record.email}`}>{record.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{record.phone || "Not supplied"}</dd>
              </div>
              <div>
                <dt>Institution</dt>
                <dd>{record.institution || "Not supplied"}</dd>
              </div>
              <div>
                <dt>Interest</dt>
                <dd>{record.service}</dd>
              </div>
              <div>
                <dt>Consent</dt>
                <dd>{record.consent ? "Agreed to contact" : "Not recorded"}</dd>
              </div>
              <div>
                <dt>Email notification</dt>
                <dd>{record.email_status}</dd>
              </div>
            </dl>
            <div className="enquiry-message">{record.message}</div>
            <AdminActions
              id={record.id}
              status={record.status}
              emailStatus={record.email_status}
            />
          </section>
        )}
      </div>
    </main>
  );
}
