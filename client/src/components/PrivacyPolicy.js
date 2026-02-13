import { Container, Row, Col, Card, CardBody } from "reactstrap";
import "./Components.css";

const PrivacyPolicy = () => {
  return (
    <Container className="legal-container">
      <Row className="justify-content-center">
        <Col md="10">
          <h2 className="legal-title">Privacy Policy</h2>

          <Card className="legal-card">
            <CardBody>

              <h5>1. Introduction</h5>
              <p>
                Renova – E-Waste Recycling Management System is committed
                to protecting your privacy and personal data. This Privacy
                Policy explains how we collect, use, and safeguard your
                information.
              </p>

              <h5>2. Information We Collect</h5>
              <p>
                We may collect personal information including your name,
                email address, phone number, and location when you create
                an account or request recycling services.
              </p>

              <h5>3. How We Use Your Information</h5>
              <p>
                Your information is used to:
                <ul>
                  <li>Process recycling requests</li>
                  <li>Connect you with authorized collectors</li>
                  <li>Send service updates and notifications</li>
                  <li>Improve system functionality and user experience</li>
                </ul>
              </p>

              <h5>4. Data Privacy & Protection</h5>
              <p>
                Renova implements appropriate security measures to protect
                user data against unauthorized access, alteration, or
                disclosure. Personal information is stored securely and
                accessed only by authorized personnel.
              </p>

              <h5>5. Data Sharing</h5>
              <p>
                We do not sell or trade personal information. Data may only
                be shared with verified recycling partners solely for the
                purpose of completing service requests.
              </p>

              <h5>6. Data Retention</h5>
              <p>
                User information is retained only as long as necessary to
                fulfill service purposes or comply with legal obligations.
              </p>

              <h5>7. Your Rights</h5>
              <p>
                Users may request to update, correct, or delete their
                personal data by contacting Renova support.
              </p>

              <h5>8. Policy Updates</h5>
              <p>
                Renova may revise this Privacy Policy from time to time.
                Updates will be reflected on this page.
              </p>

            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PrivacyPolicy;
