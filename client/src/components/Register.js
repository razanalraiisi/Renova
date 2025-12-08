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
      alert("Registration successful!");
      navigate('/login');
    }
    if (isError) {
      alert(message || 'Registration failed');
    }
  }, [isSuccess, isError, message, navigate]);

  return (
    <>
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

              <ValidationInput
                label="Password"
                error={errors.password?.message}
                showPasswordRules={true}   // rules box only here & in collector
              >
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
