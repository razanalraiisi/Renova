import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaShieldAlt,
  FaBatteryFull,
  FaTrashAlt,
} from "react-icons/fa";
import logo from "../assets/logo.png";

const Dispose = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "linear-gradient(180deg, #fff9f2 0%, #ffffff 100%)",
      }}
    >
      {/* NAVBAR */}
      <Navbar style={{ backgroundColor: "#0080AA" }}>
        <NavbarBrand tag={Link} to="/start" style={{ color: "white" }}>
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

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "40px 20px" }}>
        <h1 style={{ fontSize: "3rem", color: "#e67e22" }}>
          ⚠ Safe & Responsible Disposal
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#555",
            maxWidth: 750,
            margin: "20px auto",
            lineHeight: 1.6,
          }}
        >
          Some electronics cannot be reused or recycled safely.
          When that happens, we ensure certified, environmentally-safe disposal
          to protect people and the planet.
        </p>
      </section>

      {/* WHY SECTION */}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 30,
          flexWrap: "wrap",
          padding: "30px 20px",
        }}
      >
        {[
          {
            icon: <FaBatteryFull size={35} color="#e74c3c" />,
            title: "Leaking Batteries",
            text: "Damaged batteries can release toxic chemicals.",
          },
          {
            icon: <FaExclamationTriangle size={35} color="#f39c12" />,
            title: "Chemical Contamination",
            text: "Devices exposed to hazardous substances.",
          },
          {
            icon: <FaTrashAlt size={35} color="#34495e" />,
            title: "Severely Damaged Tech",
            text: "Burned or unsafe electronics.",
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
            }}
          >
            {card.icon}
            <h3 style={{ marginTop: 15 }}>{card.title}</h3>
            <p style={{ color: "#555" }}>{card.text}</p>
          </div>
        ))}
      </section>

      {/* ACCEPTED ITEMS */}
      <section
        style={{
          maxWidth: 900,
          margin: "40px auto",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#e67e22", marginBottom: 20 }}>
          Items We Accept for Disposal
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {[
            "Damaged or bloated batteries",
            "Broken phones",
            "Non-working laptops",
            "Dangerous chargers",
            "Burned power banks",
            "Electronics with missing parts",
          ].map((item, index) => (
            <span
              key={index}
              style={{
                padding: "10px 18px",
                borderRadius: 20,
                backgroundColor: "#fff",
                border: "2px solid #e67e22",
                color: "#e67e22",
                fontWeight: "bold",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* SAFETY PROMISE */}
      <section
        style={{
          backgroundColor: "#fff3e6",
          padding: "50px 20px",
          textAlign: "center",
        }}
      >
        <FaShieldAlt size={40} color="#e67e22" />
        <h2 style={{ color: "#e67e22", marginTop: 15 }}>
          Our Safety Commitment
        </h2>
        <p
          style={{
            maxWidth: 700,
            margin: "15px auto",
            color: "#555",
            lineHeight: 1.6,
          }}
        >
          All hazardous materials are processed according to environmental
          standards. We partner with certified disposal facilities to ensure
          zero illegal dumping and full regulatory compliance.
        </p>
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "60px 20px" }}>
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
          📍 Drop Off Instead
        </button>
      </section>
    </div>
  );
};

export default Dispose;
