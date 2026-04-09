import React, { useState, useEffect } from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import logo from "../assets/logo.png";

// FIX MARKER ICON
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DropOff = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || "DropOff";

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
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [userName, setUserName] = useState("");

  const allCategories = [
    "Small Electronics","Large Electronics","Home Appliances (Small)","Home Appliances (Large)","IT & Office Equipment",
    "Kitchen & Cooking Appliances","Entertainment Devices","Personal Care Electronics","Tools & Outdoor Equipment",
    "Lighting Equipment","Medical & Fitness Devices","Batteries & Accessories"
  ];

  const centers = [
    {
      id: 1,
      companyName: "Beah",
      position: [23.5859, 58.4059],
      address: "Muscat, Oman",
      phone: "98765401",
      hours: "08:00 - 06:00",
    },
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
    if (!form.address.trim()) newErrors.address = "Please select location from map";
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
      const response = await fetch("http://localhost:5000/api/dropoffs/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("Drop-Off request submitted successfully!");
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
        setSelectedCenter(null);
      } else {
        alert(result.message || "Error submitting request");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleMarkerClick = (center) => {
    setSelectedCenter(center);
    setForm(prev => ({
      ...prev,
      address: center.address,
    }));
  };

  const styles = {
    page: { fontFamily: "Arial", minHeight: "100vh" },
    navbar: { backgroundColor: "#00a0d0", color: "white" },
    mainWrapper: {
      display: "flex",
      justifyContent: "space-between",
      padding: "30px",
      gap: "30px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    formContainer: {
      border: "1px solid #ccc",
      borderRadius: "6px",
      padding: "20px",
      width: "400px",
    },
    input: { width: "100%", padding: "10px", marginBottom: "5px", border: "1px solid #ccc", borderRadius: "4px" },
    error: { color: "red", fontSize: "13px", marginBottom: "10px" },
    button: { backgroundColor: "#00a0d0", color: "#fff", border: "none", padding: "10px", borderRadius: "20px", width: "100%", fontWeight: "bold" },
    mapContainer: { flex: 1, height: "600px", borderRadius: "10px", overflow: "hidden" }
  };

  return (
    <div style={styles.page}>
      <Navbar style={{ ...styles.navbar, display: "flex", justifyContent: "space-between", padding: "0 20px" }}>
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
        <FaArrowLeft onClick={() => navigate("/start")} style={{ cursor: "pointer" }} />
      </div>

      {/* TITLE */}
      <h2 style={{ textAlign: "center", color: "#0080AA" }}>
        Schedule Your Drop-Off
      </h2>
      <p style={{ textAlign: "center", color: "#555", marginBottom: "20px" }}>
        Choose a nearby center and complete your request ♻️
      </p>

      <div style={styles.mainWrapper}>
        <form style={styles.formContainer} onSubmit={handleSubmit}>
          {form.name && (
            <p style={{ marginBottom: "10px", color: "#0080AA", fontWeight: "bold" }}>
              Hi {form.name}! 😊 Let’s get your drop-off ready!
            </p>
          )}

          <h3>Schedule Drop Off</h3>

          {/* ORIGINAL FIELDS */}
          <input name="name" placeholder="Name" style={styles.input} value={form.name} readOnly />
          {errors.name && <p style={styles.error}>{errors.name}</p>}

          <input name="email" placeholder="Email" style={styles.input} value={form.email} readOnly />
          {errors.email && <p style={styles.error}>{errors.email}</p>}

          <input
            name="phone"
            placeholder="Phone"
            style={styles.input}
            value={form.phone}
            onChange={handlePhoneChange}
          />
          {errors.phone && <p style={styles.error}>{errors.phone}</p>}

          <select name="deviceCategory" style={styles.input} onChange={handleChange} value={form.deviceCategory}>
            <option value="">Select Category</option>
            {allCategories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
          </select>
          {errors.deviceCategory && <p style={styles.error}>{errors.deviceCategory}</p>}

          <input name="device" placeholder="Device" style={styles.input} onChange={handleChange} value={form.device} />
          {errors.device && <p style={styles.error}>{errors.device}</p>}

          <input name="condition" placeholder="Condition" style={styles.input} onChange={handleChange} value={form.condition} />
          {errors.condition && <p style={styles.error}>{errors.condition}</p>}

          <input
            name="address"
            placeholder="Address (auto-filled)"
            value={form.address}
            style={styles.input}
            readOnly
          />
          {errors.address && <p style={styles.error}>{errors.address}</p>}

          <input type="datetime-local" name="dateTime" style={styles.input} onChange={handleChange} value={form.dateTime} />
          {errors.dateTime && <p style={styles.error}>{errors.dateTime}</p>}

          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Upload Picture (Optional)</label>
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files[0];
            if (file && !file.type.startsWith("image/")) {
              alert("Only image files are allowed");
              e.target.value = "";
              return;
            }
            setImage(file);
          }} style={styles.input} />

          <button type="submit" style={styles.button}>
            Confirm Drop-Off
          </button>

          {/* CENTER INFO */}
          {selectedCenter && (
            <div style={{
              marginTop: "10px",
              padding: "10px",
              border: "1px dashed #0078a8",
              borderRadius: "6px"
            }}>
              <strong>{selectedCenter.companyName}</strong><br />
              {selectedCenter.address}<br />
              {selectedCenter.phone}<br />
              {selectedCenter.hours}
            </div>
          )}
        </form>

        {/* MAP */}
        <div style={styles.mapContainer}>
          <MapContainer center={[23.5859, 58.4059]} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {centers.map(center => (
              <Marker
                key={center.id}
                position={center.position}
                eventHandlers={{ click: () => handleMarkerClick(center) }}
              >
                <Popup>{center.companyName}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default DropOff;