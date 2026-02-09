import React from "react";
import AdminNotificationsDropdown from "./AdminNotificationsDropdown";
import { useNavigate } from "react-router-dom";

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

  return (
    <Navbar
      expand="md"
      dark
      style={{
        background: "#0b7ea1",
        padding: "10px 18px",
      }}
    >
      <NavbarBrand href="/" style={{ fontWeight: 700 }}>
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
        <span>Dashboard</span>

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
              Collectors
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/collectors-requests")}>
              Collector Requests
            </DropdownItem>

            {/* Optional placeholders */}
            <DropdownItem onClick={() => navigate("/admin/manage-users")}>
              Users
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/manage-requests")}>
              Requests
            </DropdownItem>

            <DropdownItem onClick={() => navigate("/admin/e-waste-library")}>
              E-Waste Library
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
          <span
            title="Admin"
            style={{
              color: "white",
              fontSize: 18,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            👤
          </span>
        </NavItem>
      </Nav>
    </Navbar>
  );
};

export default AdminTopbar;
