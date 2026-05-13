import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminReportsLayout from "./AdminReportsLayout";
import "./AdminReportSummaryPage.css";
import { downloadInsightsReportPdf } from "../utils/insightsReportPdf.js";

const API_INSIGHTS = "http://localhost:5000/api/reports/insights";

function escapeCsvCell(value) {
  if (value == null || value === "") return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatCategoryLabel(key) {
  if (!key) return "—";
  const s = String(key).toLowerCase();
  if (s === "disposal") return "Disposal";
  if (s === "recycle") return "Recycle";
  if (s === "upcycle") return "Upcycle";
  return String(key).replace(/^./, (c) => c.toUpperCase());
}

const defaultData = () => ({
  totalItems: 0,
  topUser: { name: "", count: 0 },
  topCategory: { name: "", count: 0, percentage: 0 },
  peakMonth: "",
  categoryBreakdown: [],
  collectorsLeaderboard: [],
  itemsWithoutCollector: 0,
});

const SECTION_IDS = {
  collector: "report-summary-detail-collector",
  category: "report-summary-detail-category",
  total: "report-summary-detail-total",
};

export default function AdminReportSummaryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sectionParam = (searchParams.get("section") || "").toLowerCase();
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashSection, setFlashSection] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const res = await fetch(API_INSIGHTS);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to load report summary");
        }
        const j = await res.json();
        setData({
          totalItems: j.totalItems ?? 0,
          topUser: {
            name: j.topUser?.name ?? "",
            count: j.topUser?.count ?? 0,
          },
          topCategory: {
            name: j.topCategory?.name ?? "",
            count: j.topCategory?.count ?? 0,
            percentage: j.topCategory?.percentage ?? 0,
          },
          peakMonth: j.peakMonth ?? "",
          categoryBreakdown: Array.isArray(j.categoryBreakdown) ? j.categoryBreakdown : [],
          collectorsLeaderboard: Array.isArray(j.collectorsLeaderboard)
            ? j.collectorsLeaderboard
            : [],
          itemsWithoutCollector: j.itemsWithoutCollector ?? 0,
        });
      } catch (err) {
        setError(err.message || "Something went wrong");
        setData(defaultData());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (loading) return;
    const key =
      sectionParam === "collector" || sectionParam === "category" || sectionParam === "total"
        ? sectionParam
        : null;
    if (!key) return;
    const id = SECTION_IDS[key];
    const raf = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setFlashSection(key);
    });
    const clearFlash = window.setTimeout(() => setFlashSection(null), 1800);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(clearFlash);
    };
  }, [loading, sectionParam]);

  const handleDownload = useCallback(() => {
    const rows = [];
    rows.push(["Metric", "Value"]);
    rows.push(["Total qualifying items", String(data.totalItems)]);
    rows.push([
      "Top collector",
      data.topUser.count > 0
        ? `${(data.topUser.name || "").trim() || "—"} (${data.topUser.count})`
        : "—",
    ]);
    const tc = data.topCategory;
    rows.push([
      "Top category",
      tc.count > 0
        ? `${formatCategoryLabel(tc.name)} — ${Number(tc.percentage).toFixed(1)}% (${tc.count} of ${data.totalItems})`
        : "—",
    ]);
    rows.push(["Peak month (volume)", data.peakMonth || "—"]);
    rows.push(["Qualifying items without collector", String(data.itemsWithoutCollector)]);
    rows.push([]);
    rows.push(["Category breakdown"]);
    rows.push(["Category", "Count", "Share %"]);
    data.categoryBreakdown.forEach((c) => {
      rows.push([formatCategoryLabel(c.name), String(c.count), String(c.percentage ?? "")]);
    });
    rows.push([]);
    rows.push(["Collector leaderboard (top 25 on this set)"]);
    rows.push(["Rank", "Collector", "Requests"]);
    data.collectorsLeaderboard.forEach((row, i) => {
      rows.push([String(i + 1), row.name ?? "", String(row.count ?? 0)]);
    });

    const csvContent = rows.map((r) => r.map(escapeCsvCell).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const handleDownloadPdf = useCallback(() => {
    if (loading) return;
    const ok = downloadInsightsReportPdf({
      ...data,
      generatedAt: new Date().toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    });
    if (!ok) {
      window.alert("The PDF could not be generated. Please try again.");
    }
  }, [data, loading]);

  const topUserLine =
    data.topUser.count > 0
      ? `${(data.topUser.name || "").trim() || "—"} · ${data.topUser.count} request${
          data.topUser.count === 1 ? "" : "s"
        }`
      : "No completed Recycle / Upcycle / Dispose flow yet";

  const topCatLine =
    data.topCategory.count > 0
      ? `${formatCategoryLabel(data.topCategory.name)} · ${Number(data.topCategory.percentage).toFixed(1)}% · ${
          data.topCategory.count
        } of ${data.totalItems}`
      : "—";

  return (
    <AdminReportsLayout
      title="Report summary — details"
      onBack={() => navigate("/admin/dashboard")}
      onDownload={handleDownload}
      onDownloadPdf={handleDownloadPdf}
      showFilter={false}
      fillViewport
    >
      {loading && <div className="muted">Loading report summary…</div>}
      {error && (
        <div className="muted" style={{ color: "#c00" }}>
          {error}
        </div>
      )}
      {!loading && !error && (
        <>
          <p className="reportSummaryScope">
            Scope: accepted or completed pickup and drop-off requests with user category Recycle,
            Upcycle, or Dispose. Percentages use total qualifying items as the denominator.
          </p>

          <div className="reportSummarySection">
            <h4 className="reportSummarySectionTitle">At a glance</h4>
            <div className="reportSummaryMetricGrid">
              <div
                id={SECTION_IDS.total}
                className={`reportSummaryMetric${
                  flashSection === "total" ? " reportSummaryHighlight" : ""
                }`}
              >
                <div className="reportSummaryMetricLabel">Total qualifying items</div>
                <div className="reportSummaryMetricValue">{data.totalItems}</div>
                <div className="reportSummaryMetricSub">
                  With collector:{" "}
                  {Math.max(0, data.totalItems - data.itemsWithoutCollector)} · Without collector:{" "}
                  {data.itemsWithoutCollector}
                </div>
              </div>
              <div className="reportSummaryMetric">
                <div className="reportSummaryMetricLabel">Peak month</div>
                <div className="reportSummaryMetricValue">{data.peakMonth || "—"}</div>
                <div className="reportSummaryMetricSub">Busiest calendar month by volume</div>
              </div>
            </div>
          </div>

          <div
            id={SECTION_IDS.collector}
            className={`reportSummarySection${
              flashSection === "collector" ? " reportSummaryHighlight" : ""
            }`}
          >
            <h4 className="reportSummarySectionTitle">Top collector &amp; leaderboard</h4>
            <div className="reportSummaryMetric" style={{ marginBottom: 14 }}>
              <div className="reportSummaryMetricLabel">Leading collector</div>
              <div className="reportSummaryMetricValue" style={{ fontSize: "1.05rem" }}>
                {topUserLine}
              </div>
            </div>
            {data.collectorsLeaderboard.length === 0 ? (
              <div className="muted">No collector-attributed qualifying items yet.</div>
            ) : (
              <div className="reportSummaryTableWrap">
                <table className="reportSummaryTable">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Collector</th>
                      <th>Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.collectorsLeaderboard.map((row, idx) => (
                      <tr key={`${row.name}-${idx}`}>
                        <td>{idx + 1}</td>
                        <td>{(row.name || "").trim() || "—"}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div
            id={SECTION_IDS.category}
            className={`reportSummarySection${
              flashSection === "category" ? " reportSummaryHighlight" : ""
            }`}
          >
            <h4 className="reportSummarySectionTitle">Top category &amp; mix</h4>
            <div className="reportSummaryMetric" style={{ marginBottom: 14 }}>
              <div className="reportSummaryMetricLabel">Dominant category</div>
              <div className="reportSummaryMetricValue" style={{ fontSize: "1.05rem" }}>
                {topCatLine}
              </div>
            </div>
            {data.categoryBreakdown.length === 0 ? (
              <div className="muted">No qualifying category data yet.</div>
            ) : (
              <div className="reportSummaryTableWrap">
                <table className="reportSummaryTable">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Count</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.categoryBreakdown.map((row) => (
                      <tr key={row.name}>
                        <td>{formatCategoryLabel(row.name)}</td>
                        <td>{row.count}</td>
                        <td>{Number(row.percentage ?? 0).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminReportsLayout>
  );
}
