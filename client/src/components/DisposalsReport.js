import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminReportsLayout from "./AdminReportsLayout";
import RequestStatusDot, { rowMatchesStatusFilter } from "./RequestStatusDot";

const API_REPORT = "http://localhost:5000/admin/report-requests?category=Dispose";
const UPLOADS_BASE = "http://localhost:5000/uploads";

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

function imageSrc(image) {
  if (!image || typeof image !== "string") return null;
  const t = image.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `${UPLOADS_BASE}/${t.replace(/^\/+/, "")}`;
}

export default function DisposalsReport() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({
    date: "",
    item: "",
    user: "",
    status: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const res = await fetch(API_REPORT);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to load disposals");
        }
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
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
      if (r.device && String(r.device).trim()) set.add(String(r.device).trim());
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [records]);

  const userSelectOptions = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      if (r.name && String(r.name).trim()) set.add(String(r.name).trim());
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [records]);

  const filteredRows = useMemo(() => {
    let rows = records;
    const { date, item, user, status } = filterCriteria;
    if (date) {
      rows = rows.filter((r) => localDateKey(r.createdAt) === date);
    }
    if (item) {
      rows = rows.filter((r) => String(r.device || "").trim() === item);
    }
    if (user) {
      rows = rows.filter((r) => String(r.name || "").trim() === user);
    }
    if (status) {
      rows = rows.filter((r) => rowMatchesStatusFilter(r.status, status));
    }
    return rows;
  }, [records, filterCriteria]);

  const handleDownload = useCallback(() => {
    const headers = [
      "Source",
      "Device",
      "User",
      "Email",
      "Phone",
      "Address",
      "Device category",
      "Condition",
      "Status",
      "Date",
    ];
    const rows = filteredRows.map((r) => [
      r.source === "dropoff" ? "Drop-off" : "Pickup",
      r.device ?? "",
      r.name ?? "",
      r.email ?? "",
      r.phone ?? "",
      r.address ?? "",
      r.deviceCategory ?? "",
      r.condition ?? "",
      r.status ?? "",
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
    a.download = `disposals-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredRows]);

  return (
    <AdminReportsLayout
      title="Disposals"
      onBack={() => navigate("/admin/dashboard")}
      onDownload={handleDownload}
      fillViewport
      itemSelectOptions={itemSelectOptions}
      userSelectOptions={userSelectOptions}
      showStatusFilter
      onFilterApply={setFilterCriteria}
      onFilterReset={() =>
        setFilterCriteria({ date: "", item: "", user: "", status: "" })
      }
    >
      {loading && <div className="muted">Loading disposals…</div>}
      {error && (
        <div className="muted" style={{ color: "#c00" }}>
          {error}
        </div>
      )}
      {!loading && !error && records.length === 0 && (
        <div className="muted">No disposal requests found yet.</div>
      )}
      {!loading && !error && records.length > 0 && filteredRows.length === 0 && (
        <div className="muted">No rows match your filters.</div>
      )}
      {!loading && !error && filteredRows.length > 0 && (
        <div className="muted" style={{ marginBottom: 8 }}>
          Showing {filteredRows.length} of {records.length} disposal request
          {records.length === 1 ? "" : "s"}
        </div>
      )}
      {!loading &&
        !error &&
        filteredRows.map((r) => {
          const id = `${r.source || "row"}-${r._id}`;
          const open = expandedId === id;
          const imgUrl = imageSrc(r.image);
          return (
            <div className="reportCard" key={id}>
              <div className="reportCardHeader">
                <div className="reportCardHeaderMain">
                  <div className="expandRow">
                    <strong>{r.device || "—"}</strong>
                    <span
                      className="muted"
                      style={{ marginLeft: 8, fontWeight: 400, fontSize: 12 }}
                    >
                      {r.source === "dropoff" ? "Drop-off" : "Pickup"}
                    </span>
                  </div>
                  <div className="muted">Date: {formatLocalDate(r.createdAt)}</div>
                  <div className="muted">Disposed by: {r.name || "—"}</div>
                </div>
                <RequestStatusDot status={r.status} />
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
                  <div className="muted">Email: {r.email || "—"}</div>
                  <div className="muted">Phone: {r.phone || "—"}</div>
                  <div className="muted">Address: {r.address || "—"}</div>
                  <div className="muted">Device category: {r.deviceCategory || "—"}</div>
                  <div className="muted">Condition: {r.condition || "—"}</div>
                  <div className="muted">Status: {r.status || "—"}</div>
                  <div className="muted">Category: {r.category || "—"}</div>
                  <div className="muted">Request type: {r.requestType || "—"}</div>
                  {r.source === "dropoff" && r.dateTime && (
                    <div className="muted">Scheduled: {r.dateTime}</div>
                  )}
                  <div className="muted">Submitted: {formatDateTime(r.createdAt)}</div>
                  <div className="muted">Record ID: {r._id || "—"}</div>
                  {r.rejectReason && <div className="muted">Reject reason: {r.rejectReason}</div>}
                  {imgUrl && (
                    <div style={{ marginTop: 10 }}>
                      <div className="muted" style={{ marginBottom: 6 }}>
                        Image
                      </div>
                      <a href={imgUrl} target="_blank" rel="noopener noreferrer" className="link">
                        Open attachment
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
    </AdminReportsLayout>
  );
}
