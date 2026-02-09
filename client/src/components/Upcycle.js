import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import logo from "../assets/logo.png";

const Upcycle = () => {
  const navigate = useNavigate();

  const styles = {
    page: {
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#ffffff",
      color: "#333",
    },

    backWrapper: {
      maxWidth: "1200px",
      margin: "10px 0 0 0", // align left
      padding: "0 30px",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    backIcon: {
      color: "#0080AA",
      cursor: "pointer",
      fontSize: "22px",
    },

    main: {
      flex: 1,
      padding: "40px 30px",
      maxWidth: "1200px",
      margin: "0 auto",
      width: "100%",
    },

    /* HERO */
    hero: {
      textAlign: "center",
      marginBottom: "50px",
    },
    heroTitle: {
      fontSize: "3rem",
      color: "#0078a8",
      marginBottom: "10px",
      fontWeight: "bold",
    },
    heroSubtitle: {
      fontSize: "1.3rem",
      color: "#0078a8",
      marginBottom: "10px",
    },
    heroText: {
      fontSize: "1rem",
      color: "#555",
    },

    /* SECTIONS */
    sectionTitle: {
      color: "#0078a8",
      fontWeight: "bold",
      marginBottom: "10px",
      fontSize: "1.3rem",
    },
    sectionText: {
      lineHeight: "1.6",
      marginBottom: "30px",
    },

    columns: {
      display: "flex",
      gap: "60px",
      flexWrap: "wrap",
      marginBottom: "40px",
      alignItems: "flex-start",
    },
    column: {
      flex: 1,
      minWidth: "280px",
    },

    list: {
      marginLeft: "20px",
      lineHeight: "1.8",
    },

    /* WHERE YOUR ITEMS GO */
    pillsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      marginTop: "10px",
    },
    pill: {
      border: "1px solid #0078a8",
      borderRadius: "20px",
      padding: "8px 15px",
      fontSize: "0.9rem",
      color: "#0078a8",
      width: "fit-content",
    },
    pillRed: {
      border: "1px solid #e74c3c",
      color: "#e74c3c",
    },
    pillPurple: {
      border: "1px solid #9b59b6",
      color: "#9b59b6",
    },
    pillGreen: {
      border: "1px solid #27ae60",
      color: "#27ae60",
    },

    /* BUTTONS */
    buttons: {
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      margin: "40px 0",
      flexWrap: "wrap",
    },
    pickupBtn: {
      backgroundColor: "#f57c00",
      color: "#fff",
      padding: "15px 30px",
      border: "none",
      borderRadius: "6px",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: "1rem",
    },
    dropoffBtn: {
      backgroundColor: "#0078a8",
      color: "#fff",
      padding: "15px 30px",
      border: "none",
      borderRadius: "6px",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: "1rem",
    },
  };

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <Navbar style={{ backgroundColor: "#0080AA" }}>
        <NavbarBrand tag={Link} to="/" style={{ color: "white" }}>
          <img
            src={logo}
            alt="logo"
            style={{ height: 40, width: 40, marginRight: 10 }}
          />
          ReNova
        </NavbarBrand>
      </Navbar>

      {/* ⬅️ BACK ARROW (LEFT, BELOW NAVBAR) */}
      <div style={styles.backWrapper}>
        <FaArrowLeft
          style={styles.backIcon}
          onClick={() => navigate("/start")}
        />
      </div>

      {/* MAIN */}
      <main style={styles.main}>
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>UPCYCLE</h1>
          <p style={styles.heroSubtitle}>Give Your Old Electronics a New Life</p>
          <p style={styles.heroText}>
            Support creativity, innovation, and sustainability by upcycling your e-waste.
          </p>
        </section>

        <section>
          <h2 style={styles.sectionTitle}>What Is Upcycling?</h2>
          <p style={styles.sectionText}>
            Upcycling takes old or broken electronics and transforms them into functional or artistic items.
            Unlike standard recycling, upcycling keeps more materials in use and reduces the demand for new resources.
          </p>
        </section>

        <section style={styles.columns}>
          <div style={styles.column}>
            <h3 style={styles.sectionTitle}>Upcycling Ideas</h3>
            <ul style={styles.list}>
              <li>Old PC → Retro home server</li>
              <li>Circuit boards → Artwork or décor</li>
              <li>Keyboard keys → Keychains / jewelry</li>
              <li>Laptop batteries → DIY power banks (for experts)</li>
              <li>Motherboards → Coasters / frames</li>
            </ul>
          </div>

          <div style={styles.column}>
            <h3 style={styles.sectionTitle}>Where Your Items Go?</h3>
            <div style={styles.pillsContainer}>
              <span style={styles.pill}>Makerspaces</span>
              <span style={{ ...styles.pill, ...styles.pillGreen }}>Repair cafés</span>
              <span style={{ ...styles.pill, ...styles.pillPurple }}>
                Tech-education programs for kids
              </span>
              <span style={{ ...styles.pill, ...styles.pillRed }}>
                Artists and creative labs
              </span>
            </div>
          </div>
        </section>

        <section style={styles.buttons}>
          <button style={styles.pickupBtn}>PICKUP MY ITEMS</button>
          <button style={styles.dropoffBtn}>I'LL DROP THEM OFF</button>
        </section>
      </main>
    </div>
  );
};

export default Upcycle;
