import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiCheck } from 'react-icons/fi';

const Contact = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/contact').then(res => setData(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/contact/${id}`, { isRead: true });
      setData(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
      setMsg('Marked as read');
      setTimeout(() => setMsg(''), 2000);
    } catch {
      setMsg('Failed to mark as read');
      setTimeout(() => setMsg(''), 2000);
    }
  };

  const unreadCount = data.filter(m => !m.isRead).length;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Contact Messages</h2>
        {unreadCount > 0 && <span className="status-badge status-pending">{unreadCount} Unread</span>}
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {loading && <p className="loading">Loading...</p>}
      {!loading && data.length === 0 && <p className="empty">No messages yet.</p>}
      {!loading && data.length > 0 && (
        <div className="table-container">
          <div className="table-scroll-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Subject</th><th>Message</th><th>Status</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {data.map(m => (
                  <tr key={m._id} style={{ background: m.isRead ? 'transparent' : 'var(--warning-bg)' }}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.email}</td>
                    <td>{m.phone || '—'}</td>
                    <td>{m.subject || '—'}</td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</td>
                    <td>{m.isRead ? <span className="status-badge status-success">Read</span> : <span className="status-badge status-pending">Unread</span>}</td>
                    <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td>
                      {!m.isRead && (
                        <button className="btn-icon btn-edit" onClick={() => markRead(m._id)} aria-label="Mark as read"><FiCheck /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
