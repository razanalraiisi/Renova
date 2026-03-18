import './App.css'; 
import './components/AdminTheme.css';
import './components/UserCollectorTheme.css';
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
import EWasteLibrary from './components/EWasteLibrary.js';
import AdminEWasteLibrary from './components/AdminEWasteLibrary.js';
import OmanMap from './components/OmanMap.js';
import PickupRequest from './components/PickupRequest.js';
import DropOff from './components/DropOff .js';
import AdminDashboardGraphs from "./components/AdminDashboardGraphs";
import Support from './components/Support.js';
import TermsConditions from './components/TermsConditions.js';
import PrivacyPolicy from './components/PrivacyPolicy.js';
import AdminUserPage from './components/AdminUserPage.js';
import AdminMyRequests from './components/AdminMyRequests.js';
import DecisionResult from './components/DecisionResult.js';
// Admin – Reports
import RecyclesReport from "./components/RecyclesReport";
import DisposalsReport from "./components/DisposalsReport";
import CollectorsReport from "./components/CollectorsReport";
import UsersReport from "./components/UsersReport";
import DisposalsRecyclesUpcyclesReport from "./components/DisposalsRecyclesUpcyclesReport";
import AdminThemeSync from "./components/AdminThemeSync.js";
import CollectorNav from './components/CollectorNav.js'; 

function App() {
  const email = useSelector((state) => state.users?.user?.email);

  // Automatic collector layout wrapper
  const withCollectorNav = (Component) => {
    return () => (
      <>
        <CollectorNav />
        <div style={{ paddingTop: '70px' }}>
          <Component />
        </div>
      </>
    );
  };

  return (
    <Container fluid className="appBG">
      <Router>
        <AdminThemeSync />
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
            <Route path="/AboutUs" element={<AboutUs />} />
            <Route path="/FAQ" element={<FAQ />} />
            <Route path="/AdminFAQ" element={<AdminFAQ />} />
            <Route path="/start" element={<Start />} />
            <Route path="/recycle" element={<Recycle />} />
            <Route path="/upcycle" element={<Upcycle />} />
            <Route path="/dispose" element={<Dispose />} />
            <Route path="/decideForMe" element={<DecideForMe />} />
            <Route path="/decision-result" element={<DecisionResult />} />
            {/* Collector pages automatically wrapped */}
            <Route path="/CollectorDash" element={withCollectorNav(CollectorDash)()} />
            <Route path="/CollectorProfile" element={withCollectorNav(CollectorProfile)()} />
            <Route path="/CollectorRequestsHistory" element={withCollectorNav(CollectorRequestsHistory)()} />
            <Route path="/CollectorNewRecycleRequest" element={withCollectorNav(NewRecycleRequest)()} />

            {/* Other user routes */}
            <Route path="/UserRequestHistory" element={<UserRequestHistory />} />
            <Route path="/EWasteLibrary" element={<EWasteLibrary />} />
            <Route path="/admin/devices" element={<AdminEWasteLibrary />} />
            <Route path="/omanmap" element={<OmanMap />} />
            <Route path="/support" element={<Support />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/PickupRequest" element={<PickupRequest />} />
            <Route path="/DropOff" element={<DropOff />} />
        
            <Route path="/admin/dashboard/graphs" element={<AdminDashboardGraphs />} />

            {/* Dashboard routes */}
            <Route path="/UserDash" element={<UserDash />} />

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
            <Route path="/admin/reports/disposals-recycles-upcycles" element={<DisposalsRecyclesUpcyclesReport />} />
            <Route path="/admin/reports/collectors" element={<CollectorsReport />} />
            <Route path="/admin/reports/users" element={<UsersReport />} />
            <Route path="/admin/profile" element={<AdminUserPage />} />
            <Route path="/admin/my-requests" element={<AdminMyRequests />} />

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