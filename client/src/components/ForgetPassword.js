import { Container, Row, Col, FormGroup, Label, Button, Navbar, NavbarBrand } from "reactstrap";
import logo from "../assets/logo.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlineAttachEmail } from "react-icons/md";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const requestOTP = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/forgot-password", { email });
      navigate("/VerifyOtp", { state: { email } });
    } catch (err) {
      alert("Email not found");
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
                  required
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
    </>
  );
};

export default ForgetPassword;
