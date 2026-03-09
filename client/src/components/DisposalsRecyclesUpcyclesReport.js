import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminTopbar from "./AdminTopbar";
import "./AdminPages.css";
import "./AdminReports.css";

const API_PICKUPS = "http://localhost:5000/api/pickups/all";

function escapeCsvCell(value) {
  if (value == null || value === "") return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(headers, rows, filename) {
  const csvContent = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DisposalsRecyclesUpcyclesReport() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const res = await fetch(API_PICKUPS);
        if (!res.ok) throw new Error("Failed to load data");
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Something went wrong");
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const headers = ["Device", "Name", "Email", "Phone", "Address", "Condition", "Status", "Date"];
  const toRow = (r) => [
    r.device ?? "",
    r.name ?? "",
    r.email ?? "",
    r.phone ?? "",
    r.address ?? "",
    r.condition ?? "",
    r.status ?? "",
    r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
  ];

  const handleDownloadDisposals = useCallback(() => {
    downloadCsv(headers, requests.map(toRow), `disposals-report-${new Date().toISOString().slice(0, 10)}.csv`);
  }, [requests]);

  const handleDownloadRecycles = useCallback(() => {
    downloadCsv(headers, requests.map(toRow), `recycles-report-${new Date().toISOString().slice(0, 10)}.csv`);
  }, [requests]);

  const handleDownloadUpcycles = useCallback(() => {
    downloadCsv(headers, requests.map(toRow), `upcycles-report-${new Date().toISOString().slice(0, 10)}.csv`);
  }, [requests]);

  const ReportSection = ({ title, onDownload, children }) => (
    <div className="adminCardWrap" style={{ marginBottom: 32 }}>
      <div className="reportsHeader">
        <h3 className="reportsTitle">{title}</h3>
        <div className="reportsActions">
          <button className="downloadBtn" type="button" onClick={onDownload} disabled={loading || requests.length === 0}>
            ⬇ Download
          </button>
        </div>
      </div>
      <div className="reportsContent" style={{ maxHeight: 360, overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );

  const emptyMsg = <div className="muted">No records found.</div>;
  const renderList = (sectionKey) =>
    requests.length === 0
      ? emptyMsg
      : requests.map((r) => (
          <div className="reportCard" key={`${sectionKey}-${r._id}`}>
            <div className="expandRow"><strong>{r.device || "—"}</strong></div>
            <div className="muted">Name: {r.name || "—"}</div>
            <div className="muted">Email: {r.email || "—"}</div>
            <div className="muted">Phone: {r.phone || "—"}</div>
            <div className="muted">Address: {r.address || "—"}</div>
            <div className="muted">Condition: {r.condition || "—"}</div>
            <div className="muted">Status: {r.status || "—"}</div>
            <div className="muted">Date: {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</div>
          </div>
        ));

  return (
    <div className="adminPage">
      <AdminTopbar />
      <div className="adminBody">
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
        {loading && <div className="muted" style={{ padding: 16 }}>Loading reports…</div>}
        {error && <div className="muted" style={{ padding: 16, color: "#c00" }}>{error}</div>}
        {!loading && !error && (
          <>
            <ReportSection title="Disposals Report" onDownload={handleDownloadDisposals}>
              {renderList("disposals")}
            </ReportSection>
            <ReportSection title="Recycles Report" onDownload={handleDownloadRecycles}>
              {renderList("recycles")}
            </ReportSection>
            <ReportSection title="Upcycles Report" onDownload={handleDownloadUpcycles}>
              {renderList("upcycles")}
            </ReportSection>
          </>
        )}
      </div>
    </div>
  );
}
