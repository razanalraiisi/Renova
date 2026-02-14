import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaRecycle, FaLeaf, FaBolt } from "react-icons/fa";
import logo from "../assets/logo.png";

const Recycle = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f5fbff" }}>
      
      {/* NAVBAR */}
      <Navbar style={{ backgroundColor: "#0080AA" }}>
        <NavbarBrand tag={Link} to="/" style={{ color: "white" }}>
          <img
            src={logo}
            alt="logo"
            style={{ height: 40, width: 40, marginRight: 10 }}
          />
          ReNova
        </NavbarBrand>
      </Navbar>

      {/* BACK BUTTON */}
      <div style={{ padding: "20px 30px" }}>
        <FaArrowLeft
          style={{ color: "#0080AA", cursor: "pointer", fontSize: 22 }}
          onClick={() => navigate("/start")}
        />
      </div>

      {/* HERO SECTION */}
      <section
        style={{
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <h1 style={{ fontSize: "3rem", color: "#0080AA" }}>
          ♻ Recycle Smart. Recycle Right.
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#555", maxWidth: 700, margin: "0 auto" }}>
          Give your electronic waste a second life. Together we reduce pollution,
          recover valuable materials, and protect our planet.
        </p>
      </section>

      {/* WHY SECTION */}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          flexWrap: "wrap",
          padding: "20px",
        }}
      >
        {[
          {
            icon: <FaLeaf size={40} color="#2ecc71" />,
            title: "Protect Nature",
            text: "Prevent toxic materials from harming soil and water.",
          },
          {
            icon: <FaBolt size={40} color="#f39c12" />,
            title: "Save Energy",
            text: "Recycling saves energy and reduces carbon emissions.",
          },
          {
            icon: <FaRecycle size={40} color="#0080AA" />,
            title: "Recover Materials",
            text: "Extract valuable metals and reuse materials safely.",
          },
        ].map((card, index) => (
          <div
            key={index}
            style={{
              background: "#ffffff",
              borderRadius: 15,
              padding: 30,
              width: 280,
              textAlign: "center",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              transition: "0.3s",
            }}
          >
            {card.icon}
            <h3 style={{ marginTop: 15 }}>{card.title}</h3>
            <p style={{ color: "#555" }}>{card.text}</p>
          </div>
        ))}
      </section>

      {/* ACCEPTED ITEMS */}
      <section style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ color: "#0080AA", marginBottom: 30 }}>
          What Can You Recycle?
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 30,
            flexWrap: "wrap",
          }}
        >
          <div style={itemStyle}>
            <h4>📱 Small Electronics</h4>
            <p>Phones, tablets, earbuds, chargers, smartwatches.</p>
          </div>

          <div style={itemStyle}>
            <h4>💻 Large Electronics</h4>
            <p>Laptops, desktops, TVs, printers, monitors.</p>
          </div>

          <div style={itemStyle}>
            <h4>🔋 Other Devices</h4>
            <p>Batteries, routers, hard drives, speakers.</p>
          </div>
        </div>
      </section>

      {/* ACTION BUTTONS */}
      <section
        style={{
          textAlign: "center",
          paddingBottom: 60,
        }}
      >
        <button
          style={{
            backgroundColor: "#f57c00",
            color: "#fff",
            padding: "15px 30px",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: "1rem",
            marginRight: 20,
            cursor: "pointer",
          }}
          onClick={() => navigate("/PickupRequest")}
        >
          🚚 Schedule Pickup
        </button>

        <button
          style={{
            backgroundColor: "#0080AA",
            color: "#fff",
            padding: "15px 30px",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
          }}
          onClick={() => navigate("/DropOff")}
        >
          📍 Find Drop-off
        </button>
      </section>

      {/* FUN FACT SECTION */}
      <section
        style={{
          backgroundColor: "#eaf7ff",
          padding: 30,
          textAlign: "center",
          fontWeight: "bold",
          color: "#0078a8",
        }}
      >
        💡 Fun Fact: Recycling one laptop saves enough energy to power a home for several days!
      </section>
    </div>
  );
};

const itemStyle = {
  background: "#ffffff",
  padding: 25,
  borderRadius: 15,
  width: 260,
  boxShadow: "0 6px 15px rgba(0,0,0,0.06)",
};

export default Recycle;
