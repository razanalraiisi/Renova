import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminReportsLayout from "./AdminReportsLayout";

const API_URL = "http://localhost:5000/admin/users";
const UPLOADS_BASE = "http://localhost:5000/uploads";
const PAGE_SIZE = 10;

function escapeCsvCell(value) {
  if (value == null || value === "") return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function matchesSearch(user, q) {
  const raw = (q || "").trim().toLowerCase();
  if (!raw) return true;
  const name = (user.uname || "").toLowerCase();
  const email = (user.email || "").toLowerCase();
  return name.includes(raw) || email.includes(raw);
}

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

function profileImageSrc(pic) {
  if (!pic || typeof pic !== "string") return null;
  const t = pic.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `${UPLOADS_BASE}/${t.replace(/^\/+/, "")}`;
}

export default function UsersReport() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setExpandedId(null);
  }, [searchTerm]);

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

  const visibleUsers = filteredUsers.slice(0, visibleCount);
  const hasMoreUsers = filteredUsers.length > visibleCount;
  const remainingCount = filteredUsers.length - visibleCount;

  return (
    <AdminReportsLayout
      title="Users report"
      onDownload={handleDownload}
      showFilter={false}
      fillViewport
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search by name or email"
      onViewMore={
        hasMoreUsers
          ? () => setVisibleCount((n) => Math.min(n + PAGE_SIZE, filteredUsers.length))
          : undefined
      }
      viewMoreLabel={
        hasMoreUsers ? `View more (${remainingCount} more)` : "View more"
      }
      viewMoreDisabled={!hasMoreUsers}
    >
      <div style={{ alignSelf: "flex-start", margin: "0 0 8px 0" }}>
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 8px",
            fontSize: 12,
            fontWeight: 600,
            color: "#0080AA",
            background: "transparent",
            border: "1px solid #0080AA",
            borderRadius: 4,
            cursor: "pointer",
            lineHeight: 1.2,
          }}
        >
          ← Back
        </button>
      </div>

      {loading && <div className="muted">Loading users...</div>}
      {error && <div className="muted" style={{ color: "#c00" }}>{error}</div>}
      {!loading && !error && users.length === 0 && (
        <div className="muted">No users found.</div>
      )}
      {!loading && !error && users.length > 0 && searchTerm.trim() && filteredUsers.length === 0 && (
        <div className="muted" style={{ padding: "1rem 0" }}>
          No search results found. Try a different name or email.
        </div>
      )}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="muted" style={{ marginBottom: 8 }}>
          Showing {visibleUsers.length} of {filteredUsers.length}
          {searchTerm.trim() ? ` (filtered from ${users.length})` : ""} users
        </div>
      )}
      {!loading && !error &&
        visibleUsers.map((u, idx) => {
          const id =
            u._id != null
              ? String(u._id)
              : u.userId != null && u.userId !== ""
                ? String(u.userId)
                : `row-${idx}`;
          const open = expandedId === id;
          const picSrc = profileImageSrc(u.pic);
          return (
            <div className="reportCard" key={id}>
              <div className="expandRow">
                👤 <strong>{u.uname || "—"}</strong>
              </div>
              <div className="muted">Email: {u.email || "—"}</div>
              <div className="muted">Phone Number: {u.phone || "—"}</div>
              {u.userId != null && u.userId !== "" && (
                <div className="muted">User ID: {u.userId}</div>
              )}
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
                  className="user-report-details"
                  style={{
                    marginTop: 10,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <div className="muted">Account created: {formatDateTime(u.createdAt)}</div>
                  <div className="muted">Last updated: {formatDateTime(u.updatedAt)}</div>
                  {u.userIdNumber != null && (
                    <div className="muted">User ID number: {u.userIdNumber}</div>
                  )}
                  <div className="muted">Location: {u.locationName?.trim() ? u.locationName : "—"}</div>
                  <div className="muted">Record ID: {u._id || "—"}</div>
                  {picSrc ? (
                    <div style={{ marginTop: 8 }}>
                      <div className="muted" style={{ marginBottom: 6 }}>
                        Profile photo
                      </div>
                      <img
                        src={picSrc}
                        alt=""
                        style={{
                          maxWidth: 120,
                          maxHeight: 120,
                          borderRadius: 8,
                          objectFit: "cover",
                          border: "1px solid rgba(0,0,0,0.1)",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="muted" style={{ marginTop: 8 }}>
                      Profile photo: —
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
