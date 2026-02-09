import React, { useState } from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import logo from "../assets/logo.png";

const DropOff = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    item: "",
    condition: "",
    dateTime: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Drop-Off scheduled!");
    console.log(form);
    // Connect to backend/Firebase here
  };

  const styles = {
    page: {
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#ffffff",
      color: "#333",
    },
    navbar: {
      backgroundColor: "#00a0d0",
      color: "white",
    },
    backWrapper: {
      maxWidth: "600px",
      margin: "20px auto 0",
      padding: "0 20px",
      display: "flex",
      justifyContent: "flex-start",
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
    formContainer: {
      border: "1px solid #ccc",
      borderRadius: "6px",
      padding: "30px",
      width: "100%",
      maxWidth: "400px",
      textAlign: "left",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "20px",
      textAlign: "center",
      color: "#0078a8",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "bold",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "15px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    },
    button: {
      backgroundColor: "#00a0d0",
      color: "#fff",
      border: "none",
      padding: "10px 25px",
      borderRadius: "20px",
      cursor: "pointer",
      fontWeight: "bold",
      width: "100%",
      fontSize: "1rem",
    },
  };

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <Navbar style={styles.navbar}>
        <NavbarBrand tag={Link} to="/" style={{ color: "white" }}>
          <img src={logo} alt="logo" style={{ height: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>
      </Navbar>

<div style={{ maxWidth: "1200px", margin: "10px 0 0 0", padding: "0 30px", display: "flex", justifyContent: "flex-start" }}>
  <FaArrowLeft
    style={{ color: "#0080AA", cursor: "pointer", fontSize: "22px" }}
    onClick={() => navigate("/start")}
  />
</div>


      {/* MAIN FORM */}
      <main style={styles.main}>
        <form style={styles.formContainer} onSubmit={handleSubmit}>
          <h2 style={styles.title}>Schedule Drop Off</h2>

          <label style={styles.label}>Name:</label>
          <input
            style={styles.input}
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />

          <label style={styles.label}>Phone:</label>
          <input
            style={styles.input}
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter your phone"
          />

          <label style={styles.label}>Item:</label>
          <input
            style={styles.input}
            type="text"
            name="item"
            value={form.item}
            onChange={handleChange}
            placeholder="Item to drop off"
          />

          <label style={styles.label}>Condition:</label>
          <input
            style={styles.input}
            type="text"
            name="condition"
            value={form.condition}
            onChange={handleChange}
            placeholder="Item condition"
          />

          <label style={styles.label}>Select Date & Time:</label>
          <input
            style={styles.input}
            type="datetime-local"
            name="dateTime"
            value={form.dateTime}
            onChange={handleChange}
          />

          <button type="submit" style={styles.button}>
            Confirm Drop-Off
          </button>
        </form>
      </main>
    </div>
  );
};

export default DropOff;
