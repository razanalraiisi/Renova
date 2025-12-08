import React, { useState } from "react";
import AcceptModal from "../components/AcceptModal";
import RejectModal from "../components/RejectModal";
import "./AdminCollectorRequests.css";

const AdminCollectorRequests = () => {
  // Mock collector requests
  const [requests, setRequests] = useState([
    {
      id: 201,
      name: "Oman Environmental Services Holding Company",
      type: "Used Phone Store",
      date: "10/11/2025",
      time: "11:43 PM",
      email: "OESH@gmail.com",
      phone: "98765432",
      status: "pending",
      moreInfo: false,
    },
    {
      id: 154,
      name: "Recycling Services LLC Misfa",
      type: "University",
      date: "1/11/2025",
      time: "09:32 AM",
      email: "misfa@gmail.com",
      phone: "92837492",
      status: "pending",
      moreInfo: false,
    },
    {
      id: 184,
      name: "Be’ah Plastic Recycling Service",
      type: "Pickup Driver",
      date: "15/9/2025",
      time: "12:15 PM",
      email: "beah@gmail.com",
      phone: "99223344",
      status: "pending",
      moreInfo: false,
    },
  ]);

  // Modal controls
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAccept, setShowAccept] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const toggleMoreInfo = (id) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, moreInfo: !r.moreInfo } : r
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
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id ? { ...r, status: "accepted" } : r
      )
    );
    setShowAccept(false);
  };

  const rejectRequest = (reason) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id
          ? { ...r, status: "rejected", reason }
          : r
      )
    );
    setShowReject(false);
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">⚠️ Collectors Requests</h2>

      {requests.map((req) => (
        <div className="request-card" key={req.id}>
          <h4 className="collector-name">{req.name}</h4>

          {/* COLLAPSED */}
          {!req.moreInfo && (
            <>
              <p><strong>Request Date:</strong> {req.date}</p>
              <p><strong>Collector Type:</strong> {req.type}</p>
              <button className="info-btn" onClick={() => toggleMoreInfo(req.id)}>
                More Information
              </button>
            </>
          )}

          {/* MORE INFO EXPANDED */}
          {req.moreInfo && (
            <>
              <div className="info-grid">
                <div>
                  <h5>Request Details</h5>
                  <p><strong>Request ID:</strong> {req.id}</p>
                  <p><strong>Date:</strong> {req.date}</p>
                  <p><strong>Time:</strong> {req.time}</p>
                  <p><strong>Type:</strong> {req.type}</p>
                </div>
                <div>
                  <h5>Collector Details</h5>
                  <p><strong>Email:</strong> {req.email}</p>
                  <p><strong>Phone:</strong> {req.phone}</p>
                </div>
              </div>

              <button className="info-btn" onClick={() => toggleMoreInfo(req.id)}>
                Less Information
              </button>
            </>
          )}

          {/* ACCEPT / REJECT BUTTONS */}
          {req.status === "pending" && (
            <div className="btn-row">
              <button className="accept-btn" onClick={() => openAcceptModal(req)}>
                Accept
              </button>
              <button className="reject-btn" onClick={() => openRejectModal(req)}>
                Reject
              </button>
            </div>
          )}

          {req.status === "accepted" && (
            <p className="accepted-tag">✔ Request Accepted</p>
          )}

          {req.status === "rejected" && (
            <p className="rejected-tag">✖ Request Rejected</p>
          )}
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
