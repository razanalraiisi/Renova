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
import UserDash from './components/UserDash';
import CollectorDash from './components/CollectorDash';
import VerifyOtp from './components/VerifyOtp.js';
import NewRecycleRequest from './components/NewRecycleRequest.js';
import AboutUs from './components/AboutUs.js';
import FAQ from './components/FAQ.js';
import AdminFAQ from './components/AdminFAQ.js';
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard"; 
import Start from "./components/Start.js";
import Recycle from './components/Recycle.js';
import Upcycle from './components/Upcycle.js';
import Dispose from './components/Dispose.js';
import DecideForMe from './components/DecideForMe.js';
import CollectorRequestsHistory from './components/CollectorRequestsHistory.js';
import UserRequestHistory from './components/UserHistoryRequests.js';
import CollectorProfile from './components/CollectorProfile.js';
import AdminCollectorRequests from "./components/AdminCollectorRequests";
import AdminManageCollectors from "./components/AdminManageCollectors";



// Admin – Reports
import RecyclesReport from "./components/RecyclesReport";
import DisposalsReport from "./components/DisposalsReport";
import CollectorsReport from "./components/CollectorsReport";
import UsersReport from "./components/UsersReport";

function App() {
  const email = useSelector((state) => state.users?.user?.email);

  return (
    <Container fluid className="appBG">
      <Router>
        <Row>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/registerCollector" element={<RegisterCollector />} />
            <Route path="/ForgetPassword" element={<ForgetPassword />} />
            <Route path="/ResetPassword" element={<ResetPassword />} />
            <Route path="/VerifyOtp" element={<VerifyOtp />} />
            <Route path="/NewRecycleRequest" element={<NewRecycleRequest />} />
            <Route path="/AboutUs" element={<AboutUs />} />
            <Route path="/FAQ" element={<FAQ />} />
            <Route path="/AdminFAQ" element={<AdminFAQ />} />
            <Route path="/start" element={<Start />} />
            <Route path="/recycle" element={<Recycle />} />
            <Route path="/upcycle" element={<Upcycle />} />
            <Route path="/dispose" element={<Dispose />} />
            <Route path="/decideForMe" element={<DecideForMe />} />
            <Route path="/CollectorRequestsHistory" element={<CollectorRequestsHistory />} />
            <Route path="/UserRequestHistory" element={<UserRequestHistory />} />
            <Route path="/CollectorProfile" element={<CollectorProfile />} />

            {/* Dashboard routes */}
            <Route path="/UserDash" element={<UserDash />} />
            <Route path="/CollectorDash" element={<CollectorDash />} />

            {/* Admin requests page */}
            <Route path="/AdminCollectorRequests" element={<AdminCollectorRequests />} />

            {/* Admin routes using AdminLayout */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/collector-requests"
              element={
                <AdminLayout>
                  <AdminCollectorRequests />
                </AdminLayout>
              }
            />
            <Route path="/admin/collectors-requests" element={<AdminCollectorRequests />} />
            <Route path="/admin/manage-collectors" element={<AdminManageCollectors />} />
            <Route path="/admin/reports/recycles" element={<RecyclesReport />} />
            <Route path="/admin/reports/disposals" element={<DisposalsReport />} />
            <Route path="/admin/reports/collectors" element={<CollectorsReport />} />
            <Route path="/admin/reports/users" element={<UsersReport />} />


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
