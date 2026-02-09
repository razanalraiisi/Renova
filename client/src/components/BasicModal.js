import React from "react";
import "./AdminPages.css";

export default function BasicModal({ open, onClose, children, width = 520 }) {
  if (!open) return null;

  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div
        className="modalCard"
        style={{ width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="modalClose" type="button" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
