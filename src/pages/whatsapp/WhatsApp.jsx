import { useState, useEffect } from 'react';
import api, { getFullUrl } from '../../api/client';
import {
  FiSend, FiUsers, FiDownload, FiSearch, FiCheckCircle, FiXCircle, FiLoader,
  FiTarget, FiBarChart2, FiCalendar, FiPlus, FiEdit2, FiTrash2, FiPlay,
  FiEye, FiTrendingUp, FiSave
} from 'react-icons/fi';

const TABS = [
  { key: 'single', label: 'Send Message', icon: FiSend },
  { key: 'receipt', label: 'Send Receipt', icon: FiDownload },
  { key: 'donors', label: 'Message Donors', icon: FiUsers },
  { key: 'campaigns', label: 'Campaigns', icon: FiTarget },
];

const WhatsApp = () => {
  const [tab, setTab] = useState('single');

  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  // receipt tab
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [receiptType, setReceiptType] = useState('online');

  // donors tab
  const [donors, setDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [donorMessage, setDonorMessage] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedDonors, setSelectedDonors] = useState([]);

  // campaigns tab
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ name: '', message: '', template: 'custom', scheduledAt: '', recipientFilter: {} });
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignStats, setCampaignStats] = useState(null);
  const [campaignDetail, setCampaignDetail] = useState(null);

  useEffect(() => {
    if (tab === 'receipt') loadDonations();
    if (tab === 'donors') loadDonors();
    if (tab === 'campaigns') loadCampaigns();
  }, [tab]);

  const loadDonations = async (type) => {
    const t = type || receiptType;
    setLoadingDonations(true);
    try {
      const endpoint = t === 'online' ? '/donations?limit=500' : '/offline-donations?limit=500';
      const res = await api.get(endpoint);
      setDonations(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDonations(false);
    }
  };

  const loadDonors = async () => {
    setLoadingDonors(true);
    try {
      const res = await api.get('/donors?limit=500');
      setDonors(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDonors(false);
    }
  };

  const handleSendSingle = async () => {
    if (!to || !message) return;
    setSending(true);
    setResult(null);
    try {
      const res = await api.post('/whatsapp/send', { to, message });
      setResult({ type: 'success', text: res.data.message || 'Message sent!' });
      setTo('');
      setMessage('');
    } catch (err) {
      setResult({ type: 'error', text: err.response?.data?.message || 'Failed to send' });
    } finally {
      setSending(false);
    }
  };

  const handleSendReceipts = async () => {
    if (selectedIds.length === 0) return;
    setSending(true);
    setResult(null);
    try {
      const res = await api.post('/whatsapp/receipts/bulk', { type: receiptType, filters: { _id: { $in: selectedIds } } });
      setResult({ type: 'success', text: `Sent: ${res.data.data.sent}, Failed: ${res.data.data.failed}` });
    } catch (err) {
      setResult({ type: 'error', text: err.response?.data?.message || 'Failed to send receipts' });
    } finally {
      setSending(false);
    }
  };

  const handleSendSingleReceipt = async (id) => {
    setSending(true);
    try {
      const res = await api.post(`/whatsapp/receipt/${receiptType}/${id}`);
      setResult({ type: 'success', text: res.data.message });
    } catch (err) {
      setResult({ type: 'error', text: err.response?.data?.message || 'Failed' });
    } finally {
      setSending(false);
    }
  };

  const handleSendToDonors = async () => {
    if (!donorMessage || selectedDonors.length === 0) return;
    setSending(true);
    setResult(null);
    try {
      const res = await api.post('/whatsapp/donors', { message: donorMessage, donorIds: selectedDonors });
      setResult({ type: 'success', text: `Sent: ${res.data.data.sent}, Failed: ${res.data.data.failed}` });
    } catch (err) {
      setResult({ type: 'error', text: err.response?.data?.message || 'Failed' });
    } finally {
      setSending(false);
    }
  };

  const loadCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const res = await api.get('/whatsapp-campaigns');
      setCampaigns(res.data.data || []);
    } catch {}
    setCampaignsLoading(false);
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.message) return;
    try {
      await api.post('/whatsapp-campaigns', campaignForm);
      setShowCampaignForm(false);
      setCampaignForm({ name: '', message: '', template: 'custom', scheduledAt: '', recipientFilter: {} });
      loadCampaigns();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleSendCampaign = async (id) => {
    if (!window.confirm('Send this campaign now?')) return;
    try {
      await api.post(`/whatsapp-campaigns/${id}/send`);
      loadCampaigns();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await api.delete(`/whatsapp-campaigns/${id}`);
      loadCampaigns();
    } catch { alert('Delete failed'); }
  };

  const viewCampaignStats = async (id) => {
    try {
      const res = await api.get(`/whatsapp-campaigns/${id}/stats`);
      setCampaignStats(res.data.data);
      const c = await api.get(`/whatsapp-campaigns/${id}`);
      setCampaignDetail(c.data.data);
    } catch {}
  };

  const toggleDonor = (id) => {
    setSelectedDonors(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAllDonors = () => {
    if (selectAll) {
      setSelectedDonors([]);
    } else {
      setSelectedDonors(donors.map(d => d._id));
    }
    setSelectAll(!selectAll);
  };

  const handleReceiptTypeChange = (type) => {
    setReceiptType(type);
    setSelectedIds([]);
    loadDonations(type);
  };

  const toggleDonation = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">WhatsApp Messaging</h2>
      </div>

      {result && (
        <div className={`alert ${result.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {result.type === 'success' ? <FiCheckCircle /> : <FiXCircle />} {result.text}
        </div>
      )}

      <div className="tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`btn ${tab === key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setTab(key); setResult(null); }}
          >
            <Icon /> {label}
          </button>
        ))}
      </div>

      {tab === 'single' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Phone Number (with country code)</label>
              <input value={to} onChange={e => setTo(e.target.value)} placeholder="e.g. 919873336611" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                placeholder="Type your message here..."
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', resize: 'vertical' }}
              />
            </div>
            <div>
              <button className="btn btn-primary" onClick={handleSendSingle} disabled={sending || !to || !message}>
                {sending ? <FiLoader className="spin" /> : <FiSend />} Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'receipt' && (
        <div>
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: 600 }}>Donation Type:</label>
              <select value={receiptType} onChange={e => handleReceiptTypeChange(e.target.value)} style={{ padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <option value="online">Online Donations</option>
                <option value="offline">Offline Donations</option>
              </select>
              <button className="btn btn-primary" onClick={handleSendReceipts} disabled={sending || selectedIds.length === 0}>
                {sending ? <FiLoader className="spin" /> : <FiSend />} Send Receipts ({selectedIds.length})
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            {loadingDonations ? (
              <p className="loading">Loading donations...</p>
            ) : (
              <div className="dm-table-wrap" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input type="checkbox" onChange={e => {
                          if (e.target.checked) setSelectedIds(donations.map(d => d._id));
                          else setSelectedIds([]);
                        }} checked={selectedIds.length === donations.length && donations.length > 0} />
                      </th>
                      <th>Donor</th>
                      <th>Amount</th>
                      <th>Receipt ID</th>
                      <th>Phone</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map(d => (
                      <tr key={d._id}>
                        <td>
                          <input type="checkbox" checked={selectedIds.includes(d._id)} onChange={() => toggleDonation(d._id)} />
                        </td>
                        <td>{d.donorName || d.donor?.donorName || 'N/A'}</td>
                        <td>₹{Number(d.amount || 0).toLocaleString('en-IN')}</td>
                        <td className="dm-mono">{d.donationId || '—'}</td>
                        <td>{d.donorPhone || d.donor?.mobile || d.donor?.whatsapp || '—'}</td>
                        <td>
                          <button className="btn btn-sm btn-secondary" onClick={() => handleSendSingleReceipt(d._id)} disabled={sending}>
                            <FiSend size={12} /> Send
                          </button>
                        </td>
                      </tr>
                    ))}
                    {donations.length === 0 && (
                      <tr><td colSpan={6} className="dm-empty">No donations found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'donors' && (
        <div>
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Message to Donors (use {'{name}'} for personalization)</label>
                <textarea
                  value={donorMessage}
                  onChange={e => setDonorMessage(e.target.value)}
                  rows={4}
                  placeholder="Dear {name}, ..."
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', resize: 'vertical' }}
                />
              </div>
              <div>
                <button className="btn btn-primary" onClick={handleSendToDonors} disabled={sending || !donorMessage || selectedDonors.length === 0}>
                  {sending ? <FiLoader className="spin" /> : <FiSend />} Send to {selectedDonors.length} Donors
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            {loadingDonors ? (
              <p className="loading">Loading donors...</p>
            ) : (
              <div className="dm-table-wrap" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input type="checkbox" onChange={toggleAllDonors} checked={selectAll} />
                      </th>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>WhatsApp</th>
                      <th>Total Donated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map(d => (
                      <tr key={d._id}>
                        <td>
                          <input type="checkbox" checked={selectedDonors.includes(d._id)} onChange={() => toggleDonor(d._id)} />
                        </td>
                        <td>{d.donorName}</td>
                        <td>{d.mobile || '—'}</td>
                        <td>{d.whatsapp || '—'}</td>
                        <td>₹{Number(d.totalAmount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    {donors.length === 0 && (
                      <tr><td colSpan={5} className="dm-empty">No donors found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'campaigns' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>WhatsApp Campaigns</h3>
            <button className="btn btn-primary" onClick={() => setShowCampaignForm(true)}>
              <FiPlus /> New Campaign
            </button>
          </div>

          {campaignsLoading ? (
            <p className="loading">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <FiTarget size={32} style={{ color: '#94a3b8' }} />
              <p>No campaigns yet. Create your first WhatsApp campaign.</p>
            </div>
          ) : (
            <div className="dm-table-wrap">
              <table className="dm-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Template</th><th>Recipients</th><th>Sent</th>
                    <th>Delivered</th><th>Failed</th><th>Status</th><th>Scheduled</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c._id}>
                      <td><strong>{c.name}</strong></td>
                      <td className="dm-dim">{c.template}</td>
                      <td>{c.totalRecipients || 0}</td>
                      <td>{c.sentCount || 0}</td>
                      <td>{c.deliveredCount || 0}</td>
                      <td><span style={{ color: '#dc2626' }}>{c.failedCount || 0}</span></td>
                      <td><span className={`dm-status ${c.status === 'completed' ? 'dm-status-success' : c.status === 'sending' ? 'dm-status-pending' : c.status === 'draft' ? 'dm-status-inactive' : ''}`}>{c.status}</span></td>
                      <td className="dm-dim">{c.scheduledAt ? new Date(c.scheduledAt).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon" title="Stats" onClick={() => viewCampaignStats(c._id)}><FiBarChart2 /></button>
                          {c.status === 'draft' && (
                            <button className="btn-icon" style={{ background: '#d1fae5', color: '#059669' }} title="Send Now" onClick={() => handleSendCampaign(c._id)}><FiPlay /></button>
                          )}
                          <button className="btn-icon btn-edit" title="Edit" onClick={() => { setCampaignForm({ name: c.name, message: c.message, template: c.template, scheduledAt: c.scheduledAt ? c.scheduledAt.split('T')[0] : '', recipientFilter: c.recipientFilter || {} }); setShowCampaignForm(true); }}><FiEdit2 /></button>
                          <button className="btn-icon btn-delete" title="Delete" onClick={() => handleDeleteCampaign(c._id)}><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Campaign Stats Modal */}
          {campaignStats && campaignDetail && (
            <div className="dm-modal-overlay" onClick={() => { setCampaignStats(null); setCampaignDetail(null); }}>
              <div className="dm-modal dm-modal-sm" onClick={e => e.stopPropagation()}>
                <div className="dm-modal-header">
                  <h2 className="dm-modal-name">{campaignDetail.name}</h2>
                  <button className="dm-modal-close" onClick={() => { setCampaignStats(null); setCampaignDetail(null); }}><FiXCircle /></button>
                </div>
                <div className="dm-modal-body">
                  <div className="dm-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="dm-stat-card" style={{ '--sc': '#2563eb', padding: '0.75rem' }}>
                      <div className="dm-stat-label">Total</div>
                      <div className="dm-stat-value" style={{ fontSize: '1rem' }}>{campaignStats.total}</div>
                    </div>
                    <div className="dm-stat-card" style={{ '--sc': '#059669', padding: '0.75rem' }}>
                      <div className="dm-stat-label">Delivered</div>
                      <div className="dm-stat-value" style={{ fontSize: '1rem' }}>{campaignStats.delivered} ({campaignStats.deliveryRate}%)</div>
                    </div>
                    <div className="dm-stat-card" style={{ '--sc': '#dc2626', padding: '0.75rem' }}>
                      <div className="dm-stat-label">Failed</div>
                      <div className="dm-stat-value" style={{ fontSize: '1rem' }}>{campaignStats.failed}</div>
                    </div>
                  </div>
                </div>
                <div className="dm-modal-footer">
                  <button className="dm-btn-primary" onClick={() => { setCampaignStats(null); setCampaignDetail(null); }}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* Create/Edit Campaign Form */}
          {showCampaignForm && (
            <div className="dm-modal-overlay" onClick={() => setShowCampaignForm(false)}>
              <div className="dm-modal dm-modal-md" onClick={e => e.stopPropagation()}>
                <div className="dm-modal-header">
                  <h2 className="dm-modal-name">{campaignForm.name && campaigns.find(c => c.name === campaignForm.name) ? 'Edit Campaign' : 'New Campaign'}</h2>
                  <button className="dm-modal-close" onClick={() => setShowCampaignForm(false)}><FiXCircle /></button>
                </div>
                <div className="dm-modal-body">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Campaign Name</label>
                    <input className="dm-form-input" value={campaignForm.name}
                      onChange={e => setCampaignForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Diwali Appeal 2025" />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Template</label>
                    <select className="dm-form-input" value={campaignForm.template}
                      onChange={e => setCampaignForm(p => ({ ...p, template: e.target.value }))}>
                      <option value="custom">Custom</option>
                      <option value="receipt">Receipt</option>
                      <option value="reminder">Reminder</option>
                      <option value="campaign">Campaign</option>
                      <option value="appeal">Appeal</option>
                    </select>
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Message (use {'{name}'} for donor name)</label>
                    <textarea className="dm-form-input" rows={4} value={campaignForm.message}
                      onChange={e => setCampaignForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Dear {name}, support our cause..." />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Schedule (optional)</label>
                    <input type="datetime-local" className="dm-form-input" value={campaignForm.scheduledAt}
                      onChange={e => setCampaignForm(p => ({ ...p, scheduledAt: e.target.value }))} />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Recipient Filter — Area (city)</label>
                    <input className="dm-form-input" value={campaignForm.recipientFilter.area || ''}
                      onChange={e => setCampaignForm(p => ({ ...p, recipientFilter: { ...p.recipientFilter, area: e.target.value } }))}
                      placeholder="Leave empty for all areas" />
                  </div>
                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label className="dm-form-label">Min Donation (₹)</label>
                      <input type="number" className="dm-form-input" value={campaignForm.recipientFilter.minDonation || ''}
                        onChange={e => setCampaignForm(p => ({ ...p, recipientFilter: { ...p.recipientFilter, minDonation: e.target.value } }))} />
                    </div>
                    <div className="dm-form-group">
                      <label className="dm-form-label">Max Donation (₹)</label>
                      <input type="number" className="dm-form-input" value={campaignForm.recipientFilter.maxDonation || ''}
                        onChange={e => setCampaignForm(p => ({ ...p, recipientFilter: { ...p.recipientFilter, maxDonation: e.target.value } }))} />
                    </div>
                  </div>
                </div>
                <div className="dm-modal-footer">
                  <button className="dm-btn-outline" onClick={() => setShowCampaignForm(false)}>Cancel</button>
                  <button className="dm-btn-primary" onClick={handleCreateCampaign}>
                    <FiSave /> Save Campaign
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhatsApp;
