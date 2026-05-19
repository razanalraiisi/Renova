import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";
import { FaArrowLeft, FaUser, FaClipboardList, FaSignOutAlt, FaBell, FaMoon, FaSun, FaCalendarAlt, FaFlag, FaStar } from "react-icons/fa"; 
import { useDispatch, useSelector } from "react-redux";
import { updateUser, resetUser, resetState } from "../features/UserSlice.js";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Box, Card, CardContent, Typography, Divider, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Rating } from "@mui/material"; 
import logo from "../assets/logo.png";
import "./Components.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
 import { MenuItem } from "@mui/material";
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
 
  // --- Reschedule States ---
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ id: null, type: "", newDate: "", newTime: "" });
 
  // --- Report Collector States ---
  const [reportOpen, setReportOpen] = useState(false);
  const [collectors, setCollectors] = useState([]);
  const [loadingCollectors, setLoadingCollectors] = useState(false);
  const [reportData, setReportData] = useState({
    requestId: "",
    collectorId: "",
    reason: "",
  });

  // --- Rating States ---
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingData, setRatingData] = useState({
    requestId: "",
    requestType: "",
    collectorId: "",
    collectorName: ""
  });
  const [ratingValue, setRatingValue] = useState(5);
 
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
      setSnackbar({
        open: true,
        message: message || "Profile updated successfully!",
        severity: "success"
      });
 
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
 
      // 1. Fetch Pickups
      const pickupRes = await fetch("http://localhost:5000/api/pickups/user/requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pickupData = await pickupRes.json();
      
      // Handle both raw array responses and object wrapper envelopes cleanly
      const pickupRequests = Array.isArray(pickupData) 
        ? pickupData 
        : (pickupData && Array.isArray(pickupData.requests) ? pickupData.requests : []);
 
      // 2. Fetch Dropoffs
      const dropOffRes = await fetch("http://localhost:5000/api/dropoffs/user/requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dropOffData = await dropOffRes.json();
      
      const dropOffRequests = Array.isArray(dropOffData) 
        ? dropOffData 
        : (dropOffData && Array.isArray(dropOffData.requests) ? dropOffData.requests : []);
        console.log(dropOffRequests);
      // 3. Combine safely
      const allRequests = [...pickupRequests, ...dropOffRequests].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
 
      setRequests(allRequests);
    } catch (err) {
      console.error("Frontend fetch error:", err);
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };
 
  useEffect(() => {
    fetchRequests();
    fetchCollectors();
  }, [user]);

  const fetchCollectors = async () => {
    try {
      setLoadingCollectors(true);
      const res = await fetch("http://localhost:5000/api/reports/collectors");
      if (res.ok) {
        const data = await res.json();
        setCollectors(data.collectors || []);
      }
    } catch (err) {
      console.error("Error fetching collectors:", err);
    } finally {
      setLoadingCollectors(false);
    }
  };
 
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
      setSnackbar({
        open: true,
        message: "Authentication required.",
        severity: "error"
      });
      return;
    }
 
    const request = requests.find(r => r._id === id);
 
    if (!request) {
      setSnackbar({
        open: true,
        message: "Request not found.",
        severity: "error"
      });
      return;
    }
 
    const endpoint = request.requestType === "DropOff"
      ? `http://localhost:5000/api/dropoffs/cancel/${id}`
      : `http://localhost:5000/api/pickups/cancel/${id}`;
 
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
 
      if (res.ok) {
        setRequests(prev =>
          prev.map(req =>
            req._id === id
              ? { ...req, status: "Canceled" }
              : req
          )
        );
 
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
      console.error(err);
 
      setSnackbar({
        open: true,
        message: "Server error.",
        severity: "error"
      });
    }
  };
 
  const handleTryAgain = async (requestId) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
 
    if (!token) {
      return setSnackbar({
        open: true,
        message: "You must be logged in",
        severity: "error"
      });
    }
 
    const request = requests.find(r => r._id === requestId);
 
    if (!request) {
      return setSnackbar({
        open: true,
        message: "Request not found",
        severity: "error"
      });
    }
 
    try {
      const endpoint = request.requestType === "DropOff"
        ? `http://localhost:5000/api/dropoffs/try-again/${requestId}`
        : `http://localhost:5000/api/pickups/try-again/${requestId}`;
 
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
 
      if (res.ok) {
        setSnackbar({
          open: true,
          message: "We are looking for a new collector!",
          severity: "success"
        });
 
        fetchRequests();
 
      } else {
        const error = await res.json();
 
        setSnackbar({
          open: true,
          message: error.message || "Failed to try again",
          severity: "error"
        });
      }
 
    } catch (err) {
      console.error(err);
 
      setSnackbar({
        open: true,
        message: "Server error",
        severity: "error"
      });
    }
  };
 
  // --- Reschedule Logic ---
  const openRescheduleModal = (req) => {
    setRescheduleData({
      id: req._id,
      type: req.requestType,
      newDate: "",
     newTime: ""
    });
 
    setRescheduleOpen(true);
  };
 
  const handleRescheduleSubmit = async () => {
  if (!rescheduleData.newDate || !rescheduleData.newTime) {
    return setSnackbar({
      open: true,
      message: "Please select date and time",
      severity: "warning"
    });
  }
 
  const selectedDateTime = new Date(
    `${rescheduleData.newDate}T${rescheduleData.newTime}`
  );
 
  const now = new Date();
 
  if (selectedDateTime < now) {
    return setSnackbar({
      open: true,
      message: "You cannot select a past date/time",
      severity: "error"
    });
  }
 
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
 
    const endpoint = rescheduleData.type === "DropOff"
      ? `http://localhost:5000/api/dropoffs/reschedule/${rescheduleData.id}`
      : `http://localhost:5000/api/pickups/reschedule/${rescheduleData.id}`;
 
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          newDate: selectedDateTime.toISOString()
        })
      });
 
      if (res.ok) {
        setSnackbar({
          open: true,
          message: "Rescheduled successfully!",
          severity: "success"
        });
 
        setRescheduleOpen(false);
 
        fetchRequests();
 
      } else {
        const error = await res.json();
 
        setSnackbar({
          open: true,
          message: error.message || "Failed to reschedule",
          severity: "error"
        });
      }
 
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Server error",
        severity: "error"
      });
    }
  };
 
  // --- Report Collector Logic ---
  const handleReportSubmit = async () => {
    if (!reportData.reason.trim()) {
      return setSnackbar({
        open: true,
        message: "Please enter your complaint",
        severity: "warning",
      });
    }
 
    if (!reportData.collectorId) {
      return setSnackbar({
        open: true,
        message: "Please select a recycling center",
        severity: "warning",
      });
    }

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/reports/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
  requestId: reportData.requestId,
  collectorId: reportData.collectorId,
  reason: reportData.reason,
}),
        }
      );

      if (res.ok) {
        setSnackbar({
          open: true,
          message: "Report submitted successfully",
          severity: "success",
        });

        setReportOpen(false);

        setReportData({
          requestId: "",
          collectorId: "",
        });
      }
 
    } catch (err) {
      console.error(err);
 
      setSnackbar({
        open: true,
        message: "Server error",
        severity: "error",
      });
    }
  };

  // --- Rating Logic ---
  const handleRatingSubmit = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      const endpoint = ratingData.requestType === "DropOff"
        ? `http://localhost:5000/api/dropoffs/rate/${ratingData.requestId}`
        : `http://localhost:5000/api/pickups/rate/${ratingData.requestId}`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: ratingValue,
          collectorId: ratingData.collectorId 
        }),
      });

      if (res.ok) {
        setSnackbar({
          open: true,
          message: "Thank you for rating the collector!",
          severity: "success",
        });
        setRatingOpen(false);
        fetchRequests(); 
      } else {
        const error = await res.json();
        setSnackbar({
          open: true,
          message: error.message || "Failed to submit rating",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Server error.",
        severity: "error",
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
 
  const toggleTheme = () => {
    const next = isDarkEffective ? "Light" : "Dark";
 
    setTheme(next);
 
    localStorage.setItem("userTheme", next);
 
    setNotifOpen(false);
  };
 
  const onSubmit = async (data) => {
    if (!user?._id) return;
 
    const payload = {
      ...data,
      uname: user?.uname || data.uname,
      _id: user._id
    };
 
    await dispatch(updateUser(payload));
 
    fetchRequests();
  };
 
  const getStatusColor = (status) => {
    if (status === "Pending") return "#ffc107";
    if (status === "Accepted") return "#28a745";
    if (status === "Rejected") return "#dc3545";
    if (status === "Canceled") return "#6c757d";
    if (status === "Completed") return "#17a2b8"; 
 
    return "#9e9e9e";
  };
 
  const filteredRequests = requests.filter(req =>
    req?.device?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req?.requestType?.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  const downloadRequestsReport = () => {
    if (!requests || requests.length === 0) {
      setSnackbar({
        open: true,
        message: "No requests to download",
        severity: "warning",
      });
 
      return;
    }
 
    const headers = [["Device", "Type", "Status", "Date", "Collector"]];
 
    const rows = requests.map((req) => [
      req.device || "-",
      req.requestType || "-",
      req.status || "-",
      new Date(req.createdAt).toLocaleDateString(),
      req.collectorName || "-",
    ]);
 
    const doc = new jsPDF();
 
    doc.text("My Requests Report", 14, 15);
 
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 25,
    });
 
    doc.save("my_requests_report.pdf");
  };
 
  return (
    <div className="dashboard-page">
      <div style={{ padding: "10px 30px" }}>
        <FaArrowLeft
          style={{
            color: "#0080AA",
            cursor: "pointer",
            fontSize: 22
          }}
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
 
                <input type="text" value={user?.uname || ""} disabled />
 
                <input type="hidden" {...register("uname")} />
 
                {errors.uname && (
                  <p className="error">{errors.uname.message}</p>
                )}
              </div>
 
              <div className="form-group">
                <label>Email</label>
 
                <input value={user?.email || ""} disabled />
              </div>
 
              <div className="form-group">
                <label>Phone</label>
 
                <input {...register("phone")} />
 
                {errors.phone && (
                  <p className="error">{errors.phone.message}</p>
                )}
              </div>
 
              <button type="submit" className="save-btn">
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
 
          {activeTab === "requests" && (
            <>
              <div
                className="section-title"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                My Requests
 
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
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
 
                <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10
  }}
>
  <button
    onClick={() => {
      setReportData({
        requestId: "",
        collectorId: "",
        reason: "",
      });

      setReportOpen(true);
    }}
    style={{
      padding: "6px 12px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 13,
      display: "flex",
      alignItems: "center",
      gap: 6
    }}
  >
    <FaFlag />
    Report Center
  </button>

  <button
    onClick={downloadRequestsReport}
    style={{
      padding: "6px 12px",
      backgroundColor: "#0080AA",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 13
    }}
  >
    Download Report
  </button>
</div>
              </div>
 
              {loadingRequests ? (
                <p>Loading requests...</p>
              ) : filteredRequests.length === 0 ? (
                <p>You don’t have any requests yet.</p>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderBottom: "1px solid #ddd",
                      padding: "20px 0",
                      gap: "20px"
                    }}
                  >
                    <img
                      src={
                        req.image
                          ? `http://localhost:5000/uploads/${req.image}`
                          : "https://via.placeholder.com/100"
                      }
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "contain",
                        backgroundColor: "#f7f7f7",
                        borderRadius: 8
                      }}
                    />
 
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0 }}>{req.device}</h4>
 
                      <div
                        style={{
                          fontSize: 13,
                          color: "#555",
                          fontWeight: "bold"
                        }}
                      >
                        Type:{" "}
                        <span style={{ color: '#1976D2' }}>
                          {req.requestType}
                        </span>
                      </div>
 
                      <div style={{ fontSize: 13, color: "#666" }}>
                        Request Date:{" "}
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                      {req.scheduledDate && (
  <>
    <div style={{ fontSize: 13, color: "#0080AA", fontWeight: "bold" }}>
      Scheduled:{" "}
      {new Date(req.scheduledDate).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })}
    </div>

  </>
)}

 
                      <div
                        style={{
                          fontSize: 13,
                          color: getStatusColor(req.status),
                          fontWeight: "bold"
                        }}
                      >
                        Status:{" "}
                        {req.status === "Canceled" && req.rejectReason
                          ? "Rejected"
                          : req.status}
                      </div>

                      {/* Fallback check in case rating field is missing or undefined */}
                      {req.status === "Completed" && req.rating !== undefined && req.rating !== null && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: 13, marginTop: 4 }}>
                          <span style={{ fontWeight: "bold", color: "#555" }}>Your Rating:</span>
                          <Rating value={Number(req.rating)} readOnly size="small" />
                        </div>
                      )}
 
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          gap: 10,
                          justifyContent: "flex-end",
                          alignItems: "center",
                          flexWrap: "wrap"
                        }}
                      >
 
                        {/* ✅ PENDING → CANCEL & RESCHEDULE */}
                        {req.status === "Pending" && (
                          <>
                            <button
                              className="btn-cancel"
                              onClick={() => handleCancel(req._id)}
                              style={{
                                padding: '6px 12px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
 
                            <button
                              onClick={() => openRescheduleModal(req)}
                              style={{
                                padding: '6px 12px',
                                cursor: 'pointer',
                                backgroundColor: '#0080AA',
                                color: 'white',
                                border: 'none',
                                borderRadius: '2px',
                                marginLeft: 'auto'
                              }}
                            >
                              Reschedule
                            </button>
                          </>
                        )}
 
                        {/* ✅ ACCEPTED → RESCHEDULE + REPORT */}
                        {req.status === "Accepted" && (
                          <>
                            <button
                              onClick={() => openRescheduleModal(req)}
                              style={{
                                padding: '6px 12px',
                                cursor: 'pointer',
                                backgroundColor: '#0080AA',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px'
                              }}
                            >
                              Reschedule
                            </button>
 
                            
                          </>
                        )}
 
                        {/* ✅ REJECTED → TRY AGAIN */}
                        {req.status === "Rejected" && (
                          <button
                            className="btn-tryagain"
                            onClick={() => handleTryAgain(req._id)}
                          >
                            Try Again
                          </button>
                        )}

                        {/* ✅ COMPLETED → RATE COLLECTOR */}
                        {req.status === "Completed" && !req.rating && (
                          <button
                            onClick={() => {
                              setRatingData({
                                requestId: req._id,
                                requestType: req.requestType,
                                collectorId: req.collectorId || "", 
                                collectorName: req.collectorName || "Collector"
                              });
                              setRatingValue(5); 
                              setRatingOpen(true);
                            }}
                            style={{
                              padding: '6px 12px',
                              cursor: 'pointer',
                              backgroundColor: '#ffc107',
                              color: '#212529',
                              border: 'none',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FaStar />
                            Rate Collector
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
 
      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
      >
        <DialogTitle>Reschedule Request</DialogTitle>
 
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select a new date for your {rescheduleData.type}.
          </Typography>
<TextField
  type="date"
  fullWidth
  InputLabelProps={{ shrink: true }}
  value={rescheduleData.newDate}
  onChange={(e) =>
    setRescheduleData({
      ...rescheduleData,
      newDate: e.target.value
    })
  }
  inputProps={{
    min: new Date().toISOString().split("T")[0]
  }}
  sx={{ mb: 2 }}
/>
 
<TextField
  type="time"
  fullWidth
  InputLabelProps={{ shrink: true }}
  value={rescheduleData.newTime}
  onChange={(e) =>
    setRescheduleData({
      ...rescheduleData,
      newTime: e.target.value
    })
  }
/>
        </DialogContent>
 
        <DialogActions>
          <Button onClick={() => setRescheduleOpen(false)}>
            Cancel
          </Button>
 
          <Button
            onClick={handleRescheduleSubmit}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
      >
        <DialogTitle>Cancel Request</DialogTitle>
 
        <DialogContent>
          Are you sure you want to cancel this request?
        </DialogContent>
 
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)}>
            No
          </Button>
 
          <Button
            onClick={confirmCancel}
            variant="contained"
            color="error"
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
 {/* Report Collector Dialog */}
<Dialog
  open={reportOpen}
  onClose={() => setReportOpen(false)}
>
  <DialogTitle>Report Collector</DialogTitle>

  <DialogContent sx={{ pt: 2, minWidth: 400 }}>
    <Typography variant="body2" sx={{ mb: 2 }}>
      Please select the collector and describe the issue.
    </Typography>

    {/* Center Names Dropdown */}
    <TextField
      select
      fullWidth
      label="Select Recycling Center"
      value={reportData.collectorId}
      onChange={(e) =>
        setReportData({
          ...reportData,
          collectorId: e.target.value,
        })
      }
      sx={{ mb: 2 }}
      disabled={loadingCollectors}
    >
      {loadingCollectors ? (
        <MenuItem disabled>Loading collectors...</MenuItem>
      ) : collectors.length === 0 ? (
        <MenuItem disabled>No collectors available</MenuItem>
      ) : (
        collectors.map((collector) => (
          <MenuItem key={collector._id} value={collector._id}>
            {collector.companyName || collector.uname}
          </MenuItem>
        ))
      )}
    </TextField>

    {/* Reason */}
    <TextField
      fullWidth
      multiline
      rows={4}
      label="Describe the issue"
      placeholder="Example: Staff behavior, late processing, poor handling..."
      value={reportData.reason}
      onChange={(e) =>
        setReportData({
          ...reportData,
          reason: e.target.value,
        })
      }
    />
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setReportOpen(false)}>
      Cancel
    </Button>

    <Button
      onClick={handleReportSubmit}
      variant="contained"
      color="error"
    >
      Submit Report
    </Button>
  </DialogActions>
</Dialog>

      {/* Rate Collector Dialog */}
      <Dialog
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
      >
        <DialogTitle>Rate Collector</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 350, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Typography variant="body1">
            How would you rate <strong>{ratingData.collectorName}</strong>?
          </Typography>
          <Rating
            name="collector-rating"
            value={ratingValue}
            onChange={(event, newValue) => {
              setRatingValue(newValue);
            }}
            size="large"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRatingSubmit}
            variant="contained"
            color="primary"
          >
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar(prev => ({
            ...prev,
            open: false
          }))
        }
      >
        <Alert
          onClose={() =>
            setSnackbar(prev => ({
              ...prev,
              open: false
            }))
          }
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};
 
export default UserDash;