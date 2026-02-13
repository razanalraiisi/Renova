import {
  Container,
  Row,
  Col,
  Card,
  CardBody
} from "reactstrap";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import "./Components.css";

const Support = () => {
  return (
    <Container className="support-container">
      <Row className="justify-content-center">
        <Col md="6">
          <h2 className="support-title">Support Center</h2>

          <Card className="support-card text-center">
            <CardBody>
              <p className="support-text">
                Need assistance? Our team is here to help you.
                Feel free to reach out to us through the contact details below.
              </p>

              <div className="support-contact-item">
                <FaEnvelope className="support-icon" />
                <span>support@renova.com</span>
              </div>

              <div className="support-contact-item">
                <FaPhoneAlt className="support-icon" />
                <span>+968 99552311</span>
              </div>

              <div className="support-contact-item">
                <FaMapMarkerAlt className="support-icon" />
                <span>Muscat, Oman</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Support;
