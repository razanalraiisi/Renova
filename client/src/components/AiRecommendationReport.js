import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminReportsLayout from "./AdminReportsLayout";
import RenovaReportSummaryCards from "./RenovaReportSummaryCards";
import RenovaAdminAiCharts from "./RenovaAdminAiCharts";
import { fetchAIRecommendations } from "../services/aiAnalyticsService.js";
import { summarizeAIRecommendationRows } from "../utils/aiRecommendationReportStats.js";
import { downloadAIRecommendationReportPdf } from "../utils/aiRecommendationReportPdf.js";

const EMPTY_FILTERS = {
  date: "",
  item: "",
  user: "",
  recommendation: "",
  condition: "",
  followed: "",
};

function escapeCsvCell(value) {
  if (value == null || value === "") return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function formatLocalDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

function localDateKey(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normRec(value) {
  const s = String(value || "").toLowerCase();
  if (s.includes("dispose")) return "Dispose";
  if (s.includes("recycl")) return "Recycle";
  if (s.includes("upcycl")) return "Upcycle";
  return "";
}

export default function AiRecommendationReport() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState(() => ({ ...EMPTY_FILTERS }));

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const data = await fetchAIRecommendations();
        setRecords(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const itemSelectOptions = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      if (r.itemName && String(r.itemName).trim()) set.add(String(r.itemName).trim());
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [records]);

  const userSelectOptions = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      if (r.userName && String(r.userName).trim()) set.add(String(r.userName).trim());
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [records]);

  const filteredRows = useMemo(() => {
    let rows = records;
    const { date, item, user, recommendation, condition, followed } = filterCriteria;

    if (date) rows = rows.filter((r) => localDateKey(r.createdAt) === date);
    if (item) rows = rows.filter((r) => String(r.itemName || "").trim() === item);
    if (user) rows = rows.filter((r) => String(r.userName || "").trim() === user);
    if (recommendation) {
      rows = rows.filter((r) => normRec(r.aiRecommendation) === recommendation);
    }
    if (condition) {
      rows = rows.filter((r) => String(r.condition || "").toLowerCase() === condition.toLowerCase());
    }
    if (followed === "yes") rows = rows.filter((r) => r.wasRecommendationFollowed === true);
    if (followed === "no") rows = rows.filter((r) => r.wasRecommendationFollowed === false);
    if (followed === "pending") rows = rows.filter((r) => r.wasRecommendationFollowed == null);

    return rows;
  }, [records, filterCriteria]);

  const summaryCards = useMemo(() => {
    const s = summarizeAIRecommendationRows(filteredRows);
    return [
      {
        label: "Total AI uses",
        value: s.total,
        hint:
          filteredRows.length === records.length
            ? "All sessions"
            : `${filteredRows.length} of ${records.length} after filters`,
      },
      { label: "Dispose recommendations", value: s.dispose },
      { label: "Recycle recommendations", value: s.recycle },
      { label: "Upcycle recommendations", value: s.upcycle },
      { label: "Follow rate", value: `${s.followRatePercent}%` },
      { label: "Unique users", value: s.uniqueUsers },
    ];
  }, [filteredRows, records.length]);

  const handleChartFilter = useCallback((patch) => {
    if (!patch || typeof patch !== "object") return;
    setFilterCriteria((prev) => {
      const next = { ...prev };
      const keys = Object.keys(patch);
      const allMatch = keys.every((k) =>
        String(prev[k] ?? "").toLowerCase() === String(patch[k] ?? "").toLowerCase()
      );
      if (allMatch && keys.length > 0) {
        keys.forEach((k) => {
          next[k] = "";
        });
      } else {
        keys.forEach((k) => {
          if (patch[k] != null && patch[k] !== "") next[k] = patch[k];
        });
      }
      return next;
    });
  }, []);

  const handleDownload = useCallback(() => {
    const headers = [
      "Item",
      "Item category",
      "Condition",
      "AI recommendation",
      "Confidence",
      "User final choice",
      "Followed",
      "Request method",
      "User",
      "Email",
      "Date",
    ];
    const rows = filteredRows.map((r) => [
      r.itemName ?? "",
      r.itemCategory ?? "",
      r.condition ?? "",
      r.aiRecommendation ?? "",
      r.confidenceScore ?? "",
      r.userFinalChoice ?? "",
      r.wasRecommendationFollowed === true
        ? "Yes"
        : r.wasRecommendationFollowed === false
          ? "No"
          : "Pending",
      r.requestMethod ?? "",
      r.userName ?? "",
      r.userEmail ?? "",
      r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
    ]);
    const csvContent = [
      headers.map(escapeCsvCell).join(","),
      ...rows.map((row) => row.map(escapeCsvCell).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-recommendation-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredRows]);

  const handleDownloadPdf = useCallback(async () => {
    const ok = await downloadAIRecommendationReportPdf({
      subtitle: `AI analytics · ${filteredRows.length} of ${records.length} rows.`,
      rows: filteredRows,
      fileBase: "ai-recommendation-report",
    });
    if (!ok) {
      window.alert("The PDF could not be generated. Please try again.");
    }
  }, [filteredRows, records.length]);

  return (
    <AdminReportsLayout
      title="Decide For Me History"
      onBack={() => navigate("/admin/dashboard")}
      onDownload={handleDownload}
      onDownloadPdf={handleDownloadPdf}
      fillViewport
      itemSelectOptions={itemSelectOptions}
      userSelectOptions={userSelectOptions}
      itemFilterLabel="Item name"
      showCategoryFilter
      categoryFilterLabel="Condition"
      categoryFilterOptions={[
        { value: "", label: "All" },
        { value: "working", label: "Working" },
        { value: "damaged", label: "Damaged" },
        { value: "dangerous", label: "Dangerous" },
      ]}
      showAiRecommendationFilter
      showFollowedFilter
      onFilterApply={(f) =>
        setFilterCriteria({
          date: f.date || "",
          item: f.item || "",
          user: f.user || "",
          recommendation: f.recommendation || "",
          condition: f.category || "",
          followed: f.followed || "",
        })
      }
      onFilterReset={() => setFilterCriteria({ ...EMPTY_FILTERS })}
      summarySlot={<RenovaReportSummaryCards cards={summaryCards} />}
      chartsSlot={
        <RenovaAdminAiCharts rows={records} onChartFilter={handleChartFilter} />
      }
    >
      {loading && <div className="muted">Loading AI analytics…</div>}
      {error && (
        <div className="muted" style={{ color: "#c00" }}>
          {error}
        </div>
      )}
      {!loading && !error && records.length === 0 && (
        <div className="muted">No AI recommendation sessions recorded yet.</div>
      )}
      {!loading && !error && records.length > 0 && filteredRows.length === 0 && (
        <div className="muted">No rows match your filters.</div>
      )}
      {!loading && !error && filteredRows.length > 0 && (
        <div className="muted" style={{ marginBottom: 8 }}>
          Showing {filteredRows.length} of {records.length} session
          {records.length === 1 ? "" : "s"}
        </div>
      )}
      {!loading &&
        !error &&
        filteredRows.map((r) => {
          const id = String(r._id);
          const open = expandedId === id;
          const followedLabel =
            r.wasRecommendationFollowed === true
              ? "Yes"
              : r.wasRecommendationFollowed === false
                ? "No"
                : "Pending";

          return (
            <div className="reportCard" key={id}>
              <div className="reportCardHeader">
                <div className="reportCardHeaderMain">
                  <div className="expandRow">
                    <strong>{r.itemName || "Unknown item"}</strong>
                    <span
                      className="muted"
                      style={{ marginLeft: 8, fontWeight: 600, fontSize: 12 }}
                    >
                      AI: {r.aiRecommendation || "—"}
                    </span>
                  </div>
                  <div className="muted">Date: {formatLocalDate(r.createdAt)}</div>
                  <div className="muted">User: {r.userName || "—"}</div>
                </div>
                <span
                  className={`aiFollowBadge aiFollowBadge--${
                    r.wasRecommendationFollowed === true
                      ? "yes"
                      : r.wasRecommendationFollowed === false
                        ? "no"
                        : "pending"
                  }`}
                >
                  {followedLabel}
                </span>
              </div>
              <button
                type="button"
                className="link"
                style={{
                  marginTop: 6,
                  background: "none",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onClick={() => setExpandedId(open ? null : id)}
              >
                {open ? "Less information" : "More information"}
              </button>
              {open && (
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <div className="muted">Item category: {r.itemCategory || "—"}</div>
                  <div className="muted">Condition: {r.condition || "—"}</div>
                  <div className="muted">
                    Confidence:{" "}
                    {r.confidenceScore != null ? `${r.confidenceScore}%` : "—"}
                  </div>
                  <div className="muted">User final choice: {r.userFinalChoice || "—"}</div>
                  <div className="muted">
                    Request method: {r.requestMethod || "—"}
                  </div>
                  <div className="muted">Email: {r.userEmail || "—"}</div>
                  <div className="muted">Submitted: {formatDateTime(r.createdAt)}</div>
                  <div className="muted">Record ID: {r._id || "—"}</div>
                </div>
              )}
            </div>
          );
        })}
    </AdminReportsLayout>
  );
}
