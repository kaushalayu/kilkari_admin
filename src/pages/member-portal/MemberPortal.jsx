import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiUser, FiCalendar, FiDownload, FiLogOut, FiMapPin, FiMessageSquare, FiUsers } from 'react-icons/fi';
import MemberLogin from './MemberLogin';

const MemberPortal = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [referrals, setReferrals] = useState(0);
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [grievance, setGrievance] = useState({ subject: '', message: '' });
const [registering, setRegistering] = useState(null);
const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me').then(res => {
        if (res.data.data?.role === 'member') {
          setUser(res.data.data);
          setLoggedIn(true);
        }
      }).catch(() => localStorage.removeItem('token'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    setLoading(true);
    Promise.all([
      api.get('/portal/member/profile'),
      api.get('/portal/events'),
      api.get('/portal/referrals'),
    ]).then(([p, e, r]) => {
      setProfile(p.data.data);
      setEvents(e.data.data || []);
      setReferrals(r.data.data?.count || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [loggedIn]);

  const handleLogin = (data) => { setUser(data); setLoggedIn(true); };
  const handleLogout = () => { localStorage.removeItem('token'); setLoggedIn(false); setUser(null); };

  const downloadIdCard = async () => {
    try {
      const res = await api.get('/portal/member/id-card', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'membership-id-card.pdf'; a.click();
    } catch (err) {
      setMsg('Failed to download ID card');
    }
  };

  const registerEvent = async (eventId) => {
    setRegistering(eventId);
    try {
      await api.post(`/portal/events/${eventId}/register`);
      setMsg('Registered for event!');
    } catch (err) { setMsg(err.response?.data?.message || 'Registration failed'); }
    finally { setRegistering(null); }
  };

  const submitGrievance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/portal/grievance', grievance);
      setMsg('Grievance submitted');
      setGrievance({ subject: '', message: '' });
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (!loggedIn && !loading) return <MemberLogin onLogin={handleLogin} />;

  const isExpired = profile?.status === 'expired';
  const isApproved = profile?.status === 'approved';

  return (
    <div className="donor-portal">
      <header className="portal-header">
        <div className="portal-header-left">
          <div className="sidebar-logo-placeholder" style={{ width: 32, height: 32, fontSize: '0.6rem' }}><span>KC</span></div>
          <div>
            <h2>Member Portal</h2>
            <p className="text-dim">Welcome, {profile?.name || user?.name}</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={handleLogout}><FiLogOut /> Logout</button>
      </header>

      <div className="portal-tabs">
        {['profile', 'events', 'grievance'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {msg && <div className={`alert ${msg.includes('fail') || msg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {loading && <div className="loading">Loading...</div>}

      {!loading && tab === 'profile' && profile && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="stat-card" style={{ background: '#dbeafe' }}>
              <FiUser size={20} style={{ color: '#2563eb' }} />
              <div className="stat-value" style={{ fontSize: '1rem' }}>{profile.memberId}</div>
              <div className="stat-label">Member ID</div>
            </div>
            <div className="stat-card" style={{ background: profile.status === 'approved' ? '#d1fae5' : '#fef3c7' }}>
              <FiCalendar size={20} style={{ color: profile.status === 'approved' ? '#059669' : '#d97706' }} />
              <div className="stat-value" style={{ textTransform: 'capitalize' }}>{profile.status}</div>
              <div className="stat-label">Status</div>
            </div>
            <div className="stat-card" style={{ background: '#ede9fe' }}>
              <FiUsers size={20} style={{ color: '#7c3aed' }} />
              <div className="stat-value">{referrals}</div>
              <div className="stat-label">Referrals</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><FiUser /> Membership Details</h3>
              {isApproved && <button className="btn btn-sm btn-primary" onClick={downloadIdCard}><FiDownload /> ID Card</button>}
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div><strong>Name</strong><br />{profile.name}</div>
                <div><strong>Phone</strong><br />{profile.phone}</div>
                <div><strong>Email</strong><br />{profile.email || '—'}</div>
                <div><strong>Referral Code</strong><br />{profile.referralCode || '—'}</div>
                <div><strong>Type</strong><br />{profile.membershipType}</div>
                <div><strong>Join Date</strong><br />{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-IN') : '—'}</div>
                <div><strong>Expiry</strong><br />{profile.expiryDate ? new Date(profile.expiryDate).toLocaleDateString('en-IN') : '—'}</div>
              </div>
              {isExpired && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fce7f3', borderRadius: 'var(--radius)', color: '#9d174d' }}>
                  Your membership has expired. Please renew to continue enjoying member benefits.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!loading && tab === 'events' && (
        <div className="table-container">
          <h3 style={{ padding: '0.75rem 1rem', margin: 0, fontSize: '0.85rem' }}><FiCalendar /> Upcoming Events</h3>
          <table className="table">
            <thead><tr><th>Event</th><th>Date</th><th>Location</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {events.length === 0 && <tr><td colSpan={5} className="text-center text-dim">No upcoming events</td></tr>}
              {events.map(e => (
                <tr key={e._id}>
                  <td><strong>{e.title}</strong></td>
                  <td>{e.date ? new Date(e.date).toLocaleDateString('en-IN') : '—'}</td>
                  <td>{e.location || '—'}</td>
                  <td><span className="status-badge status-pending">{e.status}</span></td>
                  <td>
                    {e.registrationEnabled ? (
                      <button className="btn btn-sm btn-primary" onClick={() => registerEvent(e._id)} disabled={registering === e._id}>{registering === e._id ? 'Registering...' : 'Register'}</button>
                    ) : <span className="text-dim">Closed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'grievance' && (
        <div className="card">
          <div className="card-header"><h3 className="card-title"><FiMessageSquare /> Submit Grievance</h3></div>
          <div className="card-body">
            <form onSubmit={submitGrievance} className="crud-form" style={{ maxWidth: 500 }}>
              <div className="form-group"><label>Subject</label><input value={grievance.subject} onChange={e => setGrievance(f => ({ ...f, subject: e.target.value }))} required placeholder="Brief subject" /></div>
              <div className="form-group full"><label>Message</label><textarea value={grievance.message} onChange={e => setGrievance(f => ({ ...f, message: e.target.value }))} required rows={4} placeholder="Describe your issue..." /></div>
              <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={submitting}><FiMessageSquare /> {submitting ? 'Submitting...' : 'Submit'}</button></div>
            </form>
          </div>
        </div>
      )}

      <div className="board-footer-notice" style={{ marginTop: '2rem', padding: '1rem', background: '#dbeafe', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: '#1e40af' }}>
        <strong>Member Self-Service:</strong> You can only view and manage your own membership. For assistance, contact Kilkari support.
      </div>
    </div>
  );
};

export default MemberPortal;
