import React, { useState, useEffect } from "react";
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
  const [userName, setUserName] = useState("");
  const [fileError, setFileError] = useState("");
  const [conditionError, setConditionError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hoverUpload, setHoverUpload] = useState(false);
  const [hoverButton, setHoverButton] = useState(false);

  // Get logged-in user's name
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
    if (storedUser) setUserName(storedUser.uname || "");
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Only image files are allowed!");
      setImage(null);
      setPreview(null);
      setImageError(true);
      e.target.value = "";
      return;
    }

    setFileError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setImageError(false);
  };

  const handleDecision = async () => {
    let hasError = false;

    if (!condition) {
      setConditionError(true);
      hasError = true;
    } else {
      setConditionError(false);
    }

    if (!image) {
      setImageError(true);
      hasError = true;
    } else {
      setImageError(false);
    }

    if (hasError) return;

    const aiResult = await getAIRecommendation(image, condition);

    navigate("/decisionlogic", {
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
      backgroundColor: "#f0f8ff",
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
    main: { flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" },
    card: { border: "1px solid #ccc", padding: "30px", borderRadius: "6px", width: "450px", textAlign: "center" },
    pageTitle: { textAlign: "center", fontSize: "1.8rem", color: "#0078a8", fontWeight: "bold", margin: "20px 0" },
    title: { color: "#0078a8", fontSize: "1.6rem", fontWeight: "bold", marginBottom: "20px" },
    select: { width: "100%", padding: "10px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px" },
    selectError: { border: "2px solid red" },
    uploadBox: {
      border: "2px dashed #0078a8",
      padding: "25px",
      borderRadius: "6px",
      cursor: "pointer",
      marginBottom: "5px",
      backgroundColor: hoverUpload ? "#e6f7ff" : "white",
      borderColor: hoverUpload ? "#00a0d0" : "#0078a8",
      transition: "all 0.3s ease",
    },
    uploadBoxError: { border: "2px dashed red" },
    fileError: { color: "red", fontSize: "0.9rem", marginBottom: "10px" },
    preview: { width: "100%", marginTop: "10px", borderRadius: "4px" },
    button: {
      backgroundColor: "#0078a8",
      color: "#fff",
      border: "none",
      padding: "10px 25px",
      borderRadius: "20px",
      cursor: "pointer",
      fontWeight: "bold",
      marginTop: "10px",
      transition: "all 0.2s ease",
      transform: hoverButton ? "scale(1.05)" : "scale(1)",
      backgroundColor: hoverButton ? "#005f7a" : "#0078a8",
    },
  };

  return (
    <div className="user-flow-page" style={styles.page}>
      

      {/* ⬅️ BACK ARROW */}
      <div style={styles.backWrapper}>
        <FaArrowLeft style={styles.backIcon} onClick={() => navigate("/start")} />
      </div>

      {/* PAGE TITLE */}
      <h2 style={styles.pageTitle}>Let AI Decide For You</h2>

      {/* MAIN */}
      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.title}>Decide for Me!</h2>

          <label>Device Condition</label>
          <select
            style={{ ...styles.select, ...(conditionError ? styles.selectError : {}) }}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">Please Select...</option>
            <option value="working">Working / Reusable</option>
            <option value="damaged">Damaged / Not working</option>
            <option value="dangerous">Burned / Dangerous</option>
          </select>
          {conditionError && <p style={styles.fileError}>Please select a device condition</p>}

          <label>Upload photo of device here...</label>
          <div
            style={{ ...styles.uploadBox, ...(imageError ? styles.uploadBoxError : {}) }}
            onMouseEnter={() => setHoverUpload(true)}
            onMouseLeave={() => setHoverUpload(false)}
          >
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <p>Drag and drop files here to upload</p>
          </div>
          {(imageError || fileError) && <p style={styles.fileError}>{fileError || "Please upload an image of your device"}</p>}

          {preview && <img src={preview} alt="Preview" style={styles.preview} />}

          <button
            style={styles.button}
            onMouseEnter={() => setHoverButton(true)}
            onMouseLeave={() => setHoverButton(false)}
            onClick={handleDecision}
          >
            Upload
          </button>
        </div>
      </main>
    </div>
  );
};

export default DecideForMe;