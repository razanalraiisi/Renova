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

// 🔥 FIX MARKER ICON (IMPORTANT)
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
    item: "",
    condition: "",
    dateTime: "",
    address: "",
  });

  const [selectedCenter, setSelectedCenter] = useState(null);

  // 📍 Your centers
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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Drop-Off scheduled!");
    console.log(form);
  };

  // ✅ CLICK MARKER → AUTO FILL ADDRESS
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
      marginBottom: "15px",
      border: "1px solid #ccc",
      borderRadius: "4px",
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
      {/* NAVBAR */}
      <Navbar style={styles.navbar}>
        <NavbarBrand tag={Link} to="/" style={{ color: "white" }}>
          <img src={logo} alt="logo" style={{ height: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>
      </Navbar>

      {/* BACK BUTTON */}
      <div style={styles.backWrapper}>
        <FaArrowLeft
          onClick={() => navigate("/start")}
          style={styles.backIcon}
        />
      </div>

      <div style={styles.mainWrapper}>
        {/* FORM */}
        <form style={styles.formContainer} onSubmit={handleSubmit}>
          <h3>Schedule Drop Off</h3>

          <input name="name" placeholder="Name" style={styles.input} onChange={handleChange} />
          <input name="phone" placeholder="Phone" style={styles.input} onChange={handleChange} />
          <input name="item" placeholder="Item" style={styles.input} onChange={handleChange} />
          <input name="condition" placeholder="Condition" style={styles.input} onChange={handleChange} />

          <input
            name="address"
            placeholder="Address (auto-filled)"
            value={form.address}
            style={styles.input}
            readOnly
          />

          <input type="datetime-local" name="dateTime" style={styles.input} onChange={handleChange} />

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