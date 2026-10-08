import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Instructor } from "@/components/Instructor";
import { Credentials } from "@/components/Credentials";
export const metadata = { title: "About Chemizen Labs" };
export default function About() {
  return (
    <PageShell
      eyebrow="ABOUT CHEMIZEN LABS"
      title={
        <>
          CADD training with
          <br />
          <em>Chemizen Labs.</em>
        </>
      }
      intro="Chemizen Labs, Karnataka, offers online practical training in network pharmacology, molecular docking and computational drug discovery, alongside academic and research support."
    >
      <section className="wrap about-narrative">
        <span className="eyebrow">WORKSHOPS & RESEARCH SUPPORT</span>
        <div>
          <h2>
            Learn the software.
            <br />
            <em>Understand the results.</em>
          </h2>
          <p>
            Start with a structure, a set of compounds or a research question.
            Chemizen Labs programmes take learners through the software used to
            investigate it: from network and target analysis to docking,
            molecular visualisation and ADMET prediction. Choose a short
            workshop or a month-long practical internship.
          </p>
          <p>
            Chemizen Labs has trained 1000+ students and faculty. Students,
            faculty and researchers can also enquire about help with
            computational methods, data analysis, scientific writing and thesis
            planning. These services are discussed separately from workshop
            fees.
          </p>
          <Link href="/enquiry" className="text-link">
            Contact Chemizen Labs <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <Credentials />
      <Instructor />
    </PageShell>
  );
}
