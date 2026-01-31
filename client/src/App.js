import './App.css';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Home from './components/Home.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Row } from 'reactstrap';
import { useSelector } from 'react-redux';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import RegisterCollector from './components/RegisterCollector.js';
import ForgetPassword from './components/ForgetPassword.js';
import ResetPassword from './components/ResetPass.js';
import AdminDash from './components/AdminDash';
import UserDash from './components/UserDash';
import CollectorDash from './components/CollectorDash';
import AdminCollectorRequests from './components/AdminCollectorRequests.js';
import VerifyOtp from './components/VerifyOtp.js';
import NewRecycleRequest from './components/NewRecycleRequest.js';
import AboutUs from './components/AboutUs.js';
import FAQ from './components/FAQ.js';
import AdminFAQ from './components/AdminFAQ.js';
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard";


function App() {
  // ✅ safer (won’t crash if state.users.user is null)
  const email = useSelector((state) => state.users?.user?.email);

  return (
    <Container fluid className="appBG">
      <Router>
        <Row>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/registerCollector" element={<RegisterCollector />} />
            <Route path="/ForgetPassword" element={<ForgetPassword />} />
            <Route path="/ResetPassword" element={<ResetPassword />} />
            <Route path="/VerifyOtp" element={<VerifyOtp />} />
            <Route path="/NewRecycleRequest" element={<NewRecycleRequest/>} />
            <Route path="/AboutUs" element={<AboutUs/>} />
            <Route path="/FAQ" element={<FAQ/>} />
            <Route path="/AdminFAQ" element={<AdminFAQ/>} />

            {/* Existing dashboards (keep them working) */}
            <Route path="/UserDash" element={<UserDash />} />
            <Route path="/CollectorDash" element={<CollectorDash />} />
            <Route path="/NewRecycleRequest" element={<NewRecycleRequest />} />

            {/* ✅ Existing admin requests page (keep) */}
            <Route path="/AdminCollectorRequests" element={<AdminCollectorRequests />} />

            {/* ✅ NEW admin routes using your prototype layout */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              }
            />

            {/* OPTIONAL: if you want collector requests to also use AdminLayout */}
            <Route
              path="/admin/collector-requests"
              element={
                <AdminLayout>
                  <AdminCollectorRequests />
                </AdminLayout>
              }
            />
          </Routes>
        </Row>

        <Row>
          <Footer />
        </Row>
      </Router>
    </Container>
  );
}

export default App;
