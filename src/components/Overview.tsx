import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProteinViewer } from "./ProteinViewer";
import { AudienceAccordion } from "./AudienceAccordion";
const audiences = [
  [
    "01",
    "Students & scholars",
    "B.Pharm, M.Pharm, M.Sc. and Ph.D. students learning docking and computational research methods.",
  ],
  [
    "02",
    "Academic researchers",
    "Faculty and researchers who need help planning docking studies or interpreting their results.",
  ],
  [
    "03",
    "Pharma learners",
    "Pharmacy graduates who want practical experience with AutoDock, PyMOL and ADMET tools.",
  ],
  [
    "04",
    "Biotech professionals",
    "Professionals working on target selection, molecular properties and compound screening.",
  ],
  [
    "05",
    "Life-science institutions",
    "Colleges and laboratories arranging student workshops or faculty training.",
  ],
] as const;
export function Overview() {
  return (
    <section className="section overview">
      <div className="wrap">
        <div className="section-top">
          <div>
            <span className="eyebrow">01 / ABOUT THE WORKSHOPS</span>
            <h2>
              Practical CADD training
              <br />
              <em>by Chemizen Labs.</em>
            </h2>
          </div>
          <p>
            Chemizen Labs offers online workshops and internships in network
            pharmacology, molecular docking and computational drug discovery.
            Work through structure preparation, target analysis and molecular
            visualisation, with time to understand what the results mean.
          </p>
        </div>
        <div className="overview-grid">
          <div className="overview-copy">
            <div className="overview-facts">
              <div>
                <strong>8</strong>
                <span>
                  Academic
                  <br />
                  offerings
                </span>
              </div>
              <div>
                <strong>100%</strong>
                <span>
                  Practical
                  <br />
                  workflow
                </span>
              </div>
            </div>
            <span className="eyebrow audience-heading">WHO CAN JOIN?</span>
            <AudienceAccordion items={audiences} />
            <Link className="text-link" href="/about">
              About Chemizen Labs <ArrowUpRight size={16} />
            </Link>
          </div>
          <ProteinViewer />
        </div>
      </div>
    </section>
  );
}
