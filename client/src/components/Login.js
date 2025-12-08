import { Container, Row, Col, FormGroup, Label, Input, Button, Navbar, NavbarBrand } from 'reactstrap';
import logo from '../assets/logo.png';
import { UserSchemaValidation } from '../validations/userSchemaValidation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUser } from '../features/UserSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ValidationInput from '../components/ValidationInput';

const Login = () => {
  let [email, setEmail] = useState('');
  let [password, setPassword] = useState('');
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
    const data = { email, password };
    dispatch(getUser(data));
  };

  useEffect(() => {
    if (isSuccess && user && Object.keys(user).length > 0) {
      const role = user.role || (user.user && user.user.role) || user?.role;
      if (role === 'admin') navigate('/AdminDash');
      else if (role === 'collector') navigate('/CollectorDash');
      else navigate('/UserDash');
    }
  }, [user, isSuccess, navigate]);

  return (
    <>
      <Navbar className="my-2" style={{ backgroundColor: "#0080AA" }}>
        <NavbarBrand href="/" style={{ color: "white" }}>
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
              padding: "8px 16px",
              borderRadius: "6px",
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
              padding: "8px 16px",
              borderRadius: "6px",
              fontWeight: "600"
            }}
          >
            Sign Up
          </Button>
        </div>
      </Navbar>

      <Container fluid>
        <Row className='div-row'>
          <Col md='6' className='div-col'>
            <form className='div-form' onSubmit={submitForm(validate)}>
              <div>
                <img
                  alt='Logo'
                  className='img-fluid rounded mx-auto d-block'
                  src={logo}
                  width="150px"
                  height="150px"
                />
              </div>

              <ValidationInput label="Email" error={errors.email?.message}>
                <input
                  {...register('email', {
                    value: email,
                    onChange: (e) => setEmail(e.target.value)
                  })}
                  placeholder='Enter your email'
                  type='email'
                  className={`form-control ${errors.email ? "input-error" : ""}`}
                />
              </ValidationInput>

              <ValidationInput label="Password" error={errors.password?.message}>
                <input
                  {...register('password', {
                    value: password,
                    onChange: (e) => setPassword(e.target.value)
                  })}
                  placeholder='Enter your password'
                  type='password'
                  className={`form-control ${errors.password ? "input-error" : ""}`}
                />
              </ValidationInput>

              <FormGroup>
                <Input type='checkbox' />
                <Label> Remember Me</Label>
                <div className='float-end'>
                  <Link to='/ForgetPassword'>Forget password?</Link>
                </div>
              </FormGroup>

              <FormGroup className="d-flex justify-content-center">
                <Button type="submit" style={{ backgroundColor: "#006D90" }}>
                  Sign In
                </Button>
              </FormGroup>

              {isError && (
                <FormGroup>
                  <p className="error-text" style={{ textAlign: 'center' }}>
                    {message || 'Login failed'}
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
