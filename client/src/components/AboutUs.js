import { FcGlobe } from "react-icons/fc";
import { TbTargetArrow } from "react-icons/tb";
import { FcInfo } from "react-icons/fc";

const AboutUs = () => {
  return (
    <div style={{padding:'30px', margin:'10px'}}>   
        <h2 style={{color:'#006D90', textAlign:'center'}}>About Us</h2>
        <br/>
        <h4 style={{color:'#006D90'}}><FcInfo /> Who We Are</h4>
        <p>ReNova is a smart, user-friendly web platform designed to help people in Oman manage electronic waste responsibly. 
        Our mission is to reduce environmental harm by making e-waste disposal, recycling, and upcycling simple, accessible,
        and intelligent for every citizen.
        We combine AI-powered identification, location-based center mapping, and community-driven awareness tools to encourage sustainable habits and support a greener Oman.</p>
        <h4 style={{color:'#006D90'}}><FcGlobe /> Our Mission</h4>
        <p>To empower individuals, families, and communities in Oman to adopt responsible e-waste practices through 
        technology, education, and accessible recycling options.</p>
        <h4 style={{color:'#006D90'}}><TbTargetArrow /> Our Vision</h4>
        <p>A future where Oman becomes a leader in sustainable e-waste management, aligned with Oman Vision 2040
        building a circular economy, protecting the environment, and promoting smart digital transformation.</p>
    </div>
    );
    }
    export default AboutUs;