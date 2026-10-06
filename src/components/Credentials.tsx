import { BadgeCheck, MonitorPlay, Video } from "lucide-react";
import { brochureUrl } from "@/lib/programmes";
export function Credentials() {
  return <section className="credentials" aria-label="Credentials and programme features"><div className="wrap">
    <div className="credential-strip">
      <div className="credential-mark"><BadgeCheck aria-hidden="true" /><span><strong>ISO <b>9001:2015</b></strong><small>Certified</small></span></div>
      <div className="credential-mark"><span className="msme-mark">MSME</span><small>Registered enterprise</small></div>
      <div className="credential-mark"><MonitorPlay aria-hidden="true" /><span><strong>Live online</strong><small>Practical training</small></span></div>
      <div className="credential-mark"><Video aria-hidden="true" /><span><strong>Learn & revisit</strong><small>Recordings · E-certificate*</small></span></div>
    </div>
    <p>Credentials and programme features as listed in the <a href={brochureUrl} target="_blank" rel="noreferrer">Chemizen Labs brochure ↗</a>. *E-certificate on successful completion.</p>
  </div></section>;
}
