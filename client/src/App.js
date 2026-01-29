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

function App() {
  const email = useSelector((state) => state.users.user.email);

  return (
    <Container fluid className='appBG'>
      <Router>
        <Row>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/registerCollector" element={<RegisterCollector />} />
            <Route path="/AdminDash" element={<AdminDash />} />
            <Route path="/UserDash" element={<UserDash />} />
            <Route path="/CollectorDash" element={<CollectorDash />} />
            <Route path="/ForgetPassword" element={<ForgetPassword />} />
            <Route path="/ResetPassword" element={<ResetPassword />} />
            <Route path="/AdminCollectorRequests" element={<AdminCollectorRequests />} />
            <Route path="/VerifyOtp" element={<VerifyOtp />} />
            <Route path="/NewRecycleRequest" element={<NewRecycleRequest/>} />
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
