import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
export const metadata = { title: "IJPCSR — Forthcoming journal" };
export default function Journal() {
  return (
    <PageShell
      eyebrow="SCHOLARLY PUBLISHING / FORTHCOMING"
      title={
        <>
          IJPCSR
          <br />
          <em>Journal information.</em>
        </>
      }
      intro="Introducing the International Journal of Pharmaceutical Chemistry Scientific Research (IJPCSR), a forthcoming Chemizen Labs publication."
    >
      <div className="wrap journal-page-grid">
        <div className="journal-cover">
          <span>CHEMIZEN LABS / SCHOLARLY PUBLISHING</span>
          <strong>
            IJPCSR<span>↗</span>
          </strong>
          <div className="journal-cover-lines">
            International Journal of
            <br />
            Pharmaceutical Chemistry
            <br />
            Scientific Research
          </div>
          <div className="journal-cover-bottom">
            INAUGURAL EDITION <span>IN DEVELOPMENT</span>
          </div>
        </div>
        <div>
          <span className="eyebrow">JOURNAL STATUS</span>
          <h2>Currently in development.</h2>
          <p>
            The planned journal will focus on computational pharmacology,
            medicinal chemistry, phytochemistry and pharmaceutical research,
            with open-access distribution and double-blind peer review.
          </p>
          <p>
            The journal portal, editorial policies and submission guidelines are
            being developed. Submissions are not open on this website.
          </p>
          <Link
            href="/enquiry?service=Journal%20enquiry"
            className="button button-ink"
          >
            Ask about the journal <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <section className="wrap method-section">
        <span className="eyebrow">PLANNED RESEARCH AREAS</span>
        {[
          "Computational chemistry & molecular docking",
          "ADMET prediction & toxicity modeling",
          "Phytochemistry & natural products",
          "Structure–activity relationships",
          "Synthetic pharmaceutical chemistry",
        ].map((t, i) => (
          <div className="method-row" key={t}>
            <span>0{i + 1}</span>
            <p>{t}</p>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
