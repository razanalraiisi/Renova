import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";
import { FaUserCircle } from "react-icons/fa";

import recycle from "../assets/recycle.png";
import Dispose from "../assets/Dispose.jpg";
import ddc from "../assets/ddc.png";
import Upcycle from "../assets/Upcycle.jpg";
import logo from "../assets/logo.png";

const Start = () => {
  const navigate = useNavigate();
  const userName = JSON.parse(localStorage.getItem("user"))?.uname || "User";

  return (
    <>
      {/* NAVBAR */}
      <Navbar style={{ backgroundColor: "#0080AA", padding: "0 40px" }} className="user-flow-navbar">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <NavbarBrand tag={Link} to="/" style={{ color: "white", display: "flex", alignItems: "center" }}>
            <img src={logo} alt="logo" style={{ height: 40, width: 40, marginRight: 10 }} />
            ReNova
          </NavbarBrand>
          <div style={{ display: "flex", alignItems: "center", fontSize: "24px", color: "white", cursor: "pointer" }}>
            <FaUserCircle onClick={() => navigate("/UserDash")} />
          </div>
        </div>
      </Navbar>

      <style>{`
        .action-page {
          min-height: calc(100vh - 120px);
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          background: linear-gradient(135deg, #e0f7fa, #ffffff);
        }

        .welcome-message {
          font-size: 1.6rem;
          font-weight: 600;
          color: #0078a8;
          margin-bottom: 5px;
          text-align: center;
        }

        .main-heading {
          font-size: 2rem;
          font-weight: 700;
          color: #0078a8;
          margin-bottom: 40px;
          letter-spacing: 1px;
          text-align: center;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(2, 280px);
          gap: 40px;
        }

        .action-card {
          height: 200px;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          text-align: center;
          position: relative;
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .action-card img {
          width: 70px;
          margin-bottom: 15px;
          transition: transform 0.3s ease;
        }

        .action-card:hover img {
          transform: translateY(-12px) rotate(-5deg);
        }

        .action-card h3 {
          font-size: 16px;
          font-weight: bold;
          letter-spacing: 1px;
          color: #0b4f6c;
          transition: color 0.3s ease, text-shadow 0.3s ease;
        }

        .action-card:hover h3 {
          color: #004f6b;
          text-shadow: 0 0 8px rgba(0,0,0,0.3);
        }

        .recycle { background: linear-gradient(135deg, #c9f0dc, #a6e3c3); }
        .upcycle { background: linear-gradient(135deg, #cfe8f3, #a0d8f1); }
        .dispose { background: linear-gradient(135deg, #fff1b8, #ffe085); }
        .decide { background: linear-gradient(135deg, #ffffff, #e0e0e0); border: 2px solid #dcdcdc; }

        .action-card:hover {
          transform: translateY(-15px) rotate(2deg);
          box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.25);
        }

        @media (max-width: 700px) {
          .action-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="action-page">
        <div className="welcome-message">Welcome back, {userName}!</div>
        <div className="main-heading">Choose Your Action</div>

        <div className="action-grid">
          <div className="action-card recycle" onClick={() => navigate("/recycle")}>
            <img src={recycle} alt="Recycle" />
            <h3>RECYCLE</h3>
          </div>

          <div className="action-card upcycle" onClick={() => navigate("/upcycle")}>
            <img src={Upcycle} alt="Upcycle" />
            <h3>UPCYCLE</h3>
          </div>

          <div className="action-card dispose" onClick={() => navigate("/dispose")}>
            <img src={Dispose} alt="Dispose" />
            <h3>DISPOSE</h3>
          </div>

          <div className="action-card decide" onClick={() => navigate("/decideForMe")}>
            <img src={ddc} alt="Decide for me" />
            <h3>DECIDE FOR ME</h3>
          </div>
        </div>
      </div>
    </>
  );
};

export default Start;