import React, { useState } from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
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

  const [form, setForm] = useState({
    name: "",
    phone: "",
    deviceCategory: "",
    device: "",
    condition: "",
    dateTime: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedCenter, setSelectedCenter] = useState(null);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // only numbers
    setForm({ ...form, phone: value });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[279][0-9]{7}$/.test(form.phone)) {
      newErrors.phone =
        "Enter valid Omani number (8 digits, starts with 2, 7, or 9)";
    }

    if (!form.deviceCategory.trim()) {
      newErrors.deviceCategory = "Category is required";
    }

    if (!form.device.trim()) {
      newErrors.device = "Device is required";
    }

    if (!form.condition.trim()) {
      newErrors.condition = "Condition is required";
    }

    if (!form.address.trim()) {
      newErrors.address = "Please select location from map";
    }

    if (!form.dateTime) {
      newErrors.dateTime = "Date & Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to submit a request.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/dropoffs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Drop-Off request submitted successfully!");
        // Reset form or navigate
        setForm({
          name: "",
          phone: "",
          deviceCategory: "",
          device: "",
          condition: "",
          dateTime: "",
          address: "",
        });
        setSelectedCenter(null);
      } else {
        alert(result.message || "Error submitting request");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Server error");
    }
  };

  const handleMarkerClick = (center) => {
    setSelectedCenter(center);
    setForm((prev) => ({
      ...prev,
      address: center.address,
    }));
  };

  const styles = {
    page: {
      fontFamily: "Arial",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    },
    navbar: {
      backgroundColor: "#00a0d0",
      color: "white",
    },
    backWrapper: {
      width: "100%",
      padding: "20px 30px 0",
      display: "flex",
      justifyContent: "flex-start",
    },
    backIcon: {
      color: "#0080AA",
      cursor: "pointer",
      fontSize: "22px",
    },
    mainWrapper: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "stretch",
      padding: "40px 20px",
      gap: "30px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    formContainer: {
      border: "1px solid #ccc",
      borderRadius: "6px",
      padding: "30px",
      width: "400px",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "5px",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    error: {
      color: "red",
      fontSize: "13px",
      marginBottom: "10px",
    },
    button: {
      backgroundColor: "#00a0d0",
      color: "#fff",
      border: "none",
      padding: "10px",
      borderRadius: "20px",
      width: "100%",
      fontWeight: "bold",
      cursor: "pointer",
    },
    mapContainer: {
      flex: 1,
      height: "600px",
      minWidth: "500px",
      borderRadius: "10px",
      overflow: "hidden",
    },
    selectedInfo: {
      marginTop: "10px",
      padding: "10px",
      border: "1px dashed #0078a8",
      borderRadius: "6px",
    },
  };

  return (
    <div style={styles.page}>
      <Navbar style={styles.navbar}>
        <NavbarBrand tag={Link} to="/" style={{ color: "white" }}>
          <img src={logo} alt="logo" style={{ height: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>
      </Navbar>

      <div style={styles.backWrapper}>
        <FaArrowLeft onClick={() => navigate("/start")} style={styles.backIcon} />
      </div>

      <div style={styles.mainWrapper}>
        {/* FORM */}
        <form style={styles.formContainer} onSubmit={handleSubmit}>
          <h3>Schedule Drop Off</h3>

          <input name="name" placeholder="Name" style={styles.input} onChange={handleChange} />
          {errors.name && <p style={styles.error}>{errors.name}</p>}

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

          <input name="device" placeholder="Device" style={styles.input} onChange={handleChange} />
          {errors.device && <p style={styles.error}>{errors.device}</p>}

          <input name="condition" placeholder="Condition" style={styles.input} onChange={handleChange} />
          {errors.condition && <p style={styles.error}>{errors.condition}</p>}

          <input
            name="address"
            placeholder="Address (auto-filled)"
            value={form.address}
            style={styles.input}
            readOnly
          />
          {errors.address && <p style={styles.error}>{errors.address}</p>}

          <input type="datetime-local" name="dateTime" style={styles.input} onChange={handleChange} />
          {errors.dateTime && <p style={styles.error}>{errors.dateTime}</p>}

          <button type="submit" style={styles.button}>
            Confirm Drop-Off
          </button>

          {selectedCenter && (
            <div style={styles.selectedInfo}>
              <strong>{selectedCenter.companyName}</strong><br />
              {selectedCenter.address}<br />
              {selectedCenter.phone}<br />
              {selectedCenter.hours}
            </div>
          )}
        </form>

        {/* MAP */}
        <div style={styles.mapContainer}>
          <MapContainer
            center={[23.5859, 58.4059]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {centers.map((center) => (
              <Marker
                key={center.id}
                position={center.position}
                eventHandlers={{
                  click: () => handleMarkerClick(center),
                }}
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