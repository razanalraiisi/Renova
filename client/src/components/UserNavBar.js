import React, { useState, useEffect, useRef } from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBell, FaSun, FaMoon } from "react-icons/fa";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import logo from "../assets/logo.png";

const UserNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ================= REDUX =================
  const user = useSelector((state) => state.users?.user);

  const userName = user?.uname || "User";

  // ================= LOCAL STATE FOR REQUESTS =================
  const [requests, setRequests] = useState([]);
  const [seenNotifications, setSeenNotifications] = useState([]);

  // ================= THEME =================
  const [theme, setTheme] = useState(() => localStorage.getItem("userTheme") || "Light");
  const isDarkEffective = theme === "Dark";

  const toggleTheme = () => {
    const next = isDarkEffective ? "Light" : "Dark";
    setTheme(next);
    localStorage.setItem("userTheme", next);
    setNotifOpen(false);
    setProfileOpen(false);
  };

  // ================= STATES =================
  const [notifOpen, setNotifOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Refs for click outside handling
  const profileRef = useRef();
  const notifRef = useRef();

  // ================= EFFECTS =================
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme.toLowerCase());
  }, [theme]);

  // ================= FETCH REQUESTS =================
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?._id) return;
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        const pickupRes = await fetch("http://localhost:5000/api/pickups/user/requests", { headers: { Authorization: `Bearer ${token}` } });
        const pickupData = await pickupRes.json();
        let pickupRequests = Array.isArray(pickupData) ? pickupData : pickupData.requests || [];

        const dropOffRes = await fetch("http://localhost:5000/api/dropoffs/user/requests", { headers: { Authorization: `Bearer ${token}` } });
        const dropOffData = await dropOffRes.json();
        let dropOffRequests = Array.isArray(dropOffData) ? dropOffData : dropOffData.requests || [];

        const allRequests = [...pickupRequests, ...dropOffRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRequests(allRequests);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setRequests([]);
      }
    };

    fetchRequests();
  }, [user]);

  // ================= CLICK OUTSIDE HANDLER =================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ================= LINKS =================
  const navItems = [
    { name: "E-Waste Library", path: "/EWasteLibrary" },
    { name: "Collector Map", path: "/omanmap" }
  ];

  const ecoActions = [
    { name: "Recycle", path: "/recycle" },
    { name: "Upcycle", path: "/upcycle" },
    { name: "Dispose", path: "/dispose" },
    { name: "Decide for Me", path: "/decideForMe" }
  ];

  const notificationRequests = requests.filter((r) => !seenNotifications.includes(r._id));
  const unread = notificationRequests.length;

  return (
    <Navbar className="top-navbar">
      <div className="nav-container" style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>

        {/* LEFT */}
        <NavbarBrand tag={Link} to="/start" className="brand" style={{ display: "flex", alignItems: "center" }}>
          <img src={logo} className="logo" alt="logo" />
          <span style={{ fontWeight: "bold", marginLeft: 8 }}>ReNova</span>
        </NavbarBrand>

        {/* CENTER */}
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>

          {/* Animated Dropdown */}
          <div className="dropdown">
            <span
              className="nav-link"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ cursor: "pointer", color: "#fff" }}
            >
              Request Actions ▾
            </span>

            <div className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}>
              {ecoActions.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                  style={{ color: "#000000" }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={location.pathname === item.path ? "nav-link active-link" : "nav-link"}
              style={{ color: "#fff" }}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>

          {/* NOTIFICATIONS */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <FaBell style={{ fontSize: 22, color: "#fff", cursor: "pointer" }} onClick={() => setNotifOpen(!notifOpen)} />
            {unread > 0 && (
              <span style={{ position: "absolute", top: -5, right: -5, width: 12, height: 12, borderRadius: "50%", backgroundColor: "#dc3545" }} />
            )}
            {notifOpen && (
              <Box sx={{ position: "absolute", right: 0, top: 28, width: 350, maxHeight: 400, overflowY: "auto", bgcolor: "background.paper", boxShadow: 3, borderRadius: 2, zIndex: 9999, p: 1, display: "block" }}>
                {notificationRequests.length === 0 ? (
                  <Typography sx={{ p: 2 }}>No notifications</Typography>
                ) : (
                  notificationRequests.map((r) => (
                    <Card key={r._id} sx={{
                      mb: 1,
                      borderRadius: 2,
                      border: r.status === "Accepted" ? "2px solid #28a745" : r.status === "Pending" ? "2px dashed #ffc107" : "1px solid #ddd",
                      backgroundColor: r.status === "Accepted" ? "#e6f4ea" : "#fff",
                    }}>
                      <CardContent sx={{ display: "flex", gap: 1 }}>
                        <img src={r.image ? `http://localhost:5000/uploads/${r.image}` : "https://via.placeholder.com/50"} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={600}>{r.device}</Typography>
                          <Typography fontSize={12}>Type: {r.requestType}</Typography>
                          <Typography fontSize={12}>Request Date: {new Date(r.createdAt).toLocaleDateString()}</Typography>
                          {r.status === "Accepted" && r.collectorName && (
                            <Typography fontSize={12} color="#28a745">Collector: {r.collectorName}</Typography>
                          )}
                          <Typography fontSize={12} color={r.status === "Accepted" ? "#28a745" : r.status === "Pending" ? "#a67c00" : "#666"}>Status: {r.status}</Typography>
                          {r.status === "Pending"}
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            )}
          </div>

          <button type="button" onClick={toggleTheme} title="Toggle dark mode" style={{ marginLeft: 12, background: "transparent", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, padding: 0 }}>
            {isDarkEffective ? <FaSun /> : <FaMoon />}
          </button>

          {/* PROFILE (CLICKABLE DROPDOWN) */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                background: "transparent",
                border: "none",
                padding: 0,
                color: "inherit",
              }}
              aria-label="User profile"
            >
              <div style={{
                width: 35,
                height: 35,
                borderRadius: "50%",
                background: "white",
                color: "#00a0d0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold"
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>

              <span style={{ color: "white", fontWeight: "bold" }}>
                Hi {userName}
              </span>
            </button>

            {/* PROFILE DROPDOWN */}
            {profileOpen && (
              <div className="dropdown-menu open" style={{ position: "absolute", right: 0, left: "auto", minWidth: 220, background: "#333", borderRadius: 8, boxShadow: "0 4px 10px rgba(0,0,0,0.1)", zIndex: 1000, display: "flex", flexDirection: "column" }}>
                <div className="profile-box" style={{ padding: "20px", borderBottom: "1px solid #555", textAlign: "center", color: "#fff" }}>
                  {user?.pic ? <img src={user.pic} alt="profile" className="avatar-img" /> : <div className="avatar"></div>}
                  <strong style={{ color: "#fff" }}>{userName}</strong>
                  <div className="email" style={{ color: "#ccc" }}>{user?.email}</div>
                </div>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/UserDash");
                  }}
                  style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "10px 14px", cursor: "pointer", color: "#fff" }}
                >
                  My Profile
                </button>

                

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    localStorage.clear();
                    navigate("/");
                  }}
                  style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "10px 14px", cursor: "pointer", color: "red", fontWeight: "bold" }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </Navbar>
  );
};

export default UserNavbar;