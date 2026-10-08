"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { services } from "@/lib/content";
export function Offerings() {
  const track = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ start: true, end: false });
  function update() {
    const el = track.current;
    if (el)
      setPosition({
        start: el.scrollLeft < 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      });
  }
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  function move(dir: number) {
    const el = track.current;
    if (el)
      el.scrollBy({
        left: dir * ((el.firstElementChild?.clientWidth || 330) + 20),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }
  return (
    <section className="offerings section">
      <div className="offerings-bg-artwork" aria-hidden="true" />
      <div className="wrap">
        <div className="section-top">
          <div>
            <span className="eyebrow">02 / WHAT WE OFFER</span>
            <h2>
              CADD training &
              <br />
              <em>research support.</em>
            </h2>
          </div>
          <div className="carousel-intro">
            <p>
              Browse the workshop topics and research services available at
              Chemizen Labs.
            </p>
            <div className="carousel-buttons">
              <button
                className="icon-button"
                disabled={position.start}
                onClick={() => move(-1)}
                aria-label="Previous offerings"
              >
                <ArrowLeft size={17} />
              </button>
              <button
                className="icon-button"
                disabled={position.end}
                onClick={() => move(1)}
                aria-label="Next offerings"
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
        <div
          className="offering-track"
          ref={track}
          onScroll={update}
          tabIndex={0}
          aria-label="Eight academic offerings carousel"
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              move(e.key === "ArrowRight" ? 1 : -1);
            }
            if (e.key === "Home") {
              e.preventDefault();
              track.current?.scrollTo({ left: 0 });
            }
            if (e.key === "End") {
              e.preventDefault();
              track.current?.scrollTo({ left: track.current.scrollWidth });
            }
          }}
        >
          {services.map((s, i) => (
            <Link
              href={`/services/${s.slug}`}
              className={`offering-card card-tone-${i % 3}`}
              key={s.slug}
            >
              <div className="offering-image-wrap">
                <Image
                  src={`/assets/offerings-v2/${s.slug}.jpg`}
                  alt={s.title}
                  width={480}
                  height={270}
                  sizes="(max-width: 768px) 300px, 420px"
                  className="offering-image"
                />
                <div className="offering-image-overlay" />
                <span className="offering-badge">0{i + 1} / 08</span>
              </div>
              <div className="offering-card-body">
                <div className="offering-header-row">
                  <h3>{s.title}</h3>
                  <ArrowUpRight size={19} className="offering-arrow" />
                </div>
                <p>{s.short}</p>
                <div className="tags">
                  {s.tags.slice(0, 2).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="offering-bottom">
          <span>FOR STUDENTS, RESEARCHERS & COLLEGES</span>
          <Link href="/services" className="text-link">
            View all services <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="journal-feature">
          <div className="journal-cover">
            <span>CHEMIZEN LABS / SCHOLARLY PUBLISHING</span>
            <strong>
              IJPCSR<span>↗</span>
            </strong>
            <div className="journal-cover-lines">
              International Journal of
              <br />
              Pharmaceutical Chemistry
              <br />
              Scientific Research
            </div>
            <div className="journal-cover-bottom">
              INAUGURAL EDITION <span>FORTHCOMING</span>
            </div>
          </div>
          <div className="journal-feature-copy">
            <span className="eyebrow">UPCOMING JOURNAL</span>
            <h3>
              IJPCSR
              <br />
              <em>Pharmaceutical research.</em>
            </h3>
            <p>
              A planned journal covering pharmaceutical chemistry, molecular
              docking and related research. Submission dates will be announced
              when the journal is ready.
            </p>
            <Link href="/journal" className="text-link">
              Journal information <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
