import { PageShell } from "@/components/PageShell";
import { EnquiryForm } from "@/components/EnquiryForm";
import { enquiriesConfigured } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export const metadata = { title: "Workshop & research enquiries" };
export default async function Enquiry({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  return (
    <PageShell
      eyebrow="CONTACT CHEMIZEN LABS"
      title={
        <>
          Ask about a workshop
          <br />
          <em>or research support.</em>
        </>
      }
      intro="Need batch dates, the syllabus or help choosing a workshop? Send your question below or contact us directly."
    >
      <div className="wrap enquiry-layout">
        <aside>
          <span className="eyebrow">DIRECT CONTACT</span>
          <h3>Workshop enquiries</h3>
          <p>
            Ask about the next batch, what you need to install, or training for
            your college. You can also enquire about research services here.
          </p>
          <a href="mailto:chemizenlabs@gmail.com">chemizenlabs@gmail.com ↗</a>
          <a href="tel:+916361009705">+91 63610 09705</a>
          <span className="enquiry-aside-note">
            Include the workshop topic
            <br />
            and your preferred dates.
          </span>
        </aside>
        <EnquiryForm
          initialService={service}
          available={enquiriesConfigured()}
        />
      </div>
    </PageShell>
  );
}
