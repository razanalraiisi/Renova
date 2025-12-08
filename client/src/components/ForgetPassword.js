import { Container, Row, Col, FormGroup, Label, Input, Button,Navbar,
    NavbarBrand, } from 'reactstrap';
import logo from '../assets/logo.png';
import { UserSchemaValidation } from '../validations/userSchemaValidation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUser } from '../features/UserSlice';
import {useDispatch,useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { MdOutlineAttachEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";


const ForgetPassword = () => {

  
    let [email, setEmail] = useState('');
    let [password, setPassword] = useState('');
    const dispatch=useDispatch();
    const user=useSelector((state)=>state.users.user);
    const isSuccess=useSelector((state)=>state.users.isSuccess);
    const isError=useSelector((state)=>state.users.isError);
    const navigate=useNavigate();


    const {
        register,
        handleSubmit: submitForm,
        formState: { errors }
    } = useForm({ resolver: yupResolver(UserSchemaValidation) });

    const validate = () => {
        const data={
            email:email,
            password:password,
        }
        dispatch(getUser(data));
    }

    useEffect(()=>{
        if(user&&isSuccess)
            navigate("/home");
        if(isError)
            navigate("/");
    },[user,isSuccess,isError]);

    return (
        <>
            <Navbar
                className="my-2"
                style={{ backgroundColor: "#0080AA" }}
            >
                <NavbarBrand href="/" style={{ color: "white" }}>
                    <img
                        alt="logo"
                        src={logo}
                        style={{
                            height: 40,
                            width: 40,
                            marginRight: 10
                        }}
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
                        <form className='div-form'>
                            <div>
                                <img alt='Logo' className='img-fluid rounded mx-auto d-block' src={logo} width="150px" height="150px"></img>
                                <h3 className='text-center mt-3'>Forget Password</h3>
                                <p className='text-center mt-3'>Please enter the email address you’d like your password reset information sent to</p>
                            </div>
                            
                            <FormGroup>
                                <MdOutlineAttachEmail /> <Label>Email</Label>
                                <input
                                    {...register('email', {
                                        value: email,
                                        onChange: (e) => setEmail(e.target.value)
                                    })}
                                    placeholder='Please Enter your Email here...'
                                    type='email' className='form-control' />
                                <p style={{ color: 'red' }}>{errors.email?.message}</p>
                            </FormGroup>
                            
                            
                            
                            <FormGroup className="d-flex justify-content-between mt-4">
                                <Button
                                    href="/login"
                                    style={{ backgroundColor: "#6c757d" }}
                                >
                                    Back
                                </Button>

                                <Button
                                    type="submit"
                                    style={{ backgroundColor: "#006D90" }}
                                >
                                    Request Reset Link
                                </Button>
                            </FormGroup>
                            
                            
                        </form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default ForgetPassword;