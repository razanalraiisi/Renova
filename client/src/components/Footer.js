
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
              <li><a href="#">Home</a></li>
              <li><a href="#">E-Waste Library</a></li>
              <li><a href="#">Centers Map</a></li>
              <li><a href="#">Request Pickup</a></li>
              <li><a href="#">FAQS</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">About Us</a></li>
            </ul></Col>
        <Col><h6>Contact Information</h6>
        <p>Renova.om@hotmail.com</p>
            <p>+968 99552311</p>
            <p>Sunday - Thursday (BAM-5PM)</p></Col>
        <Col><h6>Legal</h6>
        <ul className="list-unstyled legal-links">
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Data Protection Policy</a></li>
            </ul></Col>
      </Row>
      <Row><p>We are committed to reducing e-waste and promoting a circular economy in Oman.</p></Row>
      
      
    </footer>
    )
}
export default Footer;