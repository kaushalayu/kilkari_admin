import { useState, useEffect } from 'react';
import api, { getFullUrl } from '../../api/client';
import { FiPlus, FiDownload, FiTrash2, FiEdit2, FiX, FiSave, FiCopy, FiCheck, FiRefreshCw } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';

const PAYMENT_GATEWAYS = ['Razorpay', 'PhonePe', 'Google Pay', 'Paytm', 'BHIM UPI', 'Other'];
const CAUSES = ['General', 'Education', 'Healthcare', 'Food', 'Shelter', 'Child Welfare', 'Women Empowerment', 'Environment', 'Other'];
const AMOUNT_TYPES = [
  { value: 'custom', label: 'Custom (donor enters amount)' },
  { value: 'fixed', label: 'Fixed Amount' },
];

const EMPTY = {
  name: '', description: '', upiId: '', upiName: '',
  amount: '', amountType: 'custom', minAmount: '',
  purpose: 'General', cause: '', paymentGateway: '',
  expireDate: '', qrImage: '', isActive: true, order: 0
};

const QRManagement = () => {
  const [qrs, setQrs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [copied, setCopied] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);

  useEffect(() => { fetchQrs(); }, []);

  const fetchQrs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/qr-configs');
      setQrs(res.data.data);
    } catch { setQrs([]); }
    setLoading(false);
  };

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const openCreate = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (q) => {
    setForm({
      ...q,
      expireDate: q.expireDate ? q.expireDate.split('T')[0] : '',
    });
    setEditId(q._id);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

  const handleSave = async () => {
    if (!form.name.trim()) return showMsg('error', 'QR name is required');
    if (!form.upiId && !form.qrImage) return showMsg('error', 'Either UPI ID or QR image is required');
    try {
      if (editId) {
        await api.put(`/qr-configs/${editId}`, form);
        showMsg('success', 'QR updated with new generated code!');
      } else {
        await api.post('/qr-configs', form);
        showMsg('success', 'QR created!');
      }
      closeForm();
      fetchQrs();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Save failed');
    }
  };

  const handleRegenerate = async (id) => {
    setGenerating(true);
    try {
      await api.post(`/qr-configs/${id}/regenerate`);
      showMsg('success', 'QR code regenerated!');
      fetchQrs();
    } catch { showMsg('error', 'Regeneration failed'); }
    setGenerating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this QR?')) return;
    try {
      await api.delete(`/qr-configs/${id}`);
      showMsg('success', 'QR deleted');
      fetchQrs();
    } catch { showMsg('error', 'Delete failed'); }
  };

  const toggleActive = async (q) => {
    try {
      await api.put(`/qr-configs/${q._id}`, { isActive: !q.isActive });
      fetchQrs();
    } catch { showMsg('error', 'Toggle failed'); }
  };

  const copyUPI = (upiId) => {
    navigator.clipboard.writeText(upiId).then(() => {
      setCopied(upiId);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const downloadQR = (qr) => {
    const url = getFullUrl(qr.qrImage);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${qr.name.replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const isExpired = (date) => date && new Date(date) < new Date();

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title">QR Code Generator</h1>
          <p className="dm-subtitle">Create, manage and download QR codes for donation collection</p>
        </div>
        <button className="dm-btn-primary" onClick={openCreate}>
          <FiPlus /> Generate New QR
        </button>
      </div>

      {msg.text && <div className={`dm-alert dm-alert-${msg.type}`}>{msg.text}</div>}

      {loading ? (
        <div className="loading">Loading QR codes...</div>
      ) : qrs.length === 0 ? (
        <div className="dm-empty-state">
          <div className="dm-empty-icon">📱</div>
          <h3>No QR Codes Yet</h3>
          <p>Configure your first QR code to start collecting donations via UPI.</p>
          <button className="dm-btn-primary" onClick={openCreate}><FiPlus /> Generate New QR</button>
        </div>
      ) : (
        <div className="dm-qr-grid">
          {qrs.map(qr => (
            <div key={qr._id} className={`dm-qr-card ${!qr.isActive ? 'dm-qr-inactive' : ''}`}>
              <div className="dm-qr-card-header">
                <div className="dm-qr-status-dot" style={{ background: qr.isActive ? '#4ade80' : '#9ca3af' }} />
                {isExpired(qr.expireDate) && <span className="dm-expired-badge">Expired</span>}
                {qr.amountType === 'fixed' && <span className="dm-fixed-badge">Fixed</span>}
                <span className="dm-qr-name">{qr.name}</span>
                <div className="dm-qr-actions">
                  <button className="dm-icon-btn" onClick={() => openEdit(qr)} title="Edit"><FiEdit2 size={13} /></button>
                  <button className="dm-icon-btn" onClick={() => handleRegenerate(qr._id)} disabled={generating} title="Regenerate QR">
                    <FiRefreshCw size={13} />
                  </button>
                  <button className="dm-icon-btn dm-icon-btn-danger" onClick={() => handleDelete(qr._id)} title="Delete"><FiTrash2 size={13} /></button>
                </div>
              </div>

              <div className="dm-qr-img-wrap" onClick={() => setSelectedQr(qr)} style={{ cursor: 'pointer' }}>
                {qr.qrImage ? (
                  <img src={getFullUrl(qr.qrImage)} alt={qr.name} className="dm-qr-img" crossOrigin="anonymous" />
                ) : !qr.upiId ? (
                  <div className="dm-qr-placeholder"><span>No QR Image</span></div>
                ) : (
                  <div className="dm-qr-placeholder"><span>Generate QR</span></div>
                )}
              </div>

              <div className="dm-qr-info">
                {qr.upiId && (
                  <div className="dm-qr-upi">
                    <span className="dm-qr-upi-id">{qr.upiId}</span>
                    <button className="dm-icon-btn" onClick={() => copyUPI(qr.upiId)} title="Copy UPI ID">
                      {copied === qr.upiId ? <FiCheck size={12} color="#059669" /> : <FiCopy size={12} />}
                    </button>
                  </div>
                )}
                {qr.upiName && <div className="dm-qr-meta">Name: {qr.upiName}</div>}
                {qr.cause && <div className="dm-qr-meta">Cause: {qr.cause}</div>}
                {qr.amountType === 'fixed' && qr.amount > 0 && (
                  <div className="dm-qr-meta">Amount: ₹{Number(qr.amount).toLocaleString('en-IN')}</div>
                )}
                {qr.minAmount > 0 && (
                  <div className="dm-qr-meta">Min: ₹{Number(qr.minAmount).toLocaleString('en-IN')}</div>
                )}
                {qr.paymentGateway && <div className="dm-qr-meta">Gateway: {qr.paymentGateway}</div>}
                {qr.expireDate && (
                  <div className={`dm-qr-meta ${isExpired(qr.expireDate) ? 'dm-expired-text' : ''}`}>
                    {isExpired(qr.expireDate) ? 'Expired: ' : 'Expires: '}
                    {new Date(qr.expireDate).toLocaleDateString('en-IN')}
                  </div>
                )}
                {qr.description && <div className="dm-qr-desc">{qr.description}</div>}
              </div>

              <div className="dm-qr-footer">
                <button className={`dm-toggle-active ${qr.isActive ? 'active' : ''}`} onClick={() => toggleActive(qr)}>
                  {qr.isActive ? 'Active' : 'Inactive'}
                </button>
                {qr.qrImage && (
                  <button className="dm-btn-sm" onClick={() => downloadQR(qr)}>
                    <FiDownload size={12} /> Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="dm-modal-overlay" onClick={closeForm}>
          <div className="dm-modal dm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h2 className="dm-modal-name">{editId ? 'Edit QR Code' : 'Generate New QR Code'}</h2>
              <button className="dm-modal-close" onClick={closeForm}><FiX /></button>
            </div>
            <div className="dm-modal-body">
              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">QR Name *</label>
                  <input className="dm-form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Main Donation QR" />
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">Select Cause</label>
                  <select className="dm-form-input" value={form.cause} onChange={e => setForm(p => ({ ...p, cause: e.target.value }))}>
                    <option value="">-- Select --</option>
                    {CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">Amount Type</label>
                  <select className="dm-form-input" value={form.amountType} onChange={e => setForm(p => ({ ...p, amountType: e.target.value }))}>
                    {AMOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">{form.amountType === 'fixed' ? 'Fixed Amount (₹)' : 'Suggested Amount (₹)'}</label>
                  <input className="dm-form-input" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
                </div>
              </div>

              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">Minimum Amount (₹)</label>
                  <input className="dm-form-input" type="number" value={form.minAmount} onChange={e => setForm(p => ({ ...p, minAmount: e.target.value }))} placeholder="0" />
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">Payment Gateway</label>
                  <select className="dm-form-input" value={form.paymentGateway} onChange={e => setForm(p => ({ ...p, paymentGateway: e.target.value }))}>
                    <option value="">-- Select --</option>
                    {PAYMENT_GATEWAYS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">UPI ID</label>
                  <input className="dm-form-input" value={form.upiId} onChange={e => setForm(p => ({ ...p, upiId: e.target.value }))} placeholder="name@upi" />
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">UPI Name (Account Holder)</label>
                  <input className="dm-form-input" value={form.upiName} onChange={e => setForm(p => ({ ...p, upiName: e.target.value }))} placeholder="Kilkari Care Foundation" />
                </div>
              </div>

              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">Expire Date</label>
                  <input type="date" className="dm-form-input" value={form.expireDate} onChange={e => setForm(p => ({ ...p, expireDate: e.target.value }))} />
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} style={{ marginRight: '0.4rem' }} />
                    Active
                  </label>
                </div>
              </div>

              <div className="dm-form-group">
                <label className="dm-form-label">Purpose / Description</label>
                <textarea className="dm-form-input" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Where will this QR be used?" />
              </div>

              <div className="dm-form-group">
                <label className="dm-form-label">QR Image (upload custom or auto-generate)</label>
                <ImageUpload value={form.qrImage} onChange={url => setForm(p => ({ ...p, qrImage: url }))} folder="qr-codes" />
                <p className="form-hint" style={{ marginTop: '0.3rem' }}>
                  {editId
                    ? 'QR will be auto-generated when you save. Upload a custom image to override.'
                    : 'QR code will be auto-generated from UPI ID after saving.'}
                </p>
              </div>
            </div>
            <div className="dm-modal-footer">
              <button className="dm-btn-outline" onClick={closeForm}>Cancel</button>
              <button className="dm-btn-primary" onClick={handleSave}><FiSave /> {editId ? 'Update & Regenerate QR' : 'Generate QR'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Full size QR preview */}
      {selectedQr && (
        <div className="dm-modal-overlay" onClick={() => setSelectedQr(null)}>
          <div className="dm-modal dm-modal-md" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="dm-modal-header">
              <h2 className="dm-modal-name">{selectedQr.name}</h2>
              <button className="dm-modal-close" onClick={() => setSelectedQr(null)}><FiX /></button>
            </div>
            <div className="dm-modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
              {selectedQr.qrImage ? (
                <img src={getFullUrl(selectedQr.qrImage)} alt={selectedQr.name}
                  style={{ width: 250, height: 250, objectFit: 'contain', borderRadius: 12 }} />
              ) : (
                <div className="dm-qr-placeholder" style={{ width: 250, height: 250 }}>
                  <span>No QR Image</span>
                </div>
              )}
              {selectedQr.upiId && (
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', fontFamily: 'monospace' }}>
                  {selectedQr.upiId}
                </div>
              )}
              {selectedQr.amountType === 'fixed' && selectedQr.amount > 0 && (
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>
                  ₹{Number(selectedQr.amount).toLocaleString('en-IN')}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {selectedQr.qrImage && (
                  <button className="dm-btn-primary" onClick={() => downloadQR(selectedQr)}>
                    <FiDownload /> Download QR
                  </button>
                )}
                <button className="dm-btn-outline" onClick={() => setSelectedQr(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRManagement;
