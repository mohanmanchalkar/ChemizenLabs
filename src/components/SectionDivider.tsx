import React from "react";

interface SectionDividerProps {
  type: "dark-to-light" | "light-to-dark" | "offerings-to-light" | "light-to-footer";
  className?: string;
}

export function SectionDivider({ type, className = "" }: SectionDividerProps) {
  if (type === "dark-to-light") {
    return (
      <div className={`fluid-transition fluid-credentials-to-overview ${className}`} aria-hidden="true">
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="fluid-wave-svg"
        >
          {/* Subtle water caustics / secondary wave */}
          <path
            d="M0 25 C 280 65, 620 15, 960 55 C 1180 80, 1340 35, 1440 45 L 1440 90 L 0 90 Z"
            fill="rgba(247, 246, 242, 0.45)"
          />
          {/* Main seamless organic wave connecting into --paper */}
          <path
            d="M0 40 C 340 85, 720 30, 1080 75 C 1260 95, 1380 60, 1440 70 L 1440 90 L 0 90 Z"
            fill="var(--paper, #f7f6f2)"
          />
        </svg>
      </div>
    );
  }

  if (type === "light-to-dark") {
    return (
      <div className={`fluid-transition fluid-programmes-to-offerings ${className}`} aria-hidden="true">
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="fluid-wave-svg"
        >
          {/* Water-drop meniscus / translucent wave */}
          <path
            d="M0 15 C 320 50, 680 10, 1020 50 C 1220 70, 1360 30, 1440 40 L 1440 90 L 0 90 Z"
            fill="rgba(11, 18, 28, 0.5)"
          />
          {/* Main dark fluid wave connecting into Offerings section */}
          <path
            d="M0 35 C 380 75, 760 25, 1100 65 C 1260 85, 1380 50, 1440 60 L 1440 90 L 0 90 Z"
            fill="#0b121c"
          />
        </svg>
      </div>
    );
  }

  if (type === "offerings-to-light") {
    return (
      <div className={`fluid-transition fluid-offerings-to-light ${className}`} aria-hidden="true">
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="fluid-wave-svg"
        >
          <path
            d="M0 20 C 300 55, 660 10, 1000 50 C 1200 70, 1350 30, 1440 40 L 1440 90 L 0 90 Z"
            fill="rgba(247, 246, 242, 0.45)"
          />
          <path
            d="M0 38 C 360 80, 740 25, 1080 65 C 1240 85, 1370 45, 1440 55 L 1440 90 L 0 90 Z"
            fill="var(--paper, #f7f6f2)"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`fluid-transition fluid-instructor-to-footer ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="fluid-wave-svg"
      >
        <path
          d="M0 20 C 340 60, 720 15, 1060 55 C 1240 75, 1380 35, 1440 45 L 1440 90 L 0 90 Z"
          fill="rgba(9, 14, 24, 0.55)"
        />
        <path
          d="M0 38 C 380 80, 780 28, 1120 70 C 1280 90, 1390 55, 1440 65 L 1440 90 L 0 90 Z"
          fill="#090e18"
        />
      </svg>
    </div>
  );
}
