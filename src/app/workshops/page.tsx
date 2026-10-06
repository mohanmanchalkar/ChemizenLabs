import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { workshop } from "@/lib/workshop";
export const metadata = { title: "CADD workshops · ₹600 · Up to 15 days" };
export default function Workshops() {
  return (
    <PageShell
      eyebrow="WORKSHOPS AT CHEMIZEN LABS"
      title={
        <>
          CADD & molecular
          <br />
          <em>docking workshops.</em>
        </>
      }
      intro={`Learn the tools used in computational drug-design studies. Workshops cost ${workshop.fee} and last up to 15 days, depending on the topic.`}
    >
      <dl className="wrap workshop-summary">
        <div>
          <dt>Workshop fee</dt>
          <dd>{workshop.fee}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{workshop.duration}</dd>
        </div>
        <div>
          <dt>Organised by</dt>
          <dd>Chemizen Labs</dd>
        </div>
      </dl>
      <div className="wrap workshop-feature">
        <div>
          <span className="eyebrow">WHAT THE TRAINING COVERS</span>
          <h2>
            Molecular preparation,
            <br />
            <em>docking and analysis.</em>
          </h2>
          <p>
            Learn how to prepare protein and ligand files, run docking, inspect
            poses and review ADMET predictions. The software and exercises
            covered depend on the workshop. Contact us for the syllabus and
            schedule of the next batch.
          </p>
          <div className="actions">
            <Link href="/register" className="button button-ink">
              Register for a workshop <ArrowUpRight size={16} />
            </Link>
            <Link href={workshop.enquiryHref} className="button button-outline">
              Ask for batch dates
            </Link>
          </div>
        </div>
        <div className="workshop-tools">
          {[
            "PyMOL",
            "AutoDock / Vina",
            "Discovery Studio",
            "SwissADME",
            "PASS Online",
            "ProTox",
          ].map((t, i) => (
            <div key={t}>
              <span>0{i + 1}</span>
              {t}
            </div>
          ))}
        </div>
      </div>
      <div className="wrap method-section">
        <span className="eyebrow">BEFORE YOU JOIN</span>
        {[
          [
            "Fee & duration",
            `The fee is ${workshop.fee} per workshop. Workshops run for 15 days or less; the exact duration depends on the batch.`,
          ],
          [
            "Topics & software",
            "Ask which tools and topics are included in the batch you want to join, along with any setup requirements.",
          ],
          [
            "College workshops",
            "Colleges and faculty can contact Chemizen Labs to discuss training for their students or research teams.",
          ],
        ].map(([t, d]) => (
          <div className="method-row" key={t}>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
        <p className="notice">
          Next batch dates have not been listed yet. Contact us for the current
          schedule before registering.
        </p>
      </div>
    </PageShell>
  );
}
