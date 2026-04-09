import React, { useState, useEffect } from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import logo from "../assets/logo.png";

const PickupRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || "Pickup";
  const fromPage = location.state?.from || null; // store previous page if provided

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    deviceCategory: "",
    device: "",
    condition: "",
    dateTime: "",
    address: "",
  });

  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [userName, setUserName] = useState("");

  const allCategories = [
    "Small Electronics","Large Electronics","Home Appliances (Small)","Home Appliances (Large)","IT & Office Equipment",
    "Kitchen & Cooking Appliances","Entertainment Devices","Personal Care Electronics","Tools & Outdoor Equipment",
    "Lighting Equipment","Medical & Fitness Devices","Batteries & Accessories"
  ];

  // Pre-fill user data
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
    if (storedUser) {
      setForm(prev => ({
        ...prev,
        name: storedUser.uname || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
      }));
      setUserName(storedUser.uname || "");
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, phone: value });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[279][0-9]{7}$/.test(form.phone)) {
      newErrors.phone = "Enter valid Omani number (8 digits, starts with 2, 7, or 9)";
    }
    if (!form.deviceCategory.trim()) newErrors.deviceCategory = "Category is required";
    if (!form.device.trim()) newErrors.device = "Device is required";
    if (!form.condition.trim()) newErrors.condition = "Condition is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.dateTime) newErrors.dateTime = "Date & Time is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      alert("You must be logged in.");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    formData.append("category", category);
    if (image) formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5000/api/pickups/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("Pickup request submitted successfully!");
        setForm({
          name: "",
          email: "",
          phone: "",
          deviceCategory: "",
          device: "",
          condition: "",
          dateTime: "",
          address: "",
        });
        setImage(null);
      } else {
        alert(result.message || "Error submitting request");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const styles = {
    page: { fontFamily: "Arial", minHeight: "100vh" },
    navbar: { backgroundColor: "#00a0d0", color: "white" },
    container: { maxWidth: "500px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "6px" },
    input: { width: "100%", padding: "10px", marginBottom: "5px", border: "1px solid #ccc", borderRadius: "4px" },
    error: { color: "red", fontSize: "13px", marginBottom: "10px" },
    button: { backgroundColor: "#00a0d0", color: "#fff", border: "none", padding: "10px", borderRadius: "20px", width: "100%", fontWeight: "bold" }
  };

  return (
    <div style={styles.page}>
      <Navbar style={{ ...styles.navbar, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
        <NavbarBrand tag={Link} to="/" style={{ color: "white", display: "flex", alignItems: "center" }}>
          <img src={logo} alt="logo" style={{ height: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>

        {userName && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "white",
              color: "#00a0d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold"
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span style={{ color: "white", fontWeight: "bold" }}>
              Hi {userName} 👋
            </span>
          </div>
        )}
      </Navbar>

      <div style={{ padding: "20px" }}>
        <FaArrowLeft
          onClick={() => {
            // If previous page provided, navigate back to it, otherwise go back in history
            if (fromPage) navigate(fromPage);
            else navigate(-1);
          }}
          style={{ cursor: "pointer" }}
        />
      </div>

      <h2 style={{ textAlign: "center", marginTop: "10px", color: "#0080AA" }}>
        Schedule Your Pickup
      </h2>

      <p style={{ textAlign: "center", color: "#555", marginBottom: "10px" }}>
        Fill in the details below and we’ll take care of the rest ♻️
      </p>

      <form style={styles.container} onSubmit={handleSubmit}>
        {form.name && (
          <p style={{ marginBottom: "10px", color: "#0080AA", fontWeight: "bold" }}>
            Hi {form.name}! 😊 Let’s arrange your pickup quickly and easily!
          </p>
        )}

        <h3 style={{ marginBottom: "20px" }}>Schedule Pickup</h3>

        <input name="name" placeholder="Name" style={styles.input} value={form.name} onChange={handleChange} />
        {errors.name && <p style={styles.error}>{errors.name}</p>}

        <input name="email" placeholder="Email" style={styles.input} value={form.email} onChange={handleChange} />
        {errors.email && <p style={styles.error}>{errors.email}</p>}

        <input name="phone" placeholder="Phone" style={styles.input} value={form.phone} onChange={handlePhoneChange} />
        {errors.phone && <p style={styles.error}>{errors.phone}</p>}

        <select name="deviceCategory" style={styles.input} onChange={handleChange}>
          <option value="">Select Category</option>
          {allCategories.map((cat, i) => <option key={i}>{cat}</option>)}
        </select>
        {errors.deviceCategory && <p style={styles.error}>{errors.deviceCategory}</p>}

        <input name="device" placeholder="Device" style={styles.input} onChange={handleChange} />
        {errors.device && <p style={styles.error}>{errors.device}</p>}

        <input name="condition" placeholder="Condition" style={styles.input} onChange={handleChange} />
        {errors.condition && <p style={styles.error}>{errors.condition}</p>}

        <input name="address" placeholder="Address" style={styles.input} onChange={handleChange} />
        {errors.address && <p style={styles.error}>{errors.address}</p>}

        <input type="datetime-local" name="dateTime" style={styles.input} onChange={handleChange} />
        {errors.dateTime && <p style={styles.error}>{errors.dateTime}</p>}

        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={styles.input} />

        <button type="submit" style={styles.button}>
          Confirm Pickup
        </button>
      </form>
    </div>
  );
};

export default PickupRequest;