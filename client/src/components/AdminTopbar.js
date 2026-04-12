import React, { useState, useEffect } from "react";
import AdminNotificationsDropdown from "./AdminNotificationsDropdown";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaMoon, FaSun } from "react-icons/fa";
import { ADMIN_THEME_CHANGED, dispatchAdminThemeChange } from "../utils/adminThemeEvents";


import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

const AdminTopbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProfilePage = location.pathname === "/admin/profile";

  const [adminTheme, setAdminTheme] = useState(
    () => localStorage.getItem("adminTheme") || "Light"
  );
  const [, setSystemPrefTick] = useState(0);

  useEffect(() => {
    const onThemeEvent = (e) => {
      const v = e.detail ?? (localStorage.getItem("adminTheme") || "Light");
      setAdminTheme(v);
    };
    window.addEventListener(ADMIN_THEME_CHANGED, onThemeEvent);
    return () => window.removeEventListener(ADMIN_THEME_CHANGED, onThemeEvent);
  }, []);

  useEffect(() => {
    if (!isProfilePage || adminTheme !== "System") return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const bump = () => setSystemPrefTick((x) => x + 1);
    media.addEventListener("change", bump);
    return () => media.removeEventListener("change", bump);
  }, [isProfilePage, adminTheme]);

  const adminThemeDarkEffective =
    adminTheme === "Dark" ||
    (adminTheme === "System" &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleAdminLightDark = () => {
    const t = localStorage.getItem("adminTheme") || "Light";
    const next = t === "Dark" ? "Light" : "Dark";
    localStorage.setItem("adminTheme", next);
    setAdminTheme(next);
    dispatchAdminThemeChange(next);
  };

  const goAdminHome = () => navigate("/admin/dashboard"); // ✅ your admin home route

  return (
    <Navbar
      expand="md"
      dark
      style={{ background: "#0b7ea1", padding: "10px 18px" }}
    >
      {/* ✅ Use navigate instead of href to avoid full page refresh */}
      <NavbarBrand
        role="button"
        onClick={goAdminHome}
        style={{ fontWeight: 700, cursor: "pointer" }}
      >
        ReNova
      </NavbarBrand>

      <div
        style={{
          color: "white",
          fontWeight: 600,
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* ✅ Clickable Dashboard (home) */}
        <button
          type="button"
          onClick={goAdminHome}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
          }}
          title="Go to Admin Dashboard"
        >
          Dashboard
        </button>

        <UncontrolledDropdown>
          <DropdownToggle
            caret
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "none",
              padding: "4px 12px",
              fontSize: 13,
              borderRadius: 14,
            }}
          >
            Manage
          </DropdownToggle>

          <DropdownMenu end>
            <DropdownItem onClick={() => navigate("/admin/collectors-requests")}>
              Collector Requests
            </DropdownItem>

            <DropdownItem divider />

            <DropdownItem header>Reports</DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/reports/all-requests")}>
              All requests
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/reports/recycles")}>
              Recycles Report
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/reports/disposals")}>
              Disposals Report
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/reports/upcycles")}>
              Upcycles Report
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/manage-collectors")}>
              Collectors Report
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/reports/users")}>
              Users Report
            </DropdownItem>

            <DropdownItem divider />

            <DropdownItem onClick={() => navigate("/admin/profile")}>
              Settings
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>

      <Nav navbar style={{ marginLeft: "auto", alignItems: "center" }}>
        <NavItem style={{ marginRight: 14 }}>
          <AdminNotificationsDropdown />
        </NavItem>

        {isProfilePage && (
          <NavItem style={{ marginRight: 14 }}>
            <button
              type="button"
              title={adminThemeDarkEffective ? "Switch to light mode" : "Switch to dark mode"}
              onClick={toggleAdminLightDark}
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                width: 36,
                height: 36,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label={adminThemeDarkEffective ? "Switch to light mode" : "Switch to dark mode"}
            >
              {adminThemeDarkEffective ? (
                <FaSun style={{ fontSize: 18 }} />
              ) : (
                <FaMoon style={{ fontSize: 18 }} />
              )}
            </button>
          </NavItem>
        )}

        {!isProfilePage && (
          <NavItem>
            <FaUserCircle
              onClick={() => navigate("/admin/profile")}
              title="My Profile"
              style={{
                color: "white",
                fontSize: 24,
                cursor: "pointer",
                transition: "0.2s ease",
              }}
              className="admin-user-icon"
            />
          </NavItem>
        )}

      </Nav>
    </Navbar>
  );
};

export default AdminTopbar;
