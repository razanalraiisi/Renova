import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const Gamification = () => {
  const navigate = useNavigate();

  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState("Bronze");

  const [stats, setStats] = useState({
    drops: 0,
    pickups: 0,
    recycle: 0,
    upcycle: 0,
    dispose: 0,
  });

  useEffect(() => {
    const savedPoints = parseInt(localStorage.getItem("ecoPoints")) || 0;

    const savedDrops = parseInt(localStorage.getItem("drops")) || 0;
    const savedPickups = parseInt(localStorage.getItem("pickups")) || 0;

    const recycle = parseInt(localStorage.getItem("recycle")) || 0;
    const upcycle = parseInt(localStorage.getItem("upcycle")) || 0;
    const dispose = parseInt(localStorage.getItem("dispose")) || 0;

    setPoints(savedPoints);

    setStats({
      drops: savedDrops,
      pickups: savedPickups,
      recycle,
      upcycle,
      dispose,
    });

    if (savedPoints >= 200) setLevel("Gold 🥇");
    else if (savedPoints >= 100) setLevel("Silver 🥈");
    else setLevel("Bronze 🥉");
  }, []);

  const progressToNext = () => {
    if (points >= 200) return 100;
    if (points >= 100) return ((points - 100) / 100) * 100;
    return (points / 100) * 100;
  };

  const styles = {
    page: {
      fontFamily: "Arial",
      padding: "30px",
      background: "#f5fbff",
      minHeight: "100vh",
    },
    backBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      color: "#0080AA",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    card: {
      background: "#fff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      marginBottom: "20px",
    },
    title: {
      textAlign: "center",
      color: "#0080AA",
      marginBottom: "20px",
    },
    badge: { fontSize: "20px", fontWeight: "bold" },
    progressBar: {
      height: "12px",
      background: "#ddd",
      borderRadius: "20px",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      width: `${progressToNext()}%`,
      background: "#00a0d0",
    },
  };

  return (
    <div style={styles.page}>

      {/* BACK */}
      <div style={styles.backBtn} onClick={() => navigate("/userdash")}>
        <FaArrowLeft /> 
      </div>

      <h1 style={styles.title}>🌱 Eco Gamification Dashboard</h1>

      {/* LEVEL */}
      <div style={styles.card}>
        <h2>🏆 Your Level</h2>
        <p style={styles.badge}>{level}</p>
        <p>Total Points: {points}</p>

        <div style={styles.progressBar}>
          <div style={styles.progressFill}></div>
        </div>
      </div>

      {/* REQUEST STATS */}
      <div style={styles.card}>
        <h2>📦 Your Activity</h2>
        <p>🚚 Drop-offs: {stats.drops}</p>
        <p>📍 Pickups: {stats.pickups}</p>
      </div>

      {/* DEVICE ACTIONS */}
      <div style={styles.card}>
        <h2>♻️ Device Handling Types</h2>
        <p>♻️ Recycled: {stats.recycle}</p>
        <p>🔁 Upcycled: {stats.upcycle}</p>
        <p>🗑 Disposed: {stats.dispose}</p>
      </div>

      {/* BADGES */}
      <div style={styles.card}>
        <h2>🎖 Badges</h2>
        <ul>
          <li>🌟 First Action</li>
          <li>♻️ Eco Starter</li>
          {points >= 100 && <li>🥈 Recycling Pro</li>}
          {points >= 200 && <li>🥇 Eco Hero</li>}
        </ul>
      </div>

      {/* MOTIVATION */}
      <div style={styles.card}>
        <h2>💡 Motivation</h2>
        <p>
          Every action matters — recycle, upcycle, or dispose responsibly 🌍✨
        </p>
      </div>

    </div>
  );
};

export default Gamification;