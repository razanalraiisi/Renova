import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from "react-icons/fa";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    const navigate = useNavigate();

   
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/'); 
    };

    return (
        <Navbar className="navigation" color="primary" dark expand="md">
            <div className="container">
                <NavbarBrand href="/">
                    <img src={logo} alt="ReNova Logo" width="150" />
                </NavbarBrand>
                <NavbarToggler onClick={toggle} />
                <Collapse isOpen={isOpen} navbar>
                    <Nav className="ms-auto" navbar>
                        {!isLoggedIn ? (
                            <>
                                <NavItem>
                                    <NavLink tag={Link} to="/sign-in">Sign In</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} to="/sign-up">Sign Up</NavLink>
                                </NavItem>
                            </>
                        ) : (
                            <>
                                <NavItem>
                                    <NavLink tag={Link} to="/user-dashboard">Dashboard</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink style={{ cursor: 'pointer' }} onClick={handleLogout}>
                                        <FaSignOutAlt style={{ marginRight: '5px' }} />
                                        Logout
                                    </NavLink>
                                </NavItem>
                            </>
                        )}
                    </Nav>
                </Collapse>
            </div>
        </Navbar>
    )
}

export default Header;
