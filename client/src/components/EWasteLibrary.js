import React, { useEffect, useState } from "react";
import "./Components.css";
import { FaRecycle, FaStar } from "react-icons/fa";
import { FcMultipleDevices } from "react-icons/fc";
import { IconButton, Menu, MenuItem, Snackbar, Alert } from "@mui/material";
import { MdCategory } from "react-icons/md";
import { CSSTransition, TransitionGroup } from "react-transition-group";


const infoBoxes = [
  {
    title: "Environmental Benefits of E-Waste Recycling",
    points: [
      "Reduces mining by recovering valuable materials.",
      "Lowers greenhouse gas emissions.",
      "Supports a circular economy.",
      "Protects ecosystems.",
    ],
  },
  {
    title: "Why You Shouldn’t Throw Electronics in the Trash!!",
    points: [
      "Contains toxic materials.",
      "Batteries may cause fires.",
      "Pollutes soil and water.",
      "Improper disposal is dangerous.",
    ],
  },
];

const categoryOptions = [
  "All",
  "Small Electronics",
  "Large Electronics",
  "Home Appliances (Small)",
  "Home Appliances (Large)",
  "IT & Office Equipment",
  "Kitchen & Cooking Appliances",
  "Entertainment Devices",
  "Personal Care Electronics",
  "Tools & Outdoor Equipment",
  "Lighting Equipment",
  "Medical & Fitness Devices",
  "Batteries & Accessories",
];

const EWasteLibrary = () => {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [activeRiskTab, setActiveRiskTab] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");

  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = (cat) => {
    if (cat) setActiveCategory(cat);
    setAnchorEl(null);
  };

  
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  
  const fetchDevices = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/devices");
      const data = await res.json();
      setDevices(data);
    } catch {
      setSnackbar({ open: true, message: "Failed to fetch devices", severity: "error" });
    }
  };

  useEffect(() => {
    fetchDevices();
    
    const interval = setInterval(fetchDevices, 2000);
    return () => clearInterval(interval);
  }, []);

  
  const categoryCounts = devices.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1;
    return acc;
  }, {});

  
  const filteredDevices = devices.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = activeRiskTab === "All" || d.risk === activeRiskTab;
    const matchesCategory = activeCategory === "All" || d.category === activeCategory;
    return matchesSearch && matchesRisk && matchesCategory;
  });

  return (
    <div className="ewaste-container">
      <h1>E-Waste Library</h1>
      <p className="subtitle">Device Preparation Steps Before Recycling</p>

      
      <div className="filters-wrapper justify-content-center">
        <input
          className="search-box"
          placeholder="Search devices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IconButton
          aria-label="category"
          onClick={handleMenuOpen}
          className="category-icon-button"
        >
          <MdCategory size={28} />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={() => handleMenuClose(null)}>
          {categoryOptions.map((cat) => (
            <MenuItem
              key={cat}
              selected={activeCategory === cat}
              onClick={() => handleMenuClose(cat)}
            >
              {cat}
            </MenuItem>
          ))}
        </Menu>
      </div>

      
      <div className="info-cards">
        {infoBoxes.map((card, i) => (
          <div className="info-card" key={i}>
            <h5>{card.title}</h5>
            <ul>{card.points.map((p, idx) => <li key={idx}>{p}</li>)}</ul>
          </div>
        ))}
      </div>

     
      <div className="stats">
        <span><FcMultipleDevices /> {devices.length} devices</span>
        <span><FaRecycle color="#19d759"/> {Object.keys(categoryCounts).length} categories</span>
      </div>

     
      <div className="tabs">
        {["All", "Low", "Medium", "Hazardous"].map((tab) => (
          <button
            key={tab}
            className={activeRiskTab === tab ? "active" : ""}
            onClick={() => setActiveRiskTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      
      <TransitionGroup className="devices-grid">
        {filteredDevices.map((d) => (
          <CSSTransition key={d._id} timeout={400} classNames="fade-slide">
            <div className="device-card">
              <div className={`risk ${d.risk.toLowerCase()}`}>● {d.risk} Risk</div>
              <div className="category-label">{d.category}</div>
              <img src={d.image} alt={d.name} />
              <h4>{d.name}</h4>
              <ol>{d.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EWasteLibrary;
