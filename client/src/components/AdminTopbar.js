import React from "react";
import AdminNotificationsDropdown from "./AdminNotificationsDropdown";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";


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
            <DropdownItem onClick={() => navigate("/admin/manage-collectors")}>
              Manage Collectors
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/collectors-requests")}>
              Collector Requests
            </DropdownItem>

            <DropdownItem divider />

            <DropdownItem header>Reports</DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/reports/recycles")}>
              Recycles Report
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/reports/disposals")}>
              Disposals Report
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/reports/collectors")}>
              Collectors Report
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/reports/users")}>
              Users Report
            </DropdownItem>

            <DropdownItem divider />

            <DropdownItem onClick={() => navigate("/admin/settings")}>
              Settings
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>

      <Nav navbar style={{ marginLeft: "auto", alignItems: "center" }}>
        <NavItem style={{ marginRight: 14 }}>
          <AdminNotificationsDropdown />
        </NavItem>

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


      </Nav>
    </Navbar>
  );
};

export default AdminTopbar;
