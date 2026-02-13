
import { Container,Row, Col,Button} from "reactstrap";
import logo from '../assets/logo.png';
import { FaXTwitter } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";
import { FaYoutube } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="footer">
      <Row>
        <Col>
        <div><FaXTwitter /><RiInstagramFill /><FaYoutube /><FaLinkedin /></div>
        <div><img src={logo} style={{width:"150px",height:"150px"}}></img></div>
        
        </Col>
        <Col>
        <h6>Quick Links</h6><ul className="list-unstyled quick-links">
              <li><a href="/">Home</a></li>
              <li><a href="/FAQ">FAQS</a></li>
              <li><a href="/support">Support</a></li>
              <li><a href="/AboutUs">About Us</a></li>
            </ul></Col>
        <Col><h6>Contact Information</h6>
        <p>Renova.om@hotmail.com</p>
            <p>+968 99552311</p>
            <p>Sunday - Thursday (8AM-5PM)</p></Col>
        <Col><h6>Legal</h6>
        <ul className="list-unstyled legal-links">
              <li><a href="/terms">Terms & Conditions</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul></Col>
      </Row>
      <Row><p>We are committed to reducing e-waste and promoting a circular economy in Oman.</p></Row>
      
      
    </footer>
    )
}
export default Footer;