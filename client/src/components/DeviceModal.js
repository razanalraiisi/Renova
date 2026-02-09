import React from "react";
import "./Components.css";

const DeviceModal = ({ device, onClose }) => {
  if (!device) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>×</span>

        <img src={device.image} alt={device.name} />
        <h3>{device.name}</h3>

        <div className={`risk ${device.category.toLowerCase()}`}>
          ● {device.risk}
        </div>

        <ol>
          {device.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default DeviceModal;
