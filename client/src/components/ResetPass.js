import { Container, Row, Col, FormGroup, Label, Button, Navbar, NavbarBrand } from "reactstrap";
import logo from "../assets/logo.png";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { TbLockPassword } from "react-icons/tb";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const resetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:5000/reset-password", {
        email,
        newPassword: password,
      });

      alert("Password reset successfully");
      navigate("/login");
    } catch (err) {
      alert("Failed to reset password");
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

              <FormGroup>
                <TbLockPassword /> <Label>New Password</Label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <TbLockPassword /> <Label>Confirm Password</Label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
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
    </>
  );
};

export default ResetPassword;
