import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";
import { FaBell, FaSignOutAlt, FaArrowLeft, FaUser, FaClipboardList } from "react-icons/fa"; // ✅ icons fixed
import { useDispatch, useSelector } from "react-redux";
import { updateUser, resetUser, resetState } from "../features/UserSlice.js";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import logo from "../assets/logo.png";
import "./Components.css";

const UserDash = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isSuccess, message, isLoading } = useSelector(
    (state) => state.users
  );

  const [activeTab, setActiveTab] = useState("profile");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("userTheme") || "Light"
  );

  // Default form values
  const defaultValues = {
    uname: user?.uname || "",
    phone: user?.phone || "",
  };

  // Validation schema
  const schema = Yup.object().shape({
    uname: Yup.string()
      .required("Full Name is required")
      .min(3, "Full Name must be at least 3 characters"),
    phone: Yup.string()
      .required("Phone is required")
      .matches(/^[0-9]+$/, "Phone must be numbers only")
      .min(7, "Phone must be at least 7 digits"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (user && user._id) {
      setValue("uname", user.uname);
      setValue("phone", user.phone);
    }
  }, [user, setValue]);

  useEffect(() => {
    if (isSuccess) {
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
        dispatch(resetState());
      }, 3000);
    }
  }, [isSuccess, dispatch]);

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

  const handleThemeChange = (e) => {
    const value = e.target.value;
    setTheme(value);
    localStorage.setItem("userTheme", value);
  };

  const onSubmit = (data) => {
    if (!user?._id) return;
    dispatch(updateUser({ ...data, _id: user._id }));
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
                className={
                  location.pathname === item.path
                    ? "nav-link active-link"
                    : "nav-link"
                }
              >
                {item.name}
              </Link>
            ))}
          </div>
          <FaBell className="bell-icon" />
        </div>
      </Navbar>

      {/* BACK ICON */}
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

          <div
            className={activeTab === "profile" ? "menu-item active" : "menu-item"}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser /> My Profile
          </div>

          <div
            className={activeTab === "requests" ? "menu-item active" : "menu-item"}
            onClick={() => setActiveTab("requests")}
          >
            <FaClipboardList /> My Requests
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {/* CONTENT */}
        <div className="content">
          {activeTab === "profile" && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="section-title">Profile Information</div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  {...register("uname")}
                  className={`form-control ${errors.uname ? "input-error" : ""}`}
                  style={{ borderRadius: 6, padding: 10 }}
                />
                {errors.uname && (
                  <div style={{ color: "red", fontSize: 12 }}>{errors.uname.message}</div>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  value={user?.email || ""}
                  disabled
                  style={{ borderRadius: 6, padding: 10, backgroundColor: "#f1f1f1" }}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  {...register("phone")}
                  className={`form-control ${errors.phone ? "input-error" : ""}`}
                  style={{ borderRadius: 6, padding: 10 }}
                />
                {errors.phone && (
                  <div style={{ color: "red", fontSize: 12 }}>{errors.phone.message}</div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: 24 }}>
                <label>Theme</label>
                <select
                  value={theme}
                  onChange={handleThemeChange}
                  className="theme-select"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    fontSize: 14,
                    background: "white",
                  }}
                >
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                  <option value="System">System</option>
                </select>
              </div>

              <button
                type="submit"
                className="save-btn"
                disabled={isLoading}
                style={{ marginTop: 15 }}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
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
      {showSnackbar && (
        <div className="snackbar">{message || "Profile updated successfully!"}</div>
      )}
    </div>
  );
};

export default UserDash;