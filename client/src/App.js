import './App.css'; 
import './components/AdminTheme.css';
import './components/UserCollectorTheme.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Row } from 'reactstrap';
import { useSelector } from 'react-redux';


// Existing imports (KEEP ALL)
import Login from './components/Login.js';
import Register from './components/Register.js';
import Home from './components/Home.js';
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
import AdminReportsPage from "./components/AdminReportsPage";
// Reports
import RecyclesReport from "./components/RecyclesReport";
import DisposalsReport from "./components/DisposalsReport";
import UpcyclesReport from "./components/UpcyclesReport";
import UsersReport from "./components/UsersReport";
import DisposalsRecyclesUpcyclesReport from "./components/DisposalsRecyclesUpcyclesReport";
import AllRequestsReport from "./components/AllRequestsReport";
import AiRecommendationReport from "./components/AiRecommendationReport";
import AdminReportSummaryPage from "./components/AdminReportSummaryPage";
import AdminThemeSync from "./components/AdminThemeSync.js";
import CollectorNav from './components/CollectorNav.js';
import UserNavbar from './components/UserNavBar.js';
import AdminUserReports from './components/AdminUserReports.js';
import AdminRatings from './components/AdminRatings.js';
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

  // ✅ NEW: User layout wrapper
  const withUserNav = (Component) => {
  return () => (
    <div className="app-layout">
      <UserNavbar />
      <div className="page-content">
        <Component />
      </div>
    </div>
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
       
            {/* ✅ USER PAGES WITH NAVBAR */}
            <Route path="/start" element={withUserNav(Start)()} />
            <Route path="/UserDash" element={withUserNav(UserDash)()} />
            <Route path="/PickupRequest" element={withUserNav(PickupRequest)()} />
            <Route path="/DropOff" element={withUserNav(DropOff)()} />
            <Route path="/UserRequestHistory" element={withUserNav(UserRequestHistory)()} />
            <Route path="/EWasteLibrary" element={withUserNav(EWasteLibrary)()} />
            <Route path="/omanmap" element={withUserNav(OmanMap)()} />
            <Route path="/recycle" element={withUserNav(Recycle)()} />
            <Route path="/upcycle" element={withUserNav(Upcycle)()} />
            <Route path="/dispose" element={withUserNav(Dispose)()} />
            <Route path="/decideForMe" element={withUserNav(DecideForMe)()} />
            <Route path="/decision-result" element={withUserNav(DecisionResult)()} />

            {/* Collector pages automatically wrapped */}
            <Route path="/CollectorDash" element={withCollectorNav(CollectorDash)()} />
            <Route path="/CollectorProfile" element={withCollectorNav(CollectorProfile)()} />
            <Route path="/CollectorRequestsHistory" element={withCollectorNav(CollectorRequestsHistory)()} />
            <Route path="/CollectorNewRecycleRequest" element={withCollectorNav(NewRecycleRequest)()} />

            {/* Other routes (unchanged) */}
            <Route path="/admin/devices" element={<AdminEWasteLibrary />} />
            <Route path="/support" element={<Support />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/admin/dashboard/graphs" element={<AdminDashboardGraphs />} />
            <Route path="admin/user-reports" element={<AdminUserReports />} />
            {/* Admin routes */}
            <Route path="/AdminCollectorRequests" element={<AdminCollectorRequests />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
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
            <Route path="/admin/reports/ratings" element={<AdminRatings />} />
            <Route path="/admin/collectors-requests" element={<AdminCollectorRequests />} />
            <Route path="/admin/manage-collectors" element={<AdminManageCollectors />} />
            <Route path="/admin/reports/recycles" element={<RecyclesReport />} />
            <Route path="/admin/reports/disposals" element={<DisposalsReport />} />
            <Route path="/admin/reports/upcycles" element={<UpcyclesReport />} />
            <Route path="/admin/reports/disposals-recycles-upcycles" element={<DisposalsRecyclesUpcyclesReport />} />
            <Route path="/admin/reports/collectors" element={<Navigate to="/admin/manage-collectors" replace />} />
            <Route path="/admin/reports/users" element={<UsersReport />} />
            <Route path="/admin/reports/all-requests" element={<AllRequestsReport />} />
            <Route path="/admin/reports/ai-recommendations" element={<AiRecommendationReport />} />
            <Route path="/admin/reports/report-summary" element={<AdminReportSummaryPage />} />
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