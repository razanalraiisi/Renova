import React, { useState } from "react";
import axios from "axios";
import { Button, FormGroup, Label, Input, Navbar, NavbarBrand } from "reactstrap";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email; // passed from ForgetPassword.js

  const handleVerify = async () => {
    try {
      await axios.post("http://localhost:5000/verify-otp", { email, otp });
      navigate("/ResetPassword", { state: { email } });
    } catch (err) {
      alert("Invalid or expired OTP");
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

      <div style={{ width: "400px", margin: "50px auto" }}>
        <h3 className="text-center">Verify Your Code</h3>
        <p className="text-center">Enter the 6-digit verification code sent to your email</p>

        <FormGroup>
          <Label>OTP Code</Label>
          <Input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </FormGroup>

        <Button
          style={{ backgroundColor: "#006D90", width: "100%" }}
          onClick={handleVerify}
        >
          Verify
        </Button>
      </div>
    </>
  );
};

export default VerifyOtp;
