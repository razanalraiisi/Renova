import React from "react";

/**
 * @param {{ label: string, value: string | number, hint?: string }[]} props.cards
 */
export default function RenovaReportSummaryCards({ cards = [] }) {
  if (!cards.length) return null;
  return (
    <div className="renovaReportStatGrid" aria-label="Report summary statistics">
      {cards.map((c) => (
        <div className="renovaReportStatCard" key={c.label}>
          <div className="renovaReportStatLabel">{c.label}</div>
          <div className="renovaReportStatValue">{c.value}</div>
          {c.hint ? <div className="renovaReportStatHint">{c.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}
