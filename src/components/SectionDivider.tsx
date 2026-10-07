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
          shapeRendering="geometricPrecision"
          className="fluid-wave-svg"
          style={{ overflow: "visible" }}
        >
          {/* Subtle translucent water-drop wave */}
          <path
            d="M0 25 C 280 65, 620 15, 960 55 C 1180 80, 1340 35, 1440 45 L 1440 96 L 0 96 Z"
            fill="rgba(247, 248, 244, 0.45)"
          />
          {/* Main solid wave connecting seamlessly into Overview */}
          <path
            d="M0 45 C 340 85, 720 30, 1080 75 C 1260 95, 1380 60, 1440 70 L 1440 96 L 0 96 Z"
            fill="var(--paper, #f7f8f4)"
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
          shapeRendering="geometricPrecision"
          className="fluid-wave-svg"
          style={{ overflow: "visible" }}
        >
          {/* Translucent water meniscus wave */}
          <path
            d="M0 20 C 320 55, 680 15, 1020 55 C 1220 75, 1360 35, 1440 45 L 1440 96 L 0 96 Z"
            fill="rgba(11, 18, 28, 0.4)"
          />
          {/* Main solid dark wave connecting into Offerings section */}
          <path
            d="M0 42 C 380 80, 760 25, 1100 68 C 1260 88, 1380 52, 1440 62 L 1440 96 L 0 96 Z"
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
          shapeRendering="geometricPrecision"
          className="fluid-wave-svg"
          style={{ overflow: "visible" }}
        >
          {/* Translucent light wave */}
          <path
            d="M0 22 C 300 58, 660 12, 1000 52 C 1200 72, 1350 32, 1440 42 L 1440 96 L 0 96 Z"
            fill="rgba(247, 248, 244, 0.45)"
          />
          {/* Main solid light wave connecting into Testimonials */}
          <path
            d="M0 42 C 360 82, 740 25, 1080 68 C 1240 88, 1370 48, 1440 58 L 1440 96 L 0 96 Z"
            fill="var(--paper, #f7f8f4)"
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
        shapeRendering="geometricPrecision"
        className="fluid-wave-svg"
        style={{ overflow: "visible" }}
      >
        {/* Translucent water-drop wave */}
        <path
          d="M0 22 C 340 62, 720 18, 1060 58 C 1240 78, 1380 38, 1440 48 L 1440 96 L 0 96 Z"
          fill="rgba(5, 12, 23, 0.42)"
        />
        {/* Main solid dark wave connecting into Footer with matching #050c17 */}
        <path
          d="M0 42 C 380 82, 780 28, 1120 70 C 1280 90, 1390 55, 1440 65 L 1440 96 L 0 96 Z"
          fill="#050c17"
        />
      </svg>
    </div>
  );
}
