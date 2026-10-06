import { redirect } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { googleFormUrl } from "@/lib/registration";
import { workshop } from "@/lib/workshop";
export const dynamic = "force-dynamic";
export const metadata = { title: "Registration" };
export default function Register() {
  const url = googleFormUrl(process.env.GOOGLE_FORM_URL);
  if (url) redirect(url);
  return (
    <PageShell
      eyebrow="WORKSHOP REGISTRATION"
      title={
        <>
          Join a CADD
          <br />
          <em>workshop.</em>
        </>
      }
      intro="Choose a Network Pharmacology & CADD workshop or a Molecular Docking internship. The brochure describes September–October 2026 cohorts. Contact us to confirm the next intake, fee and registration link."
    >
      <div className="wrap pending-panel">
        <span className="status-dot" />
        <span>Next intake: enquire for availability</span>
        <Link href={workshop.enquiryHref} className="button button-ink">
          Ask about the next workshop ↗
        </Link>
      </div>
    </PageShell>
  );
}
