import { useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getFullUrl } from '../api/client';
import {
  FiHome, FiSettings, FiFileText, FiCalendar, FiBriefcase,
  FiHeart, FiBookOpen, FiUsers, FiUser, FiStar,
  FiMessageSquare, FiDollarSign, FiMail, FiImage, FiAward,
  FiLogOut, FiChevronRight, FiPlusCircle, FiGrid, FiShield,
  FiBarChart2, FiExternalLink, FiUserCheck, FiCreditCard,
  FiLayers, FiCopy, FiLayout, FiUserPlus, FiLock, FiEdit3,
  FiPieChart, FiActivity, FiMapPin, FiEye, FiTrendingUp,
  FiUserPlus as FiUserAdd, FiMessageCircle, FiCheckCircle
} from 'react-icons/fi';

const isAdmin = (role) => role === 'admin';
const isCenterAdmin = (role) => role === 'center_admin';
const isVolunteer = (role) => role === 'volunteer';
const isTeam = (role) => role === 'team';
const isDccStaff = (role) => role === 'dcc_staff';
const isFundraiser = (role) => role === 'fundraiser';
const isFullAccess = (role) => isAdmin(role);

const contentItems = [
  { to: '/blogs',        icon: FiBookOpen,      label: 'Blogs' },
  { to: '/events',       icon: FiCalendar,      label: 'Events' },
  { to: '/projects',     icon: FiBriefcase,     label: 'Projects' },
  { to: '/causes',       icon: FiHeart,         label: 'Causes' },
  { to: '/stories',      icon: FiAward,         label: 'Success Stories' },
  { to: '/programs',     icon: FiGrid,          label: 'Programs' },
  { to: '/gallery',      icon: FiImage,         label: 'Gallery' },
  { to: '/team',         icon: FiUser,          label: 'Team' },
  { to: '/partners',     icon: FiUsers,         label: 'Partners' },
  { to: '/testimonials', icon: FiStar,          label: 'Testimonials' },
  { to: '/faqs',         icon: FiMessageSquare, label: 'FAQs' },
  { to: '/certificates', icon: FiFileText,      label: 'Certificates' },
  { to: '/pages',        icon: FiLayout,        label: 'Pages' },
  { to: '/hero',         icon: FiImage,         label: 'Hero Section' },
  { to: '/counters',     icon: FiBarChart2,     label: 'Counters' },
  { to: '/policies',     icon: FiShield,        label: 'Policies' },
];

const donorItems = [
  { to: '/donations',                   icon: FiActivity,   label: 'Dashboard',          end: true },
  { to: '/donations/donors',            icon: FiUsers,      label: 'Donors' },
  { to: '/donations/all',               icon: FiDollarSign, label: 'All Donations' },
  { to: '/donations/offline',           icon: FiPlusCircle, label: 'Add Offline Donation' },
  { to: '/donations/collection-report', icon: FiBarChart2,  label: 'Collection Report' },
  { to: '/donations/report',            icon: FiPieChart,   label: 'Donation Report' },
  { to: '/donations/qr',                icon: FiGrid,       label: 'QR Management' },
  { to: '/donations/field-settings',    icon: FiEdit3,      label: 'Field Colors' },
  { to: '/donations/centers',          icon: FiMapPin,     label: 'Collection Centers' },
];

const mainNav = [
  { to: '/',              icon: FiHome,      label: 'Dashboard',    end: true },
  { to: '/profile',       icon: FiUserCheck, label: 'My Profile' },
];

const centerAdminMainNav = [
  { to: '/center-dashboard', icon: FiHome,      label: 'Center Dashboard', end: true },
  { to: '/profile',          icon: FiUserCheck,  label: 'My Profile' },
];

const volunteerMainNav = [
  { to: '/volunteer-dashboard', icon: FiHome,      label: 'My Dashboard', end: true },
  { to: '/profile',            icon: FiUserCheck,  label: 'My Profile' },
];

const dccMainNav = [
  { to: '/dcc',      icon: FiHome,      label: 'DCC Dashboard', end: true },
  { to: '/profile',  icon: FiUserCheck,  label: 'My Profile' },
];

const fundraiserMainNav = [
  { to: '/fundraiser', icon: FiHome,      label: 'Dashboard', end: true },
  { to: '/profile',    icon: FiUserCheck,  label: 'My Profile' },
];

const centerAdminItems = [
  { to: '/donations',                   icon: FiEye,        label: 'View Donations', end: true },
  { to: '/donations/offline',           icon: FiPlusCircle, label: 'Add Offline Donation' },
  { to: '/donations/centers',          icon: FiMapPin,     label: 'Centers' },
  { to: '/donations/collection-report', icon: FiBarChart2,  label: 'Collection Report' },
];

const volunteerItems = [
  { to: '/blogs',     icon: FiBookOpen,  label: 'Blogs' },
  { to: '/events',    icon: FiCalendar,  label: 'Events' },
  { to: '/projects',  icon: FiBriefcase, label: 'Projects' },
  { to: '/causes',    icon: FiHeart,     label: 'Causes' },
  { to: '/stories',   icon: FiAward,     label: 'Stories' },
  { to: '/gallery',   icon: FiImage,     label: 'Gallery' },
];

const adminNavModules = [
  { to: '/settlements',   icon: FiCheckCircle,  label: 'Settlements' },
  { to: '/members',       icon: FiUserCheck,    label: 'Members' },
  { to: '/beneficiaries', icon: FiUsers,        label: 'Beneficiaries' },
  { to: '/finance',       icon: FiDollarSign,   label: 'Finance Ledger' },
  { to: '/mis-reports',   icon: FiBarChart2,    label: 'MIS Reports' },
];

const adminBottomNav = [
  { to: '/volunteers',    icon: FiUserPlus,   label: 'Volunteer Management' },
  { to: '/copyright',     icon: FiEdit3,      label: 'Copyright Settings' },
  { to: '/pdf-templates', icon: FiCopy,       label: 'PDF & Receipt Templates' },
];

const adminUtilNav = [
  { to: '/join-now',         icon: FiPlusCircle,    label: 'Join Now Form' },
  { to: '/contact',          icon: FiMail,          label: 'Messages' },
  { to: '/payment-settings', icon: FiCreditCard,    label: 'Payment & Email' },
  { to: '/whatsapp',         icon: FiMessageCircle, label: 'WhatsApp Messaging' },
  { to: '/site-settings',    icon: FiSettings,      label: 'Site Settings' },
];

const FlyoutMenu = ({ items, title, onClose }) => (
  <div className="nav-cm-flyout">
    <div className="nav-cm-flyout-header">{title}</div>
    <div className="nav-cm-flyout-grid">
      {items.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onClose}
          className={({ isActive }) => `nav-cm-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-cm-item-icon"><Icon /></span>
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  </div>
);

const SimpleNavItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink to={to} onClick={onClick}
    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
    <span className="nav-icon"><Icon /></span>
    <span className="nav-label">{label}</span>
    <FiChevronRight className="nav-arrow" />
  </NavLink>
);

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { settings }     = useSiteSettings();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [contentOpen, setContentOpen] = useState(false);
  const [donorOpen,   setDonorOpen]   = useState(false);
  const contentTimer = useRef(null);
  const donorTimer   = useRef(null);

  const role = user?.role || '';

  const isContentActive = contentItems.some(i => location.pathname === i.to);
  const isDonorActive   = donorItems.some(i => location.pathname === i.to || location.pathname.startsWith(i.to + '/'));

  const hoverProps = (setter, timer) => ({
    onMouseEnter: () => { clearTimeout(timer.current); setter(true); },
    onMouseLeave: () => { timer.current = setTimeout(() => setter(false), 150); },
  });

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleClose  = () => { if (window.innerWidth <= 1024) onClose(); };
  const closeAll     = () => { setContentOpen(false); setDonorOpen(false); handleClose(); };

  const logoUrl   = settings.logo ? getFullUrl(settings.logo) : '';
  const initials  = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD';
  const avatarUrl = user?.avatar ? getFullUrl(user.avatar) : '';

  const nav = isFullAccess(role) || isTeam(role) ? mainNav
    : isCenterAdmin(role) ? centerAdminMainNav
    : isVolunteer(role) ? volunteerMainNav
    : isDccStaff(role) ? dccMainNav
    : isFundraiser(role) ? fundraiserMainNav
    : mainNav;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          {logoUrl
            ? <img src={logoUrl} alt="Logo" className="sidebar-logo" />
            : <div className="sidebar-logo-placeholder"><span>KC</span></div>
          }
          <div className="sidebar-brand-text">
            <h2>{settings.siteName || 'Kilkari Admin'}</h2>
          </div>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={handleClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon"><Icon /></span>
              <span className="nav-label">{label}</span>
              <FiChevronRight className="nav-arrow" />
            </NavLink>
          ))}
        </div>

        {/* Center Admin — quick links */}
        {isCenterAdmin(role) && (
          <div className="nav-group">
            <span className="nav-group-label">Center Management</span>
            {centerAdminItems.map(({ to, icon: Icon, label, end }) => (
              <SimpleNavItem key={to} to={to} icon={Icon} label={label} onClick={handleClose} />
            ))}
          </div>
        )}

        {/* Volunteer — quick links */}
        {isVolunteer(role) && (
          <div className="nav-group">
            <span className="nav-group-label">Content</span>
            {volunteerItems.map(({ to, icon: Icon, label }) => (
              <SimpleNavItem key={to} to={to} icon={Icon} label={label} onClick={handleClose} />
            ))}
          </div>
        )}

        {/* DCC Staff — quick links */}
        {isDccStaff(role) && (
          <div className="nav-group">
            <span className="nav-group-label">Collection</span>
            <SimpleNavItem to="/donations" icon={FiDollarSign} label="View Donations" onClick={handleClose} />
            <SimpleNavItem to="/donations/offline" icon={FiPlusCircle} label="Add Offline Donation" onClick={handleClose} />
            <SimpleNavItem to="/donations/donors" icon={FiUsers} label="Donors" onClick={handleClose} />
            <SimpleNavItem to="/settlements" icon={FiCheckCircle} label="Settlements" onClick={handleClose} />
          </div>
        )}

        {/* Fundraiser — quick links */}
        {isFundraiser(role) && (
          <div className="nav-group">
            <span className="nav-group-label">Activities</span>
            <SimpleNavItem to="/donations/donors" icon={FiUsers} label="My Donors" onClick={handleClose} />
            <SimpleNavItem to="/donations/offline" icon={FiPlusCircle} label="Add Donation" onClick={handleClose} />
            <SimpleNavItem to="/crowd-funding" icon={FiTrendingUp} label="Campaigns" onClick={handleClose} />
          </div>
        )}

        {/* Full Access — Content Management flyout */}
        {isFullAccess(role) && (
          <div className="nav-group">
            <div className="nav-cm-wrapper" {...hoverProps(setContentOpen, contentTimer)}>
              <button
                className={`nav-link nav-cm-trigger ${isContentActive ? 'active' : ''}`}
                onClick={() => setContentOpen(v => !v)}
              >
                <span className="nav-icon"><FiLayers /></span>
                <span className="nav-label">Content Management</span>
                <FiChevronRight
                  className={`nav-arrow nav-cm-arrow ${contentOpen ? 'rotated' : ''}`}
                  style={{ opacity: 0.5 }}
                />
              </button>
              {contentOpen && (
                <div {...hoverProps(setContentOpen, contentTimer)}>
                  <FlyoutMenu items={contentItems} title="Content Management" onClose={closeAll} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Donor Management — only for full access or center admin */}
        {(isFullAccess(role) || isCenterAdmin(role)) && (
          <div className="nav-group">
            <div className="nav-cm-wrapper" {...hoverProps(setDonorOpen, donorTimer)}>
              <button
                className={`nav-link nav-cm-trigger ${isDonorActive ? 'active' : ''}`}
                onClick={() => setDonorOpen(v => !v)}
              >
                <span className="nav-icon"><FiDollarSign /></span>
                <span className="nav-label">Donor Management</span>
                <FiChevronRight
                  className={`nav-arrow nav-cm-arrow ${donorOpen ? 'rotated' : ''}`}
                  style={{ opacity: 0.5 }}
                />
              </button>
              {donorOpen && (
                <div {...hoverProps(setDonorOpen, donorTimer)}>
                  <FlyoutMenu
                    items={isCenterAdmin(role) ? centerAdminItems : donorItems}
                    title="Donor Management"
                    onClose={closeAll}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Crowd Fundraising — standalone section */}
        {(isFullAccess(role) || isCenterAdmin(role)) && (
          <div className="nav-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
            <span className="nav-group-label">Fundraising</span>
            <SimpleNavItem to="/crowd-funding" icon={FiTrendingUp} label="Campaigns" onClick={handleClose} />
          </div>
        )}

        {/* Admin Modules */}
        {isFullAccess(role) && (
          <div className="nav-group">
            <span className="nav-group-label">Admin Modules</span>
            {adminNavModules.map(({ to, icon: Icon, label }) => (
              <SimpleNavItem key={to} to={to} icon={Icon} label={label} onClick={handleClose} />
            ))}
          </div>
        )}

        {/* Admin/Editor bottom nav */}
        {isFullAccess(role) && (
          <div className="nav-group">
            {adminBottomNav.map(({ to, icon: Icon, label }) => (
              <SimpleNavItem key={to} to={to} icon={Icon} label={label} onClick={handleClose} />
            ))}
          </div>
        )}

        {/* Permission Management — simple link */}
        {isFullAccess(role) && (
          <div className="nav-group">
            <SimpleNavItem to="/permissions" icon={FiLock} label="Permission Management" onClick={handleClose} />
          </div>
        )}

        {/* Utilities — full access only */}
        {isFullAccess(role) && (
          <div className="nav-group">
            <span className="nav-group-label">Utilities</span>
            {adminUtilNav.map(({ to, icon: Icon, label }) => (
              <SimpleNavItem key={to} to={to} icon={Icon} label={label} onClick={handleClose} />
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <Link to="/profile" className="sidebar-user" onClick={handleClose}>
          {avatarUrl
            ? <img src={avatarUrl} alt="" className="sidebar-user-avatar-img" />
            : <div className="sidebar-user-avatar">{initials}</div>
          }
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name || 'Admin'}</p>
            <small className="sidebar-user-email">{user?.roleLabel || user?.role}</small>
          </div>
        </Link>
        <a
          href={import.meta.env.VITE_WEBSITE_URL}
          target="_blank" rel="noopener noreferrer"
          className="btn-view-site"
        >
          <FiExternalLink /><span>View Website</span>
        </a>
        <button className="btn-logout" onClick={handleLogout}>
          <FiLogOut /><span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
