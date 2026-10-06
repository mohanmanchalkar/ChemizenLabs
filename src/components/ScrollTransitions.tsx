"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollTransitions() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const selectors = [
      ".section-top",
      ".hero-intro",
      ".hero-glass",
      ".video-placeholder",
      ".credential-mark",
      ".overview-text",
      ".protein-stage",
      ".programme",
      ".offering-card",
      ".journal-feature",
      ".insight-card",
      ".instructor-portrait",
      ".instructor-profile",
      ".service-row",
      ".method-row",
      ".page-callout",
      ".enquiry-layout",
      ".journal-page-grid",
      ".about-narrative",
      ".reveal-on-scroll",
    ];

    const elements = document.querySelectorAll(selectors.join(", "));

    // Assign scroll-reveal class if not already added
    elements.forEach((el, index) => {
      if (!el.classList.contains("scroll-reveal")) {
        el.classList.add("scroll-reveal");
        // Add subtle staggered delays for sibling grids/cards
        const delay = (index % 4) * 0.08;
        if (delay > 0) {
          (el as HTMLElement).style.transitionDelay = `${delay}s`;
        }
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          }
        });
      },
      {
        threshold: 0.02,
        rootMargin: "0px 0px 50px 0px",
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
