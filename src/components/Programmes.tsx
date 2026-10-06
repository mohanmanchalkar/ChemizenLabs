import Link from "next/link";
import { ArrowUpRight, FileDown } from "lucide-react";
import { programmes, brochureUrl } from "@/lib/programmes";
import { workshop } from "@/lib/workshop";
export function Programmes({ detailed = false }: { detailed?: boolean }) {
  return <section className="section programmes"><div className="wrap">
    <div className="section-top"><div><span className="eyebrow">HANDS-ON LEARNING</span><h2>Two ways to build<br /><em className="script-accent">your research skills.</em></h2></div><p>For UG and PG students, research scholars, faculty and professionals in pharmacy, biotechnology and life sciences.</p></div>
    <div className="programme-list">{programmes.map(p => <article className="programme" key={p.number}>
      <span className="programme-number">{p.number}</span><div><span className="eyebrow">{p.duration}</span><h3>{p.title}</h3><p>{p.description}</p>
      {detailed && <ul>{p.topics.map(t=><li key={t}>{t}</li>)}</ul>}
      {detailed && <p className="cohort-note">{p.cohort}. Contact us for future intake dates and availability.</p>}
      <Link href={detailed ? workshop.enquiryHref : "/workshops"} className="text-link">{detailed ? "Ask about this programme" : "Explore the programme"}<ArrowUpRight size={17}/></Link></div>
    </article>)}</div>
    <div className="programme-foot"><p>Live online sessions, access to recordings, and an e-certificate on successful completion, as described in the brochure.</p><a className="text-link" href={brochureUrl} target="_blank" rel="noreferrer"><FileDown size={18}/> View training brochure</a></div>
  </div></section>;
}
