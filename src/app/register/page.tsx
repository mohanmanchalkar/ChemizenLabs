import { redirect } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { googleFormUrl } from "@/lib/registration";
import { workshop } from "@/lib/workshop";
import { EnquiryForm } from "@/components/EnquiryForm";
import { enquiriesConfigured } from "@/lib/supabase";
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
          Register for a CADD
          <br />
          <em>workshop.</em>
        </>
      }
      intro="Register for our upcoming Network Pharmacology & CADD workshop or Molecular Docking internship. Fill in your details below and our team will get back to you with batch confirmation and syllabus."
    >
      <div className="wrap enquiry-layout">
        <aside>
          <span className="eyebrow">WORKSHOP DETAILS</span>
          <h3>Upcoming Cohorts</h3>
          <p>
            Choose your preferred workshop topic, enter your contact information
            and our team will confirm your seat and batch timings.
          </p>
          <div className="workshop-card" style={{ marginTop: "24px" }}>
            <span className="eyebrow">ACTIVE WORKSHOP</span>
            <h4 style={{ margin: "8px 0" }}>Hands-on CADD & Docking</h4>
            <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0 }}>
              Practical software training · Structured hands-on modules led by expert faculty.
            </p>
          </div>
          <div style={{ marginTop: "24px" }}>
            <a href="mailto:chemizenlabs@gmail.com">chemizenlabs@gmail.com ↗</a>
            <br />
            <a href="tel:+916361009705">+91 63610 09705</a>
          </div>
        </aside>
        <EnquiryForm
          initialService="Hands-on scientific workshops"
          available={
            enquiriesConfigured() || process.env.NODE_ENV === "development"
          }
        />
      </div>
    </PageShell>
  );
}
