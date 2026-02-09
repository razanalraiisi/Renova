import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { recyclingCenters } from "./DummyData";
import "leaflet/dist/leaflet.css";
import "./Components.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const OmanMap = () => {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [hoveredCenter, setHoveredCenter] = useState(null);

  const center = [23.5880, 58.3829];


  const activeCenter = selectedCenter || hoveredCenter;

  return (
    <div>
        <h3 style={{textAlign:"center"}}>Oman Recycling Centers Map</h3>
        
    <div className="oman-map-wrapper">
      <MapContainer
        center={center}
        zoom={11}
        className="map-container-dashboard"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {recyclingCenters.map((c) => (
          <Marker
            key={c.id}
            position={[c.lat, c.lng]}
            eventHandlers={{
              mouseover: () => setHoveredCenter(c),
              mouseout: () => setHoveredCenter(null),
              click: () => setSelectedCenter(c),
            }}
          >
            <Popup>{c.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      
      <div
        className={`company-card-dashboard ${
          selectedCenter ? "selected" : hoveredCenter ? "hovered" : ""
        }`}
      >
        {activeCenter ? (
          <>
            <h4>{activeCenter.name}</h4>
            <p><strong>Address:</strong> {activeCenter.address}</p>
            <p><strong>Phone:</strong> {activeCenter.phone}</p>
            <p><strong>Hours:</strong> {activeCenter.hours}</p>
            {activeCenter.image && (
              <img src={activeCenter.image} alt={activeCenter.name} />
            )}
            <div className="buttons-container">
              <button className="primary-btn">Request Pick Up</button>
              <button className="secondary-btn">Schedule Drop Off</button>
            </div>
          </>
        ) : (
          <p className="placeholder-text">Hover over a pin to see details</p>
        )}
      </div>
    </div>
    </div>
  );
};

export default OmanMap;
