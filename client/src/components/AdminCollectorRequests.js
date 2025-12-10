import React, { useState, useEffect } from "react";
import axios from "axios";
import AcceptModal from "../components/AcceptModal";
import RejectModal from "../components/RejectModal";
import "./AdminCollectorRequests.css";

const AdminCollectorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAccept, setShowAccept] = useState(false);
  const [showReject, setShowReject] = useState(false);

  // ⭐ Format dates nicely
  const formatDate = (iso) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("en-GB") +
      " • " +
      d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    );
  };

  // ⭐ Fetch collectors sorted by newest
  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/pendingCollectors")
      .then((res) => {
        const withUI = res.data.map((c) => ({
          ...c,
          moreInfo: false,
          status: "pending",
        }));
        setRequests(withUI);
      })
      .catch((err) => console.log(err));
  }, []);

  const toggleMoreInfo = (id) => {
    setRequests((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, moreInfo: !r.moreInfo } : r
      )
    );
  };

  const openAcceptModal = (req) => {
    setSelectedRequest(req);
    setShowAccept(true);
  };

  const openRejectModal = (req) => {
    setSelectedRequest(req);
    setShowReject(true);
  };

  const acceptRequest = () => {
    axios
      .put(`http://localhost:5000/admin/approveCollector/${selectedRequest._id}`)
      .then(() => {
        setRequests((prev) =>
          prev.filter((r) => r._id !== selectedRequest._id)
        );
        setShowAccept(false);
      })
      .catch((err) => console.log(err));
  };

  const rejectRequest = (reason) => {
    axios
      .delete(`http://localhost:5000/admin/rejectCollector/${selectedRequest._id}`)
      .then(() => {
        setRequests((prev) =>
          prev.filter((r) => r._id !== selectedRequest._id)
        );
        setShowReject(false);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">⚠️ Collector Approval Requests</h2>

      {requests.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No pending collector requests.
        </p>
      )}

      {requests.map((req) => (
        <div className="request-card" key={req._id}>
          <h4 className="collector-name">{req.companyName}</h4>

          {/* COLLAPSED */}
          {!req.moreInfo && (
            <>
              <p><strong>Collector Type:</strong> {req.collectorType}</p>
              <p><strong>Registered:</strong> {formatDate(req.createdAt)}</p>

              <button
                className="info-btn"
                onClick={() => toggleMoreInfo(req._id)}
              >
                More Information
              </button>
            </>
          )}

          {/* EXPANDED */}
          {req.moreInfo && (
            <>
              <div className="info-grid">
                <div>
                  <h5>Collector Details</h5>
                  <p><strong>ID:</strong> {req.collectorId}</p>
                  <p><strong>Type:</strong> {req.collectorType}</p>
                  <p><strong>Opening Hours:</strong> {req.openHr}</p>
                  <p><strong>Categories:</strong> {req.acceptedCategories.join(", ")}</p>
                  <p><strong>Address:</strong> {req.address}</p>
                  <p><strong>Registered On:</strong> {formatDate(req.createdAt)}</p>
                </div>

                <div>
                  <h5>Contact Info</h5>
                  <p><strong>Email:</strong> {req.email}</p>
                  <p><strong>Phone:</strong> {req.phone}</p>
                </div>
              </div>

              <button
                className="info-btn"
                onClick={() => toggleMoreInfo(req._id)}
              >
                Less Information
              </button>
            </>
          )}

          {/* ACTION BUTTONS */}
          <div className="btn-row">
            <button className="accept-btn" onClick={() => openAcceptModal(req)}>
              Accept
            </button>
            <button className="reject-btn" onClick={() => openRejectModal(req)}>
              Reject
            </button>
          </div>
        </div>
      ))}

      {/* MODALS */}
      {showAccept && (
        <AcceptModal
          request={selectedRequest}
          close={() => setShowAccept(false)}
          confirm={acceptRequest}
        />
      )}

      {showReject && (
        <RejectModal
          request={selectedRequest}
          close={() => setShowReject(false)}
          confirm={rejectRequest}
        />
      )}
    </div>
  );
};

export default AdminCollectorRequests;
