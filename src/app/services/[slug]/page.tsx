import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { services } from "@/lib/content";
import { PageShell } from "@/components/PageShell";
import { ScientificArt } from "@/components/ScientificArt";
export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: services.find((s) => s.slug === slug)?.title || "Service not found",
  };
}
export default async function Service({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const i = services.findIndex((s) => s.slug === slug),
    s = services[i];
  if (!s) notFound();
  return (
    <PageShell
      eyebrow={`SCIENTIFIC & ACADEMIC OFFERINGS / 0${i + 1}`}
      title={s.title}
      intro={s.description}
    >
      <div className="wrap detail-grid">
        <div>
          <span className="eyebrow">WHO THIS IS FOR</span>
          <h2>{s.short}</h2>
          <p>{s.audience}</p>
          <Link
            className="button button-ink"
            href={`/enquiry?service=${encodeURIComponent(s.title)}`}
          >
            Enquire about this service <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="detail-art">
          <div className="detail-image-wrap">
            <Image
              src={`/assets/offerings-v2/${s.slug}.jpg`}
              alt={s.title}
              width={720}
              height={405}
              priority
              className="detail-feature-image"
            />
            <div className="detail-image-overlay" />
          </div>
          <span>{s.tags.join(" · ")}</span>
        </div>
      </div>
      <section className="wrap method-section">
        <span className="eyebrow">HOW WE APPROACH IT</span>
        {s.steps.map((step, i) => (
          <div className="method-row" key={step}>
            <span>0{i + 1}</span>
            <p>{step}</p>
          </div>
        ))}
        <p className="muted">
          {s.slug === "hands-on-workshops"
            ? "Contact us for batch dates, the syllabus and the session timetable. Workshops last up to 15 days."
            : "Contact us to discuss the work involved and the fee for your project. Research services are priced separately from workshops."}
        </p>
      </section>
      <div className="wrap page-callout">
        <Link href="/services" className="text-link">
          Explore all eight offerings <ArrowUpRight size={16} />
        </Link>
      </div>
    </PageShell>
  );
}
