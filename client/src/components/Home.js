import { Container,Row, Col,Button,Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,} from "reactstrap";
import logo from '../assets/logo.png';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Login from './Login.js';
import Register from './Register.js';





const Home = () => {


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
      
      <Row>
        
        <Col>
          <Row>
            <Col>
              <div className="text-center mb-4">
                <img src={logo} width="300" />
                <h1>ReNova</h1>
                <h3 className="mt-3">Turn Your E-Waste Into a Greener Future</h3>
                <Button href="/Register" style={{backgroundColor:"#006D90"}}>Get Started</Button>
              </div>
            </Col>
          </Row>
          
        </Col>
      </Row>
    </Container>
    </>
  )
}
export default Home;