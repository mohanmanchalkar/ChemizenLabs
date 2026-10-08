import Link from "next/link";
import { getAdmin } from "@/lib/admin-auth";

export const metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdmin();
  return (
    <>
      {admin && (
        <nav className="admin-workspace-nav wrap" aria-label="Admin workspace">
          <Link href="/admin/enquiries">Enquiries</Link>
          <Link href="/admin/reviews">Review moderation</Link>
        </nav>
      )}
      {children}
    </>
  );
}
