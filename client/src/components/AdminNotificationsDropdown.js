import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "reactstrap";
import {
  clearAllNotifications,
  markNotificationRead,
  seedNotificationsIfEmpty,
  // fetchAdminNotifications, // optional later
} from "../features/adminSlice";
import { useNavigate } from "react-router-dom";
import "./AdminNotificationsDropdown.css";
import { FaBell } from "react-icons/fa";


const AdminNotificationsDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const notifications = useSelector((s) => s.admin?.notifications) || [];
  const [open, setOpen] = useState(false);

  // Seed dummy items so UI works before backend
  useEffect(() => {
    dispatch(seedNotificationsIfEmpty());
    // later: dispatch(fetchAdminNotifications());
  }, [dispatch]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const onView = (n) => {
    dispatch(markNotificationRead(n.id));
    setOpen(false);
    if (n.linkTo) navigate(n.linkTo);
  };

  const onClearAll = () => {
    dispatch(clearAllNotifications());
  };

  return (
    <div className="notif-wrap">
      <div
        className="notif-bell"
        title="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <FaBell className="notif-icon" />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </div>

      {open && (
        <div className="notif-panel">
          <div className="notif-header">
            <div className="notif-title">
              Notifications{" "}
              <span className="notif-count-pill">{notifications.length}</span>
            </div>

            <Button
              color="link"
              className="notif-clear"
              onClick={onClearAll}
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
                    <button className="notif-view" onClick={() => onView(n)}>
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
  );
};

export default AdminNotificationsDropdown;
