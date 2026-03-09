import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminReportsLayout from "./AdminReportsLayout";

const API_URL = "http://localhost:5000/admin/users";

function escapeCsvCell(value) {
  if (value == null || value === "") return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function matchesSearch(user, q) {
  if (!q || !q.trim()) return true;
  const s = q.trim().toLowerCase();
  const name = (user.uname || "").toLowerCase();
  const email = (user.email || "").toLowerCase();
  const phone = (user.phone || "").replace(/\s/g, "");
  const phoneNorm = (user.phone || "").replace(/\D/g, "");
  const sNorm = s.replace(/\D/g, "");
  return name.includes(s) || email.includes(s) || phone.includes(s) || phoneNorm.includes(sNorm);
}

export default function UsersReport() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = searchTerm.trim()
    ? users.filter((u) => matchesSearch(u, searchTerm))
    : users;

  const handleDownload = useCallback(() => {
    const headers = ["Name", "Email", "Phone", "User ID", "Created At"];
    const rows = filteredUsers.map((u) => [
      u.uname ?? "",
      u.email ?? "",
      u.phone ?? "",
      u.userId ?? "",
      u.createdAt ? new Date(u.createdAt).toLocaleString() : "",
    ]);
    const csvContent = [
      headers.map(escapeCsvCell).join(","),
      ...rows.map((row) => row.map(escapeCsvCell).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredUsers]);

  return (
    <AdminReportsLayout
      title="Users report"
      onDownload={handleDownload}
      showFilter={false}
    >
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
      {/* Search input inside this component so state and filter stay in sync */}
      <div className="searchBox" style={{ marginBottom: 12 }}>
        🔍{" "}
        <input
          type="text"
          placeholder="Search by name, email, or phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: "none", background: "transparent", outline: "none", fontSize: 14 }}
        />
      </div>

      {loading && <div className="muted">Loading users...</div>}
      {error && <div className="muted" style={{ color: "#c00" }}>{error}</div>}
      {!loading && !error && users.length === 0 && (
        <div className="muted">No users found.</div>
      )}
      {!loading && !error && users.length > 0 && searchTerm.trim() && filteredUsers.length === 0 && (
        <div className="muted" style={{ padding: "1rem 0" }}>
          No search results found. Try a different name, email, or phone number.
        </div>
      )}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="muted" style={{ marginBottom: 8 }}>
          Showing {filteredUsers.length}{searchTerm.trim() ? ` of ${users.length}` : ""} users
        </div>
      )}
      {!loading && !error && filteredUsers.map((u) => (
        <div className="reportCard" key={u._id || u.userId}>
          <div className="expandRow">
            👤 <strong>{u.uname || "—"}</strong>
          </div>
          <div className="muted">Email: {u.email || "—"}</div>
          <div className="muted">Phone Number: {u.phone || "—"}</div>
          {u.userId && <div className="muted">User ID: {u.userId}</div>}
          <div className="link">More information</div>
        </div>
      ))}
    </AdminReportsLayout>
  );
}
