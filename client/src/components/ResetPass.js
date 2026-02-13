import { Container, Row, Col, Button, Navbar, NavbarBrand } from "reactstrap";
import logo from "../assets/logo.png";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { TbLockPassword } from "react-icons/tb";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Snackbar, Alert } from "@mui/material";
import * as yup from "yup";

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(4, "Minimum 4 characters")
    .max(10, "Maximum 10 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/\d/, "Must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must contain one special character"),
});

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const resetPassword = async (e) => {
    e.preventDefault();

    try {
      await passwordSchema.validate({ password });

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      await axios.post("http://localhost:5000/reset-password", {
        email,
        newPassword: password,
      });

      setSnackbar({
        open: true,
        message: "Password reset successfully!",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to reset password",
        severity: "error",
      });
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <Navbar className="my-2" style={{ backgroundColor: "#0080AA", padding: "10px 30px" }}>
        <NavbarBrand href="/" style={{ color: "white", fontWeight: "600" }}>
          <img alt="logo" src={logo} style={{ height: 40, width: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>
      </Navbar>

      {/* FORM SECTION */}
      <Container
        fluid
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f9fb",
        }}
      >
        <Row style={{ width: "100%", maxWidth: "450px" }}>
          <Col>
            <form
              onSubmit={resetPassword}
              style={{
                background: "white",
                padding: "40px",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="text-center mb-4">
                <img src={logo} alt="Logo" width="120" height="120" style={{ marginBottom: "15px" }} />
                <h4 style={{ color: "#0080AA", fontWeight: "600" }}>Reset Your Password</h4>
                <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
                  Enter a new password below to change your password
                </p>
              </div>

              {/* NEW PASSWORD */}
              <div style={{ position: "relative", marginBottom: "15px" }}>
                <TbLockPassword
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "12px",
                    transform: "translateY(-50%)",
                    color: "#0080AA",
                    fontSize: "20px",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 40px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "14px",
                  }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#0080AA",
                    fontSize: "16px",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* CONFIRM PASSWORD */}
              <div style={{ position: "relative", marginBottom: "20px" }}>
                <TbLockPassword
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "12px",
                    transform: "translateY(-50%)",
                    color: "#0080AA",
                    fontSize: "20px",
                  }}
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 40px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "14px",
                  }}
                />
                <span
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#0080AA",
                    fontSize: "16px",
                  }}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* BUTTONS */}
              <div className="d-flex justify-content-between mt-3">
                <Button
                  type="button"
                  onClick={() => navigate("/ForgetPassword")}
                  style={{
                    backgroundColor: "#6c757d",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontWeight: "600",
                  }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  style={{
                    backgroundColor: "#006D90",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontWeight: "600",
                  }}
                >
                  Reset Password
                </Button>
              </div>
            </form>
          </Col>
        </Row>
      </Container>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: "320px", fontSize: "0.85rem", padding: "6px 12px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ResetPassword;
