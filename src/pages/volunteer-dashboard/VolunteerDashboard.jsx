import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  FiBookOpen, FiCalendar, FiHeart, FiAward,
  FiUser, FiStar, FiEye, FiClock
} from 'react-icons/fi';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ blogs: 0, events: 0, projects: 0, causes: 0, stories: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/blogs?limit=3'),
      api.get('/events?limit=5'),
      api.get('/projects'),
      api.get('/causes'),
      api.get('/stories')
    ]).then(([blogRes, eventRes, projRes, causeRes, storyRes]) => {
      const events = eventRes.data.data || [];
      setUpcomingEvents(events.slice(0, 5));
      setStats({
        blogs: (blogRes.data.data || []).length,
        events: events.length,
        projects: (projRes.data.data || []).length,
        causes: (causeRes.data.data || []).length,
        stories: (storyRes.data.data || []).length,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="dash-page">
      <div className="dash-hero" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #5b21b6 45%, #7c3aed 100%)' }}>
        <div className="dash-hero-dots" />
        <div className="dash-hero-left">
          <p className="dash-hero-greeting">Volunteer Portal</p>
          <h1 className="dash-hero-name">
            Welcome, <span>{user?.name?.split(' ')[0] || 'Volunteer'}</span>
          </h1>
          <div className="dash-hero-role-row">
            <span className="dash-hero-role-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              Volunteer
            </span>
            <span className="dash-hero-email">{user?.email}</span>
          </div>
          <p className="dash-hero-sub">Stay updated with the latest content, events, and opportunities.</p>
        </div>
        <div className="dash-hero-right">
          <div className="dash-hero-org">
            <div className="dash-hero-org-dot" />
            <span>Volunteer Panel</span>
          </div>
        </div>
      </div>

      <div className="dash-stats">
        <div className="dash-stat-card" style={{ '--sc': '#059669' }}>
          <div className="dash-stat-top">
            <div className="dash-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}><FiBookOpen /></div>
          </div>
          <div className="dash-stat-bottom">
            <div className="dash-stat-value">{stats.blogs}</div>
            <div className="dash-stat-label">Blogs</div>
          </div>
        </div>
        <div className="dash-stat-card" style={{ '--sc': '#2563eb' }}>
          <div className="dash-stat-top">
            <div className="dash-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><FiCalendar /></div>
          </div>
          <div className="dash-stat-bottom">
            <div className="dash-stat-value">{stats.events}</div>
            <div className="dash-stat-label">Events</div>
          </div>
        </div>
        <div className="dash-stat-card" style={{ '--sc': '#d97706' }}>
          <div className="dash-stat-top">
            <div className="dash-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FiHeart /></div>
          </div>
          <div className="dash-stat-bottom">
            <div className="dash-stat-value">{stats.causes}</div>
            <div className="dash-stat-label">Causes</div>
          </div>
        </div>
        <div className="dash-stat-card" style={{ '--sc': '#7c3aed' }}>
          <div className="dash-stat-top">
            <div className="dash-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><FiAward /></div>
          </div>
          <div className="dash-stat-bottom">
            <div className="dash-stat-value">{stats.projects}</div>
            <div className="dash-stat-label">Projects</div>
          </div>
        </div>
      </div>

      <div className="dash-qa-section">
        <h3 className="dash-qa-title">Quick Links</h3>
        <div className="dash-qa-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <Link to="/blogs" className="dash-qa-btn" style={{ '--qa-color': '#059669', '--qa-bg': '#d1fae5' }}>
            <div className="dash-qa-icon" style={{ background: '#d1fae5', color: '#059669' }}><FiBookOpen /></div>
            Blogs
          </Link>
          <Link to="/events" className="dash-qa-btn" style={{ '--qa-color': '#2563eb', '--qa-bg': '#dbeafe' }}>
            <div className="dash-qa-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><FiCalendar /></div>
            Events
          </Link>
          <Link to="/stories" className="dash-qa-btn" style={{ '--qa-color': '#7c3aed', '--qa-bg': '#ede9fe' }}>
            <div className="dash-qa-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><FiAward /></div>
            Stories
          </Link>
          <Link to="/projects" className="dash-qa-btn" style={{ '--qa-color': '#d97706', '--qa-bg': '#fef3c7' }}>
            <div className="dash-qa-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FiStar /></div>
            Projects
          </Link>
          <Link to="/profile" className="dash-qa-btn" style={{ '--qa-color': '#0891b2', '--qa-bg': '#cffafe' }}>
            <div className="dash-qa-icon" style={{ background: '#cffafe', color: '#0891b2' }}><FiUser /></div>
            My Profile
          </Link>
        </div>
      </div>

      <div className="dash-main-grid">
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title"><FiCalendar /> Upcoming Events</h3>
            <Link to="/events" className="dash-panel-link"><FiEye /> View All</Link>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <p className="loading">Loading...</p>
            ) : upcomingEvents.length === 0 ? (
              <p className="dash-empty">No upcoming events</p>
            ) : (
              upcomingEvents.map(ev => (
                <div key={ev._id} className="dash-msg-item" style={{ cursor: 'default' }}>
                  <div className="dash-msg-av" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                    <FiCalendar size={16} />
                  </div>
                  <div className="dash-msg-body">
                    <div className="dash-msg-row">
                      <span className="dash-msg-name">{ev.title}</span>
                      {ev.date && <span className="dash-msg-time">{new Date(ev.date).toLocaleDateString('en-IN')}</span>}
                    </div>
                    {ev.description && (
                      <div className="dash-msg-text">{ev.description}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title"><FiClock /> Recent Activity</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div className="dash-activity-item">
              <div className="dash-activity-dot" style={{ background: '#059669' }} />
              <div>
                <div className="dash-activity-text">Welcome to the volunteer portal!</div>
                <div className="dash-activity-time">Start exploring blogs, events, and more.</div>
              </div>
            </div>
            <div className="dash-activity-item">
              <div className="dash-activity-dot" style={{ background: '#2563eb' }} />
              <div>
                <div className="dash-activity-text">Your profile is <strong>active</strong></div>
                <div className="dash-activity-time">Keep your information up to date</div>
              </div>
            </div>
            <div className="dash-activity-item">
              <div className="dash-activity-dot" style={{ background: '#d97706' }} />
              <div>
                <div className="dash-activity-text">Check out the latest <strong>success stories</strong></div>
                <div className="dash-activity-time">See the impact of your work</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
