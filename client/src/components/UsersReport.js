import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminReportsLayout from "./AdminReportsLayout";
import RenovaReportSummaryCards from "./RenovaReportSummaryCards";
import RenovaAdminUsersCharts from "./RenovaAdminUsersCharts";
import { downloadAdminUsersReportPdf } from "../utils/adminUsersReportPdf.js";
import {
  findMostActiveUser,
  filterRequestsForUsers,
} from "../utils/adminUsersReportStats.js";

const API_URL = "http://localhost:5000/admin/users";
const API_REQUESTS = "http://localhost:5000/admin/report-requests-all";
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
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null);
        const [usersRes, requestsRes] = await Promise.all([
          fetch(API_URL),
          fetch(API_REQUESTS),
        ]);
        if (!usersRes.ok) throw new Error("Failed to load users");
        const data = await usersRes.json();
        setUsers(Array.isArray(data) ? data : []);
        if (requestsRes.ok) {
          const reqData = await requestsRes.json();
          setRequests(Array.isArray(reqData) ? reqData : []);
        } else {
          setRequests([]);
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
        setUsers([]);
        setRequests([]);
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

  const filteredRequests = useMemo(
    () => filterRequestsForUsers(filteredUsers, requests),
    [filteredUsers, requests]
  );

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

  const summaryCards = useMemo(() => {
    const mostActive = findMostActiveUser(filteredUsers, filteredRequests);
    return [
      {
        label: "Most Active User",
        value: mostActive.name,
        hint:
          mostActive.count > 0
            ? `${mostActive.count} request${mostActive.count === 1 ? "" : "s"}`
            : "No requests yet",
      },
      { label: "Total in database", value: users.length },
      {
        label: "Matching filter",
        value: filteredUsers.length,
        hint: searchTerm.trim() ? `Search: "${searchTerm.trim()}"` : "No search filter",
      },
      { label: "Listed on screen", value: visibleUsers.length, hint: hasMoreUsers ? "Use View more" : "All matches visible" },
    ];
  }, [filteredUsers, filteredRequests, users.length, searchTerm, visibleUsers.length, hasMoreUsers]);

  const handleDownloadPdf = useCallback(async () => {
    const ok = await downloadAdminUsersReportPdf({
      title: "Users report",
      rows: filteredUsers,
      fileBase: "users-report",
    });
    if (!ok) {
      window.alert("The PDF could not be generated. Please try again.");
    }
  }, [filteredUsers]);

  return (
    <AdminReportsLayout
      title="Users report"
      onBack={() => navigate("/admin/dashboard")}
      onDownload={handleDownload}
      onDownloadPdf={handleDownloadPdf}
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
      summarySlot={<RenovaReportSummaryCards cards={summaryCards} />}
      chartsSlot={
        <RenovaAdminUsersCharts users={filteredUsers} requests={filteredRequests} />
      }
    >
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
