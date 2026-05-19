import React, { useState, useEffect } from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaSync, FaCamera } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import logo from "../assets/logo.png";

// FIX MARKER ICON
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DropOff = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || "DropOff";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    deviceCategory: "",
    device: "",
    condition: "",
    dateTime: "",
    address: "",
    collectorId: "",
  });

  const [customCategory, setCustomCategory] = useState("");
  const [isBroadcastToAllCollectors, setIsBroadcastToAllCollectors] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const [selectedCenter, setSelectedCenter] = useState(null);
  const [userName, setUserName] = useState("");
  const [collectors, setCollectors] = useState([]);
  const [loadingCollectors, setLoadingCollectors] = useState(false);

  const allCategories = [
    "Small Electronics","Large Electronics","Home Appliances (Small)","Home Appliances (Large)","IT & Office Equipment",
    "Kitchen & Cooking Appliances","Entertainment Devices","Personal Care Electronics","Tools & Outdoor Equipment",
    "Lighting Equipment","Medical & Fitness Devices","Batteries & Accessories","Other"
  ];

  // =========================
  // DATE / TIME RULES (OMAN FIX)
  // =========================

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 5 || day === 6;
  };

  const isValidDateTime = (value) => {
  if (!value) return false;

  const dt = new Date(value);
  const now = new Date();

  // no past date/time
  if (dt <= now) return false;

  // block Friday & Saturday
  const day = dt.getDay();
  if (day === 5 || day === 6) return false;

  // allowed hours only
  const hour = dt.getHours();
const minutes = dt.getMinutes();

// allow 08:00 → 17:00 only
if (
  hour < 8 ||
  hour > 17 ||
  (hour === 17 && minutes > 0)
) {
  return false;
}

  return true;
};

  const getMinDateTime = () => {
  const now = new Date();

  // if before 8 AM -> allow today at 8
  if (now.getHours() < 8) {
    now.setHours(8, 0, 0, 0);
  } else {
    // otherwise add 1 hour minimum
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    now.setSeconds(0);
  }

  // format WITHOUT timezone issue
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${mins}`;
};

  // =========================
  // HANDLE DATE CHANGE
  // =========================

const handleDateChange = (e) => {
  const value = e.target.value;

  setForm({
    ...form,
    dateTime: value
  });

  setErrors((prev) => ({
    ...prev,
    dateTime: ""
  }));
};

  // =========================
  // FETCH COLLECTORS
  // =========================

  const fetchCollectors = async () => {
    setLoadingCollectors(true);
    try {
      const res = await axios.get("http://localhost:5000/admin/getApprovedCollectors");

      const approvedWithLocation = res.data.filter(
        (c) => c.isApproved && c.location && c.location.lat && c.location.lng
      );

      setCollectors(approvedWithLocation);
    } catch (err) {
      console.error("Error fetching collectors:", err);
    } finally {
      setLoadingCollectors(false);
    }
  };

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));

    if (storedUser) {
      setForm(prev => ({
        ...prev,
        name: storedUser.uname || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
      }));

      setUserName(storedUser.uname || "");
    }

    fetchCollectors();

    if (location.state?.collector) {
      const collector = location.state.collector;

      setSelectedCenter({
        id: collector._id,
        companyName: collector.companyName,
        position: [collector.location.lat, collector.location.lng],
        address: collector.address,
        phone: collector.phone,
        hours: collector.openHr,
      });

      setForm(prev => ({
        ...prev,
        address: collector.address,
        collectorId: collector._id,
      }));

      // IMPORTANT FIX
      // if collector already chosen from previous page
      // disable broadcast
      setIsBroadcastToAllCollectors(false);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // CATEGORY CHANGE
  // =========================

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;

    setForm({
      ...form,
      deviceCategory: selectedCategory
    });

    // KEEP OTHER CATEGORY LOGIC INTACT
    // BUT ONLY BROADCAST IF NO COLLECTOR WAS CHOSEN
    if (selectedCategory === "Other" && !form.collectorId) {
      setIsBroadcastToAllCollectors(true);
    } else {
      setIsBroadcastToAllCollectors(false);
      setCustomCategory("");
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, phone: value });
  };

  // =========================
  // VALIDATION
  // =========================

  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[279][0-9]{7}$/.test(form.phone)) {
      newErrors.phone = "Enter valid Omani number (8 digits, starts with 2, 7, or 9)";
    }

    if (!form.deviceCategory.trim()) {
      newErrors.deviceCategory = "Category is required";
    }

    if (form.deviceCategory === "Other") {
      if (!customCategory.trim()) {
        newErrors.customCategory = "Please enter a custom category";
      }
    }

    if (!form.device.trim()) newErrors.device = "Device is required";

    if (!form.condition.trim()) {
      newErrors.condition = "Condition is required";
    }

    if (!form.address.trim()) {
      newErrors.address = "Please select location from map";
    }

    if (!form.collectorId.trim()) {
      newErrors.collectorId = "Please select a collector from map";
    }

    if (!image) {
      newErrors.image = "Please upload an image of the device";
    }

    if (!form.dateTime) {
      newErrors.dateTime = "Date & Time is required";
    } else if (!isValidDateTime(form.dateTime)) {
      newErrors.dateTime =
        "Only Sunday–Thursday (08:00–17:00), no Friday/Saturday, no past dates";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) {
      alert("You must be logged in.");
      return;
    }

    const formData = new FormData();

   Object.entries(form).forEach(([key, value]) => {
  if (key !== "collectorId") {
    formData.append(key, value);
  }
});
formData.append("collectorId", form.collectorId || "");

    formData.append("category", category);
    formData.append("requestType", "DropOff");

    if (customCategory) {
      formData.append("customCategory", customCategory);
    }

    const shouldBroadcast =
  form.deviceCategory === "Other" &&
  (!form.collectorId || form.collectorId === "");

    formData.append(
      "isBroadcastToAllCollectors",
      shouldBroadcast
    );

    
    if (image) {
      formData.append("image", image);
    }
        try {
      const response = await fetch(
        "http://localhost:5000/api/dropoffs/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert(
          "Drop-Off request submitted successfully to " +
            selectedCenter.companyName +
            "!"
        );

        setForm({
          name: "",
          email: "",
          phone: "",
          deviceCategory: "",
          device: "",
          condition: "",
          dateTime: "",
          address: "",
          collectorId: "",
        });

        setImage(null);
        setImagePreview(null);
        setSelectedCenter(null);
        setCustomCategory("");
        setIsBroadcastToAllCollectors(false);

      } else {
        alert(result.message || "Error submitting request");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // =========================
  // MARKER CLICK
  // =========================

  const handleMarkerClick = (collector) => {
    setSelectedCenter({
      id: collector._id,
      companyName: collector.companyName,
      position: [collector.location.lat, collector.location.lng],
      address: collector.address,
      phone: collector.phone,
      hours: collector.openHr,
    });

    setForm(prev => ({
      ...prev,
      address: collector.address,
      collectorId: collector._id,
    }));

    // IMPORTANT FIX
    // once collector selected manually
    // disable broadcasting completely
    setIsBroadcastToAllCollectors(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);

      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  // =========================
  // FILTER COLLECTORS
  // =========================

  const filteredCollectors = isBroadcastToAllCollectors
    ? collectors
    : form.deviceCategory
    ? collectors.filter(
        c =>
          c.acceptedCategories &&
          c.acceptedCategories.includes(
            form.deviceCategory
          )
      )
    : collectors;

  const styles = {
    page: {
      fontFamily:
        "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      minHeight: "100vh",
      background:
        "linear-gradient(135deg, #f5f7fa 0%, #c3d2e5 100%)"
    },

    navbar: {
      backgroundColor: "#0080AA",
      color: "white"
    },

    header: {
      padding: "20px",
      background: "white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      marginBottom: "20px"
    },

    headerTitle: {
      textAlign: "center",
      color: "#0080AA",
      fontSize: "28px",
      fontWeight: "bold",
      margin: "15px 0 10px"
    },

    headerSubtitle: {
      textAlign: "center",
      color: "#666",
      fontSize: "14px",
      marginBottom: "10px"
    },

    mainWrapper: {
      display: "flex",
      justifyContent: "space-between",
      padding: "30px",
      gap: "30px",
      maxWidth: "1300px",
      margin: "0 auto",
      flexWrap: "wrap"
    },

    formContainer: {
      border: "none",
      borderRadius: "12px",
      padding: "25px",
      width: "420px",
      background: "white",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      flex: "0 0 auto"
    },

    label: {
      display: "block",
      fontWeight: "600",
      color: "#0080AA",
      marginBottom: "6px",
      fontSize: "13px"
    },

    input: {
      width: "100%",
      padding: "11px",
      marginBottom: "15px",
      border: "2px solid #e0e0e0",
      borderRadius: "8px",
      fontSize: "14px",
      transition: "all 0.3s",
      boxSizing: "border-box"
    },

    inputFocus: {
      borderColor: "#0080AA",
      boxShadow: "0 0 0 3px rgba(0, 128, 170, 0.1)"
    },

    error: {
      color: "#d32f2f",
      fontSize: "12px",
      marginTop: "-12px",
      marginBottom: "12px",
      fontWeight: "500"
    },

    button: {
      backgroundColor: "#0080AA",
      color: "#fff",
      border: "none",
      padding: "12px",
      borderRadius: "8px",
      width: "100%",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: "15px",
      transition: "all 0.3s",
      marginTop: "10px"
    },

    buttonHover: {
      backgroundColor: "#005a7a"
    },

    imageContainer: {
      marginBottom: "15px",
      padding: "12px",
      border: "2px dashed #0080AA",
      borderRadius: "8px",
      textAlign: "center",
      background: "#f5f9fc",
      cursor: "pointer",
      transition: "all 0.3s"
    },

    imagePreview: {
      maxWidth: "100%",
      maxHeight: "120px",
      borderRadius: "6px",
      marginTop: "10px"
    },

    collectorInfo: {
      marginTop: "20px",
      padding: "15px",
      border: "2px solid #0080AA",
      borderRadius: "8px",
      background: "#f0f8fc",
      color: "#003d5c"
    },

    mapContainer: {
      flex: 1,
      height: "600px",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      minWidth: "400px"
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div
          style={{
            paddingLeft: "20px",
            paddingTop: "10px"
          }}
        >
          <FaArrowLeft
            onClick={() =>
              location.state?.from
                ? navigate(location.state.from)
                : navigate(-1)
            }
            style={{
              cursor: "pointer",
              fontSize: "20px",
              color: "#0080AA"
            }}
          />
        </div>

        <h2 style={styles.headerTitle}>
          ♻️ Schedule Your Drop-Off
        </h2>

        <p style={styles.headerSubtitle}>
          Choose a nearby collection center and complete your request
        </p>
      </div>

            <div style={styles.mainWrapper}>
        <form style={styles.formContainer} onSubmit={handleSubmit}>
          {form.name && (
            <p
              style={{
                marginBottom: "10px",
                color: "#0080AA",
                fontWeight: "bold"
              }}
            >
              Hi {form.name}! 😊 Let’s get your drop-off ready!
            </p>
          )}

          <label style={styles.label}>Name</label>
          <input
            name="name"
            placeholder="Name"
            style={styles.input}
            value={form.name}
            readOnly
          />

          <label style={styles.label}>Email</label>
          <input
            name="email"
            placeholder="Email"
            style={styles.input}
            value={form.email}
            readOnly
          />

          <label style={styles.label}>Phone</label>
          <input
            name="phone"
            placeholder="Phone"
            style={styles.input}
            value={form.phone}
            onChange={handlePhoneChange}
          />
          {errors.phone && (
            <p style={styles.error}>{errors.phone}</p>
          )}

          <label style={styles.label}>
            Device Category *
          </label>

          <select
            name="deviceCategory"
            style={styles.input}
            value={form.deviceCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Select Category</option>

            {allCategories.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>

          {errors.deviceCategory && (
            <p style={styles.error}>
              {errors.deviceCategory}
            </p>
          )}

          {form.deviceCategory === "Other" && (
            <>
              <label style={styles.label}>
                Custom Category *
              </label>

              <input
                type="text"
                placeholder="e.g., Furniture with electronics, Custom gadget"
                style={styles.input}
                value={customCategory}
                onChange={(e) =>
                  setCustomCategory(e.target.value)
                }
              />

              {errors.customCategory && (
                <p style={styles.error}>
                  {errors.customCategory}
                </p>
              )}
            </>
          )}

          <label style={styles.label}>
            Device Name *
          </label>

          <input
            name="device"
            placeholder="e.g., iPhone 12, Laptop"
            style={styles.input}
            value={form.device}
            onChange={handleChange}
          />

          {errors.device && (
            <p style={styles.error}>{errors.device}</p>
          )}

          <label style={styles.label}>
            Device Condition *
          </label>

          <input
            name="condition"
            placeholder="e.g., Working, Broken"
            style={styles.input}
            value={form.condition}
            onChange={handleChange}
          />

          {errors.condition && (
            <p style={styles.error}>
              {errors.condition}
            </p>
          )}

          <label style={styles.label}>
            Collection Center *
          </label>

          <input
            name="address"
            placeholder="Address (auto-filled from map)"
            style={styles.input}
            value={form.address}
            readOnly
          />

          {errors.address && (
            <p style={styles.error}>{errors.address}</p>
          )}

          {errors.collectorId && (
            <p style={styles.error}>
              {errors.collectorId}
            </p>
          )}

          <label style={styles.label}>
            Date & Time *
          </label>

          <input
            type="datetime-local"
            name="dateTime"
            style={styles.input}
            value={form.dateTime}
            min={getMinDateTime()}
            onChange={handleDateChange}
          />

          {errors.dateTime && (
            <p style={styles.error}>
              {errors.dateTime}
            </p>
          )}

          <label style={styles.label}>
            Device Image *
          </label>

          <div style={styles.imageContainer}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              id="imageInput"
            />

            <label
              htmlFor="imageInput"
              style={{
                cursor: "pointer",
                display: "block"
              }}
            >
              <FaCamera
                size={24}
                style={{
                  color: "#0080AA",
                  marginBottom: "8px"
                }}
              />

              <p
                style={{
                  margin: "0",
                  color: "#0080AA",
                  fontWeight: "600",
                  fontSize: "14px"
                }}
              >
                {image ? "Change Image" : "Upload Image"}
              </p>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#888",
                  fontSize: "12px"
                }}
              >
                Click to select photo
              </p>
            </label>

            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                style={styles.imagePreview}
              />
            )}
          </div>

          {errors.image && (
            <p style={styles.error}>{errors.image}</p>
          )}

          <button
            type="submit"
            style={styles.button}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor =
                styles.buttonHover.backgroundColor)
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor =
                styles.button.backgroundColor)
            }
          >
            ✓ Confirm Drop-Off
          </button>

          {selectedCenter && (
            <div style={styles.collectorInfo}>
              <strong
                style={{
                  fontSize: "16px",
                  color: "#0080AA"
                }}
              >
                📍 Selected Center
              </strong>
              <br />

              <div
                style={{
                  marginTop: "10px",
                  lineHeight: "1.8"
                }}
              >
                <strong>
                  {selectedCenter.companyName}
                </strong>
                <br />

                <span style={{ fontSize: "13px" }}>
                  📍 {selectedCenter.address}
                  <br />
                  📞 {selectedCenter.phone}
                  <br />
                  🕒 {selectedCenter.hours}
                </span>
              </div>
            </div>
          )}
        </form>

        <div style={styles.mapContainer}>
          <MapContainer
            center={[23.5859, 58.4059]}
            zoom={11}
            style={{
              height: "100%",
              width: "100%"
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {filteredCollectors.map((collector) => (
              <Marker
                key={collector._id}
                position={[
                  collector.location.lat,
                  collector.location.lng
                ]}
                eventHandlers={{
                  click: () =>
                    handleMarkerClick(collector)
                }}
              >
                <Tooltip>
                  {collector.companyName}
                </Tooltip>

                <Popup>
                  {collector.companyName}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default DropOff;