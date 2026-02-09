import React, { useState } from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import logo from "../assets/logo.png";

const PickupRequest = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    device: "",
    condition: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Pickup request submitted!");
    console.log(form);
    // Connect to backend or Firebase here
  };

  const styles = {
    page: {
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
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
      alignItems: "center",
    },
    backIcon: {
      color: "#0080AA",
      cursor: "pointer",
      fontSize: "22px",
      marginRight: "10px",
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
      maxWidth: "450px",
      textAlign: "center",
    },
    title: {
      fontSize: "1.8rem",
      fontWeight: "bold",
      marginBottom: "20px",
      color: "#0078a8",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "15px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    },
    button: {
      backgroundColor: "#0078a8",
      color: "#fff",
      border: "none",
      padding: "10px 25px",
      borderRadius: "20px",
      cursor: "pointer",
      fontWeight: "bold",
      width: "100%",
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
          <h2 style={styles.title}>Pickup Request</h2>

          <input
            style={styles.input}
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            type="text"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            type="text"
            name="device"
            placeholder="Device"
            value={form.device}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            type="text"
            name="condition"
            placeholder="Condition"
            value={form.condition}
            onChange={handleChange}
          />

          <button type="submit" style={styles.button}>
            Request Pickup
          </button>
        </form>
      </main>
    </div>
  );
};

export default PickupRequest;
