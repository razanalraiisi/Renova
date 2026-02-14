import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";
import { FaBell, FaSignOutAlt, FaUser, FaCog, FaClipboardList } from "react-icons/fa";
import logo from "../assets/logo.png"; 

const UserDash = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { name: "Dispose", path: "/dispose" },
    { name: "Recycle", path: "/recycle" },
    { name: "Upcycle", path: "/upcycle" },
    { name: "E-Waste Library", path: "/library" },
    { name: "FAQs", path: "/faqs" },
    { name: "About Us", path: "/about" },
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#f4f6f8",
      fontFamily: "Arial, sans-serif",
    },

    navLink: {
      color: "white",
      textDecoration: "none",
      position: "relative",
      paddingBottom: "5px",
    },

    activeLink: {
      borderBottom: "2px solid white",
    },

    /* 🔷 MAIN CONTAINER */
    container: {
      display: "flex",
      gap: "30px",
      padding: "40px",
      maxWidth: "1200px",
      margin: "0 auto",
    },

    /* 🔷 SIDEBAR */
    sidebar: {
      width: "260px",
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    },

    profileBox: {
      textAlign: "center",
      marginBottom: "25px",
    },

    avatar: {
      width: "70px",
      height: "70px",
      borderRadius: "50%",
      backgroundColor: "#0f7c95",
      margin: "0 auto 10px auto",
    },

    email: {
      fontSize: "14px",
      color: "#777",
    },

    menuItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px",
      borderRadius: "8px",
      cursor: "pointer",
      marginBottom: "8px",
      fontSize: "14px",
      transition: "0.2s",
    },

    logoutBtn: {
      marginTop: "20px",
      padding: "10px",
      backgroundColor: "#e74c3c",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "6px",
    },

    /* 🔷 MAIN CONTENT */
    content: {
      flex: 1,
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "30px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    },

    sectionTitle: {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "20px",
      color: "#0f7c95",
    },

    formGroup: {
      marginBottom: "20px",
    },

    label: {
      display: "block",
      fontSize: "14px",
      marginBottom: "6px",
      color: "#555",
    },

    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ddd",
      fontSize: "14px",
    },

    saveBtn: {
      marginTop: "10px",
      padding: "10px 20px",
      backgroundColor: "#0f7c95",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      {/* 🔷 NAVBAR */}
      <Navbar style={{ backgroundColor: "#0080AA", padding: "0 40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* LEFT: Logo */}
          <NavbarBrand
            tag={Link}
            to="/start"
            style={{ color: "white", display: "flex", alignItems: "center" }}
          >
            <img
              src={logo}
              alt="logo"
              style={{ height: 40, width: 40, marginRight: 10 }}
            />
            ReNova
          </NavbarBrand>

          {/* CENTER: Nav links */}
          <div style={{ display: "flex", gap: "30px", fontSize: "15px" }}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  ...styles.navLink,
                  ...(location.pathname === item.path ? styles.activeLink : {}),
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* RIGHT: Bell icon */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              fontSize: "18px",
              alignItems: "center",
            }}
          >
            <FaBell />
          </div>
        </div>
      </Navbar>

      {/* 🔷 DASHBOARD BODY */}
      <div style={styles.container}>
        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <div style={styles.profileBox}>
            <div style={styles.avatar}></div>
            <strong>Your Name</strong>
            <div style={styles.email}>yourname@gmail.com</div>
          </div>

          <div style={styles.menuItem}>
            <FaUser /> My Profile
          </div>
          <div style={styles.menuItem}>
            <FaCog /> Settings
          </div>
          <div style={styles.menuItem}>
            <FaClipboardList /> My Requests
          </div>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div style={styles.content}>
          <div style={styles.sectionTitle}>Profile Information</div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input style={styles.input} placeholder="Your name" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} placeholder="yourname@gmail.com" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mobile Number</label>
            <input style={styles.input} placeholder="Add phone number" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Location</label>
            <input style={styles.input} placeholder="Your country" />
          </div>

          <button style={styles.saveBtn}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default UserDash;
