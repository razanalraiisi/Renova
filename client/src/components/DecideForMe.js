import React, { useState } from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import logo from "../assets/logo.png";
import { getAIRecommendation } from "./aiService.js";

const DecideForMe = () => {
  const navigate = useNavigate();
  const [condition, setCondition] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDecision = async () => {
    if (!condition || !image) {
      alert("Please select device condition and upload an image.");
      return;
    }

    // ===== Call AI service =====
    const aiResult = await getAIRecommendation(image, condition);

    // ===== Navigate to result page with AI data =====
    navigate("/decision-result", {
      state: {
        recommendation: aiResult,
        imagePreview: preview,
        condition: condition,
      },
    });
  };

  const styles = {
    page: {
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
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
    backIcon: {
      color: "#0080AA",
      cursor: "pointer",
      fontSize: "22px",
    },
    main: {
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px 20px",
    },
    card: {
      border: "1px solid #ccc",
      padding: "30px",
      borderRadius: "6px",
      width: "450px",
      textAlign: "center",
    },
    title: {
      color: "#0078a8",
      fontSize: "1.6rem",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    select: {
      width: "100%",
      padding: "10px",
      marginBottom: "20px",
    },
    uploadBox: {
      border: "2px dashed #0078a8",
      padding: "25px",
      borderRadius: "6px",
      cursor: "pointer",
      marginBottom: "15px",
    },
    preview: {
      width: "100%",
      marginTop: "10px",
      borderRadius: "4px",
    },
    button: {
      backgroundColor: "#0078a8",
      color: "#fff",
      border: "none",
      padding: "10px 25px",
      borderRadius: "20px",
      cursor: "pointer",
      fontWeight: "bold",
      marginTop: "10px",
    },
  };

  return (
    <div className="user-flow-page" style={styles.page}>
      {/* NAVBAR */}
      <Navbar style={{ backgroundColor: "#0080AA" }} className="user-flow-navbar">
        <NavbarBrand tag={Link} to="/start" style={{ color: "white" }}>
          <img src={logo} alt="logo" style={{ height: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>
      </Navbar>

      {/* ⬅️ BACK ARROW */}
      <div style={styles.backWrapper}>
        <FaArrowLeft style={styles.backIcon} onClick={() => navigate("/start")} />
      </div>

      {/* MAIN */}
      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.title}>Decide for Me!</h2>

          <label>Device Condition</label>
          <select
            style={styles.select}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">Please Select...</option>
            <option value="working">Working / Reusable</option>
            <option value="damaged">Damaged / Not working</option>
            <option value="dangerous">Burned / Dangerous</option>
          </select>

          <label>Upload photo of device here...</label>
          <div style={styles.uploadBox}>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <p>Drag and drop files here to upload</p>
          </div>

          {preview && <img src={preview} alt="Preview" style={styles.preview} />}

          <button style={styles.button} onClick={handleDecision}>
            Upload
          </button>
        </div>
      </main>
    </div>
  );
};

export default DecideForMe;