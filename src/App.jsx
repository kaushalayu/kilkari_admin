import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import CenterDashboard from './pages/center-dashboard/CenterDashboard';
import VolunteerDashboard from './pages/volunteer-dashboard/VolunteerDashboard';
import SiteSettings from './pages/settings/SiteSettings';
import Hero from './pages/hero/Hero';
import Pages from './pages/pages/Pages';
import Events from './pages/events/Events';
import Projects from './pages/projects/Projects';
import Causes from './pages/causes/Causes';
import Blogs from './pages/blogs/Blogs';
import Stories from './pages/stories/Stories';
import Gallery from './pages/gallery/Gallery';
import Certificates from './pages/certificates/Certificates';
import Partners from './pages/partners/Partners';
import Team from './pages/team/Team';
import Volunteers from './pages/volunteers/Volunteers';
import Testimonials from './pages/testimonials/Testimonials';
import FAQs from './pages/faqs/FAQs';
import DonationDashboard from './pages/donations/DonationDashboard';
import Donors from './pages/donations/Donors';
import AllDonations from './pages/donations/AllDonations';
import CollectionReport from './pages/donations/CollectionReport';
import DonationReport from './pages/donations/DonationReport';
import QRManagement from './pages/donations/QRManagement';
import OfflineDonation from './pages/donations/OfflineDonation';
import DonorFieldSettings from './pages/donations/DonorFieldSettings';
import Contact from './pages/contact/Contact';
import Programs from './pages/programs/Programs';
import Counters from './pages/counters/Counters';
import Policies from './pages/policies/Policies';
import JoinNow from './pages/joinNow/JoinNow';
import PaymentSettings from './pages/paymentSettings/PaymentSettings';
import WhatsApp from './pages/whatsapp/WhatsApp';
import Profile from './pages/profile/Profile';
import NotFoundPage from './pages/notFound/NotFoundPage';
import Copyright from './pages/copyright/Copyright';
import PdfTemplates from './pages/pdfTemplates/PdfTemplates';
import Permissions from './pages/permissions/Permissions';
import CrowdFunding from './pages/crowd-funding/CrowdFunding';
import Centers from './pages/donations/Centers';
import Settlements from './pages/settlements/Settlements';
import Members from './pages/members/Members';
import Beneficiaries from './pages/beneficiaries/Beneficiaries';
import Finance from './pages/finance/Finance';
import MISReports from './pages/mis-reports/MISReports';
import DCCDashboard from './pages/dcc-staff/DCCDashboard';
import FundraiserDashboard from './pages/fundraiser/FundraiserDashboard';
import CampaignPublic from './pages/crowd-funding/CampaignPublic';
import DonorPortal from './pages/donor-portal/DonorPortal';
import MemberPortal from './pages/member-portal/MemberPortal';

const isAdmin = (role) => role === 'admin';
const isCenterAdmin = (role) => role === 'center_admin';
const isFullAccess = (role) => isAdmin(role);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loading">Loading...</div></div>;
  return user ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  const role = user?.role || '';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Role-based index route */}
        <Route index element={
          isCenterAdmin(role) ? <CenterDashboard /> :
          role === 'volunteer' ? <VolunteerDashboard /> :
          <Dashboard />
        } />
        <Route path="profile" element={<RoleRoute roles={['admin', 'center_admin', 'volunteer', 'team', 'dcc_staff', 'fundraiser']}><Profile /></RoleRoute>} />
        <Route path="center-dashboard" element={<RoleRoute roles={['center_admin']}><CenterDashboard /></RoleRoute>} />
        <Route path="volunteer-dashboard" element={<RoleRoute roles={['volunteer']}><VolunteerDashboard /></RoleRoute>} />
        {/* Content Management */}
        <Route path="blogs" element={<RoleRoute roles={['admin', 'editor', 'volunteer']}><Blogs /></RoleRoute>} />
        <Route path="events" element={<RoleRoute roles={['admin', 'editor', 'volunteer']}><Events /></RoleRoute>} />
        <Route path="projects" element={<RoleRoute roles={['admin', 'editor', 'volunteer']}><Projects /></RoleRoute>} />
        <Route path="causes" element={<RoleRoute roles={['admin', 'editor', 'volunteer']}><Causes /></RoleRoute>} />
        <Route path="stories" element={<RoleRoute roles={['admin', 'editor', 'volunteer']}><Stories /></RoleRoute>} />
        <Route path="programs" element={<RoleRoute roles={['admin', 'editor']}><Programs /></RoleRoute>} />
        <Route path="gallery" element={<RoleRoute roles={['admin', 'editor', 'volunteer']}><Gallery /></RoleRoute>} />
        <Route path="team" element={<RoleRoute roles={['admin', 'editor']}><Team /></RoleRoute>} />
        <Route path="partners" element={<RoleRoute roles={['admin', 'editor']}><Partners /></RoleRoute>} />
        <Route path="testimonials" element={<RoleRoute roles={['admin', 'editor']}><Testimonials /></RoleRoute>} />
        <Route path="faqs" element={<RoleRoute roles={['admin', 'editor']}><FAQs /></RoleRoute>} />
        <Route path="certificates" element={<RoleRoute roles={['admin', 'editor']}><Certificates /></RoleRoute>} />
        <Route path="counters" element={<RoleRoute roles={['admin', 'editor']}><Counters /></RoleRoute>} />
        <Route path="policies" element={<RoleRoute roles={['admin', 'editor']}><Policies /></RoleRoute>} />
        {/* Donor Management */}
        <Route path="donations" element={<RoleRoute roles={['admin', 'center_admin', 'dcc_staff']}><DonationDashboard /></RoleRoute>} />
        <Route path="donations/donors" element={<RoleRoute roles={['admin', 'center_admin', 'dcc_staff', 'fundraiser']}><Donors /></RoleRoute>} />
        <Route path="donations/all" element={<RoleRoute roles={['admin']}><AllDonations /></RoleRoute>} />
        <Route path="donations/offline" element={<RoleRoute roles={['admin', 'center_admin', 'dcc_staff', 'fundraiser']}><OfflineDonation /></RoleRoute>} />
        <Route path="donations/collection-report" element={<RoleRoute roles={['admin', 'center_admin']}><CollectionReport /></RoleRoute>} />
        <Route path="donations/report" element={<RoleRoute roles={['admin']}><DonationReport /></RoleRoute>} />
        <Route path="donations/qr" element={<RoleRoute roles={['admin']}><QRManagement /></RoleRoute>} />
        <Route path="donations/field-settings" element={<RoleRoute roles={['admin']}><DonorFieldSettings /></RoleRoute>} />
        <Route path="donations/centers" element={<RoleRoute roles={['admin', 'center_admin']}><Centers /></RoleRoute>} />
        {/* Site Settings */}
        <Route path="site-settings" element={<RoleRoute roles={['admin']}><SiteSettings /></RoleRoute>} />
        <Route path="hero" element={<RoleRoute roles={['admin', 'editor']}><Hero /></RoleRoute>} />
        <Route path="pages" element={<RoleRoute roles={['admin', 'editor']}><Pages /></RoleRoute>} />
        {/* Admin Modules */}
        <Route path="permissions" element={<RoleRoute roles={['admin']}><Permissions /></RoleRoute>} />
        <Route path="whatsapp" element={<RoleRoute roles={['admin']}><WhatsApp /></RoleRoute>} />
        <Route path="crowd-funding" element={<RoleRoute roles={['admin', 'fundraiser', 'editor']}><CrowdFunding /></RoleRoute>} />
        <Route path="settlements" element={<RoleRoute roles={['admin']}><Settlements /></RoleRoute>} />
        <Route path="members" element={<RoleRoute roles={['admin']}><Members /></RoleRoute>} />
        <Route path="beneficiaries" element={<RoleRoute roles={['admin']}><Beneficiaries /></RoleRoute>} />
        <Route path="finance" element={<RoleRoute roles={['admin']}><Finance /></RoleRoute>} />
        <Route path="mis-reports" element={<RoleRoute roles={['admin']}><MISReports /></RoleRoute>} />
        <Route path="dcc" element={<RoleRoute roles={['dcc_staff']}><DCCDashboard /></RoleRoute>} />
        <Route path="fundraiser" element={<RoleRoute roles={['fundraiser']}><FundraiserDashboard /></RoleRoute>} />
        <Route path="volunteers" element={<RoleRoute roles={['admin']}><Volunteers /></RoleRoute>} />
        <Route path="copyright" element={<RoleRoute roles={['admin']}><Copyright /></RoleRoute>} />
        <Route path="pdf-templates" element={<RoleRoute roles={['admin']}><PdfTemplates /></RoleRoute>} />
        <Route path="join-now" element={<RoleRoute roles={['admin']}><JoinNow /></RoleRoute>} />
        <Route path="contact" element={<RoleRoute roles={['admin']}><Contact /></RoleRoute>} />
        <Route path="payment-settings" element={<RoleRoute roles={['admin']}><PaymentSettings /></RoleRoute>} />
      </Route>
      <Route path="/donor-portal" element={<DonorPortal />} />
      <Route path="/member-portal" element={<MemberPortal />} />
      <Route path="/campaign/:slug" element={<CampaignPublic />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
