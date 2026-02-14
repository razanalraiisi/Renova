import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaLightbulb, FaPaintBrush, FaTools } from "react-icons/fa";
import logo from "../assets/logo.png";

const Upcycle = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f9f6ff" }}>
      
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

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "40px 20px" }}>
        <h1 style={{ fontSize: "3rem", color: "#7d3cff" }}>
          ✨ Upcycle & Create Something New
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#555", maxWidth: 700, margin: "0 auto" }}>
          Turn old electronics into creative, useful, and meaningful products.
          Sustainability meets innovation.
        </p>
      </section>

      {/* WHAT IS UPCYCLING */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#7d3cff" }}>What Is Upcycling?</h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          Upcycling transforms old electronics into new functional or artistic creations.
          Instead of breaking materials down, we redesign and repurpose them —
          reducing waste and inspiring creativity.
        </p>
      </section>

      {/* IDEAS CARDS */}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 30,
          flexWrap: "wrap",
          padding: "40px 20px",
        }}
      >
        {[
          {
            icon: <FaTools size={40} color="#f39c12" />,
            title: "DIY Projects",
            text: "Old PC → home server, laptop parts → mini projects.",
          },
          {
            icon: <FaPaintBrush size={40} color="#e84393" />,
            title: "Art & Decor",
            text: "Circuit boards → wall art, motherboards → frames.",
          },
          {
            icon: <FaLightbulb size={40} color="#27ae60" />,
            title: "Innovation",
            text: "Components reused for robotics & STEM education.",
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

      {/* WHERE ITEMS GO */}
      <section style={{ textAlign: "center", paddingBottom: 50 }}>
        <h2 style={{ color: "#7d3cff", marginBottom: 20 }}>
          Where Your Items Go
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 15,
            flexWrap: "wrap",
          }}
        >
          {[
            "Makerspaces",
            "Repair Cafés",
            "Tech Education Programs",
            "Creative Artists",
          ].map((item, index) => (
            <span
              key={index}
              style={{
                padding: "10px 20px",
                borderRadius: 25,
                backgroundColor: "#ffffff",
                border: "2px solid #7d3cff",
                color: "#7d3cff",
                fontWeight: "bold",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* BUTTONS */}
      <section style={{ textAlign: "center", paddingBottom: 60 }}>
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
            backgroundColor: "#7d3cff",
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

export default Upcycle;
