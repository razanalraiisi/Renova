import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";

const API_URL = "http://localhost:5000/api/reports/all";

export default function AdminUserReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const res = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load reports");

        const data = await res.json();
        setReports(data || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>User Reports</h3>

        <Button
          color="secondary"
          onClick={() => navigate("/admin/dashboard")}
        >
          Back
        </Button>
      </div>

      {/* States */}
      {loading && <p>Loading reports...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && reports.length === 0 && (
        <p>No reports submitted yet.</p>
      )}

      {/* Reports List */}
      <div style={{ marginTop: 20 }}>
        {reports.map((r, index) => (
          <div
            key={r._id || index}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "10px",
              background: "#fff",
            }}
          >
            <h5 style={{ marginBottom: 5 }}>
              Collector: {r.collectorName || "Unknown"}
            </h5>

            <p style={{ margin: 0 }}>
              <strong>Request ID:</strong> {r.requestId || "—"}
            </p>

            <p style={{ margin: "5px 0" }}>
              <strong>Reason:</strong> {r.reason}
            </p>

            <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
              Date:{" "}
              {r.createdAt
                ? new Date(r.createdAt).toLocaleString()
                : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}