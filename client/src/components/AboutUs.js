import { FcGlobe } from "react-icons/fc";
import { TbTargetArrow } from "react-icons/tb";
import { FcInfo } from "react-icons/fc";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Components.css";

function isCollectorSession() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user && String(user.role).toLowerCase() === "collector";
  } catch {
    return false;
  }
}

const AboutUs = () => {
  const navigate = useNavigate();
  const showCollectorBack = isCollectorSession();

  return (
    <div style={{ padding: "30px", margin: "10px", position: "relative" }}>
      {showCollectorBack && (
        <div className="about-us-back-row">
          <button
            type="button"
            className="admin-faq-back-btn"
            onClick={() => navigate("/CollectorDash")}
          >
            <FaArrowLeft aria-hidden />
            Back
          </button>
        </div>
      )}

      <h2 style={{ color: "#006D90", textAlign: "center" }}>About Us</h2>
      <br />
      <h4 style={{ color: "#006D90" }}>
        <FcInfo /> Who We Are
      </h4>
      <p>
        ReNova is a smart, user-friendly web platform designed to help people in
        Oman manage electronic waste responsibly. Our mission is to reduce
        environmental harm by making e-waste disposal, recycling, and upcycling
        simple, accessible, and intelligent for every citizen. We combine
        AI-powered identification, location-based center mapping, and
        community-driven awareness tools to encourage sustainable habits and
        support a greener Oman.
      </p>
      <h4 style={{ color: "#006D90" }}>
        <FcGlobe /> Our Mission
      </h4>
      <p>
        To empower individuals, families, and communities in Oman to adopt
        responsible e-waste practices through technology, education, and
        accessible recycling options.
      </p>
      <h4 style={{ color: "#006D90" }}>
        <TbTargetArrow /> Our Vision
      </h4>
      <p>
        A future where Oman becomes a leader in sustainable e-waste management,
        aligned with Oman Vision 2040 building a circular economy, protecting
        the environment, and promoting smart digital transformation.
      </p>
    </div>
  );
};

export default AboutUs;
