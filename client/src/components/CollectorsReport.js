import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminReportsLayout from "./AdminReportsLayout";

const API_URL = "http://localhost:5000/admin/collectors";

function formatTimeSince(date) {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;
  if (diffYears === 1) return "1 year ago";
  return `${diffYears} years ago`;
}

function escapeCsvCell(value) {
  if (value == null || value === "") return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function CollectorsReport() {
  const navigate = useNavigate();
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        setError(null);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to load collectors");
        const data = await res.json();
        setCollectors(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
        setCollectors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCollectors();
  }, []);

  const handleDownload = useCallback(() => {
    const headers = ["Company Name", "Address", "Phone", "Email", "Collector ID", "Type", "Open Hours", "Created At"];
    const rows = collectors.map((c) => [
      c.companyName ?? "",
      c.address ?? "",
      c.phone ?? "",
      c.email ?? "",
      c.collectorId ?? "",
      c.collectorType ?? "",
      c.openHr ?? "",
      c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
    ]);
    const csvContent = [
      headers.map(escapeCsvCell).join(","),
      ...rows.map((row) => row.map(escapeCsvCell).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `collectors-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [collectors]);

  return (
    <AdminReportsLayout title="Collectors Report" onDownload={handleDownload}>
      <button
        type="button"
        onClick={() => navigate("/admin/dashboard")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          fontSize: 14,
          fontWeight: 600,
          color: "#0080AA",
          background: "transparent",
          border: "1px solid #0080AA",
          borderRadius: 6,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        ← Back
      </button>
      {loading && <div className="muted">Loading collectors...</div>}
      {error && <div className="muted" style={{ color: "#c00" }}>{error}</div>}
      {!loading && !error && collectors.length === 0 && (
        <div className="muted">No collectors found.</div>
      )}
      {!loading && !error && collectors.map((c) => {
        const id = c._id || c.collectorId;
        const isExpanded = expandedId === id;
        return (
          <div className="reportCard" key={id} style={{ display: "block" }}>
            <div className="expandRow">
              » <strong>{c.companyName || "—"}</strong>
            </div>
            <div className="muted" style={{ marginBottom: 4 }}>Address: {c.address || "—"}</div>
            <div className="muted" style={{ marginBottom: 4 }}>Phone: {c.phone || "—"}</div>
            {isExpanded && (
              <>
                <div className="muted" style={{ marginBottom: 4 }}>Email: {c.email || "—"}</div>
                <div className="muted" style={{ marginBottom: 4 }}>Opening hours: {c.openHr || "—"}</div>
                <div className="muted" style={{ marginBottom: 4 }}>Collector ID: {c.collectorId || "—"}</div>
                <div className="muted" style={{ marginBottom: 4 }}>Type: {c.collectorType || "—"}</div>
                <div className="muted" style={{ marginBottom: 4 }}>
                  Registered: {formatTimeSince(c.createdAt)}
                  {c.createdAt && (
                    <span style={{ opacity: 0.8 }}> ({new Date(c.createdAt).toLocaleDateString()})</span>
                  )}
                </div>
              </>
            )}
            <div
              className="link"
              style={{ marginTop: 6, cursor: "pointer", userSelect: "none" }}
              onClick={() => setExpandedId(isExpanded ? null : id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedId(isExpanded ? null : id); } }}
            >
              {isExpanded ? "See less" : "See more"}
            </div>
          </div>
        );
      })}
    </AdminReportsLayout>
  );
}
