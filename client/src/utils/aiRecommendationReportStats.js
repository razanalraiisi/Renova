/** Client-side rollups for AI recommendation admin reports. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const AI_REC_COLORS = {
  Dispose: "#006d90",
  Recycle: "#0080aa",
  Upcycle: "#5cbad4",
};

function normRec(value) {
  const s = String(value || "").toLowerCase();
  if (s.includes("dispose")) return "Dispose";
  if (s.includes("recycl")) return "Recycle";
  if (s.includes("upcycl")) return "Upcycle";
  return null;
}

export function summarizeAIRecommendationRows(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const out = {
    total: list.length,
    dispose: 0,
    recycle: 0,
    upcycle: 0,
    followed: 0,
    ignored: 0,
    pending: 0,
    uniqueUsers: 0,
    followRatePercent: 0,
    mostSuggested: "—",
  };

  const users = new Set();
  const recCounts = { Dispose: 0, Recycle: 0, Upcycle: 0 };

  for (const r of list) {
    const rec = normRec(r.aiRecommendation);
    if (rec === "Dispose") out.dispose += 1;
    else if (rec === "Recycle") out.recycle += 1;
    else if (rec === "Upcycle") out.upcycle += 1;
    if (rec) recCounts[rec] += 1;

    if (r.userId) users.add(String(r.userId));
    else if (r.userEmail) users.add(`e:${r.userEmail}`);
    else if (r.userName) users.add(`n:${r.userName}`);

    if (r.wasRecommendationFollowed === true) out.followed += 1;
    else if (r.wasRecommendationFollowed === false) out.ignored += 1;
    else out.pending += 1;
  }

  out.uniqueUsers = users.size;
  const decided = out.followed + out.ignored;
  out.followRatePercent = decided > 0 ? Math.round((out.followed / decided) * 100) : 0;

  const top = Object.entries(recCounts).sort((a, b) => b[1] - a[1])[0];
  out.mostSuggested = top && top[1] > 0 ? top[0] : "—";

  return out;
}

export function recommendationDistributionForChart(stats) {
  const pairs = [
    { label: "Dispose", value: stats.dispose, color: AI_REC_COLORS.Dispose, filterKey: "Dispose" },
    { label: "Recycle", value: stats.recycle, color: AI_REC_COLORS.Recycle, filterKey: "Recycle" },
    { label: "Upcycle", value: stats.upcycle, color: AI_REC_COLORS.Upcycle, filterKey: "Upcycle" },
  ].filter((p) => p.value > 0);

  if (pairs.length === 0) {
    return { labels: ["No data"], data: [1], colors: ["#e2e8f0"], filterKeys: [null] };
  }

  return {
    labels: pairs.map((p) => p.label),
    data: pairs.map((p) => p.value),
    colors: pairs.map((p) => p.color),
    filterKeys: pairs.map((p) => p.filterKey),
  };
}

export function followedVsIgnoredForChart(stats) {
  const pairs = [
    { label: "Followed", value: stats.followed, color: "#0080aa" },
    { label: "Ignored", value: stats.ignored, color: "#94a3b8" },
    { label: "Pending", value: stats.pending, color: "#cbd5e1" },
  ].filter((p) => p.value > 0);

  if (pairs.length === 0) {
    return { labels: ["No data"], data: [1], colors: ["#e2e8f0"], filterKeys: [null] };
  }

  return {
    labels: pairs.map((p) => p.label),
    data: pairs.map((p) => p.value),
    colors: pairs.map((p) => p.color),
    filterKeys: pairs.map((p) => p.label.toLowerCase()),
  };
}

/** Monthly trend: count of AI uses per month (last 6 months with data). */
export function recommendationTrendForChart(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const buckets = new Map();

  for (const r of list) {
    if (!r.createdAt) continue;
    const d = new Date(r.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  const sorted = [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-6);

  if (sorted.length === 0) {
    return { labels: ["—"], data: [0] };
  }

  return {
    labels: sorted.map(([key]) => {
      const [, m] = key.split("-");
      return MONTHS[Number(m) - 1] || key;
    }),
    data: sorted.map(([, v]) => v),
  };
}

/** Top item names by frequency */
export function topItemCategoriesForChart(rows, limit = 6) {
  const list = Array.isArray(rows) ? rows : [];
  const counts = new Map();

  for (const r of list) {
    const name = String(r.itemName || r.itemCategory || "Unknown").trim() || "Unknown";
    counts.set(name, (counts.get(name) || 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);

  if (sorted.length === 0) {
    return { labels: ["—"], data: [0] };
  }

  return {
    labels: sorted.map(([k]) => (k.length > 22 ? `${k.slice(0, 20)}…` : k)),
    data: sorted.map(([, v]) => v),
  };
}
