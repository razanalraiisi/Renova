import React, { useMemo, useState } from "react";
import AdminTopbar from "./AdminTopbar"; // ✅ matches your file name
import BasicModal from "./BasicModal";
import "./AdminPages.css";

export default function AdminManageCollectors() {
  const initial = useMemo(
    () => [
      {
        id: 1,
        name: "Oman Environmental Services Holding Company",
        address: "HCF5+XF9, Muscat",
        phone: "24228401",
      },
      {
        id: 2,
        name: "Recycling Services LLC Misfa",
        address: "F7C9+9MW, Misfah As Safil",
        phone: "24489922",
      },
      {
        id: 3,
        name: "Be’ah plastic recycling service",
        address: "Oman avenues, 2nd floor, Muscat",
        phone: "24556792",
      },
    ],
    []
  );

  const [collectors, setCollectors] = useState(initial);

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [activeId, setActiveId] = useState(null);

  const [successOpen, setSuccessOpen] = useState(false);

  const openModal = (id) => {
    setActiveId(id);
    setReason("");
    setOpen(true);
  };

  const save = () => {
    // UI-only: remove collector and show success
    setCollectors((prev) => prev.filter((c) => c.id !== activeId));
    setOpen(false);
    setSuccessOpen(true);
  };

  return (
    <div className="adminPage">
      <AdminTopbar />

      <div className="adminBody">
        <div className="adminCardWrap">
          <div className="pageTitleCentered">Manage Collectors</div>

          <div className="manageList">
            {collectors.map((c) => (
              <div className="manageCard" key={c.id}>
                <div className="manageLeft">
                  <div className="chev">»</div>
                  <div>
                    <div className="manageName">{c.name}</div>
                    <div className="manageMeta">Address: {c.address}</div>
                    <div className="manageMeta">Phone: {c.phone}</div>
                  </div>
                </div>

                <button
                  className="btnDeactivate"
                  type="button"
                  onClick={() => openModal(c.id)}
                >
                  Deactivate
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deactivation Reason Modal */}
      <BasicModal open={open} onClose={() => setOpen(false)} width={760}>
        <div className="modalBodyLarge">
          <div className="modalRow">
            <div className="modalLabel">Specify Reason:</div>

            {/* ✅ textarea matches Figma better */}
            <textarea
              className="modalTextarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder=""
            />
          </div>

          <div className="modalActions">
            <button className="btnSave" type="button" onClick={save}>
              Save Changes
            </button>
            <button
              className="btnCloseGray"
              type="button"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </BasicModal>

      {/* Success Modal */}
      <BasicModal open={successOpen} onClose={() => setSuccessOpen(false)} width={600}>
        <div className="successWrap">
          <div className="successTitle">Changes Saved Successfully</div>
          <div className="successText">
            The changes you made to the collector request have been saved.
          </div>
        </div>
      </BasicModal>
    </div>
  );
}
