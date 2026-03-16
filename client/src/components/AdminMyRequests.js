import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FcDepartment, FcViewDetails, FcBusinessContact } from "react-icons/fc";
import BasicModal from "./BasicModal";
import "./AdminCollectorRequests.css";
import "./AdminPages.css";

const API_URL = "http://localhost:5000/admin/collector-requests-history";
const API_REACTIVATE = "http://localhost:5000/admin/collectors";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB") +
    " • " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

export default function AdminMyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmReactivateOpen, setConfirmReactivateOpen] = useState(false);
  const [reactivateId, setReactivateId] = useState(null);
  const [reactivating, setReactivating] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const openReactivateConfirm = (id) => {
    setReactivateId(id);
    setConfirmReactivateOpen(true);
  };

  const closeReactivateConfirm = () => {
    setConfirmReactivateOpen(false);
    setReactivateId(null);
  };

  const doReactivate = () => {
    if (!reactivateId) return;
    setReactivating(true);
    fetch(`${API_REACTIVATE}/${reactivateId}/reactivate`, { method: "PUT" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(() => {
        setRequests((prev) =>
          prev.map((r) =>
            r._id === reactivateId ? { ...r, status: "approved" } : r
          )
        );
        closeReactivateConfirm();
      })
      .catch(() => {})
      .finally(() => setReactivating(false));
  };

  return (
    <div className="admin-container">
      <button
        type="button"
        onClick={() => navigate("/admin/profile")}
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
      <h2 className="admin-title">Collector Account Requests – History</h2>
      <p style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
        All collector requests (pending, approved, and deactivated). You can reactivate deactivated accounts.
      </p>

      {loading && <p style={{ textAlign: "center" }}>Loading…</p>}
      {!loading && requests.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No collector requests found.
        </p>)}

      {!loading &&
        requests.map((req) => {
          const isExpanded = expandedId === req._id;
          const isApproved = req.status === "approved";
          const isDeactivated = req.status === "deactivated";
          const statusLabel = isApproved ? "Approved" : isDeactivated ? "Deactivated" : "Pending";
          const statusStyle = isApproved
            ? { color: "#28a745" }
            : isDeactivated
            ? { color: "#dc3545" }
            : { color: "#f0ad4e" };
          return (
            <div className="request-card" key={req._id}>
              <h4 className="collector-name">
                <FcDepartment /> {req.companyName || "—"}
              </h4>
              <p style={{ color: "#006D90" }}>
                <strong>Status:</strong>{" "}
                <span style={statusStyle}>{statusLabel}</span>
              </p>
              <p style={{ color: "#006D90" }}>
                <strong>Registered:</strong> {formatDate(req.createdAt)}
              </p>

              <button
                type="button"
                className="info-btn"
                onClick={() => toggleExpand(req._id)}
              >
                {isExpanded ? "Less Information" : "More Information"}
              </button>

              {isDeactivated && (
                <button
                  type="button"
                  className="accept-btn"
                  style={{ marginTop: 10 }}
                  onClick={() => openReactivateConfirm(req._id)}
                >
                  Reactivate
                </button>
              )}

              {isExpanded && (
                <div className="info-grid" style={{ marginTop: 12 }}>
                  <div>
                    <h5>
                      <FcViewDetails /> Collector Details
                    </h5>
                    <p style={{ color: "#006D90" }}>
                      <strong>ID:</strong> {req.collectorId || "—"}
                    </p>
                    <p style={{ color: "#006D90" }}>
                      <strong>Type:</strong> {req.collectorType || "—"}
                    </p>
                    <p style={{ color: "#006D90" }}>
                      <strong>Opening Hours:</strong> {req.openHr || "—"}
                    </p>
                    <p style={{ color: "#006D90" }}>
                      <strong>Address:</strong> {req.address || "—"}
                    </p>
                    <p style={{ color: "#006D90" }}>
                      <strong>Registered On:</strong> {formatDate(req.createdAt)}
                    </p>
                  </div>
                  <div>
                    <h5>
                      <FcBusinessContact /> Contact Info
                    </h5>
                    <p style={{ color: "#006D90" }}>
                      <strong>Email:</strong> {req.email || "—"}
                    </p>
                    <p style={{ color: "#006D90" }}>
                      <strong>Phone:</strong> {req.phone || "—"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

      <BasicModal open={confirmReactivateOpen} onClose={closeReactivateConfirm} width={440}>
        <div className="modalBodyLarge" style={{ padding: "8px 0 6px" }}>
          <p style={{ fontSize: 15, color: "#333", marginBottom: 24, lineHeight: 1.5 }}>
            Are you sure you want to reactivate this collector?
          </p>
          <div className="modalActions">
            <button className="btnSave" type="button" onClick={doReactivate} disabled={reactivating}>
              {reactivating ? "Reactivating…" : "Yes, I'm sure"}
            </button>
            <button className="btnCloseGray" type="button" onClick={closeReactivateConfirm}>
              Cancel
            </button>
          </div>
        </div>
      </BasicModal>
    </div>
  );
}
