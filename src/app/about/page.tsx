import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Instructor } from "@/components/Instructor";
import { workshop } from "@/lib/workshop";
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
      intro="Chemizen Labs offers short workshops on molecular docking and computational drug design, along with academic and research support."
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
            Chemizen Labs offers workshops on CADD, molecular docking and
            related research tools. Each workshop costs {workshop.fee} and runs
            for up to 15 days. The topic, tools and timetable vary by batch.
          </p>
          <p>
            Students, faculty and researchers can also enquire about help with
            computational methods, data analysis, scientific writing and thesis
            planning. These services are discussed separately from workshop
            fees.
          </p>
          <Link href="/enquiry" className="text-link">
            Contact Chemizen Labs <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <Instructor />
    </PageShell>
  );
}
