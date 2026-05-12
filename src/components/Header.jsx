import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getFullUrl } from '../api/client';
import { FiMenu, FiLogOut } from 'react-icons/fi';

const routeNames = {
  '/': 'Dashboard',
  '/center-dashboard': 'Center Dashboard',
  '/volunteer-dashboard': 'My Dashboard',
  '/profile': 'My Profile',
  '/site-settings': 'Site Settings',
  '/hero': 'Hero Section',
  '/pages': 'Pages',
  '/events': 'Events',
  '/projects': 'Projects',
  '/causes': 'Causes',
  '/blogs': 'Blogs',
  '/stories': 'Success Stories',
  '/gallery': 'Gallery',
  '/certificates': 'Certificates',
  '/partners': 'Partners',
  '/team': 'Team',
  '/volunteers': 'Volunteers',
  '/testimonials': 'Testimonials',
  '/faqs': 'FAQs',
  '/donations':                   'Donation Dashboard',
  '/donations/donors':            'Donors',
  '/donations/all':               'All Donations',
  '/donations/collection-report': 'Collection Report',
  '/donations/report':            'Donation Report',
  '/donations/qr':                'QR Management',
  '/donations/offline':           'Add Offline Donation',
  '/donations/centers':           'Collection Centers',
  '/donations/field-settings':    'Donor Field Colors',
  '/contact': 'Messages',
  '/programs': 'Programs',
  '/counters': 'Counters',
  '/policies': 'Policies',
  '/join-now': 'Join Now Form',
  '/payment-settings': 'Payment & Email',
  '/copyright': 'Copyright Settings',
  '/pdf-templates': 'PDF & Receipt Templates',
  '/permissions': 'Permission Management',
  '/roles': 'Role Management',
  '/user-registration': 'User Registration',
  '/crowd-funding': 'Crowd Fundraising',
};

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageName = routeNames[location.pathname] || 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  const avatarUrl = user?.avatar ? getFullUrl(user.avatar) : '';

  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <FiMenu />
        </button>
        <div className="header-page-info">
          <h1 className="header-page-name">{pageName}</h1>
        </div>
      </div>

      <div className="header-right">
        <Link to="/profile" className="header-user">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="header-user-avatar-img" />
          ) : (
            <div className="header-user-avatar">{initials}</div>
          )}
          <div className="header-user-info">
            <span className="header-user-name">{user?.name || 'Admin'}</span>
            <span className="header-user-role">{user?.roleLabel || user?.role || 'Admin'}</span>
          </div>
        </Link>
        <button className="header-logout-btn" onClick={handleLogout} aria-label="Logout">
          <FiLogOut />
        </button>
      </div>
    </header>
  );
};

export default Header;
