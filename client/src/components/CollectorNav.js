import React, { useEffect, useMemo, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; 
import { FaUserCircle } from "react-icons/fa"; 
import "./Components.css";
import { FaBell } from "react-icons/fa";

const CollectorNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [requestsDropdownOpen, setRequestsDropdownOpen] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const collector = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
        if (!collector?._id) return;

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        // Fetch pickup requests
        const pickupRes = await fetch(`http://localhost:5000/api/pickups/all/${collector._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const pickupData = await pickupRes.json();
        
        // Fetch drop-off requests
        const dropOffRes = await fetch(`http://localhost:5000/api/dropoffs/all/${collector._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dropOffData = await dropOffRes.json();
        
        // Combine and sort by createdAt descending
        const allRequests = [...(Array.isArray(pickupData) ? pickupData : []), ...(Array.isArray(dropOffData) ? dropOffData : [])]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setRequests(allRequests);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();

    // Poll for new requests every 30 seconds
    const interval = setInterval(fetchRequests, 30000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = requests.length;

  // Separate regular requests from reminders (requests older than 7 days)
  const { regularRequests, reminderRequests } = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const regular = [];
    const reminders = [];
    
    requests.forEach(request => {
      const createdAt = new Date(request.createdAt);
      if (createdAt < sevenDaysAgo) {
        reminders.push(request);
      } else {
        regular.push(request);
      }
    });
    
    return { regularRequests: regular, reminderRequests: reminders };
  }, [requests]);

  const totalUnreadCount = regularRequests.length + reminderRequests.length;

  return (
  <Navbar className="collector-navbar d-flex align-items-center">
    <Container fluid className="d-flex align-items-center">
      
      <NavbarBrand href="/" className="d-flex align-items-center" style={{color:"#ffff"}}>
        <img src={logo} alt="logo" className="navbar-logo" />
        ReNova
      </NavbarBrand>

      {/* Centered links */}
      <div className="navbar-links d-flex align-items-center mx-auto gap-3">
        <Button color="link" onClick={() => navigate("/CollectorDash")}>
          Dashboard
        </Button>

        <Dropdown
          isOpen={requestsDropdownOpen}
          toggle={() => setRequestsDropdownOpen(!requestsDropdownOpen)}
        >
          <DropdownToggle caret color="link" className="navbar-dropdown">
            Requests
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => navigate("/CollectorRequestsHistory")}>
              History Requests
            </DropdownItem>
            <DropdownItem onClick={() => navigate("/CollectorNewRecycleRequest")}>
              New Requests
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Button color="link" onClick={() => navigate("/AboutUs")}>
          About Us
        </Button>
      </div>

      {/* Right side */}
      <div className="navbar-right d-flex align-items-center gap-3">
        <div className="notif-wrap">
          <div className="notif-bell" onClick={() => setNotifOpen((v) => !v)}>
            <FaBell size={28}/>
            {totalUnreadCount > 0 && (
              <span className="notif-badge">{totalUnreadCount}</span>
            )}
          </div>

          {notifOpen && (
            <div className="notif-panel">
              <div className="notif-header">
                <div className="notif-title">
                  New Requests{" "}
                  <span className="notif-count-pill">
                    {totalUnreadCount}
                  </span>
                  {reminderRequests.length > 0 && (
                    <span className="reminder-badge">
                      {reminderRequests.length} reminder{reminderRequests.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              <div className="notif-list">
                {totalUnreadCount === 0 ? (
                  <div className="notif-empty">No new requests</div>
                ) : (
                  <>
                    {/* Show reminders first */}
                    {reminderRequests.map((r) => (
                      <div key={r._id} className="notif-item reminder-item">
                        <div className="notif-item-top">
                          <div className="notif-item-title">
                            <span className="reminder-text">remainder!!</span>
                            {" "}
                            {r.requestType === "DropOff" ? "Drop-off" : "Pickup"} Request for {r.device}
                          </div>
                          <div className="notif-time">{new Date(r.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="notif-message">
                          Condition: {r.condition}
                          <br />
                          <span className="reminder-note">This request has been pending for over a week</span>
                        </div>
                        <div className="notif-actions">
                          <button
                            className="notif-view reminder-view"
                            onClick={() => {
                              setNotifOpen(false);
                              navigate("/CollectorNewRecycleRequest");
                            }}
                          >
                            view
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show regular requests */}
                    {regularRequests.map((r) => (
                      <div key={r._id} className="notif-item">
                        <div className="notif-item-top">
                          <div className="notif-item-title">New {r.requestType === "DropOff" ? "Drop-off" : "Pickup"} Request for {r.device}</div>
                          <div className="notif-time">{new Date(r.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="notif-message">Condition: {r.condition}</div>
                        <div className="notif-actions">
                          <button
                            className="notif-view"
                            onClick={() => {
                              setNotifOpen(false);
                              navigate("/CollectorNewRecycleRequest");
                            }}
                          >
                            view
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <FaUserCircle
          className="profile-icon"
          size={28}
          onClick={() => navigate("/CollectorProfile")}
        />
      </div>

    </Container>
  </Navbar>
);

};

export default CollectorNavbar;
