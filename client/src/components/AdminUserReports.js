import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import AdminTopbar from "./AdminTopbar";
import "./AdminPages.css";
import "./AdminReports.css";
import "./Components.css";

const API_URL = "http://localhost:5000/api/reports";

export default function AdminUserReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

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
  }, [token]);

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
    <div className="adminPage">
      <AdminTopbar />

      <div className="adminBody">
        <div className="adminCardWrap adminUserReportsWrap">
          <div className="adminUserReportsHeader">
            <div className="reportsBackRow adminUserReportsBackRow">
              <button
                type="button"
                className="reportsBackBtn"
                onClick={() => navigate("/admin/dashboard")}
              >
                ← Back
              </button>
            </div>
            <h3 className="adminUserReportsTitle">User &amp; Collector Reports</h3>
          </div>

          {loading && <p className="muted">Loading reports…</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && reports.length === 0 && (
            <p className="muted">No reports found.</p>
          )}

          <div className="adminUserReportsList">
            {reports.map((r) => (
              <div
                key={r._id}
                className="reportCard adminUserReportCard"
              >
                <h5>
                  Report Type: {r.type || "unknown"} | Status: {r.status}
                </h5>

                <p>
                  <strong>Reporter:</strong> {r.reporterName || "Unknown"} (
                  {r.reporterRole})
                </p>

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

                <p className="muted" style={{ fontSize: 12 }}>
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleString()
                    : "—"}
                </p>

                <div className="adminUserReportActions">
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
      </div>
    </div>
  );
}
