"use client";

import { useState } from "react";

export function AudienceAccordion({
  items,
}: {
  items: readonly (readonly [string, string, string])[];
}) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="audiences" role="region" aria-label="Who can join Chemizen Labs workshops">
      {items.map(([n, title, desc]) => {
        const isOpen = Boolean(openItems[n]);
        return (
          <div key={n} className={`audience-item ${isOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="audience-summary"
              onClick={() => toggle(n)}
              aria-expanded={isOpen}
              aria-controls={`audience-desc-${n}`}
            >
              <span className="audience-num">{n}</span>
              <span className="audience-title">{title}</span>
              <span className="audience-plus" aria-hidden="true">
                +
              </span>
            </button>
            <div
              id={`audience-desc-${n}`}
              className="audience-body"
              role="region"
            >
              <div className="audience-inner">
                <p>{desc}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
