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
      intro={`Workshops with Chemizen Labs cost ${workshop.fee} and last up to 15 days. The registration form is not available yet. Contact us for the next batch dates.`}
    >
      <div className="wrap pending-panel">
        <span className="status-dot" />
        <span>Registration link coming soon</span>
        <Link href={workshop.enquiryHref} className="button button-ink">
          Ask about the next workshop ↗
        </Link>
      </div>
    </PageShell>
  );
}
