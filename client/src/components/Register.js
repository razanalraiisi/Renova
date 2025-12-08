import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Navbar, NavbarBrand } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addUser } from '../features/UserSlice';
import { UserRegisterSchemaValidation } from '../validations/UserRegisterSchemaValidation';
import ValidationInput from '../components/ValidationInput';
import logo from '../assets/logo.png';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uname, setUname] = useState('');
  const [pic, setPic] = useState('');
  const [phone, setPhone] = useState('');

  const [centerMessage, setCenterMessage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { message, isSuccess, isError } = useSelector(state => state.users);

  const { register: hookRegister, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(UserRegisterSchemaValidation)
  });

  const submit = () => {
    dispatch(addUser({ role: 'user', uname, email, password, phone, pic }));
  };

  useEffect(() => {
    if (isSuccess) {
      setCenterMessage({
        type: "success",
        text: "🎉 Registration Successful! Redirecting..."
      });

      setTimeout(() => {
        setCenterMessage(null);
        navigate('/login');
      }, 3000);
    }

    if (isError) {
      setCenterMessage({
        type: "error",
        text: message || "Registration Failed"
      });

      setTimeout(() => setCenterMessage(null), 3000); 
    }
  }, [isSuccess, isError, message, navigate]);

  return (
    <>
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

      <Navbar className="my-2" style={{ backgroundColor: "#0080AA" }}>
        <NavbarBrand href="/" style={{ color: "white" }}>
          <img alt="logo" src={logo} style={{ height: 40, width: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>

        <div className="ms-auto d-flex gap-2">
          <Button href="/Login" style={{ backgroundColor: "white", color: "#0080AA", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "600" }}>Sign In</Button>
          <Button href="/Register" style={{ backgroundColor: "#006D90", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "600" }}>Sign Up</Button>
        </div>
      </Navbar>

      <Container fluid>
        <Row className='div-row'>
          <Col md='6' className='div-col'>
            <form className='div-form' onSubmit={handleSubmit(submit)}>
              <div className="text-center">
                <img src={logo} width="150" height="150" alt="Logo" />
              </div>

              <div className="text-center mb-4">
                <label>
                  <input type="radio" name="choice" value="user" defaultChecked /> User
                </label>
                <label style={{ marginLeft: "15px" }}>
                  <input type="radio" name="choice" value="collector" onClick={() => navigate('/registerCollector')} /> Collector
                </label>
              </div>

              <ValidationInput label="Full Name" error={errors.uname?.message}>
                <input
                  {...hookRegister('uname')}
                  value={uname}
                  onChange={e => setUname(e.target.value)}
                  className={`form-control ${errors.uname ? "input-error" : ""}`}
                  placeholder="Full name"
                />
              </ValidationInput>

              <ValidationInput label="Email" error={errors.email?.message}>
                <input
                  {...hookRegister('email')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`form-control ${errors.email ? "input-error" : ""}`}
                  placeholder="Email"
                  type="email"
                />
              </ValidationInput>

              <ValidationInput label="Password" error={errors.password?.message} showPasswordRules={true}>
                <input
                  {...hookRegister('password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`form-control ${errors.password ? "input-error" : ""}`}
                  placeholder="Create a password"
                  type="password"
                />
              </ValidationInput>

              <ValidationInput label="Phone" error={errors.phone?.message}>
                <input
                  {...hookRegister('phone')}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className={`form-control ${errors.phone ? "input-error" : ""}`}
                  placeholder="Omani phone (8 digits, starts 2/7/9)"
                />
              </ValidationInput>

              <ValidationInput label="Profile Picture URL" error={errors.pic?.message}>
                <input
                  {...hookRegister('pic')}
                  value={pic}
                  onChange={e => setPic(e.target.value)}
                  className={`form-control ${errors.pic ? "input-error" : ""}`}
                  placeholder="Profile Pic URL"
                />
              </ValidationInput>

              <div className="d-flex justify-content-center">
                <Button type="submit" style={{ backgroundColor: "#006D90" }}>Register</Button>
              </div>
            </form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Register;
