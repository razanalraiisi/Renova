import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import "./Components.css";

const API_URL = "http://localhost:5000/admin/devices";

const categoryOptions = [
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

const emptyDevice = { name: "", risk: "", category: "", image: "", steps: [""] };

export default function AdminEWasteLibrary() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState(emptyDevice);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: "" });

  const fetchDevices = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setDevices(data);
    } catch {
      console.error("Failed to fetch devices");
    }
  };

  useEffect(() => { fetchDevices(); }, []);

  // ✅ VALIDATION FUNCTIONS
  const isValidText = (text) => /^[a-zA-Z0-9 ]+$/.test(text);
  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ NAME VALIDATION
    if (!isValidText(form.name)) {
      return setSnackbar({ open: true, message: "Name should not contain special characters", severity: "error" });
    }

    // ✅ IMAGE VALIDATION
    if (!form.image || !isValidURL(form.image)) {
      return setSnackbar({ open: true, message: "Please enter a valid image URL", severity: "error" });
    }

    // ✅ STEPS VALIDATION
    const cleanSteps = form.steps.map(s => s.trim()).filter(s => s !== "");

    if (cleanSteps.length < 2) {
      return setSnackbar({ open: true, message: "Please enter at least 2 steps", severity: "error" });
    }

    for (let step of cleanSteps) {
      if (!isValidText(step)) {
        return setSnackbar({ open: true, message: "Steps should not contain special characters", severity: "error" });
      }
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, steps: cleanSteps })
      });

      setForm(emptyDevice);
      setEditingId(null);
      fetchDevices();

      setSnackbar({
        open: true,
        message: editingId ? `Device "${form.name}" updated!` : `Device "${form.name}" added!`,
        severity: "success"
      });
    } catch {
      setSnackbar({ open: true, message: "Error saving device", severity: "error" });
    }
  };

  const handleEdit = (device) => {
    setForm(device);
    setEditingId(device._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id, name) => {
    setDeleteModal({ open: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      await fetch(`${API_URL}/${deleteModal.id}`, { method: "DELETE" });
      fetchDevices();
      setSnackbar({ open: true, message: `Device "${deleteModal.name}" deleted!`, severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to delete device", severity: "error" });
    } finally {
      setDeleteModal({ open: false, id: null, name: "" });
    }
  };

  return (
    <div className="ewaste-container admin">
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            fontSize: 14,
            fontWeight: 600,
            color: "#0080AA",
            background: "transparent",
            border: "1px solid #0080AA",
            borderRadius: 6,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          ← Back
        </button>
      </div>

      <h1>Admin – E-Waste Library</h1>
      <p className="subtitle">Manage electronics </p>

      <form onSubmit={handleSubmit} className="admin-form fade-in">
        <h3>{editingId ? "Edit Device" : "Add New Device"}</h3>
        <input placeholder="Device name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        
        <select value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value })} required>
          <option value="">Select Risk</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="Hazardous">Hazardous</option>
        </select>

        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
          <option value="">Select Category</option>
          {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />

        <textarea
          placeholder="Steps (one per line)"
          value={form.steps.join("\n")}
          onChange={(e) => setForm({ ...form, steps: e.target.value.split("\n") })}
        />

        <button type="submit" className="primary-btn">
          {editingId ? "Update Device" : "Add Device"}
        </button>
      </form>

      <div className="devices-grid">
        {devices.map((d) => (
          <div key={d._id} className="device-card slide-up">
            <div className={`risk ${d.risk.toLowerCase()}`}>● {d.risk} Risk</div>
            <div className="category-label">{d.category}</div>
            <img src={d.image} alt={d.name} />
            <h4>{d.name}</h4>
            <ol>{d.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            <div className="admin-actions">
              <button className="edit-btn" onClick={() => handleEdit(d)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(d._id, d.name)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {deleteModal.open && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999
        }}>
          <div style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "12px",
            width: "320px",
            textAlign: "center",
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ marginBottom: 10 }}>Delete Device</h3>
            <p style={{ fontSize: 14, marginBottom: 20 }}>
              Are you sure you want to delete <b>{deleteModal.name}</b>?
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteModal({ open: false, id: null, name: "" })} style={{ flex: 1 }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}