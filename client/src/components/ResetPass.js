import { Container, Row, Col, FormGroup, Label, Button, Navbar, NavbarBrand, InputGroup, InputGroupText, Input } from "reactstrap";
import logo from "../assets/logo.png";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { TbLockPassword } from "react-icons/tb";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import * as yup from "yup";
import { Snackbar, Alert } from "@mui/material";

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

      // Backend MUST check if new password equals old password
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
      <Navbar className="my-2" style={{ backgroundColor: "#0080AA" }}>
        <NavbarBrand href="/" style={{ color: "white" }}>
          <img alt="logo" src={logo} style={{ height: 40, width: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>
      </Navbar>

      <Container fluid>
        <Row className="div-row">
          <Col md="6" className="div-col">
            <form className="div-form" onSubmit={resetPassword}>
              <div>
                <img alt="Logo" className="img-fluid rounded mx-auto d-block" src={logo} width="150" />
                <h3 className="text-center mt-3">Reset Your Password</h3>
                <p className="text-center mt-3">
                  Enter a new password below to change your password.
                </p>
              </div>

              {/* New Password */}
              <FormGroup>
                <TbLockPassword /> <Label>New Password</Label>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputGroupText
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroupText>
                </InputGroup>
              </FormGroup>

              {/* Confirm Password */}
              <FormGroup>
                <TbLockPassword /> <Label>Confirm Password</Label>
                <InputGroup>
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <InputGroupText
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </InputGroupText>
                </InputGroup>
              </FormGroup>

              <FormGroup className="d-flex justify-content-between mt-4">
                <Button href="/ForgetPassword" style={{ backgroundColor: "#6c757d" }}>
                  Back
                </Button>

                <Button type="submit" style={{ backgroundColor: "#006D90" }}>
                  Reset Password
                </Button>
              </FormGroup>
            </form>
          </Col>
        </Row>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{
            width: "320px",
            fontSize: "0.85rem",
            padding: "6px 12px",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ResetPassword;
