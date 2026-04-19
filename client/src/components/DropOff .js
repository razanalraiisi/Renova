import React, { useState, useEffect } from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaSync } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
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
  const [collectors, setCollectors] = useState([]);
  const [loadingCollectors, setLoadingCollectors] = useState(false);

  const allCategories = [
    "Small Electronics","Large Electronics","Home Appliances (Small)","Home Appliances (Large)","IT & Office Equipment",
    "Kitchen & Cooking Appliances","Entertainment Devices","Personal Care Electronics","Tools & Outdoor Equipment",
    "Lighting Equipment","Medical & Fitness Devices","Batteries & Accessories"
  ];

  // =========================
  // DATE / TIME RULES (OMAN FIX)
  // =========================

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 5 || day === 6;
  };

  const isValidDateTime = (value) => {
    if (!value) return false;

    const dt = new Date(value);
    const now = new Date();

    const isSameDay =
      dt.getFullYear() === now.getFullYear() &&
      dt.getMonth() === now.getMonth() &&
      dt.getDate() === now.getDate();

    if (dt <= now || isSameDay) return false;
    if (isWeekend(dt)) return false;

    const hour = dt.getHours();
    if (hour < 8 || hour > 17) return false;

    return true;
  };

  const getMinDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(8, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  // =========================
  // 🔥 NEW: HANDLE DATE CHANGE (UI BLOCK)
  // =========================

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (!value) return;

    const dt = new Date(value);

    const day = dt.getDay();
    if (day === 5 || day === 6) {
      alert("Friday and Saturday are not allowed.");
      return;
    }

    const hour = dt.getHours();
    if (hour < 8 || hour > 17) {
      alert("Please select time between 08:00 and 17:00.");
      return;
    }

    setForm({ ...form, dateTime: value });
  };

  // =========================
  // FETCH COLLECTORS
  // =========================

  const fetchCollectors = async () => {
    setLoadingCollectors(true);
    try {
      const res = await axios.get("http://localhost:5000/admin/getApprovedCollectors");
      const approvedWithLocation = res.data.filter(
        (c) => c.isApproved && c.location && c.location.lat && c.location.lng
      );
      setCollectors(approvedWithLocation);
    } catch (err) {
      console.error("Error fetching collectors:", err);
    } finally {
      setLoadingCollectors(false);
    }
  };

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));

    if (storedUser) {
      setForm(prev => ({
        ...prev,
        name: storedUser.uname || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
      }));
      setUserName(storedUser.uname || "");
    }

    fetchCollectors();

    if (location.state?.collector) {
      const collector = location.state.collector;

      setSelectedCenter({
        id: collector._id,
        companyName: collector.companyName,
        position: [collector.location.lat, collector.location.lng],
        address: collector.address,
        phone: collector.phone,
        hours: collector.openHr,
      });

      setForm(prev => ({
        ...prev,
        address: collector.address,
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, phone: value });
  };

  // =========================
  // VALIDATION
  // =========================

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

    if (!form.dateTime) {
      newErrors.dateTime = "Date & Time is required";
    } else if (!isValidDateTime(form.dateTime)) {
      newErrors.dateTime =
        "Only Sunday–Thursday (08:00–17:00), no Friday/Saturday, no past dates";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // SUBMIT
  // =========================

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

  const handleMarkerClick = (collector) => {
    setSelectedCenter({
      id: collector._id,
      companyName: collector.companyName,
      position: [collector.location.lat, collector.location.lng],
      address: collector.address,
      phone: collector.phone,
      hours: collector.openHr,
    });

    setForm(prev => ({
      ...prev,
      address: collector.address,
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
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "5px",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    error: { color: "red", fontSize: "13px", marginBottom: "10px" },
    button: {
      backgroundColor: "#00a0d0",
      color: "#fff",
      border: "none",
      padding: "10px",
      borderRadius: "20px",
      width: "100%",
      fontWeight: "bold",
    },
    mapContainer: {
      flex: 1,
      height: "600px",
      borderRadius: "10px",
      overflow: "hidden",
    },
  };

  return (
    <div style={styles.page}>
      <div style={{ padding: "20px" }}>
        <FaArrowLeft
          onClick={() =>
            location.state?.from ? navigate(location.state.from) : navigate(-1)
          }
          style={{ cursor: "pointer" }}
        />
      </div>

      <h2 style={{ textAlign: "center", color: "#0080AA" }}>
        Schedule Your Drop-Off
      </h2>

      <p style={{ textAlign: "center", color: "#555", marginBottom: "10px" }}>
        Choose a nearby center and complete your request ♻️
      </p>

      <div style={styles.mainWrapper}>
        <form style={styles.formContainer} onSubmit={handleSubmit}>
          {form.name && (
            <p style={{ marginBottom: "10px", color: "#0080AA", fontWeight: "bold" }}>
              Hi {form.name}! 😊 Let’s get your drop-off ready!
            </p>
          )}

          <input name="name" placeholder="Name" style={styles.input} value={form.name} readOnly />
          <input name="email" placeholder="Email" style={styles.input} value={form.email} readOnly />

          <input
            name="phone"
            placeholder="Phone"
            style={styles.input}
            value={form.phone}
            onChange={handlePhoneChange}
          />

          <select
            name="deviceCategory"
            style={styles.input}
            value={form.deviceCategory}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {allCategories.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          <input
            name="device"
            placeholder="Device"
            style={styles.input}
            value={form.device}
            onChange={handleChange}
          />

          <input
            name="condition"
            placeholder="Condition"
            style={styles.input}
            value={form.condition}
            onChange={handleChange}
          />

          <input
            name="address"
            placeholder="Address (auto-filled)"
            style={styles.input}
            value={form.address}
            readOnly
          />

          {/* ✅ ONLY EDITED PART */}
          <input
            type="datetime-local"
            name="dateTime"
            style={styles.input}
            value={form.dateTime}
            min={new Date(
              new Date().setDate(new Date().getDate() + 1)
            ).toISOString().slice(0, 10) + "T08:00"}
            max={new Date(
              new Date().setDate(new Date().getDate() + 30)
            ).toISOString().slice(0, 10) + "T17:00"}
            onChange={handleDateChange}
          />

          {errors.dateTime && <p style={styles.error}>{errors.dateTime}</p>}

          <button type="submit" style={styles.button}>
            Confirm Drop-Off
          </button>

          {selectedCenter && (
            <div style={{
              marginTop: "15px",
              padding: "12px",
              border: "1px dashed #0078a8",
              borderRadius: "8px",
              background: "#f9fcff"
            }}>
              <strong>{selectedCenter.companyName}</strong><br />
              📍 {selectedCenter.address}<br />
              📞 {selectedCenter.phone}<br />
              🕒 {selectedCenter.hours}
            </div>
          )}
        </form>

        <div style={styles.mapContainer}>
          <MapContainer center={[23.5859, 58.4059]} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {collectors.map((collector) => (
              <Marker
                key={collector._id}
                position={[collector.location.lat, collector.location.lng]}
                eventHandlers={{ click: () => handleMarkerClick(collector) }}
              >
                <Popup>{collector.companyName}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default DropOff;