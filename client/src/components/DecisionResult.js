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
  const { recommendation, imagePreview, condition } = location.state || {};

  const styles = {
    page: {
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      backgroundColor: "#fff",
    },
    backWrapper: {
      maxWidth: "1200px",
      margin: "10px 0 0 0",
      padding: "0 30px",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    backIcon: { color: "#0080AA", cursor: "pointer", fontSize: "22px" },
    main: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px",
    },
    previewCard: {
      width: "300px",
      textAlign: "center",
      marginBottom: "20px",
    },
    previewImage: {
      width: "100%",
      borderRadius: "6px",
    },
    resultCardContainer: {
      display: "flex",
      gap: "20px",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    resultCard: {
      flex: "1 1 30%",
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "15px",
      textAlign: "center",
      boxShadow: "0 0 5px #aaa",
    },
    highlighted: {
      border: "3px solid #4caf50",
      boxShadow: "0 0 10px #4caf50",
    },
    cardImage: {
      width: "100%",
      height: "150px",
      objectFit: "cover",
      borderRadius: "5px",
    },
    cardButtons: { display: "flex", justifyContent: "space-around", marginTop: "10px" },
    cardButton: { padding: "5px 10px" },
    recommendedText: { color: "#4caf50", marginTop: "10px" },
    collectorInfo: { marginTop: "10px", fontSize: "0.9rem", color: "#555" },
  };

  if (!recommendation) return <p>No recommendation available</p>;

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <Navbar style={{ backgroundColor: "#0080AA" }}>
        <NavbarBrand tag={Link} to="/start" style={{ color: "white" }}>
          <img src={logo} alt="logo" style={{ height: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>
      </Navbar>

      {/* ⬅️ BACK ARROW */}
      <div style={styles.backWrapper}>
        <FaArrowLeft style={styles.backIcon} onClick={() => navigate(-1)} />
      </div>

      <main style={styles.main}>
        {/* Optional preview of uploaded image */}
        {imagePreview && (
          <div style={styles.previewCard}>
            <img src={imagePreview} alt="Uploaded Device" style={styles.previewImage} />
            <p>Condition: {condition}</p>
          </div>
        )}

        {/* AI Result Cards */}
        <div style={styles.resultCardContainer}>
          {[
            { name: "Recycle", img: recycleImg },
            { name: "Upcycle", img: upcycleImg },
            { name: "Dispose", img: disposeImg },
          ].map((option) => (
            <div
              key={option.name}
              style={{
                ...styles.resultCard,
                ...(option.name === recommendation ? styles.highlighted : {}),
              }}
            >
              <img src={option.img} alt={option.name} style={styles.cardImage} />
              <h3>{option.name}</h3>
              {option.name === recommendation && <p style={styles.recommendedText}>Recommended</p>}
              <div style={styles.cardButtons}>
                <button style={styles.cardButton}>Pick Up</button>
                <button style={styles.cardButton}>Drop Off</button>
              </div>
              {option.name === recommendation && (
                <p style={styles.collectorInfo}>Collector info will appear here</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DecisionResult;