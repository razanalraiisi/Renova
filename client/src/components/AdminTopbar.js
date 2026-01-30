import React from "react";
import AdminNotificationsDropdown from "./AdminNotificationsDropdown";

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
    return (
        <Navbar
            expand="md"
            dark
            style={{
                background: "#0b7c8a", // teal-ish like your prototype
                padding: "10px 16px",
            }}
        >
            <NavbarBrand href="/" style={{ fontWeight: 700 }}>
                ReNova
            </NavbarBrand>

            <div style={{ color: "white", fontWeight: 600, marginLeft: "auto", marginRight: "auto" }}>
                Dashboard
                <UncontrolledDropdown style={{ display: "inline-block", marginLeft: 10 }}>
                    <DropdownToggle
                        caret
                        style={{
                            background: "rgba(255,255,255,0.15)",
                            border: "none",
                            padding: "4px 10px",
                            fontSize: 13,
                        }}
                    >
                        Manage
                    </DropdownToggle>
                    <DropdownMenu end>
                        <DropdownItem>Users</DropdownItem>
                        <DropdownItem>Collectors</DropdownItem>
                        <DropdownItem>Requests</DropdownItem>
                        <DropdownItem>E-Waste Library</DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem>Settings</DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            </div>

            <Nav navbar style={{ marginLeft: "auto" }}>
                <NavItem style={{ marginRight: 10 }}>
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
