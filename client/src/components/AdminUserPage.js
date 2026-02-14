import React, { useMemo, useState } from "react";
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

const AdminUserPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ pull admin profile from store if you have it (adjust paths if needed)
  const admin = useSelector((s) => s.admin?.profile) || {
    name: "Admin Name",
    email: "admin@renova.com",
    mobile: "",
    location: "",
    avatarUrl: "", // optional
  };

  const [profile, setProfile] = useState({
    name: admin.name || "",
    email: admin.email || "",
    mobile: admin.mobile || "",
    location: admin.location || "",
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showSettingsCard, setShowSettingsCard] = useState(true);
  const [theme, setTheme] = useState("Light");

  const handleLogout = () => {
    localStorage.removeItem("token");
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
      { key: "settings", label: "Settings", icon: <FaCog />, path: "/admin/profile/settings" },
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

  const onSave = () => {
    // TODO: connect to your backend / redux action
    // Example:
    // dispatch(updateAdminProfile(profile))
    console.log("Save admin profile:", profile, { theme, notificationsEnabled });
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
            <FaCog title="Settings" onClick={() => setShowSettingsCard(true)} style={{ cursor: "pointer" }} />
            <FaMoon title="Theme" />
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
                    {admin.avatarUrl ? (
                      <img src={admin.avatarUrl} alt="admin" className="au-avatar-img" />
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

                    <select className="au-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
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
              <div className="au-details-top">
                <div className="au-details-avatar">
                  {admin.avatarUrl ? (
                    <img src={admin.avatarUrl} alt="admin" className="au-avatar-img" />
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
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    placeholder="admin@email.com"
                  />
                </div>

                <div className="au-field">
                  <div className="au-field-label">Mobile number</div>
                  <input
                    className="au-input"
                    value={profile.mobile}
                    onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))}
                    placeholder="Add number"
                  />
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

              <button className="au-save-btn" onClick={onSave}>
                Save Change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserPage;
