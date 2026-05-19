import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminReportsPage() {
  const navigate = useNavigate();

  const cards = [
    { title: "Users Report", path: "/admin/reports/users" },
    { title: "All Requests", path: "/admin/reports/all-requests" },
    { title: "Decide For Me History", path: "/admin/reports/ai-recommendations" },
    { title: "Recycles", path: "/admin/reports/recycles" },
    { title: "Disposals", path: "/admin/reports/disposals" },
    { title: "Upcycles", path: "/admin/reports/upcycles" },
    { title: "Summary Dashboard", path: "/admin/reports/report-summary" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Reports</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "15px",
        marginTop: "20px"
      }}>
        {cards.map((c, i) => (
          <div
            key={i}
            onClick={() => navigate(c.path)}
            style={{
              padding: "20px",
              background: "#fff",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              textAlign: "center",
              fontWeight: "600"
            }}
          >
            {c.title}
          </div>
        ))}
      </div>
    </div>
  );
}