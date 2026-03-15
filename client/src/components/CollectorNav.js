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
        const res = await fetch(`http://localhost:5000/api/pickups/all/${collector._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, []);

  const unreadCount = requests.length;

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
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </div>

          {notifOpen && (
            <div className="notif-panel">
              <div className="notif-header">
                <div className="notif-title">
                  New Requests{" "}
                  <span className="notif-count-pill">
                    {requests.length}
                  </span>
                </div>
              </div>

              <div className="notif-list">
                {requests.length === 0 ? (
                  <div className="notif-empty">No new requests</div>
                ) : (
                  requests.map((r) => (
                    <div key={r._id} className="notif-item">
                      <div className="notif-item-top">
                        <div className="notif-item-title">New Pickup Request for {r.device}</div>
                        <div className="notif-time">{new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="notif-message">Condition: {r.condition}</div>
                      <div className="notif-actions">
                        <button
                          className="notif-view"
                          onClick={() => {
                            setNotifOpen(false);
                            navigate("/NewRecycleRequest");
                          }}
                        >
                          view
                        </button>
                      </div>
                    </div>
                  ))
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
