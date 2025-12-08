import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    NavbarText,
} from 'reactstrap';
import { useState } from 'react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { FaHome, FaUserAlt,FaSignOutAlt   } from "react-icons/fa";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    return (
        <>
             <Navbar className="navigation" color="primary" dark expand="md">
                  <div className="container">
                    <NavbarBrand href="/">
                      <img src={logo}alt="ReNova Logo" width="150" />
                    </NavbarBrand>
                    <NavbarToggler onClick={toggle} />
                    <Collapse isOpen={isOpen} navbar>
                      <Nav className="ms-auto" navbar>
                        <NavItem>
                          <NavLink tag={Link} to="/sign-in">Sign In</NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink tag={Link} to="/sign-up">Sign Up</NavLink>
                        </NavItem>
                      </Nav>
                    </Collapse>
                  </div>
                </Navbar>
        </>
    )
}
export default Header;