import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";
import { FaArrowLeft, FaUser, FaClipboardList, FaSignOutAlt, FaBell, FaMoon, FaSun } from "react-icons/fa";
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
  const isDarkEffective = theme === "Dark" || (theme === "System" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [seenNotifications, setSeenNotifications] = useState([]);

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

      const pickupRes = await fetch("http://localhost:5000/api/pickups/user/requests", { headers: { Authorization: `Bearer ${token}` } });
      const pickupData = await pickupRes.json();
      let pickupRequests = Array.isArray(pickupData) ? pickupData : pickupData.requests || [];

      const dropOffRes = await fetch("http://localhost:5000/api/dropoffs/user/requests", { headers: { Authorization: `Bearer ${token}` } });
      const dropOffData = await dropOffRes.json();
      let dropOffRequests = Array.isArray(dropOffData) ? dropOffData : dropOffData.requests || [];

      const allRequests = [...pickupRequests, ...dropOffRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (JSON.stringify(allRequests) !== JSON.stringify(requests)) setRequests(allRequests);
    } catch (err) {
      console.error(err);
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [user]);

  const handleCancel = (id) => { setCancelTargetId(id); setCancelConfirmOpen(true); };

  const confirmCancel = async () => {
    const id = cancelTargetId;
    setCancelConfirmOpen(false);
    setCancelTargetId(null);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) { setSnackbar({ open: true, message: "Authentication required.", severity: "error" }); return; }

    const request = requests.find(r => r._id === id);
    if (!request) { setSnackbar({ open: true, message: "Request not found.", severity: "error" }); return; }

    const endpoint = request.requestType === "DropOff"
      ? `http://localhost:5000/api/dropoffs/cancel/${id}`
      : `http://localhost:5000/api/pickups/cancel/${id}`;

    try {
      const res = await fetch(endpoint, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setRequests(prev => prev.map(req => req._id === id ? { ...req, status: "Canceled" } : req));
        setSnackbar({ open: true, message: "Request canceled successfully!", severity: "success" });
      } else {
        const error = await res.json();
        setSnackbar({ open: true, message: error.message || "Failed to cancel request.", severity: "error" });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Server error.", severity: "error" });
    }
  };

  const handleTryAgain = async (requestId) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return setSnackbar({ open: true, message: "You must be logged in", severity: "error" });

    const request = requests.find(r => r._id === requestId);
    if (!request) return setSnackbar({ open: true, message: "Request not found", severity: "error" });

    try {
      const endpoint = request.requestType === "DropOff"
        ? `http://localhost:5000/api/dropoffs/try-again/${requestId}`
        : `http://localhost:5000/api/pickups/try-again/${requestId}`;

      const res = await fetch(endpoint, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setSnackbar({ open: true, message: "We are looking for a new collector!", severity: "success" });
        fetchRequests();
      } else {
        const error = await res.json();
        setSnackbar({ open: true, message: error.message || "Failed to try again", severity: "error" });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Server error", severity: "error" });
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

  const toggleTheme = () => {
    const next = isDarkEffective ? "Light" : "Dark";
    setTheme(next);
    localStorage.setItem("userTheme", next);
    setNotifOpen(false);
  };

  const onSubmit = async (data) => {
    if (!user?._id) return;
    const payload = { ...data, uname: user?.uname || data.uname, _id: user._id };
    await dispatch(updateUser(payload));
    fetchRequests();
  };



  const getStatusColor = (status) => {
    if (status === "Pending") return "#ffc107";
    if (status === "Accepted") return "#28a745";
    if (status === "Rejected") return "#dc3545";
    if (status === "Canceled") return "#6c757d";
    return "#9e9e9e";
  };

  const filteredRequests = requests.filter(req =>
    req.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.requestType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      

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
          <div className={activeTab === "profile" ? "menu-item active" : "menu-item"} onClick={() => setActiveTab("profile")}><FaUser /> My Profile</div>
          <div className={activeTab === "requests" ? "menu-item active" : "menu-item"} onClick={() => setActiveTab("requests")}><FaClipboardList /> My Requests</div>
          <div
  className={activeTab === "gamification" ? "menu-item active" : "menu-item"}
  onClick={() => {
    setActiveTab("gamification");
    navigate("/Gamification");
  }}
>
  🏆 Gamification
</div>
          <button className="logout-btn" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
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
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="text" placeholder="Search requests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14, width: 180 }} />
                  {searchTerm && (<button onClick={() => setSearchTerm("")} style={{ border: "none", background: "#ccc", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontWeight: "bold", lineHeight: "16px", padding: 0 }}>×</button>)}
                </div>
              </div>

              {loadingRequests ? (<p>Loading requests...</p>) : filteredRequests.length === 0 ? (<p>You don’t have any requests yet.</p>) : (
                filteredRequests.map((req) => (
                  <div key={req._id} style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #ddd", padding: "20px 0", gap: "20px" }}>
                    <img src={req.image ? `http://localhost:5000/uploads/${req.image}` : "https://via.placeholder.com/100"} style={{ width: 100, height: 100, objectFit: "contain", backgroundColor: "#f7f7f7", borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0 }}>{req.device}</h4>
                      <div style={{ fontSize: 13, color: "#555", fontWeight: "bold" }}>Type: <span style={{ color: '#1976D2' }}>{req.requestType}</span></div>
                      <div style={{ fontSize: 13, color: "#666" }}>Request Date: {new Date(req.createdAt).toLocaleDateString()}</div>
                      {req.status === "Accepted" && req.collectorName && <div style={{ fontSize: 13, color: "#28a745" }}>Collector: {req.collectorName}</div>}
                      <div style={{ fontSize: 13, color: getStatusColor(req.status), fontWeight: "bold" }}>
  Status: {req.status === "Canceled" && req.rejectReason ? "Rejected" : req.status}
</div>
                     <div style={{ marginTop: 8, display: "flex", gap: 10 }}>

  {/* ✅ PENDING → ONLY CANCEL */}
  {req.status === "Pending" && (
    <button className="btn-cancel" onClick={() => handleCancel(req._id)}>
      Cancel
    </button>
  )}

  {/* ❌ ACCEPTED → NO BUTTONS */}

  {/* ❌ CANCELED → NO BUTTONS */}

  {/* ✅ REJECTED → ONLY TRY AGAIN */}
  {req.status === "Rejected" && (
    <button className="btn-tryagain" onClick={() => handleTryAgain(req._id)}>
      Try Again
    </button>
  )}

</div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelConfirmOpen} onClose={() => setCancelConfirmOpen(false)}>
        <DialogTitle>Cancel Request</DialogTitle>
        <DialogContent>Are you sure you want to cancel this request?</DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)}>No</Button>
          <Button onClick={confirmCancel} variant="contained" color="error">Yes, Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default UserDash;