import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaArrowRight } from "react-icons/fa";

const UserDash = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Dashboard</h2>
      <p>Welcome to your dashboard!</p>

      {/* 🌱 NEW: GO TO START PAGE */}
      <div style={{ marginTop: "25px" }}>
        <p style={{ color: "#555" }}>
          Ready to explore sustainable choices?
        </p>

        <button
          onClick={() => navigate("/start")}
          style={{
            marginTop: "10px",
            padding: "10px 18px",
            backgroundColor: "#0080AA",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          Go to Start Page <FaArrowRight />
        </button>
      </div>

      {/* 🚪 LOGOUT */}
      <button
        onClick={handleLogout}
        style={{
          marginTop: "30px",
          padding: "8px 16px",
          backgroundColor: "#006D90",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
};

export default UserDash;
