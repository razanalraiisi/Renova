import React, { useMemo, useState } from "react";
import "./AdminCollectorRequests.css";
import AdminTopbar from "./AdminTopbar";
import { FcDepartment, FcViewDetails, FcBusinessContact } from "react-icons/fc";

const AdminCollectorRequests = () => {
  const initialRequests = useMemo(
    () => [
      {
        _id: "201",
        companyName: "Oman Environmental services holding company",
        collectorType: "Used Phone store",
        createdAt: "2025-11-10T19:43:00.000Z",
        collectorId: "201",
        openHr: "8:00 AM – 5:00 PM",
        acceptedCategories: ["Phones", "Laptops", "Accessories"],
        address: "HCF5+XF9, Muscat",
        email: "OESH@gmail.com",
        phone: "98765432",
      },
      {
        _id: "202",
        companyName: "Recycling Services LLC Misfa",
        collectorType: "University",
        createdAt: "2025-11-11T10:10:00.000Z",
        collectorId: "202",
        openHr: "9:00 AM – 4:00 PM",
        acceptedCategories: ["Batteries", "Cables"],
        address: "F7C9+9MW, Misfah As Safil",
        email: "misfa@uni.edu",
        phone: "24489922",
      },
      {
        _id: "203",
        companyName: "Be’ah plastic recycling service",
        collectorType: "Pick up driver",
        createdAt: "2025-09-15T14:55:00.000Z",
        collectorId: "203",
        openHr: "24/7",
        acceptedCategories: ["Plastics", "Small e-waste"],
        address: "Oman avenues, 2nd floor, Muscat",
        email: "beah@service.com",
        phone: "24556792",
      },
    ],
    []
  );

  const [requests, setRequests] = useState(
    initialRequests.map((r) => ({ ...r, moreInfo: false }))
  );

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState(
    "[Multiple User Complaints]\n• Reports of unprofessional or unsafe behavior"
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("en-GB") +
      " • " +
      d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const toggleMoreInfo = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === id ? { ...r, moreInfo: !r.moreInfo } : r))
    );
  };

  const acceptRequest = (req) => {
    setRequests((prev) => prev.filter((r) => r._id !== req._id));
  };

  const openRejectModal = (req) => {
    setSelectedRequest(req);
    setShowReject(true);
  };

  const saveReject = () => {
    setRequests((prev) => prev.filter((r) => r._id !== selectedRequest?._id));
    setShowReject(false);
    setShowSuccess(true);
  };

  return (
    <div className="adminPage">
      <AdminTopbar />

      <div className="adminBody">
        <div className="adminPanelPlain">
          <div className="pageTitleRow">
            <div className="warnDot">🔔</div>
            <h2 className="pageTitle">Collectors Requests</h2>
          </div>

          {requests.length === 0 && (
            <p className="emptyText">No pending collector requests.</p>
          )}

          <div className="requestsList">
            {requests.map((req) => (
              <div className="requestCard" key={req._id}>
                <div className="requestLeft">
                  <div className="bagIcon">👜</div>
                  <div>
                    <div className="requestName">
                      <FcDepartment style={{ marginRight: 6 }} />
                      {req.companyName}
                    </div>

                    {!req.moreInfo && (
                      <div className="requestMeta">
                        <div>
                          <strong>Request Date:</strong>{" "}
                          {new Date(req.createdAt).toLocaleDateString("en-GB")}
                        </div>
                        <div>
                          <strong>Collector Type:</strong> {req.collectorType}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="requestRight">
                  <button
                    className="btnAccept"
                    type="button"
                    onClick={() => acceptRequest(req)}
                  >
                    Accept
                  </button>
                  <button
                    className="btnReject"
                    type="button"
                    onClick={() => openRejectModal(req)}
                  >
                    Reject
                  </button>
                </div>

                <div className="requestBottom">
                  <button
                    className="linkBtn"
                    type="button"
                    onClick={() => toggleMoreInfo(req._id)}
                  >
                    {req.moreInfo ? "Less Information" : "More information"}
                  </button>
                </div>

                {req.moreInfo && (
                  <div className="expandedDetails">
                    <div className="detailCol">
                      <div className="detailHead">
                        <FcViewDetails style={{ marginRight: 6 }} />
                        Request Details
                      </div>
                      <div className="detailText">
                        <strong>Request ID:</strong> {req.collectorId}
                      </div>
                      <div className="detailText">
                        <strong>Request Date:</strong> {formatDate(req.createdAt)}
                      </div>
                      <div className="detailText">
                        <strong>Collector Type:</strong> {req.collectorType}
                      </div>
                    </div>

                    <div className="detailCol">
                      <div className="detailHead">
                        <FcBusinessContact style={{ marginRight: 6 }} />
                        Collector Details
                      </div>
                      <div className="detailText">
                        <strong>Collector Phone Number:</strong> {req.phone}
                      </div>
                      <div className="detailText">
                        <strong>Collector Email:</strong> {req.email}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showReject && (
        <div className="modalOverlay" onMouseDown={() => setShowReject(false)}>
          <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modalClose" type="button" onClick={() => setShowReject(false)}>
              ✕
            </button>

            <div className="modalBodyLarge">
              <div className="modalRow">
                <div className="modalLabel">Specify Reason:</div>
                <textarea
                  className="modalTextarea"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="modalActions">
                <button className="btnSave" type="button" onClick={saveReject}>
                  Save Changes
                </button>
                <button className="btnCloseGray" type="button" onClick={() => setShowReject(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="modalOverlay" onMouseDown={() => setShowSuccess(false)}>
          <div className="modalCard successCard" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modalClose" type="button" onClick={() => setShowSuccess(false)}>
              ✕
            </button>

            <div className="successWrap">
              <div className="successTitle">Changes Saved Successfully</div>
              <div className="successText">
                The changes you made to the collector request have been saved.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollectorRequests;
