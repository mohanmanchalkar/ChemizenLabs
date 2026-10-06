import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { workshop } from "@/lib/workshop";
import { Brand } from "./Brand";
export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-invitation">
          <div>
            <span className="eyebrow">WORKSHOP ENQUIRIES</span>
            <h2>
              Questions about
              <br />
              <em>the next workshop?</em>
            </h2>
          </div>
          <Link href={workshop.enquiryHref} className="button button-light">
            Ask about the next batch <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="footer-columns">
          <div className="footer-brand">
            <Link href="/" className="brand">
              <Brand />
            </Link>
            <p>
              CADD & molecular docking
              <br />
              workshops at Chemizen Labs.
            </p>
          </div>
          <div>
            <span className="eyebrow">TRAINING & SERVICES</span>
            <Link href="/services">Our services</Link>
            <Link href="/workshops">Workshops</Link>
            <Link href="/journal">IJPCSR journal</Link>
          </div>
          <div>
            <span className="eyebrow">ABOUT & RESOURCES</span>
            <Link href="/about">About Chemizen</Link>
            <Link href="/insights">Learning guides</Link>
            <Link href="/register">Registration</Link>
            <a href="https://www.linkedin.com/company/chemizenlabs/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          </div>
          <div>
            <span className="eyebrow">CONTACT</span>
            <a href="mailto:chemizenlabs@gmail.com">
              chemizenlabs@gmail.com <ArrowUpRight size={12} />
            </a>
            <a href="tel:+916361009705">+91 63610 09705</a>
            <span className="footer-address">
              Contact us for batch dates and course details.
            </span>
          </div>
        </div>
        <div className="footer-legal">
          <span>© {new Date().getFullYear()} Chemizen Labs</span>
          <span>CADD TRAINING & RESEARCH SUPPORT</span>
          <Link href="/privacy">Privacy & data</Link>
        </div>
      </div>
      <div className="footer-earth">
        <Image
          src="/assets/earth-footer-v2.png"
          alt="Earth’s blue horizon seen from space"
          width={1983}
          height={428}
          sizes="100vw"
        />
      </div>
    </footer>
  );
}
