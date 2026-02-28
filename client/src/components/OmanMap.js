import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios"; // fetch from backend
import "leaflet/dist/leaflet.css";
import "./Components.css";
import { FaLocationDot } from "react-icons/fa6";
import { FaPhoneVolume } from "react-icons/fa6";
import { IoTime } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

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
  const [collectors, setCollectors] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [hoveredCenter, setHoveredCenter] = useState(null);
  const navigate = useNavigate();

  const center = [23.5880, 58.3829];

  
  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const res = await axios.get("http://localhost:5000/admin/getApprovedCollectors");
        const approvedWithLocation = res.data.filter(
          (c) => c.isApproved && c.location && c.location.lat && c.location.lng
        );
        setCollectors(approvedWithLocation);
      } catch (err) {
        console.error("Error fetching collectors:", err);
      }
    };
    fetchCollectors();
  }, []);

  const activeCenter = selectedCenter || hoveredCenter;

  return (
    <div>
      <h3 style={{ textAlign: "center" }}>Oman Recycling Centers Map</h3>

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

          {collectors.map((c) => (
            <Marker
              key={c._id}
              position={[c.location.lat, c.location.lng]}
              eventHandlers={{
                mouseover: () => setHoveredCenter(c),
                mouseout: () => setHoveredCenter(null),
                click: () => setSelectedCenter(c),
              }}
            >
              <Popup>{c.companyName || "Collector"}</Popup>
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
              <h4 style={{color:"#006D90"}}>{activeCenter.companyName}</h4>
              <p><FaLocationDot size={19} color="#006D90"/> <strong>Address:</strong> {activeCenter.address}</p>
              <p><FaPhoneVolume size={17} color="#006D90"/> <strong>Phone:</strong> {activeCenter.phone}</p>
              <p><IoTime size={20} color="#006D90"/> <strong>Hours:</strong> {activeCenter.openHr}</p>
              {activeCenter.pic && (
                <img src={activeCenter.pic} alt={activeCenter.companyName} />
              )}
              <div className="buttons-container">
                <button className="primary-btn" onClick={() => navigate('/PickupRequest')}>Request Pick Up</button>
                <button className="primary-btn" onClick={() => navigate('/DropOff')}>Schedule Drop Off</button>
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