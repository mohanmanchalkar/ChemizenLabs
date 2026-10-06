import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Programmes } from "@/components/Programmes";
import { workshop } from "@/lib/workshop";
export const metadata = { title: "Network Pharmacology, CADD Workshops & Internships" };
export default function Workshops() {
  return <PageShell eyebrow="WORKSHOPS & INTERNSHIPS" title={<>Learn by doing.<br/><em className="script-accent">Understand by exploring.</em></>} intro="Online practical training in network pharmacology, molecular docking and computational drug discovery, with Chemizen Labs, Karnataka.">
    <Programmes detailed />
    <section className="wrap method-section"><span className="eyebrow">BEFORE YOU JOIN</span>
      {[
        ["Who can join?", "UG and PG students, research scholars, PhD scholars, faculty and industry professionals in pharmacy, biotechnology and life sciences."],
        ["Session format", "Live online training with practical software workflows. The internship brochure specifies Google Meet. Recordings are provided for the programme duration; an e-certificate is issued on successful completion."],
        ["Fees & next intake", "The September 2026 brochures list standard fees of ₹600 for UG/PG students and ₹800 for researchers, faculty and industry participants. Those cohort dates and early-registration deadlines are not a current offer. Please confirm the next batch, fee and timetable before registering."],
        ["Prepare your laptop", "Ask for the software list and setup instructions for your chosen programme. The two tracks use different combinations of molecular viewers, docking software and online databases."],
      ].map(([title, copy])=><div className="method-row" key={title}><h3>{title}</h3><p>{copy}</p></div>)}
      <div className="actions"><Link href={workshop.enquiryHref} className="button button-ink">Ask about the next intake ↗</Link><Link href="/register" className="button button-outline">Registration information</Link></div>
    </section>
  </PageShell>;
}
