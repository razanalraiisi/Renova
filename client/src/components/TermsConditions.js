import { Container, Row, Col, Card, CardBody } from "reactstrap";
import "./Components.css";

const TermsConditions = () => {
  return (
    <Container className="legal-container">
      <Row className="justify-content-center">
        <Col md="10">
          <h2 className="legal-title">Terms & Conditions</h2>

          <Card className="legal-card">
            <CardBody>

              <h5>1. Introduction</h5>
              <p>
                Welcome to Renova – E-Waste Recycling Management System.
                By accessing or using our platform, you agree to comply with
                and be bound by these Terms and Conditions.
              </p>

              <h5>2. Purpose of the Platform</h5>
              <p>
                Renova provides users with a digital system to schedule,
                manage, and monitor electronic waste recycling services.
                The platform connects users with authorized recycling
                collectors and facilities.
              </p>

              <h5>3. User Responsibilities</h5>
              <p>
                Users must provide accurate and complete information when
                registering or submitting recycling requests. Any misuse,
                false reporting, or illegal disposal of electronic waste
                through the platform is strictly prohibited.
              </p>

              <h5>4. Recycling Compliance</h5>
              <p>
                All e-waste collected through Renova must comply with
                local environmental regulations in Oman. Users agree not
                to submit hazardous or prohibited materials outside the
                defined e-waste categories.
              </p>

              <h5>5. Limitation of Liability</h5>
              <p>
                Renova is not responsible for delays, damages, or losses
                resulting from third-party collectors or unforeseen
                operational issues. The system acts as a facilitator
                between users and recycling services.
              </p>

              <h5>6. Account Termination</h5>
              <p>
                Renova reserves the right to suspend or terminate accounts
                that violate these terms or misuse the platform.
              </p>

              <h5>7. Changes to Terms</h5>
              <p>
                We may update these Terms and Conditions periodically.
                Continued use of the platform constitutes acceptance of
                any modifications.
              </p>

            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TermsConditions;
