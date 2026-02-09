import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaEdit } from "react-icons/fa";
import {
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { collectorProfileData } from "./DummyData";
import "./Components.css";
import { FaMapLocationDot } from "react-icons/fa6";
import { GoTasklist } from "react-icons/go";
import { FaRegUser } from "react-icons/fa";

const CollectorProfile = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(collectorProfileData);

  const [editMode, setEditMode] = useState({
    basicInfo: false,
    acceptedCategories: false,
    location: false,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleLogout = () => {
    if (hasChanges) {
      setShowWarning(true);
      return;
    }
    localStorage.removeItem("token");
    navigate("/");
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleChange = (section, field, value) => {
    setHasChanges(true);
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleCategoryToggle = (index) => {
    setHasChanges(true);
    const updated = [...data.acceptedCategories];
    updated[index].checked = !updated[index].checked;
    setData((prev) => ({ ...prev, acceptedCategories: updated }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    setHasChanges(true);

    const items = Array.from(data.acceptedCategories);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setData((prev) => ({ ...prev, acceptedCategories: items }));
  };

  const handleSave = () => {
    setEditMode({ basicInfo: false, acceptedCategories: false, location: false });
    setHasChanges(false);
    setSnackbar({
      open: true,
      message: "Profile updated successfully!",
      severity: "success",
    });
  };

  return (
    <div className="profile-container">
      <div style={{display: "flex", justifyContent: "flex-end"}}>
        {hasChanges && <Chip label="Unsaved changes" color="warning" size="small" />}
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="profile-content">
        
        <div className="profile-header">
          <img src={data.logo} alt="Company Logo" className="company-logo" />
          <div className="profile-title">{data.companyName}</div>
        </div>

        <div className="cards-container">
          
          <div className="card">
            <h3 style={{color: "#006D90"}}>
              <FaRegUser />Collector Information
              <FaEdit
                className={editMode.basicInfo ? "edit-icon active" : "edit-icon"}
                onClick={() =>
                  setEditMode((p) => ({ ...p, basicInfo: !p.basicInfo }))
                }
              />
            </h3>

            {editMode.basicInfo ? (
              <>
                <input value={data.basicInfo.collectorId} disabled />
                <input
                  value={data.basicInfo.collectorType}
                  onChange={(e) =>
                    handleChange("basicInfo", "collectorType", e.target.value)
                  }
                />
                <input
                  value={data.basicInfo.workingHours}
                  onChange={(e) =>
                    handleChange("basicInfo", "workingHours", e.target.value)
                  }
                />
                <input
                  value={data.basicInfo.phone}
                  onChange={(e) =>
                    handleChange("basicInfo", "phone", e.target.value)
                  }
                />
                <input
                  value={data.basicInfo.email}
                  onChange={(e) =>
                    handleChange("basicInfo", "email", e.target.value)
                  }
                />
              </>
            ) : (
              <>
                <p><strong>Collector ID:</strong> {data.basicInfo.collectorId}</p>
                <p><strong>Collector Type:</strong> {data.basicInfo.collectorType}</p>
                <p><strong>Working Hours:</strong> {data.basicInfo.workingHours}</p>
                <p><strong>Phone:</strong> {data.basicInfo.phone}</p>
                <p><strong>Email:</strong> {data.basicInfo.email}</p>
              </>
            )}
          </div>

          {/* Categories */}
          <div className="card">
            <h3 style={{color: "#006D90"}}>
              <GoTasklist />Accepted Categories
              <FaEdit
                className={editMode.acceptedCategories ? "edit-icon active" : "edit-icon"}
                onClick={() =>
                  setEditMode((p) => ({
                    ...p,
                    acceptedCategories: !p.acceptedCategories,
                  }))
                }
              />
            </h3>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categories">
                {(provided) => (
                  <ul
                    className="accepted-categories"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {data.acceptedCategories.map((cat, index) => (
                      <Draggable
                        key={cat.name}
                        draggableId={cat.name}
                        index={index}
                        isDragDisabled={!editMode.acceptedCategories}
                      >
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <input
                              type="checkbox"
                              checked={cat.checked}
                              disabled={!editMode.acceptedCategories}
                              onChange={() => handleCategoryToggle(index)}
                            />
                            {cat.name}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Location */}
          <div className="card">
            <h3 style={{color: "#006D90"}}>
              <FaMapLocationDot />Location
              <FaEdit
                className={editMode.location ? "edit-icon active" : "edit-icon"}
                onClick={() =>
                  setEditMode((p) => ({ ...p, location: !p.location }))
                }
              />
            </h3>

            {editMode.location ? (
              <input
                value={data.location.address}
                onChange={(e) =>
                  handleChange("location", "address", e.target.value)
                }
              />
            ) : (
              <p><strong>Address:</strong> {data.location.address}</p>
            )}
          </div>
        </div>

        {(editMode.basicInfo ||
          editMode.acceptedCategories ||
          editMode.location) && (
          <div className="save-container">
            <Button variant="contained" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={showWarning} onClose={() => setShowWarning(false)}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes. Leave anyway?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarning(false)}>Cancel</Button>
          <Button color="error" onClick={confirmLogout}>
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success">{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default CollectorProfile;
