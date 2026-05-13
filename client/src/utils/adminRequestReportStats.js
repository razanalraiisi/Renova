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
 *   other: number,
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
    other: 0,
    pickup: 0,
    dropoff: 0,
  };
  for (const r of list) {
    const st = normStatus(r.status);
    if (st === "pending") out.pending += 1;
    else if (st === "accepted") out.accepted += 1;
    else if (st === "completed") out.completed += 1;
    else if (st === "rejected") out.rejected += 1;
    else out.other += 1;

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
    { label: "Pending", value: stats.pending, color: "#94a3b8" },
    { label: "Accepted", value: stats.accepted, color: "#22c55e" },
    { label: "Completed", value: stats.completed, color: "#0080aa" },
    { label: "Rejected", value: stats.rejected, color: "#ef4444" },
    { label: "Other", value: stats.other, color: "#cbd5e1" },
  ].filter((p) => p.value > 0);
  if (pairs.length === 0) {
    return { labels: ["No data"], data: [1], colors: ["#e2e8f0"] };
  }
  return {
    labels: pairs.map((p) => p.label),
    data: pairs.map((p) => p.value),
    colors: pairs.map((p) => p.color),
  };
}
