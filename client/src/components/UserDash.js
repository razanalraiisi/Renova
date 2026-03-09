import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";
import { FaBell, FaSignOutAlt, FaUser, FaClipboardList, FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, resetUser, resetState } from "../features/UserSlice.js";
import logo from "../assets/logo.png";
import "./Components.css";

const UserDash = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isSuccess, message, isLoading } = useSelector((state) => state.users);

  const [activeTab, setActiveTab] = useState("profile");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("userTheme") || "Light");

  const [formData, setFormData] = useState({
    uname: "",
    email: "",
    phone: "",
  });

  // Populate form when user changes
  useEffect(() => {
    if (user && user._id) {
      setFormData({
        uname: user.uname || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Snackbar logic
  useEffect(() => {
    if (isSuccess) {
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
        dispatch(resetState()); // 🔥 reset success flag after showing
      }, 3000);
    }
  }, [isSuccess, dispatch]);

  // Apply user theme
  useEffect(() => {
    const root = document.documentElement;
    const apply = (value) => root.setAttribute("data-theme", value);
    if (theme === "System") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystem = () => apply(media.matches ? "dark" : "light");
      applySystem();
      media.addEventListener("change", applySystem);
      return () => media.removeEventListener("change", applySystem);
    }
    apply(theme.toLowerCase());
  }, [theme]);

  const handleLogout = () => {
    dispatch(resetUser());
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!user?._id) return;
    dispatch(updateUser({ ...formData, _id: user._id }));
  };

  const handleThemeChange = (e) => {
    const value = e.target.value;
    setTheme(value);
    localStorage.setItem("userTheme", value);
  };

  const navItems = [
    { name: "Dispose", path: "/dispose" },
    { name: "Recycle", path: "/recycle" },
    { name: "Upcycle", path: "/upcycle" },
    { name: "E-Waste Library", path: "/library" },
    { name: "FAQs", path: "/faqs" },
    { name: "About Us", path: "/about" },
  ];

  return (
    <div className="dashboard-page">
      {/* NAVBAR */}
      <Navbar className="top-navbar">
        <div className="nav-container">
          <NavbarBrand tag={Link} to="/start" className="brand">
            <img src={logo} alt="logo" className="logo" />
            ReNova
          </NavbarBrand>
          <div className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={location.pathname === item.path ? "nav-link active-link" : "nav-link"}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <FaBell className="bell-icon" />
        </div>
      </Navbar>

      {/* BACK BUTTON */}
      <div style={{ padding: "10px 30px" }}>
        <FaArrowLeft
          style={{ color: "#0080AA", cursor: "pointer", fontSize: "22px" }}
          onClick={() => navigate("/start")}
        />
      </div>

      <div className="dashboard-container">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="profile-box">
            {user?.pic ? (
              <img src={user.pic} alt="profile" className="avatar-img" />
            ) : (
              <div className="avatar"></div>
            )}
            <strong>{user?.uname || "User"}</strong>
            <div className="email">{user?.email}</div>
          </div>

          <div className={activeTab === "profile" ? "menu-item active" : "menu-item"} onClick={() => setActiveTab("profile")}>
            <FaUser /> My Profile
          </div>

          <div className={activeTab === "requests" ? "menu-item active" : "menu-item"} onClick={() => setActiveTab("requests")}>
            <FaClipboardList /> My Requests
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {/* CONTENT */}
        <div className="content">
          {activeTab === "profile" && (
            <>
              <div className="section-title">Profile Information</div>

              <div className="form-group">
                <label>Full Name</label>
                <input name="uname" value={formData.uname} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input name="email" value={formData.email} disabled />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input name="phone" value={formData.phone} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ marginTop: 24 }}>
                <label>Theme</label>
                <select
                  value={theme}
                  onChange={handleThemeChange}
                  className="theme-select"
                  style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, background: "white" }}
                >
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                  <option value="System">System</option>
                </select>
              </div>

              <button className="save-btn" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}

          {activeTab === "requests" && (
            <>
              <div className="section-title">My Requests</div>
              <p>You don’t have any requests yet.</p>
            </>
          )}
        </div>
      </div>

      {/* SNACKBAR */}
      {showSnackbar && <div className="snackbar">{message || "Profile updated successfully!"}</div>}
    </div>
  );
};

export default UserDash;