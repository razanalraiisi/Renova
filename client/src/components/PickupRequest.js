import React, { useState, useEffect } from "react";
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

  // AUTO FILL NAME & EMAIL FROM LOGIN
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.uname || "",
        email: user.email || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // SUBMIT FORM TO BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/pickups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Pickup request submitted successfully!");
        console.log("Saved request:", data);

        // Reset form
        setForm({
          name: "",
          email: "",
          phone: "",
          address: "",
          device: "",
          condition: "",
        });

        // optional redirect
        // navigate("/user-dashboard");
      } else {
        alert(data.message || "Error submitting request");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Server error");
    }
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
      textAlign: "left",
    },
    title: {
      fontSize: "1.8rem",
      fontWeight: "bold",
      marginBottom: "20px",
      color: "#0078a8",
      textAlign: "center",
    },
    label: {
      marginBottom: "5px",
      display: "block",
      fontWeight: "600",
      color: "#333",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "15px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      boxSizing: "border-box",
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

      {/* BACK BUTTON */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "10px 0 0 0",
          padding: "0 30px",
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <FaArrowLeft
          style={{ color: "#0080AA", cursor: "pointer", fontSize: "22px" }}
          onClick={() => navigate("/start")}
        />
      </div>

      {/* MAIN FORM */}
      <main style={styles.main}>
        <form style={styles.formContainer} onSubmit={handleSubmit}>
          <h2 style={styles.title}>Pickup Request</h2>

          <label style={styles.label}>Name</label>
          <input
            style={{ ...styles.input, backgroundColor: "#f1f1f1", cursor: "not-allowed" }}
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            readOnly
            required
          />

          <label style={styles.label}>Email</label>
          <input
            style={{ ...styles.input, backgroundColor: "#f1f1f1", cursor: "not-allowed" }}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            readOnly
            required
          />

          <label style={styles.label}>Phone</label>
          <input
            style={styles.input}
            type="text"
            name="phone"
            placeholder="Enter your Phone no"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Address</label>
          <input
            style={styles.input}
            type="text"
            name="address"
            placeholder="Enter your Address"
            value={form.address}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Device</label>
          <input
            style={styles.input}
            type="text"
            name="device"
            placeholder="Enter Device type"
            value={form.device}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Condition</label>
          <input
            style={styles.input}
            type="text"
            name="condition"
            placeholder="Enter device Condition"
            value={form.condition}
            onChange={handleChange}
            required
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