import { Container, Row, Col, FormGroup, Label, Button, Navbar, NavbarBrand } from "reactstrap";
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
      <Navbar className="my-2" style={{ backgroundColor: "#0080AA" }}>
        <NavbarBrand href="/" style={{ color: "white" }}>
          <img alt="logo" src={logo} style={{ height: 40, width: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>
      </Navbar>

      <Container fluid>
        <Row className="div-row">
          <Col md="6" className="div-col">
            <form className="div-form" onSubmit={requestOTP}>
              <div>
                <img alt="Logo" className="img-fluid rounded mx-auto d-block" src={logo} width="150" />
                <h3 className="text-center mt-3">Forget Password</h3>
                <p className="text-center mt-3">
                  Please enter the email address you’d like your password reset information sent to
                </p>
              </div>

              <FormGroup>
                <MdOutlineAttachEmail /> <Label>Email</Label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormGroup>

              <FormGroup className="d-flex justify-content-between mt-4">
                <Button href="/login" style={{ backgroundColor: "#6c757d" }}>
                  Back
                </Button>

                <Button type="submit" style={{ backgroundColor: "#006D90" }}>
                  Request Reset Link
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
            padding: "6px 12px"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ForgetPassword;
