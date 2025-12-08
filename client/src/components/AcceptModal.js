import React from "react";
import "./Modal.css";

const AcceptModal = ({ request, close, confirm }) => {
  return (
    <div className="modal-bg">
      <div className="modal-box">
        <h3>Accept Request</h3>
        <p>
          Are you sure you want to <strong>ACCEPT</strong> the request from:
        </p>
        <h4>{request.name}</h4>

        <div className="modal-row">
          <button className="cancel-btn" onClick={close}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={confirm}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptModal;
