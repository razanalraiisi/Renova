import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

const DecideForMe = () => {
  const [condition, setCondition] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDecision = () => {
    if (!condition || !image) {
      alert("Please select device condition and upload an image.");
      return;
    }

    /* 🔮 TEMP LOGIC (AI SIMULATION)
       Later this will be replaced with real AI API */
    if (condition === "working") {
      setResult("✅ Recommended: UPCYCLE");
    } else if (condition === "damaged") {
      setResult("♻️ Recommended: RECYCLE");
    } else {
      setResult("⚠️ Recommended: DISPOSE");
    }
  };

  const styles = {
    page: {
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
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
    result: {
      marginTop: "20px",
      fontWeight: "bold",
      fontSize: "1.1rem",
    },
  };

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.title}>Decide for Me!</h2>

          {/* CONDITION */}
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

          {/* UPLOAD */}
          <label>Upload photo of device here...</label>
          <div style={styles.uploadBox}>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <p>Drag and drop files here to upload</p>
          </div>

          {preview && <img src={preview} alt="Preview" style={styles.preview} />}

          {/* BUTTON */}
          <button style={styles.button} onClick={handleDecision}>
            Upload
          </button>

          {/* RESULT */}
          {result && <p style={styles.result}>{result}</p>}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DecideForMe;
