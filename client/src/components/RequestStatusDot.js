import React from "react";

/**
 * Maps API status strings (Pickup/DropOff) to a stable key for styling and filters.
 * Colors: grey pending, red rejected, yellow accepted, green completed.
 */
export function normalizeRequestStatusKey(raw) {
  const t = String(raw ?? "").trim().toLowerCase();
  if (t === "pending") return "pending";
  if (t === "rejected") return "rejected";
  if (t === "accepted") return "accepted";
  if (t === "completed") return "completed";
  if (t === "canceled" || t === "cancelled") return "canceled";
  return "unknown";
}

export function rowMatchesStatusFilter(recordStatus, filterValue) {
  if (!filterValue || !String(filterValue).trim()) return true;
  return normalizeRequestStatusKey(recordStatus) === String(filterValue).trim().toLowerCase();
}

export default function RequestStatusDot({ status }) {
  const key = normalizeRequestStatusKey(status);
  const display =
    key === "unknown" && !String(status ?? "").trim()
      ? "Unknown"
      : String(status ?? "").trim() || "Unknown";

  return (
    <span
      className={`reportStatusDot reportStatusDot--${key}`}
      title={display}
      aria-label={`Status: ${display}`}
      role="img"
    />
  );
}
