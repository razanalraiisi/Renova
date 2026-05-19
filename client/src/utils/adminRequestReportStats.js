/** Normalize request rows for admin reports (pickup + drop-off merged shape). */

function normStatus(s) {
  return String(s || "")
    .toLowerCase()
    .trim();
}

/**
 * @param {Array<object>} rows
 * @returns {{
 *   total: number,
 *   pending: number,
 *   accepted: number,
 *   completed: number,
 *   rejected: number,
 *   canceled: number,
 *   pickup: number,
 *   dropoff: number,
 * }}
 */
export function summarizeAdminRequestRows(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const out = {
    total: list.length,
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0,
    canceled: 0,
    pickup: 0,
    dropoff: 0,
  };
  for (const r of list) {
    const st = normStatus(r.status);
    if (st === "pending") out.pending += 1;
    else if (st === "accepted") out.accepted += 1;
    else if (st === "completed") out.completed += 1;
    else if (st === "rejected") out.rejected += 1;
    else if (st === "canceled" || st === "cancelled") out.canceled += 1;

    if (String(r.source || "").toLowerCase() === "dropoff") out.dropoff += 1;
    else out.pickup += 1;
  }
  return out;
}

/**
 * @param {ReturnType<summarizeAdminRequestRows>} stats
 * @returns {{ labels: string[], data: number[], colors: string[] }}
 */
export function statusDistributionForChart(stats) {
  const pairs = [
    { label: "Pending", value: stats.pending, color: "#94a3b8", filterKey: "pending" },
    { label: "Accepted", value: stats.accepted, color: "#22c55e", filterKey: "accepted" },
    { label: "Completed", value: stats.completed, color: "#0080aa", filterKey: "completed" },
    { label: "Rejected", value: stats.rejected, color: "#ef4444", filterKey: "rejected" },
    { label: "Canceled", value: stats.canceled, color: "#9333ea", filterKey: "canceled" },
  ].filter((p) => p.value > 0);
  if (pairs.length === 0) {
    return {
      labels: ["No data"],
      data: [1],
      colors: ["#e2e8f0"],
      filterKeys: [null],
    };
  }
  return {
    labels: pairs.map((p) => p.label),
    data: pairs.map((p) => p.value),
    colors: pairs.map((p) => p.color),
    filterKeys: pairs.map((p) => p.filterKey),
  };
}

/** @param {number} barIndex 0 = Pickup, 1 = Drop-off */
export function barIndexToSourceFilter(barIndex) {
  return barIndex === 1 ? "dropoff" : "pickup";
}

export function categoryKeyToFilterLabel(key) {
  const row = REQUEST_CATEGORY_CHART_SERIES.find((s) => s.key === key);
  return row?.label ?? "";
}

/** Recycle / Upcycle / Dispose — blue shades aligned with ReNova theme. */
export const REQUEST_CATEGORY_CHART_SERIES = [
  { key: "recycle", label: "Recycle", color: "#006d90" },
  { key: "upcycle", label: "Upcycle", color: "#0080aa" },
  { key: "dispose", label: "Dispose", color: "#5cbad4" },
];

function normRequestCategory(raw) {
  const s = String(raw || "").toLowerCase().trim();
  if (s.includes("recycl")) return "recycle";
  if (s.includes("upcycl")) return "upcycle";
  if (s.includes("dispose")) return "dispose";
  return null;
}

/**
 * Count requests by source (pickup / drop-off) and user category.
 * @param {Array<object>} rows
 * @returns {{ pickup: { recycle: number, upcycle: number, dispose: number }, dropoff: { recycle: number, upcycle: number, dispose: number } }}
 */
export function pickupDropoffCategoryBreakdown(rows) {
  const out = {
    pickup: { recycle: 0, upcycle: 0, dispose: 0 },
    dropoff: { recycle: 0, upcycle: 0, dispose: 0 },
  };
  const list = Array.isArray(rows) ? rows : [];
  for (const r of list) {
    const cat = normRequestCategory(r.category);
    if (!cat) continue;
    const src =
      String(r.source || "").toLowerCase() === "dropoff" ? "dropoff" : "pickup";
    out[src][cat] += 1;
  }
  return out;
}

/**
 * Chart.js stacked bar config: Pickup vs Drop-off with Recycle / Upcycle / Dispose segments.
 * @param {Array<object>} rows
 */
export function pickupDropoffStackedBarForChart(rows) {
  const counts = pickupDropoffCategoryBreakdown(rows);
  return {
    labels: ["Pickup", "Drop-off"],
    datasets: REQUEST_CATEGORY_CHART_SERIES.map(({ key, label, color }) => ({
      label,
      data: [counts.pickup[key], counts.dropoff[key]],
      backgroundColor: color,
      borderColor: "#fff",
      borderWidth: 1,
      borderRadius: 4,
    })),
  };
}
