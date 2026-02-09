import { useEffect, useState } from "react";
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
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState(emptyDevice);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    try {
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setForm(emptyDevice);
      setEditingId(null);
      fetchDevices();
      setSnackbar({ open: true, message: editingId ? `Device "${form.name}" updated!` : `Device "${form.name}" added!`, severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Error saving device", severity: "error" });
    }
  };

  const handleEdit = (device) => { setForm(device); setEditingId(device._id); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleDelete = async (id, name) => {
    if (!window.confirm("Delete this device?")) return;
    try { await fetch(`${API_URL}/${id}`, { method: "DELETE" }); fetchDevices(); setSnackbar({ open: true, message: `Device "${name}" deleted!`, severity: "success" }); } 
    catch { setSnackbar({ open: true, message: "Failed to delete device", severity: "error" }); }
  };

  return (
    <div className="ewaste-container admin">
      <h1>Admin – E-Waste Library</h1>
      <p className="subtitle">Add, edit, and manage recycling devices</p>

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
        <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <textarea placeholder="Steps (one per line)" value={form.steps.join("\n")} onChange={(e) => setForm({ ...form, steps: e.target.value.split("\n") })} />
        <button type="submit" className="primary-btn">{editingId ? "Update Device" : "Add Device"}</button>
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

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
