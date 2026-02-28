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

const DEFAULT_PROFILE_PIC = "https://icon-library.com/images/profiles-icon/profiles-icon-0.jpg";

const Register = () => {
  const [isUser, setIsUser] = useState(true); // toggle state: true = user, false = collector
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [uname, setUname] = useState("");
  const [pic, setPic] = useState("");
  const [phone, setPhone] = useState("");
  const [centerMessage, setCenterMessage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message, isSuccess, isError } = useSelector(state => state.users);

  const { register: hookRegister, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(UserRegisterSchemaValidation)
  });

  const submit = () => {
    if (isUser) {
      dispatch(addUser({
        role: "user",
        uname,
        email,
        password,
        phone,
        pic: pic.trim() ? pic : DEFAULT_PROFILE_PIC
      }));
    } else {
      navigate("/register-collector"); // go to collector form
    }
  };

  useEffect(() => {
    dispatch(resetState());

    if (isSuccess) {
      setCenterMessage({ type: "success", text: "Registration Successful! Redirecting..." });
      setTimeout(() => {
        setCenterMessage(null);
        navigate("/login");
      }, 3000);
    }

    if (isError) {
      setCenterMessage({ type: "error", text: message || "Registration Failed" });
      setTimeout(() => setCenterMessage(null), 3000);
    }
  }, [isSuccess, isError, message, navigate, dispatch]);

  return (
    <>
      {/* CENTER MESSAGE */}
      {centerMessage && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          padding: "15px 25px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          zIndex: 9999,
          textAlign: "center",
          fontWeight: "500",
          fontSize: "0.95rem",
          color: centerMessage.type === "success" ? "#0d8f44" : "#b40000",
          animation: "fadeIn 0.3s ease",
          maxWidth: "300px",
          wordWrap: "break-word"
        }}>
          {centerMessage.text}
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -48%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
          }
        `}
      </style>

      {/* NAVBAR */}
      <Navbar
        style={{ backgroundColor: "#0080AA", padding: "10px 30px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
      >
        <NavbarBrand href="/" style={{ color: "white", fontWeight: "600" }}>
          <img alt="logo" src={logo} style={{ height: 40, width: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>

        <div className="ms-auto d-flex gap-2">
          <Button href="/Login" style={{ backgroundColor: "white", color: "#0080AA", border: "none", padding: "8px 18px", borderRadius: "8px", fontWeight: "600" }}>
            Sign In
          </Button>
          <Button href="/Register" style={{ backgroundColor: "#006D90", color: "white", border: "none", padding: "8px 18px", borderRadius: "8px", fontWeight: "600" }}>
            Sign Up
          </Button>
        </div>
      </Navbar>

      {/* FORM */}
      <Container fluid style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f9fb",
        paddingBottom: "50px",
        paddingTop: "30px"
      }}>
        <Row style={{ width: "100%", maxWidth: "450px" }}>
          <Col>
            <form onSubmit={handleSubmit(submit)} style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
              {/* LOGO */}
              <div className="text-center mb-4">
                <img src={logo} width="90" alt="Logo" style={{ marginBottom: "10px" }} />
                <h4 style={{ fontWeight: "600", color: "#0080AA" }}>Create Account</h4>
                <p style={{ fontSize: "14px", color: "#666" }}>Sign up to continue</p>
              </div>

              {/* TOGGLE INSIDE FORM */}
              <div style={{ display: "flex", borderRadius: "12px", overflow: "hidden", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <div
                  onClick={() => setIsUser(true)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    cursor: "pointer",
                    backgroundColor: isUser ? "#4DA6FF" : "#fff",
                    color: isUser ? "#fff" : "#000",
                    fontWeight: "600",
                    textAlign: "center",
                    transition: "0.3s"
                  }}
                >
                  User
                </div>
                <div
                  onClick={() => {
                    setIsUser(false);
                    navigate("/registerCollector");
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    cursor: "pointer",
                    backgroundColor: !isUser ? "#4DA6FF" : "#fff",
                    color: !isUser ? "#fff" : "#000",
                    fontWeight: "600",
                    textAlign: "center",
                    transition: "0.3s"
                  }}
                >
                  Collector
                </div>
              </div>

              {/* FULL NAME */}
              <ValidationInput label="Full Name" error={errors.uname?.message}>
                <input
                  {...hookRegister("uname")}
                  value={uname}
                  onChange={e => setUname(e.target.value)}
                  placeholder="Full Name"
                  className={`form-control ${errors.uname ? "input-error" : ""}`}
                  style={{ borderRadius: "8px", padding: "10px" }}
                />
              </ValidationInput>

              {/* EMAIL */}
              <ValidationInput label="Email" error={errors.email?.message}>
                <input
                  {...hookRegister("email")}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  className={`form-control ${errors.email ? "input-error" : ""}`}
                  style={{ borderRadius: "8px", padding: "10px" }}
                />
              </ValidationInput>

              {/* PASSWORD */}
              <ValidationInput label="Password" error={errors.password?.message}>
                <div style={{ position: "relative" }}>
                  <input
                    {...hookRegister("password")}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create Password"
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
                      fontWeight: "600"
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </span>
                </div>
              </ValidationInput>

              {/* PHONE */}
              <ValidationInput label="Phone" error={errors.phone?.message}>
                <input
                  {...hookRegister("phone")}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Omani phone (8 digits, starts 2/7/9)"
                  className={`form-control ${errors.phone ? "input-error" : ""}`}
                  style={{ borderRadius: "8px", padding: "10px" }}
                />
              </ValidationInput>

              {/* PROFILE PIC */}
              <ValidationInput label="Profile Picture URL" error={errors.pic?.message}>
                <input
                  {...hookRegister("pic")}
                  value={pic}
                  onChange={e => setPic(e.target.value)}
                  placeholder="Profile Pic URL"
                  className={`form-control ${errors.pic ? "input-error" : ""}`}
                  style={{ borderRadius: "8px", padding: "10px" }}
                />
              </ValidationInput>

              {/* BUTTON */}
              <div className="mt-3">
                <Button type="submit" style={{ backgroundColor: "#006D90", width: "100%", padding: "10px", borderRadius: "10px", fontWeight: "600", border: "none" }}>
                  Register
                </Button>
              </div>
            </form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Register;