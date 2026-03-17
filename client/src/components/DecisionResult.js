import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";
import { FaArrowLeft } from "react-icons/fa";
import logo from "../assets/logo.png";
import recycleImg from "../assets/recycle.png";
import upcycleImg from "../assets/Upcycle.jpg";
import disposeImg from "../assets/Dispose.jpg";

const DecisionResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { recommendation, imagePreview, condition, detectedDevice } = location.state || {};

  const styles = {
    page: { fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#fff" },
    navbar: { backgroundColor: "#00a1c6" },
    backWrapper: { maxWidth: "1200px", margin: "10px 0 0 0", padding: "0 30px", display: "flex", justifyContent: "flex-start", alignItems: "center" },
    backIcon: { color: "#fff", cursor: "pointer", fontSize: "22px" },
    main: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" },
    detected: { fontWeight: "bold", marginBottom: "20px", fontSize: "1.2rem" },
    cardContainer: { display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" },
    card: { flex: "1 1 250px", borderRadius: "8px", padding: "20px", textAlign: "center", position: "relative", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" },
    numberBadge: { position: "absolute", top: "-10px", left: "-10px", backgroundColor: "#ffd700", color: "#000", borderRadius: "50%", width: "25px", height: "25px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
    cardImage: { width: "100%", height: "150px", objectFit: "cover", borderRadius: "5px" },
    cardButtons: { display: "flex", justifyContent: "space-around", marginTop: "15px" },
    cardButton: { backgroundColor: "#0080AA", color: "#fff", border: "none", borderRadius: "20px", padding: "8px 15px", cursor: "pointer", fontWeight: "bold" },
    recommendedText: { color: "#007a33", fontWeight: "bold", marginTop: "10px" },
    collectorInfo: { marginTop: "10px", fontSize: "0.9rem", color: "#555" },
    upcycle: { backgroundColor: "#cce5ff", border: "2px solid #007bff" },
    recycle: { backgroundColor: "#d4edda", border: "2px solid #28a745" },
    dispose: { backgroundColor: "#ffe5b4", border: "2px solid #ff9800" },
    highlighted: { boxShadow: "0 0 10px #4caf50", borderWidth: "3px" },
  };

  if (!recommendation) return <p>No recommendation available</p>;

  const cards = [
    { name: "Upcycle", img: upcycleImg, style: styles.upcycle },
    { name: "Recycle", img: recycleImg, style: styles.recycle },
    { name: "Dispose", img: disposeImg, style: styles.dispose },
  ];

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <Navbar style={styles.navbar}>
        <NavbarBrand tag={Link} to="/start" style={{ color: "white" }}>
          <img src={logo} alt="logo" style={{ height: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>
      </Navbar>

      {/* BACK */}
      <div style={styles.backWrapper}>
        <FaArrowLeft style={styles.backIcon} onClick={() => navigate(-1)} />
      </div>

      <main style={styles.main}>
        {/* Detected device */}
        {detectedDevice && <div style={styles.detected}>Detected: {detectedDevice}</div>}

        <div style={styles.cardContainer}>
          {cards.map((card, idx) => (
            <div
              key={card.name}
              style={{
                ...styles.card,
                ...card.style,
                ...(card.name === recommendation ? styles.highlighted : {}),
              }}
            >
              <div style={styles.numberBadge}>{idx + 1}</div>
              <img src={card.img} alt={card.name} style={styles.cardImage} />
              <h3>{card.name}</h3>
              {card.name === recommendation && <p style={styles.recommendedText}>Recommended</p>}
              {card.name === "Upcycle" && card.name === recommendation && (
                <p style={styles.collectorInfo}>Matched Collector: Muscat Tech Repairs ★★★★☆ (300) • Est. 1h</p>
              )}
              {card.name === "Recycle" && card.name === recommendation && (
                <p style={styles.collectorInfo}>Certified centers can recycle your device</p>
              )}
              {card.name === "Dispose" && card.name === recommendation && (
                <p style={styles.collectorInfo}>Use if device cannot be reused or safely recycled</p>
              )}
              <div style={styles.cardButtons}>
                <button
                  style={styles.cardButton}
                  onClick={() => navigate("/PickupRequest")}
                >
                  PickUp
                </button>
                <button
                  style={styles.cardButton}
                  onClick={() => navigate("/DropOff")}
                >
                  Drop Off
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DecisionResult;