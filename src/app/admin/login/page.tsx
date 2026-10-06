import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/AdminLogin";
import { getAdmin } from "@/lib/admin-auth";
import { enquiriesConfigured } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export const metadata = { title: "Administrator sign-in" };
export default async function Login() {
  if (await getAdmin()) redirect("/admin/enquiries");
  return (
    <main id="main" className="page-main">
      <div className="wrap admin-login-heading">
        <span className="eyebrow">CHEMIZEN LABS / PRIVATE WORKSPACE</span>
        <h1>
          Welcome <em>back.</em>
        </h1>
        <AdminLogin available={enquiriesConfigured()} />
      </div>
    </main>
  );
}
