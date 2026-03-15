import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";
import { FaBell, FaSignOutAlt, FaArrowLeft, FaUser, FaClipboardList } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, resetUser, resetState } from "../features/UserSlice.js";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Snackbar, Alert } from "@mui/material";
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
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const defaultValues = { uname: user?.uname || "", phone: user?.phone || "" };
  const schema = Yup.object().shape({
    uname: Yup.string().required("Full Name is required").min(3),
    phone: Yup.string().required("Phone is required").matches(/^[0-9]+$/).min(7),
  });

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
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
        fetchRequests();
      }, 3000);
    }
  }, [isSuccess, dispatch]);

  const fetchRequests = async () => {
    if (!user?._id) return;
    setLoadingRequests(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/pickups/user/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      let newRequests = [];
      if (Array.isArray(data)) newRequests = data;
      else if (data.requests && Array.isArray(data.requests)) newRequests = data.requests;

      // Only update state if data has changed
      if (JSON.stringify(newRequests) !== JSON.stringify(requests)) {
        setRequests(newRequests);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleCancel = async (id) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      alert("Authentication required.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/pickups/cancel/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        // Update local state immediately
        setRequests(prev => prev.map(req => req._id === id ? { ...req, status: "Canceled" } : req));
        setSnackbar({
          open: true,
          message: "Request canceled successfully!",
          severity: "success"
        });
      } else {
        const error = await res.json();
        setSnackbar({
          open: true,
          message: error.message || "Failed to cancel request.",
          severity: "error"
        });
      }
    } catch (err) {
      console.error("Cancel error:", err);
      setSnackbar({
        open: true,
        message: "Server error.",
        severity: "error"
      });
    }
  };

  const handleLogout = () => {
    dispatch(resetUser());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const handleThemeChange = (e) => {
    const value = e.target.value;
    setTheme(value);
    localStorage.setItem("userTheme", value);
  };

  const onSubmit = async (data) => {
    if (!user?._id) return;
    await dispatch(updateUser({ ...data, _id: user._id }));
    fetchRequests();
  };

  const navItems = [
    { name: "Dispose", path: "/dispose" },
    { name: "Recycle", path: "/recycle" },
    { name: "Upcycle", path: "/upcycle" },
    { name: "E-Waste Library", path: "/library" },
    { name: "FAQs", path: "/faqs" },
    { name: "About Us", path: "/about" },
  ];

  const getStatusColor = (status) => {
    if (status === "Pending") return "#9e9e9e";
    if (status === "Accepted") return "#28a745";
    if (status === "Rejected") return "#dc3545";
    if (status === "Canceled") return "#6c757d";
    return "#9e9e9e";
  };

  return (
    <div className="dashboard-page">
      <Navbar className="top-navbar">
        <div className="nav-container">
          <NavbarBrand tag={Link} to="/start" className="brand">
            <img src={logo} alt="logo" className="logo" /> ReNova
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

      <div style={{ padding: "10px 30px" }}>
        <FaArrowLeft
          style={{ color: "#0080AA", cursor: "pointer", fontSize: "22px" }}
          onClick={() => navigate("/start")}
        />
      </div>

      <div className="dashboard-container">
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

        <div className="content">
          {activeTab === "profile" && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="section-title">Profile Information</div>
              <div className="form-group">
                <label>Full Name</label>
                <input {...register("uname")} />
                {errors.uname && <p className="error">{errors.uname.message}</p>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input value={user?.email || ""} disabled />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input {...register("phone")} />
                {errors.phone && <p className="error">{errors.phone.message}</p>}
              </div>

              <button type="submit">{isLoading ? "Saving..." : "Save Changes"}</button>
            </form>
          )}

          {activeTab === "requests" && (
            <>
              <div className="section-title">My Requests</div>
              {loadingRequests ? (
                <p>Loading requests...</p>
              ) : requests.length === 0 ? (
                <p>You don’t have any requests yet.</p>
              ) : (
                requests.map((req) => (
                  <div
                    key={req._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderBottom: "1px solid #ddd",
                      padding: "20px 0",
                      gap: "20px",
                    }}
                  >
                    <img
                      src={req.image ? `http://localhost:5000/uploads/${req.image}` : "https://via.placeholder.com/100"}
                      style={{ width: 100, height: 100, objectFit: "cover" }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0 }}>{req.device}</h4>
                      <div style={{ fontSize: 13, color: "#666" }}>Date: {new Date(req.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: 13, color: "#666" }}>Time: {new Date(req.createdAt).toLocaleTimeString()}</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 120 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <span>{req.status}</span>
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: getStatusColor(req.status),
                            display: "inline-block",
                          }}
                        />
                      </div>
                      {req.status === "Pending" && (
                        <button
                          onClick={() => handleCancel(req._id)}
                          style={{
                            marginTop: 20,
                            padding: "6px 14px",
                            border: "1px solid #ccc",
                            borderRadius: 6,
                            background: "#eee",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {showSnackbar && <div className="snackbar">{message || "Profile updated successfully!"}</div>}
    </div>
  );
};

export default UserDash;