import {
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  Navbar,
  NavbarBrand
} from "reactstrap";
import logo from "../assets/logo.png";
import { UserSchemaValidation } from "../validations/userSchemaValidation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUser, resetState } from "../features/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ValidationInput from "../components/ValidationInput";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // added

  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.user);
  const isSuccess = useSelector((state) => state.users.isSuccess);
  const isError = useSelector((state) => state.users.isError);
  const message = useSelector((state) => state.users.message);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors }
  } = useForm({ resolver: yupResolver(UserSchemaValidation) });

  const validate = () => {
    dispatch(resetState());
    dispatch(getUser({ email, password, rememberMe })); // send rememberMe
  };

  useEffect(() => {
    if (isSuccess && user?.role) {
      const role = String(user.role).toLowerCase();

      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "collector") navigate("/CollectorDash");
      else navigate("/start");

      dispatch(resetState());
    }
  }, [isSuccess, user, navigate, dispatch]);

  return (
    <>
      {/* NAVBAR */}
      <Navbar
        style={{
          backgroundColor: "#0080AA",
          padding: "10px 30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
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
              fontWeight: "600"
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
              fontWeight: "600"
            }}
          >
            Sign Up
          </Button>
        </div>
      </Navbar>

      {/* FORM SECTION */}
      <Container
        fluid
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f9fb"
        }}
      >
        <Row style={{ width: "100%", maxWidth: "450px" }}>
          <Col>
            <form
              onSubmit={submitForm(validate)}
              style={{
                background: "white",
                padding: "40px",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
              }}
            >
              {/* LOGO */}
              <div className="text-center mb-4">
                <img
                  alt="Logo"
                  src={logo}
                  width="90"
                  style={{ marginBottom: "10px" }}
                />
                <h4 style={{ fontWeight: "600", color: "#0080AA" }}>
                  Welcome Back
                </h4>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  Sign in to continue
                </p>
              </div>

              {/* EMAIL */}
              <ValidationInput label="Email" error={errors.email?.message}>
                <input
                  {...register("email", {
                    value: email,
                    onChange: (e) => setEmail(e.target.value)
                  })}
                  placeholder="Enter your email"
                  type="email"
                  className={`form-control ${errors.email ? "input-error" : ""}`}
                  style={{ borderRadius: "8px", padding: "10px" }}
                />
              </ValidationInput>

              {/* PASSWORD */}
              <ValidationInput label="Password" error={errors.password?.message}>
                <div style={{ position: "relative" }}>
                  <input
                    {...register("password", {
                      value: password,
                      onChange: (e) => setPassword(e.target.value)
                    })}
                    placeholder="Enter your password"
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

              {/* REMEMBER + FORGOT */}
              <FormGroup className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <Input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)} // bind checkbox
                  />{" "}
                  <Label className="mb-0">Remember Me</Label>
                </div>

                <Link
                  to="/ForgetPassword"
                  style={{
                    color: "#0080AA",
                    fontSize: "14px",
                    textDecoration: "none",
                    fontWeight: "500"
                  }}
                >
                  Forget password?
                </Link>
              </FormGroup>

              {/* BUTTON */}
              <FormGroup className="mt-4">
                <Button
                  type="submit"
                  style={{
                    backgroundColor: "#006D90",
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    border: "none",
                    transition: "0.3s"
                  }}
                >
                  Sign In
                </Button>
              </FormGroup>

              {/* ERROR */}
              {isError && (
                <FormGroup>
                  <p
                    style={{
                      textAlign: "center",
                      color: "red",
                      fontSize: "14px",
                      marginTop: "10px"
                    }}
                  >
                    {message || "Login failed"}
                  </p>
                </FormGroup>
              )}
            </form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Login;
