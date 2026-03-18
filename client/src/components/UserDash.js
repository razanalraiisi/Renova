import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";
import { FaArrowLeft, FaUser, FaClipboardList, FaSignOutAlt, FaBell } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, resetUser, resetState } from "../features/UserSlice.js";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Box, Card, CardContent, Typography, Divider, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import logo from "../assets/logo.png";
import "./Components.css";

const UserDash = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isSuccess, message, isLoading } = useSelector((state) => state.users);

  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState(() => localStorage.getItem("userTheme") || "Light");
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [openId, setOpenId] = useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  const defaultValues = { uname: user?.uname || "", phone: user?.phone || "" };
  const schema = Yup.object().shape({
    uname: Yup.string().required("Full Name is required"),
    phone: Yup.string()
      .required("Phone is required")
      .matches(/^[279]\d{7}$/, "Phone must be exactly 8 digits and start with 2, 7, or 9"),
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
      setSnackbar({ open: true, message: message || "Profile updated successfully!", severity: "success" });
      setTimeout(() => {
        dispatch(resetState());
        fetchRequests();
      }, 3000);
    }
  }, [isSuccess, message, dispatch]);

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
  }, [user]);

  const handleCancel = (id) => {
    setCancelTargetId(id);
    setCancelConfirmOpen(true);
  };

  const confirmCancel = async () => {
    const id = cancelTargetId;
    setCancelConfirmOpen(false);
    setCancelTargetId(null);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Authentication required.", severity: "error" });
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/pickups/cancel/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setRequests(prev => prev.map(req => req._id === id ? { ...req, status: "Canceled" } : req));
        setSnackbar({ open: true, message: "Request canceled successfully!", severity: "success" });
      } else {
        const error = await res.json();
        setSnackbar({ open: true, message: error.message || "Failed to cancel request.", severity: "error" });
      }
    } catch (err) {
      console.error("Cancel error:", err);
      setSnackbar({ open: true, message: "Server error.", severity: "error" });
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
    const payload = {
      ...data,
      uname: user?.uname || data.uname,
      _id: user._id,
    };
    await dispatch(updateUser(payload));
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

  // Filtered requests based on search
  const filteredRequests = requests.filter(req =>
    req.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.requestType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      {/* NAVBAR */}
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

          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <FaBell
              style={{ fontSize: 22, color: "#fff", cursor: "pointer" }}
              onClick={() => setNotifOpen(!notifOpen)}
            />
            {requests.length > 0 && (
              <span style={{
                position: "absolute",
                top: -5,
                right: -5,
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#dc3545",
              }} />
            )}

            {notifOpen && (
              <Box sx={{
                position: "absolute",
                right: 0,
                top: 28,
                width: 350,
                maxHeight: 400,
                overflowY: "auto",
                bgcolor: "background.paper",
                boxShadow: 3,
                borderRadius: 2,
                zIndex: 9999,
                p: 1
              }}>
                {loadingRequests ? <Typography sx={{ p: 2 }}>Loading...</Typography> :
                  requests.length === 0 ? <Typography sx={{ p: 2 }}>No notifications</Typography> :
                    requests.map((r) => (
                      <Card key={r._id} sx={{ mb: 1, borderRadius: 2 }}>
                        <CardContent sx={{ display: 'flex', gap: 1 }}>
                          <img src={r.image ? `http://localhost:5000/uploads/${r.image}` : "https://via.placeholder.com/50"}
                            style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={600}>{r.device}</Typography>
                            {openId === r._id ? (
                              <>
                                <Divider sx={{ my: 0.5 }} />
                                <Typography fontSize={12}>Type: {r.requestType}</Typography>
                                <Typography fontSize={12}>Request Date: {new Date(r.createdAt).toLocaleDateString()}</Typography>
                                {r.status === "Accepted" && r.acceptedAt && (
                                  <Typography fontSize={12}>Accepted Date: {new Date(r.acceptedAt).toLocaleDateString()}</Typography>
                                )}
                                <Typography fontSize={12}>Condition: {r.condition}</Typography>
                                <Typography fontSize={12}>Status: {r.status}</Typography>
                                <Typography sx={{ mt: 0.5, color: '#1976D2', cursor: 'pointer', fontSize: 12 }} onClick={() => setOpenId(null)}>Less info</Typography>
                              </>
                            ) : (
                              <>
                                <Typography fontSize={12}>Type: {r.requestType}</Typography>
                                <Typography fontSize={12}>Date: {new Date(r.createdAt).toLocaleDateString()}</Typography>
                                {r.status === "Accepted" && r.acceptedAt && (
                                  <Typography fontSize={12}>Accepted Date: {new Date(r.acceptedAt).toLocaleDateString()}</Typography>
                                )}
                                <Typography fontSize={12}>Status: {r.status}</Typography>
                                <Typography sx={{ mt: 0.5, color: '#1976D2', cursor: 'pointer', fontSize: 12 }} onClick={() => setOpenId(r._id)}>More info</Typography>
                              </>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                }
              </Box>
            )}
          </div>
        </div>
      </Navbar>

      {/* MAIN PAGE */}
      <div style={{ padding: "10px 30px" }}>
        <FaArrowLeft style={{ color: "#0080AA", cursor: "pointer", fontSize: 22 }} onClick={() => navigate("/start")} />
      </div>

      <div className="dashboard-container">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="profile-box">
            {user?.pic ? <img src={user.pic} alt="profile" className="avatar-img" /> : <div className="avatar"></div>}
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="section-title">Profile Information</div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={user?.uname || ""} disabled />
                <input type="hidden" {...register("uname")} />
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
              <button type="submit" className="save-btn">{isLoading ? "Saving..." : "Save Changes"}</button>
            </form>
          )}

          {activeTab === "requests" && (
            <>
              <div className="section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                My Requests
                {/* SEARCH BAR WITH CLEAR BUTTON */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      fontSize: 14,
                      width: 180
                    }}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      style={{
                        border: "none",
                        background: "#ccc",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        cursor: "pointer",
                        fontWeight: "bold",
                        lineHeight: "16px",
                        padding: 0
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {loadingRequests ? (
                <p>Loading requests...</p>
              ) : filteredRequests.length === 0 ? (
                <p>You don’t have any requests yet.</p>
              ) : (
                filteredRequests.map((req) => (
                  <div key={req._id} style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #ddd", padding: "20px 0", gap: "20px" }}>
                    <img src={req.image ? `http://localhost:5000/uploads/${req.image}` : "https://via.placeholder.com/100"}
                      style={{ width: 100, height: 100, objectFit: "contain", backgroundColor: "#f7f7f7", borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0 }}>{req.device}</h4>
                      <div style={{ fontSize: 13, color: "#555", fontWeight: "bold" }}>Type: <span style={{ color: '#1976D2' }}>{req.requestType}</span></div>
                      <div style={{ fontSize: 13, color: "#666" }}>Request Date: {new Date(req.createdAt).toLocaleDateString()}</div>
                      {req.status === "Accepted" && req.acceptedAt && (
                        <div style={{ fontSize: 13, color: "#28a745", fontWeight: "bold" }}>Accepted Date: {new Date(req.acceptedAt).toLocaleDateString()}</div>
                      )}
                      <div style={{ fontSize: 13, color: "#666" }}>Time: {new Date(req.createdAt).toLocaleTimeString()}</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 120 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <span>{req.status}</span>
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: getStatusColor(req.status), display: "inline-block" }} />
                      </div>
                      {req.status === "Pending" && (
                        <button onClick={() => handleCancel(req._id)} style={{ marginTop: 20, padding: "6px 14px", border: "1px solid #ccc", borderRadius: 6, background: "#eee", cursor: "pointer" }}>
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

      <Dialog open={cancelConfirmOpen} onClose={() => setCancelConfirmOpen(false)}>
        <DialogTitle>Cancel Request</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel this request?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)} variant="outlined">No</Button>
          <Button onClick={confirmCancel} variant="contained" color="error">Yes, cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserDash;