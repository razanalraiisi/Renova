import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminReportsLayout from "./AdminReportsLayout";
import BasicModal from "./BasicModal";
import RenovaReportSummaryCards from "./RenovaReportSummaryCards";
import RenovaAdminCollectorsCharts from "./RenovaAdminCollectorsCharts";
import { downloadAdminCollectorsReportPdf } from "../utils/adminCollectorsReportPdf.js";
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

function matchesCollectorSearch(c, q) {
  const raw = (q || "").trim().toLowerCase();
  if (!raw) return true;
  const name = (c.companyName || "").toLowerCase();
  const email = (c.email || "").toLowerCase();
  const phone = (c.phone || "").replace(/\s/g, "").toLowerCase();
  const phoneNorm = (c.phone || "").replace(/\D/g, "");
  const qNorm = raw.replace(/\D/g, "");
  return (
    name.includes(raw) ||
    email.includes(raw) ||
    phone.includes(raw) ||
    (qNorm.length > 0 && phoneNorm.includes(qNorm))
  );
}

function isDeactivated(c) {
  return Boolean(c.deactivatedAt);
}

export default function AdminManageCollectors() {
  const navigate = useNavigate();
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [activeId, setActiveId] = useState(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [reactivateId, setReactivateId] = useState(null);
  const [reactivating, setReactivating] = useState(false);

  const fetchCollectors = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to load collectors");
      const data = await res.json();
      setCollectors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setCollectors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCollectors();
  }, [fetchCollectors]);

  useEffect(() => {
    setExpandedId(null);
  }, [searchTerm]);

  const filteredCollectors = searchTerm.trim()
    ? collectors.filter((c) => matchesCollectorSearch(c, searchTerm))
    : collectors;

  const handleDownload = useCallback(() => {
    const headers = [
      "Status",
      "Company Name",
      "Address",
      "Description",
      "Website",
      "Phone",
      "Email",
      "Collector ID",
      "Type",
      "Open Hours",
      "Requests accepted",
      "Requests completed",
      "Created At",
      "Deactivated At",
    ];
    const rows = filteredCollectors.map((c) => [
      isDeactivated(c) ? "Deactivated" : "Active",
      c.companyName ?? "",
      c.address ?? "",
      c.companyDescription ?? "",
      c.websiteUrl ?? "",
      c.phone ?? "",
      c.email ?? "",
      c.collectorId ?? "",
      c.collectorType ?? "",
      c.openHr ?? "",
      c.requestsAccepted ?? 0,
      c.requestsCompleted ?? 0,
      c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
      c.deactivatedAt ? new Date(c.deactivatedAt).toLocaleString() : "",
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
  }, [filteredCollectors]);

  const summaryCards = useMemo(() => {
    let active = 0;
    let deactivated = 0;
    let sumAccepted = 0;
    let sumCompleted = 0;
    for (const c of filteredCollectors) {
      if (isDeactivated(c)) deactivated += 1;
      else active += 1;
      sumAccepted += Number(c.requestsAccepted) || 0;
      sumCompleted += Number(c.requestsCompleted) || 0;
    }
    return [
      {
        label: "Collectors",
        value: filteredCollectors.length,
        hint:
          filteredCollectors.length === collectors.length
            ? "In database"
            : `${filteredCollectors.length} match search of ${collectors.length}`,
      },
      { label: "Active", value: active },
      { label: "Deactivated", value: deactivated },
      { label: "Accepted (sum)", value: sumAccepted, hint: "Pickup + drop-off" },
      { label: "Completed (sum)", value: sumCompleted },
    ];
  }, [filteredCollectors, collectors.length]);

  const handleDownloadPdf = useCallback(async () => {
    const ok = await downloadAdminCollectorsReportPdf({
      title: "Collectors",
      rows: filteredCollectors,
      fileBase: "collectors-report",
    });
    if (!ok) {
      window.alert("The PDF could not be generated. Please try again.");
    }
  }, [filteredCollectors]);

  const openDeactivateModal = (id) => {
    setActiveId(id);
    setReason("");
    setDeactivateOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!activeId) return;
    setConfirmDeactivateOpen(false);
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
      const nowIso = new Date().toISOString();
      setCollectors((prev) =>
        prev.map((c) =>
          String(c._id) === String(activeId)
            ? { ...c, isApproved: false, deactivatedAt: nowIso }
            : c
        )
      );
      setDeactivateOpen(false);
      setActiveId(null);
      setSuccessOpen(true);
    } catch (err) {
      setError(err.message || "Failed to deactivate collector");
    } finally {
      setDeactivating(false);
    }
  };

  const confirmReactivate = async () => {
    if (!reactivateId) return;
    setReactivating(true);
    try {
      const res = await fetch(`${API_URL}/${reactivateId}/reactivate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to reactivate");
      }
      setCollectors((prev) =>
        prev.map((c) =>
          String(c._id) === String(reactivateId)
            ? { ...c, isApproved: true, deactivatedAt: undefined }
            : c
        )
      );
      setReactivateOpen(false);
      setReactivateId(null);
      setSuccessOpen(true);
    } catch (err) {
      setError(err.message || "Failed to reactivate collector");
    } finally {
      setReactivating(false);
    }
  };

  return (
    <AdminReportsLayout
      title="Collectors"
      onDownload={handleDownload}
      onDownloadPdf={handleDownloadPdf}
      fillViewport
      showFilter={false}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search by name, email, or phone"
      onBack={() => navigate("/admin/dashboard")}
      summarySlot={<RenovaReportSummaryCards cards={summaryCards} />}
      chartsSlot={<RenovaAdminCollectorsCharts collectors={filteredCollectors} />}
    >
      {loading && <div className="muted">Loading collectors...</div>}
      {error && (
        <div className="muted" style={{ color: "#c00" }}>
          {error}
        </div>
      )}
      {!loading && !error && collectors.length === 0 && (
        <div className="muted">No collectors found.</div>
      )}
      {!loading &&
        !error &&
        collectors.length > 0 &&
        searchTerm.trim() &&
        filteredCollectors.length === 0 && (
          <div className="muted" style={{ padding: "1rem 0" }}>
            No search results found. Try a different name, email, or phone number.
          </div>
        )}
      {!loading && !error && filteredCollectors.length > 0 && (
        <div className="muted" style={{ marginBottom: 8 }}>
          Showing {filteredCollectors.length}
          {searchTerm.trim() ? ` of ${collectors.length}` : ""} collectors
        </div>
      )}

      {!loading &&
        !error &&
        filteredCollectors.map((c, idx) => {
          const id =
            c._id != null
              ? String(c._id)
              : c.collectorId != null && c.collectorId !== ""
                ? String(c.collectorId)
                : `row-${idx}`;
          const off = isDeactivated(c);
          const isExpanded = expandedId === id;
          return (
            <div className="reportCard" key={id}>
              <div className="reportCardHeader">
                <div className="reportCardHeaderMain">
                  <div className="expandRow">
                    <strong>{c.companyName || "—"}</strong>
                  </div>
                  <div className="muted">Address: {c.address || "—"}</div>
                  <div className="muted">Phone: {c.phone || "—"}</div>
                  <div className="muted">
                    Requests accepted: <strong>{c.requestsAccepted ?? 0}</strong>
                    {" · "}
                    Completed: <strong>{c.requestsCompleted ?? 0}</strong>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: off ? "#fff3cd" : "#d1fae5",
                      color: off ? "#856404" : "#047857",
                    }}
                  >
                    {off ? "Deactivated" : "Active"}
                  </span>
                  {off ? (
                    <button
                      type="button"
                      className="btnReactivate"
                      disabled={reactivating}
                      onClick={() => {
                        setReactivateId(c._id);
                        setReactivateOpen(true);
                      }}
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btnDeactivate"
                      onClick={() => openDeactivateModal(c._id)}
                    >
                      Deactivate
                    </button>
                  )}
                </div>
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
                  color: "#0080aa",
                  fontWeight: 600,
                }}
                onClick={() => setExpandedId(isExpanded ? null : id)}
              >
                {isExpanded ? "Less information" : "More information"}
              </button>
              {isExpanded && (
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <div className="muted">Email: {c.email || "—"}</div>
                  <div className="muted">Opening hours: {c.openHr || "—"}</div>
                  <div className="muted">Collector ID: {c.collectorId || "—"}</div>
                  <div className="muted">Type: {c.collectorType || "—"}</div>                  <div className="muted">Description: {c.companyDescription || "—"}</div>
                  <div className="muted">
                    Website: {c.websiteUrl ? (
                      <a
                        href={c.websiteUrl.match(/^https?:\/\//i) ? c.websiteUrl : `https://${c.websiteUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#006D90" }}
                      >
                        {c.websiteUrl}
                      </a>
                    ) : (
                      "—"
                    )}
                  </div>                  <div className="muted">
                    Registered: {formatTimeSince(c.createdAt)}
                    {c.createdAt && (
                      <span style={{ opacity: 0.85 }}>
                        {" "}
                        ({new Date(c.createdAt).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                  {off && c.deactivatedAt && (
                    <div className="muted">
                      Deactivated: {new Date(c.deactivatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

      <BasicModal open={deactivateOpen} onClose={() => setDeactivateOpen(false)} width={760}>
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
            <button
              className="btnSave"
              type="button"
              onClick={() => setConfirmDeactivateOpen(true)}
              disabled={deactivating}
            >
              {deactivating ? "Saving…" : "Deactivate"}
            </button>
            <button className="btnCloseGray" type="button" onClick={() => setDeactivateOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </BasicModal>

      <BasicModal open={confirmDeactivateOpen} onClose={() => setConfirmDeactivateOpen(false)} width={440}>
        <div className="modalBodyLarge" style={{ padding: "8px 0 6px" }}>
          <p style={{ fontSize: 15, color: "#333", marginBottom: 24, lineHeight: 1.5 }}>
            Are you sure you want to deactivate this collector?
          </p>
          <div className="modalActions">
            <button className="btnSave" type="button" onClick={confirmDeactivate} disabled={deactivating}>
              {deactivating ? "Saving…" : "Yes, I'm sure"}
            </button>
            <button className="btnCloseGray" type="button" onClick={() => setConfirmDeactivateOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </BasicModal>

      <BasicModal open={reactivateOpen} onClose={() => !reactivating && setReactivateOpen(false)} width={440}>
        <div className="modalBodyLarge" style={{ padding: "8px 0 6px" }}>
          <p style={{ fontSize: 15, color: "#333", marginBottom: 24, lineHeight: 1.5 }}>
            Reactivate this collector? They will be able to log in and use the platform again.
          </p>
          <div className="modalActions">
            <button
              className="btnReactivate"
              type="button"
              onClick={confirmReactivate}
              disabled={reactivating}
            >
              {reactivating ? "Working…" : "Yes, reactivate"}
            </button>
            <button
              className="btnCloseGray"
              type="button"
              onClick={() => setReactivateOpen(false)}
              disabled={reactivating}
            >
              Cancel
            </button>
          </div>
        </div>
      </BasicModal>

      <BasicModal open={successOpen} onClose={() => setSuccessOpen(false)} width={600}>
        <div className="successWrap">
          <div className="successTitle">Changes saved successfully</div>
          <div className="successText">The collector list has been updated.</div>
        </div>
      </BasicModal>
    </AdminReportsLayout>
  );
}
