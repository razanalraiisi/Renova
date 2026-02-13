import React, { useState } from "react";
import axios from "axios";
import { Button, FormGroup, Label, Input, Navbar, NavbarBrand } from "reactstrap";
import { Snackbar, Alert } from "@mui/material";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleVerify = async () => {
    try {
      if (otp.length !== 6) {
        throw new Error("OTP must be 6 digits");
      }

      await axios.post("http://localhost:5000/verify-otp", { email, otp });

      setSnackbar({
        open: true,
        message: "OTP verified successfully!",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/ResetPassword", { state: { email } });
      }, 1500);

    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || "Invalid or expired OTP",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Navbar className="my-2" style={{ backgroundColor: "#0080AA" }}>
        <NavbarBrand href="/" style={{ color: "white" }}>
          <img src={logo} alt="logo" width="40" />
          ReNova
        </NavbarBrand>
      </Navbar>

      <div
        style={{
          width: "400px",
          margin: "60px auto",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          backgroundColor: "white",
        }}
      >
        <h3 className="text-center" style={{ fontWeight: "600" }}>
          Verify Your Code
        </h3>

        <p className="text-center mt-2" style={{ fontSize: "0.9rem", color: "#666" }}>
          Enter the 6-digit verification code sent to your email
        </p>

        <FormGroup className="mt-4">
          <Label style={{ fontWeight: "500" }}>OTP Code</Label>
          <Input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setOtp(value);
            }}
            style={{
              textAlign: "center",
              fontSize: "1.5rem",
              letterSpacing: "10px",
              height: "60px",
              borderRadius: "12px",
            }}
          />
        </FormGroup>

        <Button
          style={{
            backgroundColor: "#006D90",
            width: "100%",
            marginTop: "10px",
            borderRadius: "10px",
          }}
          onClick={handleVerify}
        >
          Verify
        </Button>
      </div>

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

export default VerifyOtp;
