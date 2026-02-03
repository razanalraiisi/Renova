import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Dispose = () => {
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
      fontWeight: "bold",
      marginBottom: "10px",
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

    /* COLUMNS */
    columns: {
      display: "flex",
      gap: "60px",
      flexWrap: "wrap",
      marginBottom: "60px",
      alignItems: "flex-start",
    },
    column: {
      flex: 1,
      minWidth: "280px",
    },

    sectionTitle: {
      color: "#0078a8",
      fontWeight: "bold",
      marginBottom: "15px",
      fontSize: "1.3rem",
    },

    /* LEFT BOX LIST */
    reasonItem: {
      border: "1px solid #0078a8",
      padding: "8px 12px",
      borderRadius: "4px",
      fontSize: "0.9rem",
      marginBottom: "10px",
      width: "fit-content",
    },

    /* RIGHT LIST */
    acceptList: {
      listStyle: "none",
      padding: 0,
      lineHeight: "2",
    },
    acceptItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "0.95rem",
      marginBottom: "6px",
    },

    /* BUTTONS */
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
      {/* HEADER */}
      <Header />

      {/* MAIN */}
      <main style={styles.main}>
        {/* HERO */}
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>DISPOSE</h1>
          <p style={styles.heroSubtitle}>Safe E-Waste Disposal</p>
          <p style={styles.heroText}>
            Some tech can’t be reused — we dispose of it the right way.
          </p>
        </section>

        {/* CONTENT */}
        <section style={styles.columns}>
          {/* LEFT */}
          <div style={styles.column}>
            <h3 style={styles.sectionTitle}>
              Why Some Electronics Can’t Be Recycled or Upcycled?
            </h3>

            <div style={styles.reasonItem}>– Batteries with leaks</div>
            <div style={styles.reasonItem}>– Devices contaminated with chemicals</div>
            <div style={styles.reasonItem}>– Burned or damaged electronics</div>
            <div style={styles.reasonItem}>– Outdated tech with unsafe components</div>
          </div>

          {/* RIGHT */}
          <div style={styles.column}>
            <h3 style={styles.sectionTitle}>Items We Accept for Disposal</h3>

            <ul style={styles.acceptList}>
              <li style={styles.acceptItem}>🟢 Damaged or bloated batteries</li>
              <li style={styles.acceptItem}>📱 Broken phones</li>
              <li style={styles.acceptItem}>💻 Non-working laptops</li>
              <li style={styles.acceptItem}>⚠️ Dangerous chargers</li>
              <li style={styles.acceptItem}>🔥 Burned power banks</li>
              <li style={styles.acceptItem}>🧩 Electronics with missing parts</li>
            </ul>
          </div>
        </section>

        {/* BUTTONS */}
        <section style={styles.buttons}>
          <button style={styles.pickupBtn}>PICKUP MY ITEMS</button>
          <button style={styles.dropoffBtn}>I'LL DROP THEM OFF</button>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Dispose;
