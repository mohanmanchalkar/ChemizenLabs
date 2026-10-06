import { PageShell } from "@/components/PageShell";
export const metadata = { title: "Privacy & enquiry data" };
export default function Privacy() {
  return (
    <PageShell
      eyebrow="PRIVACY & DATA"
      title={
        <>
          Privacy &
          <br />
          <em>enquiry data.</em>
        </>
      }
      intro="How this website handles information you submit when asking about Chemizen Labs services."
    >
      <div className="wrap privacy-prose prose">
        <h2>What we collect</h2>
        <p>
          The enquiry form requests your name, email, service interest and
          message. Phone and institution are optional. We record your consent,
          submission time and handling status. Please do not include
          confidential research, patient data or other sensitive information.
        </p>
        <h2>Why we use it</h2>
        <p>
          We use enquiry information to understand your request and contact you
          about it. Submitting an enquiry does not subscribe you to marketing
          messages.
        </p>
        <h2>Storage and access</h2>
        <p>
          When enquiry services are enabled, records are stored using Supabase.
          Resend delivers notification emails to the Chemizen Labs
          administrator. Only authorized administrators can access the enquiry
          dashboard. These providers process data to operate the service.
        </p>
        <h2>Cookies and technical information</h2>
        <p>
          Administrator sign-in uses session cookies. The public site does not
          add advertising or analytics cookies. A short-lived hashed network
          identifier is used to limit abusive submissions; it is not included in
          the admin enquiry record.
        </p>
        <h2>Retention and requests</h2>
        <p>
          Enquiries are retained while needed for responding and managing the
          relationship. To request access, correction or deletion, email{" "}
          <a href="mailto:chemizenlabs@gmail.com">chemizenlabs@gmail.com</a>.
          The administrator handles these requests; a self-service deletion tool
          is not provided.
        </p>
        <h2>External registration</h2>
        <p>
          When available, registration opens a Google Form. Information
          submitted there is handled through that form and Google’s services,
          separately from this site’s enquiry form.
        </p>
      </div>
    </PageShell>
  );
}
