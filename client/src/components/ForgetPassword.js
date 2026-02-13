import { Container, Row, Col, FormGroup, Button, Navbar, NavbarBrand } from "reactstrap";
import logo from "../assets/logo.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlineAttachEmail } from "react-icons/md";
import * as yup from "yup";
import { Snackbar, Alert } from "@mui/material";

const emailSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
});

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const requestOTP = async (e) => {
    e.preventDefault();

    try {
      await emailSchema.validate({ email });

      await axios.post("http://localhost:5000/forgot-password", { email });

      setSnackbar({
        open: true,
        message: "Reset email sent successfully!",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/VerifyOtp", { state: { email } });
      }, 1800);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Email not found",
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
              onSubmit={requestOTP}
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
                <h4 style={{ color: "#0080AA", fontWeight: "600" }}>Forget Password</h4>
                <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
                  Enter the email address you’d like your password reset link sent to
                </p>
              </div>

              {/* EMAIL INPUT */}
              <div style={{ position: "relative", marginBottom: "20px" }}>
                <MdOutlineAttachEmail
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
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 40px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* BUTTONS */}
              <FormGroup className="d-flex justify-content-between mt-3">
                <Button
                  type="button"
                  onClick={() => navigate("/login")}
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
                  Request Reset Link
                </Button>
              </FormGroup>
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

export default ForgetPassword;
