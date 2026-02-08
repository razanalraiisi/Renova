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
import {
  clearAllNotifications,
  markNotificationRead,
  seedNotificationsIfEmpty,
} from "../features/adminSlice"; 
import logo from "../assets/logo.png"; 
import { FaUserCircle } from "react-icons/fa"; 
import "./Components.css";
import { FaBell } from "react-icons/fa";

const CollectorNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useSelector((s) => s.admin?.notifications) || [];
  const [notifOpen, setNotifOpen] = useState(false);
  const [requestsDropdownOpen, setRequestsDropdownOpen] = useState(false);

  useEffect(() => {
    dispatch(seedNotificationsIfEmpty());
  }, [dispatch]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const handleView = (n) => {
    dispatch(markNotificationRead(n.id));
    setNotifOpen(false);
    if (n.linkTo) navigate(n.linkTo);
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

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
            <DropdownItem onClick={() => navigate("/NewRecycleRequest")}>
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
                  Notifications{" "}
                  <span className="notif-count-pill">
                    {notifications.length}
                  </span>
                </div>
                <Button
                  color="link"
                  className="notif-clear"
                  onClick={handleClearAll}
                  disabled={notifications.length === 0}
                >
                  Clear All
                </Button>
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="notif-item">
                      <div className="notif-item-top">
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-time">{n.timeAgo}</div>
                      </div>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-actions">
                        <button
                          className="notif-view"
                          onClick={() => handleView(n)}
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
