import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check, FileDown } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { programmes, brochureUrl } from "@/lib/programmes";
export const metadata = { title: "Choose your workshop" };
export default function Register() {
  return (
    <PageShell
      eyebrow="WORKSHOP REGISTRATION"
      title={
        <>
          Choose your next
          <br />
          <em className="script-accent">step in research.</em>
        </>
      }
      intro="Two practical programmes from Chemizen Labs. Compare the topics, choose your track and enroll using its Google Form."
    >
      <section
        className="wrap registration-options"
        aria-label="Training programmes"
      >
        <div className="registration-grid">
          {programmes.map((p, i) => (
            <article className="registration-card" key={p.number}>
              <div className="registration-cover">
                <Image
                  src={
                    i === 0
                      ? "/assets/offerings-v2/molecular-design.jpg"
                      : "/assets/offerings-v2/cadd-molecular-docking.jpg"
                  }
                  alt=""
                  width={720}
                  height={405}
                  sizes="(max-width: 760px) 90vw, 45vw"
                />
                <span>{p.duration}</span>
              </div>
              <div className="registration-content">
                <span className="eyebrow">
                  PROGRAMME {p.number} / LIVE ONLINE
                </span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <ul>
                  {p.topics.map((t) => (
                    <li key={t}>
                      <Check size={16} aria-hidden="true" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <dl className="registration-facts">
                  <div>
                    <dt>Student fee</dt>
                    <dd>₹600</dd>
                  </div>
                  <div>
                    <dt>Research / faculty / industry</dt>
                    <dd>₹800</dd>
                  </div>
                </dl>
                <div className="registration-benefits">
                  <span>Session recordings</span>
                  <span>Completion e-certificate</span>
                  <span>Doubt-clearing sessions</span>
                </div>
                <p className="registration-cohort">
                  Cohort dates and session timings will be communicated to you.
                </p>
                <div className="registration-actions">
                  <a
                    className="button button-ink"
                    href={p.formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Enroll in this programme <ArrowUpRight size={17} />
                  </a>
                  <Link
                    href={`/enquiry?service=${encodeURIComponent(p.title)}`}
                    className="button button-outline"
                  >
                    Outside India? Enquire here <ArrowUpRight size={17} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="registration-note">
          <a
            href={brochureUrl}
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            <FileDown size={17} /> Read the brochure
          </a>
        </div>
        <div className="registration-help">
          <h3>Not sure which track fits?</h3>
          <p>Tell us your background and what you want to learn.</p>
          <Link
            href="/enquiry?service=Hands-on%20scientific%20workshops"
            className="text-link"
          >
            Ask Chemizen Labs <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
