import React from "react";
import "./AdminPages.css";

export default function AdminFooter() {
  return (
    <footer className="renovaFooter">
      <div className="footerCols">
        <div className="footerCol">
          <div className="footerSocialRow">
            <span className="footerIcon">✕</span>
            <span className="footerIcon">📷</span>
            <span className="footerIcon">▶</span>
            <span className="footerIcon">in</span>
          </div>
          <div className="footerLogoBlock">
            <div className="footerLogo">♻️</div>
            <div className="footerTextSmall">
              We are committed to reducing e-waste and promoting a circular economy in Oman.
            </div>
          </div>
        </div>

        <div className="footerCol">
          <div className="footerHead">Quick Links</div>
          <div className="footerLink">Home</div>
          <div className="footerLink">E-waste Library</div>
          <div className="footerLink">Contact Map</div>
          <div className="footerLink">Request Pickup</div>
          <div className="footerLink">FAQs</div>
          <div className="footerLink">Support</div>
          <div className="footerLink">About Us</div>
        </div>

        <div className="footerCol">
          <div className="footerHead">Contact Information</div>
          <div className="footerText">renova@gmail.com</div>
          <div className="footerText">+968 99552311</div>
          <div className="footerText">Sunday – Thursday (8AM–5PM)</div>
        </div>

        <div className="footerCol">
          <div className="footerHead">Legal</div>
          <div className="footerLink">Terms & Conditions</div>
          <div className="footerLink">Privacy Policy</div>
          <div className="footerLink">Data Protection Policy</div>
        </div>
      </div>
    </footer>
  );
}
