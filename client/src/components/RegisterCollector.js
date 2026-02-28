import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Navbar, NavbarBrand } from "reactstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser, resetState } from "../features/UserSlice";
import { UserRegisterSchemaValidation } from "../validations/UserRegisterSchemaValidation";
import ValidationInput from "../components/ValidationInput";
import logo from "../assets/logo.png";

const DEFAULT_PROFILE_PIC =
  "https://icon-library.com/images/profiles-icon/profiles-icon-0.jpg";

const RegisterCollector = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [uname, setUname] = useState("");
  const [pic, setPic] = useState("");
  const [phone, setPhone] = useState("");
  const [isUser, setIsUser] = useState(true);

  const [collectorType, setCollectorType] = useState("");
  const [acceptedCategories, setAcceptedCategories] = useState([]);
  const [address, setAddress] = useState("");
  const [openHr, setOpenHr] = useState("8:00 AM - 6:00 PM");
  const [locationConsent, setLocationConsent] = useState(false);
  const [coords, setCoords] = useState(null);

  const [collectorTypeError, setCollectorTypeError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [openHrError, setOpenHrError] = useState("");
  const [locationError, setLocationError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message, isSuccess, isError } = useSelector((state) => state.users);

  const { register: hookRegister, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(UserRegisterSchemaValidation),
  });

  const getCurrentLocation = () => {
    console.log("Getting location...");
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return alert("Geolocation not supported");
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location success:", position.coords);
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.log("Location error:", error);
        alert("Unable to retrieve location");
      }
    );
  };

  const handleNextStep = () => {
    if (!collectorType) {
      setCollectorTypeError("Collector type is required");
      return;
    }
    setCollectorTypeError("");
    setStep(2);
  };

  const submitCollector = () => {
    let ok = true;
    if (acceptedCategories.length === 0) {
      setCategoriesError("Select at least one category");
      ok = false;
    } else setCategoriesError("");
    if (!openHr.trim()) {
      setOpenHrError("Opening hours required");
      ok = false;
    } else setOpenHrError("");
    if (!address.trim()) {
      setAddressError("Address required");
      ok = false;
    } else setAddressError("");
    if (!locationConsent) {
      setLocationError("Consent required for location");
      ok = false;
    } else if (!coords) {
      setLocationError("Location not detected");
      ok = false;
    } else setLocationError("");

    if (!ok) return;

    const data = {
      role: "collector",
      companyName: uname,
      collectorType,
      acceptedCategories,
      address,
      openHr,
      email,
      password,
      phone,
      pic: pic.trim() ? pic : DEFAULT_PROFILE_PIC,
      location: coords,
      locationConsent,
    };

    dispatch(addUser(data));
  };

  useEffect(() => {
    if (isSuccess) {
      dispatch(resetState());
      alert("Collector registration submitted. Please wait for admin approval.");
      navigate("/login");
    }
    if (isError) alert(message || "Registration failed");
  }, [isSuccess, isError, message, navigate, dispatch]);

  return (
    <>
      {/* NAVBAR */}
      <Navbar
        style={{
          backgroundColor: "#0080AA",
          padding: "10px 30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <NavbarBrand href="/" style={{ color: "white", fontWeight: "600" }}>
          <img
            alt="logo"
            src={logo}
            style={{ height: 40, width: 40, marginRight: 10 }}
          />
          ReNova
        </NavbarBrand>
        <div className="ms-auto d-flex gap-2">
          <Button
            href="/Login"
            style={{
              backgroundColor: "white",
              color: "#0080AA",
              border: "none",
              padding: "8px 18px",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            Sign In
          </Button>
          <Button
            href="/Register"
            style={{
              backgroundColor: "#006D90",
              color: "white",
              border: "none",
              padding: "8px 18px",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            Sign Up
          </Button>
        </div>
      </Navbar>

      {/* FORM */}
      <Container
        fluid
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f9fb",
          paddingTop: "50px",
          paddingBottom: "50px",
        }}
      >
        <Row style={{ width: "100%", maxWidth: "600px" }}>
          <Col>
            <form
              onSubmit={
                step === 1 ? handleSubmit(handleNextStep) : handleSubmit(submitCollector)
              }
              style={{
                background: "white",
                padding: "40px",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            >
              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <div className="text-center mb-4">
                    <img
                      src={logo}
                      width="90"
                      alt="Logo"
                      style={{ marginBottom: "10px" }}
                    />
                    <h4 style={{ fontWeight: "600", color: "#0080AA" }}>
                      Register Collector
                    </h4>
                    <p style={{ fontSize: "14px", color: "#666" }}>
                      Step 1: Company & Account Info
                    </p>
                  </div>

                  {/* TOGGLE */}
                  <div
                    style={{
                      display: "flex",
                      borderRadius: "12px",
                      overflow: "hidden",
                      marginBottom: "20px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      onClick={() => navigate("/register")}
                      style={{
                        flex: 1,
                        padding: "10px 0",
                        cursor: "pointer",
                        backgroundColor: isUser ? "#4DA6FF" : "#fff",
                        color: isUser ? "#fff" : "#000",
                        fontWeight: "600",
                        textAlign: "center",
                        transition: "0.3s",
                      }}
                    >
                      User
                    </div>
                    <div
                      onClick={() => setIsUser(false)}
                      style={{
                        flex: 1,
                        padding: "10px 0",
                        cursor: "default",
                        backgroundColor: !isUser ? "#4DA6FF" : "#fff",
                        color: !isUser ? "#fff" : "#000",
                        fontWeight: "600",
                        textAlign: "center",
                        transition: "0.3s",
                      }}
                    >
                      Collector
                    </div>
                  </div>

                  <Row>
                    <Col md={6}>
                      <ValidationInput label="Company Name" error={errors.uname?.message}>
                        <input
                          {...hookRegister("uname")}
                          value={uname}
                          onChange={(e) => setUname(e.target.value)}
                          placeholder="Company Name"
                          className={`form-control ${errors.uname ? "input-error" : ""}`}
                          style={{ borderRadius: "8px", padding: "10px" }}
                        />
                      </ValidationInput>
                    </Col>
                    <Col md={6}>
                      <ValidationInput label="Collector Type" error={collectorTypeError}>
                        <select
                          value={collectorType}
                          onChange={(e) => setCollectorType(e.target.value)}
                          className={`form-control ${collectorTypeError ? "input-error" : ""}`}
                          style={{ borderRadius: "8px", padding: "10px" }}
                        >
                          <option value="">Select Collector Type</option>
                          <option value="individual">Individual Collector</option>
                          <option value="private_company">Private Collection Company</option>
                          <option value="government_approved">Government-Approved Collector</option>
                          <option value="recycling_center">Recycling Center</option>
                          <option value="scrap_dealer">Scrap Dealer / Scrap Yard</option>
                          <option value="ngo">NGO / Community Organization</option>
                          <option value="retailer_program">Retailer Take-Back Program</option>
                          <option value="corporate_collector">Corporate Collector</option>
                          <option value="logistics_partner">Transport & Logistics Partner</option>
                          <option value="hazardous_specialist">
                            Specialized Hazardous Waste Collector
                          </option>
                        </select>
                      </ValidationInput>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={6}>
                      <ValidationInput label="Email" error={errors.email?.message}>
                        <input
                          {...hookRegister("email")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email"
                          className={`form-control ${errors.email ? "input-error" : ""}`}
                          style={{ borderRadius: "8px", padding: "10px" }}
                        />
                      </ValidationInput>
                    </Col>
                    <Col md={6}>
                      <ValidationInput label="Password" error={errors.password?.message}>
                        <div style={{ position: "relative" }}>
                          <input
                            {...hookRegister("password")}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create password"
                            type={showPassword ? "text" : "password"}
                            className={`form-control ${errors.password ? "input-error" : ""}`}
                            style={{ borderRadius: "8px", padding: "10px 40px 10px 10px" }}
                          />
                          <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: "#0080AA",
                              fontWeight: "600",
                            }}
                          >
                            {showPassword ? "Hide" : "Show"}
                          </span>
                        </div>
                      </ValidationInput>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={6}>
                      <ValidationInput label="Phone" error={errors.phone?.message}>
                        <input
                          {...hookRegister("phone")}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Omani phone"
                          className={`form-control ${errors.phone ? "input-error" : ""}`}
                          style={{ borderRadius: "8px", padding: "10px" }}
                        />
                      </ValidationInput>
                    </Col>
                    <Col md={6}>
                      <ValidationInput label="Profile Pic URL" error={errors.pic?.message}>
                        <input
                          {...hookRegister("pic")}
                          value={pic}
                          onChange={(e) => setPic(e.target.value)}
                          placeholder="Profile Pic URL"
                          className={`form-control ${errors.pic ? "input-error" : ""}`}
                          style={{ borderRadius: "8px", padding: "10px" }}
                        />
                      </ValidationInput>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-center mt-4">
                    <Button type="submit" style={{ backgroundColor: "#006D90", padding: "10px 20px" }}>
                      Next
                    </Button>
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <div className="text-center mb-4">
                    <h4 style={{ fontWeight: "600", color: "#0080AA" }}>
                      Accepted Categories & Location
                    </h4>
                    <p style={{ fontSize: "14px", color: "#666" }}>
                      Step 2: Services & Address
                    </p>
                  </div>

                  <ValidationInput label="Accepted Categories" error={categoriesError}>
                    <div
                      className={`category-box ${categoriesError ? "input-error" : ""}`}
                      style={{
                        height: "180px",
                        overflowY: "auto",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        padding: "10px",
                        backgroundColor: "#F8F9FA",
                      }}
                    >
                      {[
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
                      ].map((cat) => (
                        <div key={cat}>
                          <input
                            type="checkbox"
                            checked={acceptedCategories.includes(cat)}
                            onChange={() =>
                              setAcceptedCategories((prev) =>
                                prev.includes(cat)
                                  ? prev.filter((c) => c !== cat)
                                  : [...prev, cat]
                              )
                            }
                            style={{ marginRight: 8 }}
                          />
                          {cat}
                        </div>
                      ))}
                    </div>
                  </ValidationInput>

                  <Row className="mt-3">
                    <Col md={6}>
                      <ValidationInput label="Opening Hours" error={openHrError}>
                        <input
                          value={openHr}
                          onChange={(e) => setOpenHr(e.target.value)}
                          className={`form-control ${openHrError ? "input-error" : ""}`}
                          placeholder="8:00 AM - 6:00 PM"
                          style={{ borderRadius: "8px", padding: "10px" }}
                        />
                      </ValidationInput>
                    </Col>
                    <Col md={6}>
                      <ValidationInput label="Address" error={addressError}>
                        <input
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className={`form-control ${addressError ? "input-error" : ""}`}
                          placeholder="Address"
                          style={{ borderRadius: "8px", padding: "10px" }}
                        />
                      </ValidationInput>
                    </Col>
                  </Row>

                  <div className="mt-3">
                    <input
                      type="checkbox"
                      checked={locationConsent}
                      onChange={(e) => {
                        setLocationConsent(e.target.checked);
                        if (e.target.checked) getCurrentLocation();
                        else setCoords(null);
                      }}
                      style={{ marginRight: 8 }}
                    />
                    I consent to share my current location to appear on the map.
                    {locationError && (
                      <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                        {locationError}
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <Button type="button" style={{ backgroundColor: "#6c757d" }} onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="submit" style={{ backgroundColor: "#006D90" }}>
                      Register
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default RegisterCollector;