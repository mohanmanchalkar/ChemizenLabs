import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function Instructor() {
  return (
    <section className="instructor section">
      <div className="wrap instructor-layout">
        <div
          className="instructor-monogram"
          aria-label="Typographic placeholder for instructor portrait"
        >
          <span className="eyebrow">YOUR WORKSHOP TRAINER</span>
          <span className="monogram">
            MLM<span>·</span>
          </span>
          <span className="monogram-caption">
            MOHAN L. MANCHALKAR
            <br />
            FOUNDER & TRAINER
          </span>
        </div>
        <div className="instructor-copy">
          <span className="eyebrow">05 / MEET THE TRAINER</span>
          <h2>
            Mohan L.
            <br />
            <em>Manchalkar</em>
          </h2>
          <p>
            Mohan teaches CADD, molecular docking and research software at
            Chemizen Labs. His workshops run for up to 15 days, depending on the
            topic.
          </p>
          <div className="instructor-name">
            <strong>Founder, Chemizen Labs</strong>
            <span>
              M.Pharm (Pharmaceutical Chemistry)
              <br />
              Former Assistant Professor
            </span>
          </div>
          <Link href="/about" className="text-link">
            More about Mohan <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
