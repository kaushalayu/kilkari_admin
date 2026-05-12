import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  FiUsers, FiDollarSign, FiMail, FiCalendar,
  FiBookOpen, FiAward, FiHeart, FiBriefcase,
  FiPlus, FiArrowRight, FiImage, FiUserPlus,
  FiSettings, FiActivity, FiStar, FiMessageSquare,
  FiGrid, FiShield, FiTrendingUp, FiZap,
  FiLayers, FiClock, FiCheckCircle, FiRepeat,
  FiUserCheck, FiFileText, FiBarChart2
} from 'react-icons/fi';

/* ─────────────────────────────────────────────────────────
   Animated counter hook
───────────────────────────────────────────────────────── */
const useCountUp = (target, duration = 900) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
};

/* ─────────────────────────────────────────────────────────
   Live Clock
───────────────────────────────────────────────────────── */
const LiveClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="dash-clock">
      <div className="dash-clock-time">
        {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
      </div>
      <div className="dash-clock-date">
        {now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Role display label + badge color
───────────────────────────────────────────────────────── */
const ROLE_META = {
  admin:       { label: 'Administrator', color: '#92400e', bg: '#fef3c7' },
  editor:      { label: 'Editor',        color: '#065f46', bg: '#d1fae5' },
  volunteer:   { label: 'Volunteer',     color: '#5b21b6', bg: '#ede9fe' },
  team:        { label: 'Team Member',   color: '#9d174d', bg: '#fce7f3' },
};
const getRoleMeta = (role) => ROLE_META[role] || { label: role || 'Admin', color: '#1e40af', bg: '#dbeafe' };
const greet = () => {
  const h = new Date().getHours();
  if (h < 5)  return 'Good Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Good Night';
};

/* ─────────────────────────────────────────────────────────
   Avatar color palette
───────────────────────────────────────────────────────── */
const AV_COLORS = [
  '#2563eb','#7c3aed','#059669','#dc2626',
  '#d97706','#0891b2','#db2777','#65a30d',
];
const avColor = (str = '') => AV_COLORS[str.charCodeAt(0) % AV_COLORS.length];

/* ─────────────────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, color, bg, link, tag }) => {
  const animated = useCountUp(value || 0);
  return (
    <Link to={link} className="dash-stat-card" style={{ '--sc': color }}>
      <div className="dash-stat-top">
        <div className="dash-stat-icon" style={{ background: bg, color }}>
          <Icon />
        </div>
        {tag && (
          <span className={`dash-stat-change ${tag.type}`}>{tag.text}</span>
        )}
      </div>
      <div className="dash-stat-bottom">
        <div className="dash-stat-value">{animated}</div>
        <div className="dash-stat-label">{label}</div>
      </div>
    </Link>
  );
};

/* ─────────────────────────────────────────────────────────
   Quick Action Button
───────────────────────────────────────────────────────── */
const QABtn = ({ to, icon: Icon, label, color, bg }) => (
  <Link
    to={to}
    className="dash-qa-btn"
    style={{ '--qa-color': color, '--qa-bg': bg }}
  >
    <div className="dash-qa-icon" style={{ background: bg, color }}>
      <Icon />
    </div>
    <span>{label}</span>
  </Link>
);

/* ─────────────────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]               = useState({});
  const [recentDonations, setDonations] = useState([]);
  const [recentMessages,  setMessages]  = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const eps = [
          'events','projects','causes','blogs','stories',
          'donations','contact','partners','team','volunteers',
          'gallery','testimonials','faqs','programs'
        ];
        const results = await Promise.allSettled(
          eps.map(async ep => {
            try {
              const r = await api.get(`/${ep}?limit=6`);
              if (ep === 'donations') setDonations(r.data.data?.slice(0,6) || []);
              if (ep === 'contact')   setMessages(r.data.data?.slice(0,5) || []);
              return [ep, r.data.total ?? r.data.data?.length ?? 0];
            } catch { return [ep, 0]; }
          })
        );
        setStats(Object.fromEntries(
          results.filter(r => r.status === 'fulfilled').map(r => r.value)
        ));
      } finally { setLoading(false); }
    };
    load();
  }, []);

  /* ── Stat cards — 8 cards ── */
  const successDonations = recentDonations.filter(d => d.paymentStatus === 'success');
  const totalAmount = successDonations.reduce((s, d) => s + (d.amount || 0), 0);

  const statCards = [
    { label: 'Total Donations',    value: stats.donations,                        icon: FiDollarSign,  color: '#059669', bg: '#ecfdf5', link: '/donations',  tag: { type: 'up',      text: 'Live' } },
    { label: 'Contact Messages',   value: stats.contact,                          icon: FiMail,        color: '#2563eb', bg: '#eff6ff', link: '/contact',    tag: { type: 'neutral', text: 'Inbox' } },
    { label: 'Events',             value: stats.events,                           icon: FiCalendar,    color: '#7c3aed', bg: '#f5f3ff', link: '/events',     tag: { type: 'up',      text: 'Active' } },
    { label: 'Team & Volunteers',  value: (stats.team||0)+(stats.volunteers||0),  icon: FiUsers,       color: '#0891b2', bg: '#ecfeff', link: '/team',       tag: { type: 'neutral', text: 'Members' } },
    { label: 'Blogs Published',    value: stats.blogs,                            icon: FiBookOpen,    color: '#db2777', bg: '#fdf2f8', link: '/blogs',      tag: { type: 'neutral', text: 'Posts' } },
    { label: 'Active Causes',      value: stats.causes,                           icon: FiHeart,       color: '#dc2626', bg: '#fef2f2', link: '/causes',     tag: { type: 'up',      text: 'Running' } },
    { label: 'Projects',           value: stats.projects,                         icon: FiBriefcase,   color: '#d97706', bg: '#fffbeb', link: '/projects',   tag: { type: 'neutral', text: 'Total' } },
    { label: 'Gallery Items',      value: stats.gallery,                          icon: FiImage,       color: '#65a30d', bg: '#f7fee7', link: '/gallery',    tag: { type: 'neutral', text: 'Media' } },
  ];

  /* ── Quick actions ── */
  const quickActions = [
    { to: '/blogs',         icon: FiBookOpen,   label: 'New Blog',     color: '#2563eb', bg: '#eff6ff' },
    { to: '/events',        icon: FiCalendar,   label: 'New Event',    color: '#7c3aed', bg: '#f5f3ff' },
    { to: '/causes',        icon: FiHeart,      label: 'New Cause',    color: '#dc2626', bg: '#fef2f2' },
    { to: '/donations',     icon: FiDollarSign, label: 'Donations',    color: '#059669', bg: '#ecfdf5' },
    { to: '/contact',       icon: FiMail,       label: 'Messages',     color: '#0891b2', bg: '#ecfeff' },
    { to: '/gallery',       icon: FiImage,      label: 'Gallery',      color: '#d97706', bg: '#fffbeb' },
    { to: '/volunteers',    icon: FiUserPlus,   label: 'Volunteers',   color: '#7c3aed', bg: '#f5f3ff' },
    { to: '/permissions',   icon: FiShield,     label: 'Permissions',  color: '#dc2626', bg: '#fef2f2' },
    { to: '/site-settings', icon: FiSettings,   label: 'Settings',     color: '#6b7280', bg: '#f3f4f6' },
  ];

  /* ── Content overview ── */
  const contentRows = [
    { label: 'Blogs',           count: stats.blogs,        icon: FiBookOpen,  color: '#2563eb', bg: '#eff6ff' },
    { label: 'Projects',        count: stats.projects,     icon: FiBriefcase, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Causes',          count: stats.causes,       icon: FiHeart,     color: '#dc2626', bg: '#fef2f2' },
    { label: 'Success Stories', count: stats.stories,      icon: FiAward,     color: '#d97706', bg: '#fffbeb' },
    { label: 'Gallery Items',   count: stats.gallery,      icon: FiImage,     color: '#0891b2', bg: '#ecfeff' },
    { label: 'Testimonials',    count: stats.testimonials, icon: FiStar,      color: '#059669', bg: '#ecfdf5' },
    { label: 'FAQs',            count: stats.faqs,         icon: FiMessageSquare, color: '#db2777', bg: '#fdf2f8' },
    { label: 'Programs',        count: stats.programs,     icon: FiGrid,      color: '#65a30d', bg: '#f7fee7' },
  ];
  const maxCount = Math.max(...contentRows.map(r => r.count || 0), 1);

  /* ── System status rows ── */
  const statusRows = [
    { key: 'API Server',       val: <span className="dash-status-online">Online</span> },
    { key: 'Database',         val: <span className="dash-status-online">Connected</span> },
    { key: 'File Storage',     val: <span className="dash-status-online">Active</span> },
    { key: 'Payment Gateway',  val: <span className="dash-status-online">Ready</span> },
    { key: 'Logged in as',     val: <span className="dash-status-val" style={{ textTransform: 'capitalize' }}>{user?.role?.replace('_',' ') || 'Admin'}</span> },
    { key: 'Total Records',    val: <span className="dash-status-val">{Object.values(stats).reduce((a,b)=>a+(b||0),0)}</span> },
    { key: 'Partners',         val: <span className="dash-status-val">{stats.partners ?? 0}</span> },
  ];

  /* ── Activity feed (derived from recent data) ── */
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const activities = useMemo(() => shuffleArray([
    ...recentDonations.slice(0,3).map(d => ({
      color: '#059669',
      text: <><strong>{d.donorName || 'Anonymous'}</strong> donated <strong>₹{(d.amount||0).toLocaleString('en-IN')}</strong></>,
      time: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '',
    })),
    ...recentMessages.slice(0,2).map(m => ({
      color: '#2563eb',
      text: <><strong>{m.name}</strong> sent a message</>,
      time: m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '',
    })),
  ]).slice(0, 5), [recentDonations, recentMessages]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:'1rem' }}>
      <div style={{ width:40, height:40, border:'3px solid #e5e7eb', borderTopColor:'#2563eb', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <p style={{ color:'#9ca3af', fontSize:'0.82rem' }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="dash-page">

      {/* ══ HERO BANNER ══ */}
      <div className="dash-hero">
        <div className="dash-hero-dots" />
        <div className="dash-hero-left">
          <div className="dash-hero-greeting">{greet()}</div>
          <div className="dash-hero-name">
            Welcome back, <span>{user?.name || 'Admin'}</span> 👋
          </div>
          <div className="dash-hero-role-row">
            <span
              className="dash-hero-role-badge"
              style={{
                background: getRoleMeta(user?.role).bg,
                color: getRoleMeta(user?.role).color,
              }}
            >
              {user?.roleLabel || getRoleMeta(user?.role).label}
            </span>
            {user?.email && (
              <span className="dash-hero-email">{user.email}</span>
            )}
          </div>
          <div className="dash-hero-sub">
            Here's what's happening at Kilkari Care Foundation today.
            {recentMessages.filter(m => !m.isRead).length > 0 && (
              <> You have <strong style={{ color: '#93c5fd' }}>{recentMessages.filter(m => !m.isRead).length} unread</strong> messages.</>
            )}
          </div>
        </div>
        <div className="dash-hero-right">
          <LiveClock />
          <div className="dash-hero-org">
            <div className="dash-hero-org-dot" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>

      {/* ══ STAT CARDS ══ */}
      <div className="dash-stats">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ══ QUICK ACTIONS ══ */}
      <div className="dash-qa-section">
        <div className="dash-qa-title">Quick Actions</div>
        <div className="dash-qa-grid">
          {quickActions.map(a => <QABtn key={a.to} {...a} />)}
        </div>
      </div>

      {/* ══ MAIN GRID: Donations + Messages ══ */}
      <div className="dash-main-grid">

        {/* Recent Donations */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <span className="dash-panel-title">
              <FiDollarSign /> Recent Donations
              {recentDonations.length > 0 && (
                <span className="dash-panel-badge">{recentDonations.length}</span>
              )}
            </span>
            <Link to="/donations" className="dash-panel-link">
              View All <FiArrowRight size={12} />
            </Link>
          </div>
          {recentDonations.length > 0 ? (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Amount</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations.map(d => (
                    <tr key={d._id || d.donationId}>
                      <td>
                        <div className="dash-donor-cell">
                          <div
                            className="dash-donor-av"
                            style={{ background: avColor(d.donorName || 'A') }}
                          >
                            {(d.donorName || 'A')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="dash-donor-name">{d.donorName || 'Anonymous'}</div>
                            <div className="dash-donor-email">{d.donorEmail || d.donorPhone || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="dash-amount">₹{(d.amount||0).toLocaleString('en-IN')}</td>
                      <td className="dash-purpose">{d.purpose || 'General'}</td>
                      <td>
                        <span className={`dash-status ${d.paymentStatus === 'success' ? 'success' : d.paymentStatus === 'failed' ? 'failed' : 'pending'}`}>
                          {d.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="dash-date">
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'}) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dash-empty">No donations recorded yet.</div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <span className="dash-panel-title">
              <FiMessageSquare /> Messages
              {recentMessages.filter(m=>!m.isRead).length > 0 && (
                <span className="dash-panel-badge">{recentMessages.filter(m=>!m.isRead).length} new</span>
              )}
            </span>
            <Link to="/contact" className="dash-panel-link">
              View All <FiArrowRight size={12} />
            </Link>
          </div>
          <div className="dash-msgs">
            {recentMessages.length > 0 ? recentMessages.map(m => (
              <div key={m._id} className={`dash-msg-item ${!m.isRead ? 'unread' : ''}`}>
                <div className="dash-msg-av" style={{ background: avColor(m.name||'U') }}>
                  {(m.name||'U')[0].toUpperCase()}
                </div>
                <div className="dash-msg-body">
                  <div className="dash-msg-row">
                    <span className="dash-msg-name">{m.name}</span>
                    <span className="dash-msg-time">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : ''}
                    </span>
                  </div>
                  <div className="dash-msg-text">
                    {(m.message||m.subject||'').substring(0,60)}{(m.message||'').length>60?'…':''}
                  </div>
                </div>
                {!m.isRead && <div className="dash-unread-badge" />}
              </div>
            )) : (
              <div className="dash-empty">No messages yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* ══ BOTTOM GRID ══ */}
      <div className="dash-bottom-grid">

        {/* Content Overview */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <span className="dash-panel-title"><FiLayers /> Content Overview</span>
          </div>
          {contentRows.map(({ label, count, icon: Icon, color, bg }) => (
            <div key={label} className="dash-content-item">
              <div className="dash-content-icon" style={{ background: bg, color }}>
                <Icon />
              </div>
              <span className="dash-content-label">{label}</span>
              <div className="dash-content-bar-wrap">
                <div
                  className="dash-content-bar"
                  style={{ width: `${Math.round(((count||0)/maxCount)*100)}%`, background: color }}
                />
              </div>
              <span className="dash-content-count">{count ?? 0}</span>
            </div>
          ))}
        </div>

        {/* System Status */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <span className="dash-panel-title"><FiActivity /> System Status</span>
          </div>
          {statusRows.map(({ key, val }) => (
            <div key={key} className="dash-status-item">
              <span className="dash-status-key">{key}</span>
              {val}
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <span className="dash-panel-title"><FiZap /> Recent Activity</span>
          </div>
          {activities.length > 0 ? activities.map((a, i) => (
            <div key={`act-${i}`} className="dash-activity-item">
              <div className="dash-activity-dot" style={{ background: a.color }} />
              <div>
                <div className="dash-activity-text">{a.text}</div>
                <div className="dash-activity-time">{a.time}</div>
              </div>
            </div>
          )) : (
            <div className="dash-empty">No recent activity.</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
