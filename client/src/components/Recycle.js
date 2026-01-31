import React from "react";
import Header from "./Header"; // Make sure the path matches your Header component
import Footer from "./Footer"; // Optional if you also have a Footer component

const Recycle = () => {
  const styles = {
    page: {
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#ffffff",
      color: "#333",
    },
    main: {
      flex: "1",
      padding: "40px 30px",
      maxWidth: "1200px",
      margin: "0 auto",
      width: "100%",
    },
    hero: {
      textAlign: "center",
      marginBottom: "50px",
    },
    heroTitle: { fontSize: "3rem", color: "#0078a8", marginBottom: "10px" },
    heroSubtitle: { fontSize: "1.2rem", color: "#2c3e50", marginBottom: "10px" },
    heroText: { fontSize: "1rem", color: "#333" },
    columns: {
      display: "flex",
      gap: "50px",
      flexWrap: "wrap",
      marginBottom: "40px",
    },
    column: { flex: "1", minWidth: "250px" },
    columnTitleBlue: { color: "#0078a8", fontWeight: "bold", marginBottom: "10px" },
    columnTitleDark: { color: "#000", fontWeight: "bold", marginBottom: "10px" },
    list: { marginLeft: "20px", lineHeight: "1.6" },
    itemsSection: { marginBottom: "40px" },
    itemsGrid: {
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      marginTop: "15px",
    },
    itemCategory: { flex: "1", minWidth: "200px", marginBottom: "15px" },
    itemTitle: { fontWeight: "bold", marginBottom: "5px" },
    buttons: {
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      marginBottom: "40px",
      flexWrap: "wrap",
    },
    pickupBtn: {
      backgroundColor: "#f57c00",
      color: "#fff",
      padding: "15px 25px",
      border: "none",
      borderRadius: "6px",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: "1rem",
    },
    dropoffBtn: {
      backgroundColor: "#0078a8",
      color: "#fff",
      padding: "15px 25px",
      border: "none",
      borderRadius: "6px",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: "1rem",
    },
    fact: {
      textAlign: "center",
      fontStyle: "italic",
      color: "#3c763d",
      fontWeight: "bold",
      fontSize: "1.1rem",
      marginBottom: "40px",
    },
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <Header /> {/* <-- Your existing header component */}

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        {/* HERO */}
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>RECYCLE</h1>
          <p style={styles.heroSubtitle}>Recycle Your E-waste Responsibly</p>
          <p style={styles.heroText}>
            We ensure safe dismantling, material recovery, and eco-friendly processing of electronic waste.
          </p>
        </section>

        {/* WHY & HOW */}
        <section style={styles.columns}>
          <div style={styles.column}>
            <h2 style={styles.columnTitleBlue}>Why Recycle E-Waste?</h2>
            <ul style={styles.list}>
              <li>Prevent toxic materials from entering landfills</li>
              <li>Recover precious metals</li>
              <li>Reduce carbon footprint</li>
              <li>Protect soil and water from contamination</li>
            </ul>
          </div>
          <div style={styles.column}>
            <h2 style={styles.columnTitleDark}>How We Recycle Your Items?</h2>
            <ul style={styles.list}>
              <li>Sorting (separating plastics, metals, glass)</li>
              <li>Safe dismantling</li>
              <li>Material recovery</li>
              <li>Reprocessing / reusing materials</li>
            </ul>
          </div>
        </section>

        {/* ACCEPTED ITEMS */}
        <section style={styles.itemsSection}>
          <h3 style={styles.columnTitleBlue}>Accepted Items for Recycle</h3>
          <p>(We accept most electronic devices, even if broken, damaged, or not working)</p>
          <div style={styles.itemsGrid}>
            <div style={styles.itemCategory}>
              <p style={styles.itemTitle}>(Small Electronics)</p>
              <p>Phones, tablets, smartwatches, earbuds, power banks, chargers.</p>
            </div>
            <div style={styles.itemCategory}>
              <p style={styles.itemTitle}>(Large Electronics)</p>
              <p>Laptops, desktops, monitors, TVs, printers, scanners.</p>
            </div>
            <div style={styles.itemCategory}>
              <p style={styles.itemTitle}>(Household & Other)</p>
              <p>Cameras, game consoles, speakers, routers, hard drives, batteries, computer parts.</p>
            </div>
          </div>
        </section>

        {/* BUTTONS */}
        <section style={styles.buttons}>
          <button style={styles.pickupBtn}>PICKUP MY ITEMS</button>
          <button style={styles.dropoffBtn}>I'LL DROP THEM OFF</button>
        </section>

        {/* FUN FACT */}
        <p style={styles.fact}>
          1 recycled laptop = saves enough energy to power a home for several days.
        </p>
      </main>

      {/* FOOTER */}
      <Footer /> {/* Optional if you have a Footer component */}
    </div>
  );
};

export default Recycle;
