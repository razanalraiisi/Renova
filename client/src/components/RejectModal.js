import React, { useState } from "react";
import "./Modal.css";

const RejectModal = ({ request, close, confirm }) => {
  const [reason, setReason] = useState("");

  return (
    <div className="modal-bg">
      <div className="modal-box">
        <h3>Reject Request</h3>
        <p>
          Please enter a reason for rejecting <strong>{request.name}</strong>.
        </p>

        <textarea
          className="reason-box"
          placeholder="Reason for rejection..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="modal-row">
          <button className="cancel-btn" onClick={close}>
            Cancel
          </button>

          <button
            className="reject-confirm-btn"
            disabled={!reason.trim()}
            onClick={() => confirm(reason)}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
