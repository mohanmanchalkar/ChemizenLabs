import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowDown, AudioLines } from "lucide-react";
import { HeroRipples } from "./HeroRipples";
import { workshop } from "@/lib/workshop";
export function Hero() {
  return (
    <section className="hero">
      <Image
        src="/assets/section1bgimage.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hero-background"
      />
      <div className="hero-shade" />
      <HeroRipples />
      <div className="hero-content wrap">
        <div className="hero-intro">
          <span className="eyebrow">
            <span className="status-dot" /> NETWORK PHARMACOLOGY & DRUG DISCOVERY
          </span>
          <h1>
            Learn molecular
            <br />
            <em>docking.</em>
          </h1>
          <p>
            Hands-on training in molecular docking, network pharmacology and
            computational drug discovery. Learn the tools. Understand the results.
          </p>
        </div>
        <div className="hero-bottom">
          <div className="hero-glass">
            <div className="hero-glass-heading">
              <span className="eyebrow">
                ONLINE WORKSHOPS · PRACTICAL TRAINING
              </span>
            </div>
            <div className="workshop-quick-facts">
              <div>
                <strong>Certified Training</strong>
                <span>Structured hands-on modules led by expert faculty</span>
              </div>
            </div>
            <p>
              Prepare molecules, explore target networks and interpret docking
              results with guidance from Chemizen Labs.
            </p>
            <div className="actions">
              <Link href="/register" className="button button-light">
                Register for a workshop <ArrowUpRight size={16} />
              </Link>
              <Link href={workshop.enquiryHref} className="hero-enquire">
                Ask about a batch <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="hero-note">
              Contact us for the next batch dates and syllabus.
            </div>
          </div>
          <div
            className="video-placeholder"
            aria-label="Introduction video coming soon"
          >
            <div className="video-top">
              <span className="eyebrow">ABOUT CHEMIZEN LABS</span>
              <span>VIDEO</span>
            </div>
            <div className="video-symbol">
              <AudioLines size={46} strokeWidth={1} />
            </div>
            <div>
              <span className="video-title">
                Chemizen Labs
                <br />
                CADD workshops
              </span>
              <span className="video-status">
                Workshop introduction · Video coming soon
              </span>
            </div>
          </div>
        </div>
        <div className="hero-foot">
          <span>FOR PHARMACY & LIFE-SCIENCE STUDENTS</span>
          <span>
            WORKSHOP DETAILS <ArrowDown size={14} />
          </span>
        </div>
      </div>
    </section>
  );
}
