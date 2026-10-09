import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
export function Instructor() {
  return (
    <section className="instructor section">
      <div className="wrap instructor-layout">
        <figure className="founder-portrait">
          <span className="portrait-orbit" aria-hidden="true" />
          <span className="eyebrow">THE PERSON BEHIND THE TRAINING</span>
          <Image
            src="/assets/founder.jpeg"
            alt="Mohan L. Manchalkar, founder and trainer at Chemizen Labs"
            width={1198}
            height={1313}
            sizes="(max-width: 760px) 90vw, 40vw"
          />
          <figcaption>Model. Predict. Validate.</figcaption>
        </figure>
        <div className="instructor-copy">
          <span className="eyebrow">05 / MEET THE TRAINER</span>
          <h2>
            Mohan
            <br />
            <em>Manchalkar</em>
          </h2>
          <p>
            Mohan teaches CADD, molecular docking and research software at
            Chemizen Labs. He mentors students and faculty through structured
            hands-on CADD and docking cohorts.
          </p>
          <div className="instructor-name">
            <div className="trainer-proof">
              <strong>1000+</strong>
              <span>Students & faculty trained</span>
            </div>
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
