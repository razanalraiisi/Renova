import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaBell,
  FaCog,
  FaUserCircle,
  FaUserShield,
  FaClipboardList,
  FaSignOutAlt,
  FaLock,
  FaChevronRight,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import * as yup from "yup";
import AdminTopbar from "./AdminTopbar";
import { ADMIN_THEME_CHANGED, dispatchAdminThemeChange } from "../utils/adminThemeEvents";
import "./AdminUserPage.css";

const API_BASE = "http://localhost:5000/admin";

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(4, "Minimum 4 characters")
    .max(10, "Maximum 10 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/\d/, "Must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must contain one special character"),
});

const AdminUserPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = useSelector((s) => s.users?.user) || {};

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [mobileError, setMobileError] = useState(null);


  const [nameError, setNameError] = useState(null);
  const [avatarError, setAvatarError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState(null);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordStep, setPasswordStep] = useState("current");
  const [currentPassword, setCurrentPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showSettingsCard, setShowSettingsCard] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("adminTheme") || "Light");

  const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

  // ================= VALIDATIONS =================
  const isValidName = (name) => /^[a-zA-Z\s]+$/.test(name);
  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };


  useEffect(() => {
    const root = document.documentElement;
    const apply = (value) => root.setAttribute("data-admin-theme", value);
    if (theme === "System") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystem = () => apply(media.matches ? "dark" : "light");
      applySystem();
      media.addEventListener("change", applySystem);
      return () => media.removeEventListener("change", applySystem);
    }
    apply(theme.toLowerCase());
  }, [theme]);

  useEffect(() => {
    const onTheme = (e) => {
      if (e.detail != null) setTheme(e.detail);
    };
    window.addEventListener(ADMIN_THEME_CHANGED, onTheme);
    return () => window.removeEventListener(ADMIN_THEME_CHANGED, onTheme);
  }, []);

  const handleThemeChange = (e) => {
    const value = e.target.value;
    setTheme(value);
    localStorage.setItem("adminTheme", value);
    dispatchAdminThemeChange(value);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setProfile({
        name: storedUser.uname || storedUser.name || "",
        email: storedUser.email || "",
        mobile: storedUser.phone || "",
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
        });
        setAvatarUrl(data.avatarUrl || "");
      })
      .catch(() => {
        setProfile({
          name: storedUser.uname || storedUser.name || "",
          email: storedUser.email || "",
          mobile: storedUser.phone || "",
        });
      })
      .finally(() => setProfileLoading(false));
  }, [storedUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/");
  };


  const menuItems = useMemo(
    () => [
      { key: "profile", label: "My Profile", icon: <FaUserShield />, path: "/admin/profile" },
      {
        key: "settings",
        label: "Theme Settings",
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
      { key: "requests", label: "Requests History", icon: <FaClipboardList />, path: "/admin/my-requests" },
      {
        key: "changePassword",
        label: "Change Password",
        icon: <FaLock />,
        onClick: () => openChangePassword(),
      },
    ],
    [notificationsEnabled]
  );

  const isActiveMenu = (path) => path && location.pathname === path;

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordStep("current");
    setPasswordMsg({ type: "", text: "" });
  };

  const openChangePassword = () => {
    setShowChangePassword(true);
    setIsEditing(false);
    resetPasswordForm();
  };

  const closeChangePassword = () => {
    setShowChangePassword(false);
    resetPasswordForm();
  };

  const authHeaders = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleVerifyCurrentPassword = async () => {
    const token = getToken();
    if (!token) {
      setPasswordMsg({ type: "error", text: "Please log in again." });
      return;
    }
    if (!currentPassword) {
      setPasswordMsg({ type: "error", text: "Enter your current password." });
      return;
    }
    setPasswordBusy(true);
    setPasswordMsg({ type: "", text: "" });
    try {
      const res = await fetch(`${API_BASE}/profile/change-password/verify-current`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Verification failed");
      setPasswordStep("otp");
      setPasswordMsg({
        type: "success",
        text: data.message || `Code sent to ${profile.email || "your email"}.`,
      });
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message || "Could not verify password." });
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setPasswordMsg({ type: "error", text: "OTP must be 6 digits." });
      return;
    }
    setPasswordBusy(true);
    setPasswordMsg({ type: "", text: "" });
    try {
      const res = await fetch(`${API_BASE}/profile/change-password/verify-otp`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ otp: otpCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Invalid code");
      setPasswordStep("new");
      setPasswordMsg({ type: "success", text: data.message || "Code verified." });
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message || "Invalid or expired OTP." });
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleCompletePasswordChange = async () => {
    setPasswordBusy(true);
    setPasswordMsg({ type: "", text: "" });
    try {
      await passwordSchema.validate({ password: newPassword });
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const res = await fetch(`${API_BASE}/profile/change-password/complete`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not update password");
      setPasswordMsg({ type: "success", text: data.message || "Password updated successfully." });
      setTimeout(() => closeChangePassword(), 2000);
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setPasswordBusy(false);
    }
  };

  // ================= MOBILE VALIDATION =================
  const validateMobile = (value) => {
    if (!value) return "Mobile is required.";
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8) return "Number must be 8 digits.";
    if (!/^[79]/.test(digits)) return "Number must start with 7 or 9.";
    return null;
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setProfile((p) => ({ ...p, mobile: value }));
    setMobileError(validateMobile(value));
  };

  const startEditing = () => {
    setEditSnapshot({ ...profile, avatarUrl });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (editSnapshot) {
      setProfile(editSnapshot);
      setAvatarUrl(editSnapshot.avatarUrl || "");
    }
    setIsEditing(false);
  };

  const onSave = () => {
    const token = getToken();
    if (!token) {
      setSaveStatus("error");
      return;
    }

    const name = profile.name.trim();
    const mobile = profile.mobile.trim();

    if (!name || !isValidName(name)) {
      setNameError("Name must contain only letters.");
      return;
    }

    const mobileErr = validateMobile(mobile);
    if (mobileErr) {
      setMobileError(mobileErr);
      return;
    }

    if (avatarUrl && !isValidURL(avatarUrl)) {
      setAvatarError("Invalid URL.");
      return;
    }

    fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        mobile,
        avatarUrl: avatarUrl || undefined,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(() => {
        setSaveStatus("success");
        setIsEditing(false);
      })
      .catch(() => setSaveStatus("error"));
  };
  return (
    <div className="au-page">
      <AdminTopbar />

      {/* BODY */}
      <div className="au-body">
        <div className="au-layout-wrap">
          <button
            type="button"
            className="au-back-btn"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Back to Dashboard
          </button>
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
                    const active =
                      m.key === "changePassword"
                        ? showChangePassword
                        : isActiveMenu(m.path);
                    return (
                      <div
                        key={m.key}
                        className={`au-menu-item ${active ? "active" : ""}`}
                        onClick={() => {
                          if (m.onClick) return m.onClick();
                          if (m.path) {
                            setShowChangePassword(false);
                            navigate(m.path);
                          }
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


              {showSettingsCard && (
                <div className="au-card au-settings-card">
                  <div className="au-settings-header">
                    <div className="au-settings-title">Theme Settings</div>
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
              {showChangePassword && (
                <>
                  <div className="au-details-top">
                    <div className="au-details-avatar au-pw-avatar">
                      <FaLock className="au-pw-lock-icon" />
                    </div>
                    <div>
                      <div className="au-details-name">Change Password</div>
                      <div className="au-details-email">
                        Verify your current password, then confirm with the code sent to{" "}
                        {profile.email || "your email"}.
                      </div>
                    </div>
                  </div>

                  {passwordStep === "current" && (
                    <div className="au-fields au-pw-fields">
                      <p className="au-pw-step-label">Step 1 of 3 — Current password</p>
                      <div className="au-field">
                        <div className="au-field-label">Current password</div>
                        <div className="au-pw-input-wrap">
                          <input
                            className="au-input"
                            type={showCurrentPw ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            className="au-pw-toggle"
                            onClick={() => setShowCurrentPw((v) => !v)}
                            aria-label={showCurrentPw ? "Hide password" : "Show password"}
                          >
                            {showCurrentPw ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {passwordStep === "otp" && (
                    <div className="au-fields au-pw-fields">
                      <p className="au-pw-step-label">Step 2 of 3 — Email verification</p>
                      <div className="au-field">
                        <div className="au-field-label">OTP code</div>
                        <input
                          className="au-input au-otp-input"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) =>
                            setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          placeholder="6-digit code"
                        />
                      </div>
                    </div>
                  )}

                  {passwordStep === "new" && (
                    <div className="au-fields au-pw-fields">
                      <p className="au-pw-step-label">Step 3 of 3 — New password</p>
                      <div className="au-field">
                        <div className="au-field-label">New password</div>
                        <div className="au-pw-input-wrap">
                          <input
                            className="au-input"
                            type={showNewPw ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="au-pw-toggle"
                            onClick={() => setShowNewPw((v) => !v)}
                          >
                            {showNewPw ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                      <div className="au-field">
                        <div className="au-field-label">Confirm new password</div>
                        <div className="au-pw-input-wrap">
                          <input
                            className="au-input"
                            type={showConfirmPw ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="au-pw-toggle"
                            onClick={() => setShowConfirmPw((v) => !v)}
                          >
                            {showConfirmPw ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                      <p className="au-pw-hint">
                        Must be 4–10 characters with uppercase, number, and special character.
                      </p>
                    </div>
                  )}

                  {passwordMsg.text && (
                    <div
                      className={`au-pw-msg au-pw-msg--${passwordMsg.type === "success" ? "success" : "error"}`}
                    >
                      {passwordMsg.text}
                    </div>
                  )}

                  <div className="au-edit-actions">
                    <button type="button" className="au-cancel-btn" onClick={closeChangePassword}>
                      Cancel
                    </button>
                    {passwordStep === "current" && (
                      <button
                        type="button"
                        className="au-save-btn"
                        onClick={handleVerifyCurrentPassword}
                        disabled={passwordBusy}
                      >
                        {passwordBusy ? "Sending…" : "Verify & Send Code"}
                      </button>
                    )}
                    {passwordStep === "otp" && (
                      <>
                        <button
                          type="button"
                          className="au-cancel-btn"
                          onClick={() => {
                            setPasswordStep("current");
                            setOtpCode("");
                          }}
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          className="au-save-btn"
                          onClick={handleVerifyOtp}
                          disabled={passwordBusy}
                        >
                          {passwordBusy ? "Verifying…" : "Verify Code"}
                        </button>
                      </>
                    )}
                    {passwordStep === "new" && (
                      <button
                        type="button"
                        className="au-save-btn"
                        onClick={handleCompletePasswordChange}
                        disabled={passwordBusy}
                      >
                        {passwordBusy ? "Saving…" : "Update Password"}
                      </button>
                    )}
                  </div>
                </>
              )}

              {!showChangePassword && profileLoading && (
                <div className="au-muted">Loading profile…</div>
              )}
              {!showChangePassword && !profileLoading && !isEditing && (
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
                  </div>
                  <button
                    type="button"
                    className="au-edit-btn"
                    onClick={() => {
                      setShowChangePassword(false);
                      startEditing();
                    }}
                  >
                    Edit
                  </button>
                  {saveStatus === "success" && <div className="au-save-msg" style={{ color: "#0080AA", marginTop: 8 }}>Profile updated successfully.</div>}
                </>
              )}
              {!showChangePassword && !profileLoading && isEditing && (
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
                        readOnly
                        disabled
                        placeholder="Admin name"
                        title="Name cannot be changed"
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
    </div>
  );
};

export default AdminUserPage;
