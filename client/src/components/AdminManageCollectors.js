import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminTopbar from "./AdminTopbar";
import BasicModal from "./BasicModal";
import "./AdminPages.css";

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
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export default function AdminManageCollectors() {
  const navigate = useNavigate();
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [activeId, setActiveId] = useState(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
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

  const openModal = (id) => {
    setActiveId(id);
    setReason("");
    setOpen(true);
  };

  const save = async () => {
    if (!activeId) return;
    setDeactivating(true);
    try {
      const res = await fetch(`${API_URL}/${activeId}/deactivate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to deactivate");
      }
      setCollectors((prev) => prev.filter((c) => c._id !== activeId));
      setOpen(false);
      setSuccessOpen(true);
    } catch (err) {
      setError(err.message || "Failed to deactivate collector");
    } finally {
      setDeactivating(false);
    }
  };

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
        <div className="adminCardWrap">
          {/* ✅ Back + Title row */}
          <div className="adminPageHeaderRow">
            <div className="adminPageHeaderLeft">

            </div>
          </div>

          <div className="pageTitleCentered" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            Manage Collectors
            <button
              className="downloadBtn"
              type="button"
              onClick={handleDownload}
              disabled={loading || collectors.length === 0}
              style={{ marginLeft: "0.5rem" }}
            >
              ⬇ Download
            </button>
          </div>

          {loading && <div className="manageMeta" style={{ textAlign: "center", padding: "1rem" }}>Loading collectors...</div>}
          {error && <div className="manageMeta" style={{ textAlign: "center", padding: "1rem", color: "#c00" }}>{error}</div>}
          {!loading && !error && collectors.length === 0 && (
            <div className="manageMeta" style={{ textAlign: "center", padding: "1rem" }}>No approved collectors found.</div>
          )}

          <div className="manageList">
            {!loading && !error && collectors.map((c) => {
              const isExpanded = expandedId === c._id;
              return (
                <div className="manageCard" key={c._id}>
                  <div className="manageLeft">
                    <div className="chev">»</div>
                    <div style={{ flex: 1 }}>
                      <div className="manageName">{c.companyName || "—"}</div>
                      <div className="manageMeta">Address: {c.address || "—"}</div>
                      <div className="manageMeta">Phone: {c.phone || "—"}</div>
                      {isExpanded && (
                        <>
                          <div className="manageMeta">Email: {c.email || "—"}</div>
                          <div className="manageMeta">Opening hours: {c.openHr || "—"}</div>
                          <div className="manageMeta">Collector ID: {c.collectorId || "—"}</div>
                          <div className="manageMeta">Type: {c.collectorType || "—"}</div>
                          <div className="manageMeta">
                            Registered: {formatTimeSince(c.createdAt)}
                            {c.createdAt && (
                              <span style={{ opacity: 0.85 }}> ({new Date(c.createdAt).toLocaleDateString()})</span>
                            )}
                          </div>
                        </>
                      )}
                      <div
                        style={{ marginTop: 6, cursor: "pointer", fontSize: 13, color: "#2c7be5", fontWeight: 500 }}
                        onClick={() => setExpandedId(isExpanded ? null : c._id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setExpandedId(isExpanded ? null : c._id);
                          }
                        }}
                      >
                        {isExpanded ? "See less" : "See more"}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btnDeactivate"
                    type="button"
                    onClick={() => openModal(c._id)}
                  >
                    Deactivate
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deactivation Reason Modal */}
      <BasicModal open={open} onClose={() => setOpen(false)} width={760}>
        <div className="modalBodyLarge">
          <div className="modalRow">
            <div className="modalLabel">Specify Reason:</div>

            <textarea
              className="modalTextarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder=""
            />
          </div>

          <div className="modalActions">
            <button className="btnSave" type="button" onClick={save} disabled={deactivating}>
              {deactivating ? "Saving…" : "Save Changes"}
            </button>
            <button className="btnCloseGray" type="button" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </BasicModal>

      {/* Success Modal */}
      <BasicModal open={successOpen} onClose={() => setSuccessOpen(false)} width={600}>
        <div className="successWrap">
          <div className="successTitle">Changes Saved Successfully</div>
          <div className="successText">
            The changes you made to the collector request have been saved.
          </div>
        </div>
      </BasicModal>
    </div>
  );
}
