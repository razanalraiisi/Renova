import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import logo from "../assets/logo.png";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

const PickupRequest = () => {
  const navigate = useNavigate();

  const [defaultValues, setDefaultValues] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    device: "",
    condition: "",
  });

  // auto-fill Name, Email, and Phone from logged-in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setDefaultValues({
        name: user.uname || "",
        email: user.email || "",
        phone: user.phone || "",
        address: "",
        device: "",
        condition: "",
      });
    }
  }, []);

  // validation schema (matches Register style)
  const schema = Yup.object().shape({
    phone: Yup.string()
      .required("Phone is required")
      .matches(/^[0-9]+$/, "Phone must be numbers only")
      .min(7, "Phone must be at least 7 digits"),
    address: Yup.string().required("Address is required"),
    device: Yup.string().required("Device is required"),
    condition: Yup.string()
      .required("Condition is required")
      .max(100, "Condition must be at most 100 characters"),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const formData = { ...defaultValues, ...data };

    try {
      const response = await fetch("http://localhost:5000/api/pickups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Pickup request submitted successfully!");
        console.log("Saved request:", result);
        reset();
      } else {
        alert(result.message || "Error submitting request");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Server error");
    }
  };

  const styles = {
    page: { fontFamily: "Arial, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" },
    main: { flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" },
    formContainer: { border: "1px solid #ccc", borderRadius: "6px", padding: "30px", width: "100%", maxWidth: "450px", textAlign: "center" },
    title: { fontSize: "1.8rem", fontWeight: "bold", marginBottom: "20px", color: "#0078a8" },
    label: { display: "block", marginBottom: "5px", fontWeight: "600", textAlign: "left", color: "#333" },
    input: { width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" },
    errorText: { color: "red", fontSize: "12px", marginBottom: "10px", textAlign: "left" },
    button: { backgroundColor: "#0078a8", color: "#fff", border: "none", padding: "10px 25px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", width: "100%" },
    navbar: { backgroundColor: "#0080AA", padding: "0 40px" },
    userIcon: { display: "flex", alignItems: "center", fontSize: "24px", color: "white", cursor: "pointer" },
  };

  // get user name for tooltip / future use
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={styles.page}>
      {/* 🔵 NAVBAR (with user icon) */}
      <Navbar style={styles.navbar}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          {/* LEFT: Logo */}
          <NavbarBrand tag={Link} to="/" style={{ color: "white", display: "flex", alignItems: "center" }}>
            <img src={logo} alt="logo" style={{ height: 40, width: 40, marginRight: 10 }} />
            ReNova
          </NavbarBrand>

          {/* RIGHT: User icon */}
          <div style={styles.userIcon}>
            <FaUserCircle onClick={() => navigate("/UserDash")} title={user?.uname || "User"} />
          </div>
        </div>
      </Navbar>

      {/* BACK BUTTON */}
      <div style={{ maxWidth: "1200px", margin: "10px 0 0 0", padding: "0 30px", display: "flex", justifyContent: "flex-start" }}>
        <FaArrowLeft style={{ color: "#0080AA", cursor: "pointer", fontSize: "22px" }} onClick={() => navigate("/start")} />
      </div>

      {/* MAIN FORM */}
      <main style={styles.main}>
        <form style={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
          <h2 style={styles.title}>Pickup Request</h2>

          {/* Name */}
          <label style={styles.label}>Name</label>
          <input
            style={{ ...styles.input, backgroundColor: "#f1f1f1", cursor: "not-allowed" }}
            type="text"
            name="name"
            value={defaultValues.name}
            readOnly
          />

          {/* Email */}
          <label style={styles.label}>Email</label>
          <input
            style={{ ...styles.input, backgroundColor: "#f1f1f1", cursor: "not-allowed" }}
            type="email"
            name="email"
            value={defaultValues.email}
            readOnly
          />

          {/* Phone */}
          <label style={styles.label}>Phone</label>
          <input
            style={styles.input}
            type="text"
            {...register("phone")}
            placeholder="Phone"
          />
          {errors.phone && <div style={styles.errorText}>{errors.phone.message}</div>}

          {/* Address */}
          <label style={styles.label}>Address</label>
          <input
            style={styles.input}
            type="text"
            {...register("address")}
            placeholder="Address"
          />
          {errors.address && <div style={styles.errorText}>{errors.address.message}</div>}

          {/* Device */}
          <label style={styles.label}>Device</label>
          <input
            style={styles.input}
            type="text"
            {...register("device")}
            placeholder="Device"
          />
          {errors.device && <div style={styles.errorText}>{errors.device.message}</div>}

          {/* Condition */}
          <label style={styles.label}>Condition</label>
          <input
            style={styles.input}
            type="text"
            {...register("condition")}
            placeholder="Condition"
          />
          {errors.condition && <div style={styles.errorText}>{errors.condition.message}</div>}

          <button type="submit" style={styles.button}>
            Request Pickup
          </button>
        </form>
      </main>
    </div>
  );
};

export default PickupRequest;