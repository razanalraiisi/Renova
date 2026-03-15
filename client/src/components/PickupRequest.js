import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Navbar, NavbarBrand } from "reactstrap";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import logo from "../assets/logo.png";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

const PickupRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || "Pickup";

  const [defaultValues, setDefaultValues] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    device: "",
    condition: "",
    deviceCategory: ""
  });
  const [image, setImage] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const requestType = location.state?.requestType || "Pickup Request";

  const allCategories = [
    "Small Electronics","Large Electronics","Home Appliances (Small)","Home Appliances (Large)","IT & Office Equipment",
    "Kitchen & Cooking Appliances","Entertainment Devices","Personal Care Electronics","Tools & Outdoor Equipment",
    "Lighting Equipment","Medical & Fitness Devices","Batteries & Accessories"
  ];

  const schema = Yup.object().shape({
    phone: Yup.string().required("Phone is required").matches(/^[0-9]+$/, "Phone must be numbers only").min(7),
    address: Yup.string().required("Address is required"),
    deviceCategory: Yup.string().required("Category is required"),
    device: Yup.string().required("Device is required"),
    condition: Yup.string().required("Condition is required").max(100),
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
    if (storedUser) {
      setValue("name", storedUser.uname || "");
      setValue("email", storedUser.email || "");
      setValue("phone", storedUser.phone || "");
      setDefaultValues({
        name: storedUser.uname || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
        address: "",
        device: "",
        condition: "",
        deviceCategory: ""
      });
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", defaultValues.name);
    formData.append("email", defaultValues.email);
    formData.append("phone", data.phone);
    formData.append("address", data.address);
    formData.append("deviceCategory", data.deviceCategory);
    formData.append("device", data.device);
    formData.append("condition", data.condition);
    formData.append("requestType", "Pickup");
    formData.append("category", category);
    if (image) formData.append("image", image);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to submit a request.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/pickups/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setShowSnackbar(true);
        reset();
        setTimeout(() => setShowSnackbar(false), 3000);
      } else {
        alert(result.message || "Error submitting request");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Server error");
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Navbar style={{ backgroundColor: "#0080AA", padding: "0 40px" }}>
        <NavbarBrand tag={Link} to="/" style={{ color: "white", display: "flex", alignItems: "center" }}>
          <img src={logo} alt="logo" style={{ height: 40, width: 40, marginRight: 10 }} /> ReNova
        </NavbarBrand>
        <div style={{ display: "flex", alignItems: "center", fontSize: 24, color: "white", cursor: "pointer" }}>
          <FaUserCircle onClick={() => navigate("/UserDash")} title={user?.uname || "User"} />
        </div>
      </Navbar>

      <div style={{ padding: "10px 30px" }}>
        <FaArrowLeft style={{ color: "#0080AA", cursor: "pointer", fontSize: 22 }} onClick={() => navigate("/start")} />
      </div>

      <main style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ border: "1px solid #ccc", borderRadius: 6, padding: 30, maxWidth: 450, width: "100%" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: 20, color: "#0078a8" }}>Pickup Request</h2>

          <input type="hidden" value={requestType} />

          <label>Name</label>
          <input type="text" value={defaultValues.name} readOnly style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 4, backgroundColor: "#f1f1f1" }} />

          <label>Email</label>
          <input type="email" value={defaultValues.email} readOnly style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 4, backgroundColor: "#f1f1f1" }} />

          <label>Phone</label>
          <input type="text" {...register("phone")} placeholder="Phone" style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #ccc" }} />
          {errors.phone && <div style={{ color: "red", fontSize: 12 }}>{errors.phone.message}</div>}

          <label>Address</label>
          <input type="text" {...register("address")} placeholder="Address" style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #ccc" }} />
          {errors.address && <div style={{ color: "red", fontSize: 12 }}>{errors.address.message}</div>}

          <label>Electronic Category</label>
          <select {...register("deviceCategory")} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #ccc" }}>
            <option value="">Select Category</option>
            {allCategories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
          </select>
          {errors.deviceCategory && <div style={{ color: "red", fontSize: 12 }}>{errors.deviceCategory.message}</div>}

          <label>Device</label>
          <input type="text" {...register("device")} placeholder="Device" style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #ccc" }} />
          {errors.device && <div style={{ color: "red", fontSize: 12 }}>{errors.device.message}</div>}

          <label>Condition</label>
          <input type="text" {...register("condition")} placeholder="Condition" style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 4, border: "1px solid #ccc" }} />
          {errors.condition && <div style={{ color: "red", fontSize: 12 }}>{errors.condition.message}</div>}

          <label>Upload Picture</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ width: "100%", marginBottom: 10 }} />

          <button type="submit" style={{ backgroundColor: "#0078a8", color: "#fff", border: "none", padding: 10, borderRadius: 20, fontWeight: "bold", width: "100%" }}>Request Pickup</button>
        </form>
      </main>

      {showSnackbar && (
        <div style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", background: "#28a745", color: "#fff", padding: "14px 24px", borderRadius: 8, fontWeight: "bold", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
          Pickup Request Submitted Successfully
        </div>
      )}
    </div>
  );
};

export default PickupRequest;