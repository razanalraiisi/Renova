import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";
import {
  FaBell,
  FaCog,
  FaMoon,
  FaUserCircle,
  FaUserShield,
  FaClipboardList,
  FaSignOutAlt,
  FaLock,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import logo from "../assets/logo.png";

import "./AdminUserPage.css";

const API_BASE = "http://localhost:5000/admin";

const AdminUserPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = useSelector((s) => s.users?.user) || {};

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    location: "",
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error" | null
  const [mobileError, setMobileError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState(null); // revert on Cancel

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showSettingsCard, setShowSettingsCard] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("adminTheme") || "Light");

  const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

  // Apply theme (Light / Dark / System) to document
  useEffect(() => {
    const root = document.documentElement;
    const apply = (value) => {
      root.setAttribute("data-admin-theme", value);
    };
    if (theme === "System") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystem = () => apply(media.matches ? "dark" : "light");
      applySystem();
      media.addEventListener("change", applySystem);
      return () => media.removeEventListener("change", applySystem);
    }
    apply(theme.toLowerCase());
  }, [theme]);

  const handleThemeChange = (e) => {
    const value = e.target.value;
    setTheme(value);
    localStorage.setItem("adminTheme", value);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setProfile({
        name: storedUser.uname || storedUser.name || "",
        email: storedUser.email || "",
        mobile: storedUser.phone || "",
        location: "",
      });
      setProfileLoading(false);
      return;
    }
    fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          location: data.location || "",
        });
        setAvatarUrl(data.avatarUrl || "");
      })
      .catch(() => {
        setProfile({
          name: storedUser.uname || storedUser.name || "",
          email: storedUser.email || "",
          mobile: storedUser.phone || "",
          location: "",
        });
      })
      .finally(() => setProfileLoading(false));
  }, [storedUser.uname, storedUser.name, storedUser.email, storedUser.phone]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const navItems = useMemo(
    () => [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "Collectors", path: "/admin/manage-collectors" },
      { name: "Requests", path: "/admin/collectors-requests" },
      { name: "Reports", path: "/admin/dashboard/graphs" },
    ],
    []
  );

  const menuItems = useMemo(
    () => [
      { key: "profile", label: "My Profile", icon: <FaUserShield />, path: "/admin/profile" },
      {
        key: "settings",
        label: "Settings",
        icon: <FaCog />,
        onClick: () => setShowSettingsCard((v) => !v),
      },
      {
        key: "notifications",
        label: "Notification",
        icon: <FaBell />,
        right: notificationsEnabled ? "Allow" : "Off",
        onClick: () => setNotificationsEnabled((v) => !v),
      },
      { key: "requests", label: "My Requests", icon: <FaClipboardList />, path: "/admin/my-requests" },
      { key: "forgot", label: "Forget Password", icon: <FaLock />, path: "/admin/forget-password" },
    ],
    [notificationsEnabled]
  );

  const isActiveMenu = (path) => path && location.pathname === path;

  // Mobile: 8 digits, must start with 7 or 9
  const validateMobile = (value) => {
    if (!value || value.trim() === "") return null;
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8) return "Number must be 8 digits.";
    if (!/^[79]/.test(digits)) return "Number must start with 7 or 9.";
    return null;
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8); // digits only, max 8
    setProfile((p) => ({ ...p, mobile: value }));
    setMobileError(validateMobile(value));
  };

  const startEditing = () => {
    setEditSnapshot({
      name: profile.name,
      email: profile.email,
      mobile: profile.mobile,
      location: profile.location,
      avatarUrl,
    });
    setIsEditing(true);
    setSaveStatus(null);
    setMobileError(null);
  };

  const cancelEditing = () => {
    if (editSnapshot) {
      setProfile({
        name: editSnapshot.name,
        email: editSnapshot.email,
        mobile: editSnapshot.mobile,
        location: editSnapshot.location,
      });
      setAvatarUrl(editSnapshot.avatarUrl ?? "");
    }
    setMobileError(null);
    setSaveStatus(null);
    setIsEditing(false);
  };

  const onSave = () => {
    const token = getToken();
    if (!token) {
      setSaveStatus("error");
      return;
    }
    const err = validateMobile(profile.mobile);
    if (err) {
      setMobileError(err);
      setSaveStatus(null);
      return;
    }
    setMobileError(null);
    setSaveStatus(null);
    fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: profile.name,
        mobile: profile.mobile,
        location: profile.location,
        avatarUrl: avatarUrl || undefined,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data.profile) {
          setProfile({
            name: data.profile.name ?? profile.name,
            email: data.profile.email ?? profile.email,
            mobile: data.profile.mobile ?? profile.mobile,
            location: data.profile.location ?? profile.location,
          });
          setAvatarUrl(data.profile.avatarUrl ?? "");
          setEditSnapshot(null);
        }
        setSaveStatus("success");
        setIsEditing(false);
      })
      .catch(() => setSaveStatus("error"));
  };

  return (
    <div className="au-page">
      {/* TOP NAVBAR */}
      <Navbar className="au-navbar">
        <div className="au-nav-inner">
          <NavbarBrand tag={Link} to="/admin/dashboard" className="au-brand">
            <img src={logo} alt="logo" className="au-logo" />
            ReNova
          </NavbarBrand>

          <div className="au-nav-links">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`au-nav-link ${location.pathname === item.path ? "active" : ""}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="au-nav-icons">
            <FaBell title="Notifications" />
            <FaCog title="Settings" onClick={() => setShowSettingsCard((v) => !v)} style={{ cursor: "pointer" }} />
            <FaMoon
              title="Toggle dark mode"
              onClick={() => {
                const next = theme === "Dark" ? "Light" : "Dark";
                setTheme(next);
                localStorage.setItem("adminTheme", next);
              }}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
      </Navbar>

      {/* BODY */}
      <div className="au-body">
        <div className="au-center-bg">
          <div className="au-grid">
            {/* LEFT PANEL */}
            <div className="au-left">
              <div className="au-card au-profile-card">
                <div className="au-profile-top">
                  <div className="au-avatar">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="admin" className="au-avatar-img" />
                    ) : (
                      <FaUserCircle />
                    )}
                  </div>

                  <div className="au-profile-meta">
                    <div className="au-name">{profile.name || "Admin name"}</div>
                    <div className="au-email">{profile.email || "admin@email.com"}</div>
                  </div>
                </div>

                <div className="au-menu">
                  {menuItems.map((m) => {
                    const active = isActiveMenu(m.path);
                    return (
                      <div
                        key={m.key}
                        className={`au-menu-item ${active ? "active" : ""}`}
                        onClick={() => {
                          if (m.onClick) return m.onClick();
                          if (m.path) navigate(m.path);
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="au-menu-left">
                          <span className="au-menu-icon">{m.icon}</span>
                          <span>{m.label}</span>
                        </div>

                        <div className="au-menu-right">
                          {m.right && <span className="au-menu-right-text">{m.right}</span>}
                          <FaChevronRight className="au-menu-chevron" />
                        </div>
                      </div>
                    );
                  })}

                  <div className="au-menu-item logout" onClick={handleLogout} role="button" tabIndex={0}>
                    <div className="au-menu-left">
                      <span className="au-menu-icon">
                        <FaSignOutAlt />
                      </span>
                      <span>Log Out</span>
                    </div>
                    <div className="au-menu-right">
                      <FaChevronRight className="au-menu-chevron" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SETTINGS SMALL CARD (like your prototype) */}
              {showSettingsCard && (
                <div className="au-card au-settings-card">
                  <div className="au-settings-header">
                    <div className="au-settings-title">Settings</div>
                    <FaTimes
                      className="au-settings-close"
                      onClick={() => setShowSettingsCard(false)}
                      title="Close"
                    />
                  </div>

                  <div className="au-setting-row">
                    <div className="au-setting-label">Theme</div>

                    <select className="au-select" value={theme} onChange={handleThemeChange}>
                      <option value="Light">Light</option>
                      <option value="Dark">Dark</option>
                      <option value="System">System</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL */}
            <div className="au-card au-details-card">
              {profileLoading && <div className="au-muted">Loading profile…</div>}
              {!profileLoading && !isEditing && (
                <>
                  <div className="au-details-top">
                    <div className="au-details-avatar">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="admin" className="au-avatar-img" />
                      ) : (
                        <FaUserCircle />
                      )}
                    </div>
                    <div>
                      <div className="au-details-name">{profile.name || "Admin name"}</div>
                      <div className="au-details-email">{profile.email || "admin@email.com"}</div>
                    </div>
                  </div>
                  <div className="au-display-fields">
                    <div className="au-display-row">
                      <span className="au-display-label">Name</span>
                      <span className="au-display-value">{profile.name || "—"}</span>
                    </div>
                    <div className="au-display-row">
                      <span className="au-display-label">Email</span>
                      <span className="au-display-value">{profile.email || "—"}</span>
                    </div>
                    <div className="au-display-row">
                      <span className="au-display-label">Mobile</span>
                      <span className="au-display-value">{profile.mobile || "—"}</span>
                    </div>
                    <div className="au-display-row">
                      <span className="au-display-label">Location</span>
                      <span className="au-display-value">{profile.location || "—"}</span>
                    </div>
                  </div>
                  <button type="button" className="au-edit-btn" onClick={startEditing}>
                    Edit
                  </button>
                  {saveStatus === "success" && <div className="au-save-msg" style={{ color: "#0080AA", marginTop: 8 }}>Profile updated successfully.</div>}
                </>
              )}
              {!profileLoading && isEditing && (
                <>
                  <div className="au-details-top">
                    <div className="au-details-avatar">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="admin" className="au-avatar-img" />
                      ) : (
                        <FaUserCircle />
                      )}
                    </div>
                    <div>
                      <div className="au-details-name">{profile.name || "Admin name"}</div>
                      <div className="au-details-email">{profile.email || "admin@email.com"}</div>
                    </div>
                  </div>
                  <div className="au-fields">
                    <div className="au-field">
                      <div className="au-field-label">Profile picture URL</div>
                      <input
                        className="au-input"
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="au-field">
                      <div className="au-field-label">Name</div>
                      <input
                        className="au-input"
                        value={profile.name}
                        onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Admin name"
                      />
                    </div>
                    <div className="au-field">
                      <div className="au-field-label">Email account</div>
                      <input
                        className="au-input"
                        value={profile.email}
                        readOnly
                        disabled
                        placeholder="admin@email.com"
                        title="Email cannot be changed"
                      />
                    </div>
                    <div className="au-field">
                      <div className="au-field-label">Mobile number</div>
                      <input
                        className="au-input"
                        type="tel"
                        inputMode="numeric"
                        maxLength={8}
                        value={profile.mobile}
                        onChange={handleMobileChange}
                        placeholder="e.g. 91234567"
                      />
                      {mobileError && (
                        <div className="au-field-error" style={{ gridColumn: "1 / -1", fontSize: 12, color: "#c00", marginTop: 4 }}>
                          {mobileError}
                        </div>
                      )}
                    </div>
                    <div className="au-field">
                      <div className="au-field-label">Location</div>
                      <input
                        className="au-input"
                        value={profile.location}
                        onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                        placeholder="USA"
                      />
                    </div>
                  </div>
                  <div className="au-edit-actions">
                    <button type="button" className="au-cancel-btn" onClick={cancelEditing}>
                      Cancel
                    </button>
                    <button type="button" className="au-save-btn" onClick={onSave} disabled={profileLoading}>
                      Save Change
                    </button>
                  </div>
                  {saveStatus === "error" && <div className="au-save-msg" style={{ color: "#c00", marginTop: 8 }}>Failed to update. Check your connection or log in again.</div>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserPage;
