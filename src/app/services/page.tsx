import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/content";
import { PageShell } from "@/components/PageShell";
export const metadata = { title: "Scientific & academic services" };
export default function Services() {
  return (
    <PageShell
      eyebrow="TRAINING & ACADEMIC SERVICES"
      title={
        <>
          CADD workshops &
          <br />
          <em>research support.</em>
        </>
      }
      intro="Browse the topics we teach and the research services we offer. The ₹600 workshop fee applies to workshops; other services are scoped and priced separately."
    >
      <div className="wrap service-list">
        {services.map((s, i) => (
          <Link
            className="service-row"
            href={`/services/${s.slug}`}
            key={s.slug}
          >
            <span className="service-index">0{i + 1}</span>
            <h2>{s.title}</h2>
            <p>{s.description}</p>
            <ArrowUpRight size={26} />
          </Link>
        ))}
      </div>
      <div className="wrap page-callout">
        <h2>Need help choosing a workshop?</h2>
        <p>Tell us which tools you have used and what you want to learn.</p>
        <Link className="button button-ink" href="/enquiry">
          Send an enquiry <ArrowUpRight size={16} />
        </Link>
      </div>
    </PageShell>
  );
}
