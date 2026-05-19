import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";

const API_URL = "http://localhost:5000/api/reports";

export default function AdminUserReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load reports");

        const data = await res.json();
        setReports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // IGNORE
  const handleIgnore = async (id) => {
    await fetch(`${API_URL}/${id}/ignore`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    setReports((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, status: "ignored" } : r
      )
    );
  };

  // DEACTIVATE
  const handleDeactivate = async (id) => {
    await fetch(`${API_URL}/${id}/deactivate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    setReports((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, status: "actioned" } : r
      )
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>User & Collector Reports</h3>

        <Button color="secondary" onClick={() => navigate("/admin/dashboard")}>
          Back
        </Button>
      </div>

      {/* STATES */}
      {loading && <p>Loading reports...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && reports.length === 0 && (
        <p>No reports found.</p>
      )}

      {/* REPORTS */}
      <div style={{ marginTop: 20 }}>
        {reports.map((r) => (
          <div
            key={r._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "10px",
              background: "#fff",
            }}
          >
            <h5>
              Report Type: {r.type || "unknown"} | Status: {r.status}
            </h5>

            <p><strong>Reporter:</strong> {r.reporterName || "Unknown"} ({r.reporterRole})</p>

            <p>
              <strong>Reported:</strong>{" "}
              {r.reportedName || "Unknown"} ({r.reportedRole})
            </p>

            <p>
              <strong>Reason:</strong> {r.reason}
            </p>

            <p>
              <strong>Request ID:</strong> {r.requestId || "—"}
            </p>

            <p style={{ fontSize: 12, color: "#666" }}>
              {r.createdAt
                ? new Date(r.createdAt).toLocaleString()
                : "—"}
            </p>

            {/* ACTION BUTTONS */}
            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <Button
                color="danger"
                size="sm"
                onClick={() => handleDeactivate(r._id)}
                disabled={r.status !== "open"}
              >
                Deactivate
              </Button>

              <Button
                color="secondary"
                size="sm"
                onClick={() => handleIgnore(r._id)}
                disabled={r.status !== "open"}
              >
                Ignore
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}