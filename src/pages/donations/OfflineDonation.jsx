import { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import {
  FiUser, FiMail, FiPhone, FiMapPin,
  FiCalendar, FiSave, FiX, FiCheckCircle,
  FiDollarSign, FiSearch, FiPlus, FiTrash2, FiEdit2,
  FiChevronLeft, FiChevronRight, FiHome, FiFileText
} from 'react-icons/fi';
import ReceiptGenerator from '../../components/ReceiptGenerator';

const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash', group: 'Offline' },
  { value: 'upi', label: 'UPI', group: 'Online' },
  { value: 'gpay', label: 'Google Pay', group: 'Online' },
  { value: 'phonepay', label: 'PhonePe', group: 'Online' },
  { value: 'paytm', label: 'Paytm', group: 'Online' },
  { value: 'neft', label: 'NEFT', group: 'Offline' },
  { value: 'rtgs', label: 'RTGS', group: 'Offline' },
  { value: 'cheque', label: 'Cheque', group: 'Offline' },
  { value: 'dd', label: 'Demand Draft', group: 'Offline' },
  { value: 'razorpay', label: 'Razorpay', group: 'Online', gateway: true },
  { value: 'qr', label: 'QR Code', group: 'Online', gateway: true },
  { value: 'bank_transfer', label: 'Bank Transfer', group: 'Offline' },
  { value: 'other', label: 'Other', group: 'Other' },
];

const DONOR_GROUPS = ['Donor Identity', 'Contact Details', 'Address'];
const DONATION_GROUPS = ['Donation Details', 'Donation Center'];

const GROUP_ICONS = {
  'Donor Identity': FiUser,
  'Contact Details': FiPhone,
  'Address': FiMapPin,
  'Donation Details': FiDollarSign,
  'Donation Center': FiHome,
};

const EMPTY_DONOR = {
  donorType: 'individual', donorName: '', dob: '', nationality: 'Indian',
  country: 'India', email: '', mobile: '', whatsapp: '', address: '',
  area: '', state: '', city: '', pincode: '', pan: '', adhar: ''
};

const EMPTY_DONATION = {
  amount: '', purpose: 'General', cause: '', donationType: 'once',
  paymentMode: 'cash', paymentGateway: '', transactionId: '',
  walletDetails: '', adhar: '', remark: '',
  donationDate: new Date().toISOString().split('T')[0],
  receiptNumber: '', donationHome: '', donationCenter: '', qrCode: '', center: '',
  isCSR: '', isFCRA: '', chequeNumber: '', chequeDate: '', bankName: '',
  pan: '', cin: '', fcraReference: ''
};

const OfflineDonation = () => {
  const [step, setStep] = useState('lookup');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState('mobile');
  const [donor, setDonor] = useState(null);
  const [donorForm, setDonorForm] = useState(EMPTY_DONOR);
  const [donationForm, setDonationForm] = useState(EMPTY_DONATION);
  const [donations, setDonations] = useState([]);
  const [donationsTotal, setDonationsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [searching, setSearching] = useState(false);
  const [editDonationId, setEditDonationId] = useState(null);
  const [receiptDonation, setReceiptDonation] = useState(null);
  const [qrConfigs, setQrConfigs] = useState([]);
  const [centers, setCenters] = useState([]);
  const [fieldSettings, setFieldSettings] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    api.get('/qr-configs').then(r => setQrConfigs(r.data.data || [])).catch(() => {});
    api.get('/centers?isActive=true').then(r => setCenters(r.data.data || [])).catch(() => {});
    api.get('/donor-field-settings').then(r => {
      setFieldSettings(r.data.data || []);
      setSettingsLoading(false);
    }).catch(() => { setSettingsLoading(false); });
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const fetchDonations = useCallback(async (d, p) => {
    if (!d) return;
    setLoading(true);
    try {
      const res = await api.get(`/offline-donations/donor/${d._id}?page=${p}&limit=100`);
      setDonations(res.data.data);
      setDonationsTotal(res.data.total);
      setPage(res.data.page);
      setTotalPages(res.data.pages);
    } catch { setDonations([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (donor) fetchDonations(donor, page);
  }, [donor, page, fetchDonations]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/donors/check?${searchBy}=${encodeURIComponent(searchQuery)}`);
      if (res.data.exists) {
        setDonor(res.data.data);
        setStep('donation');
        setPage(1);
      } else {
        setDonor(null);
        setDonorForm(p => ({ ...p, [searchBy]: searchQuery }));
        setStep('register');
      }
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Search failed');
    }
    setSearching(false);
  };

  const handleRegisterDonor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/donors', donorForm);
      setDonor(res.data.data);
      setStep('donation');
      setPage(1);
      showMsg('success', 'Donor registered successfully!');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Registration failed');
    }
    setSubmitting(false);
  };

  const handleSaveDonation = async (e) => {
    e.preventDefault();
    if (!donor) return;
    if (!donationForm.amount || Number(donationForm.amount) <= 0) {
      return showMsg('error', 'Valid amount is required');
    }
    setSubmitting(true);
    try {
      const payload = { ...donationForm, donor: donor._id };
      if (editDonationId) {
        await api.put(`/offline-donations/${editDonationId}`, payload);
        showMsg('success', 'Donation updated!');
        setEditDonationId(null);
      } else {
        await api.post('/offline-donations', payload);
        showMsg('success', 'Donation saved!');
      }
      setDonationForm(EMPTY_DONATION);
      fetchDonations(donor, 1);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Save failed');
    }
    setSubmitting(false);
  };

  const handleEditDonation = (d) => {
    setEditDonationId(d._id);
    setDonationForm({
      amount: d.amount, purpose: d.purpose, cause: d.cause || '',
      donationType: d.donationType, paymentMode: d.paymentMode,
      paymentGateway: d.paymentGateway || '', transactionId: d.transactionId || '',
      walletDetails: d.walletDetails || '', adhar: d.adhar || '',
      remark: d.remark || '', donationDate: d.donationDate ? d.donationDate.split('T')[0] : '',
      receiptNumber: d.receiptNumber || '', donationHome: d.donationHome || '',
      donationCenter: d.donationCenter || '', qrCode: d.qrCode || '',
      center: d.center?._id || d.center || '',
      isCSR: d.isCSR ? 'true' : '', isFCRA: d.isFCRA ? 'true' : '',
      chequeNumber: d.chequeNumber || '', chequeDate: d.chequeDate ? d.chequeDate.split('T')[0] : '',
      bankName: d.bankName || '', pan: d.pan || '', cin: d.cin || '',
      fcraReference: d.fcraReference || ''
    });
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm('Delete this donation?')) return;
    try {
      await api.delete(`/offline-donations/${id}`);
      showMsg('success', 'Donation deleted');
      fetchDonations(donor, page);
    } catch { showMsg('error', 'Delete failed'); }
  };

  const handleNewDonor = () => {
    setDonor(null);
    setDonationForm(EMPTY_DONATION);
    setEditDonationId(null);
    setStep('lookup');
    setSearchQuery('');
    setDonations([]);
  };

  const setDonation = (key, val) => setDonationForm(p => ({ ...p, [key]: val }));
  const setDonorField = (key, val) => setDonorForm(p => ({ ...p, [key]: val }));

  const selectedMode = PAYMENT_MODES.find(m => m.value === donationForm.paymentMode);
  const isOnline = selectedMode?.group === 'Online';

  const paymentModeLabel = (val) => {
    const m = PAYMENT_MODES.find(p => p.value === val);
    return m ? m.label : val;
  };

  /* ── Dynamic Field Renderer ─────────────────────────── */

  const renderField = (field, formObj, setter) => {
    const val = formObj[field.fieldName] !== undefined ? formObj[field.fieldName] : '';

    if (field.fieldName === 'donorType') {
      return (
        <div className="ofd-field" key={field._id || field.fieldName}>
          <label className="ofd-label" style={{ color: field.color }}>
            {field.label} {field.isRequired && <span className="ofd-required">*</span>}
          </label>
          <div className="ofd-radio-group">
            {(field.options || ['individual', 'organization', 'trust', 'corporate']).map(t => (
              <label key={t} className={`ofd-radio ${val === t ? 'checked' : ''}`}>
                <input type="radio" name={`r${field.fieldName}`} value={t}
                  checked={val === t}
                  onChange={e => setter(field.fieldName, e.target.value)} />
                <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (field.fieldName === 'paymentMode') {
      return (
        <div className="ofd-field" key={field._id || field.fieldName}>
          <label className="ofd-label" style={{ color: field.color }}>
            {field.label} {field.isRequired && <span className="ofd-required">*</span>}
          </label>
          <div className="ofd-payment-grid">
            {PAYMENT_MODES.map(mode => (
              <label key={mode.value}
                className={`ofd-payment-option ${val === mode.value ? 'selected' : ''}`}
                style={val === mode.value ? { borderColor: field.color, background: `${field.color}12` } : {}}>
                <input type="radio" name="paymentMode" value={mode.value}
                  checked={val === mode.value}
                  onChange={e => setter('paymentMode', e.target.value)} />
                <span className="ofd-payment-label">{mode.label}</span>
                <span className="ofd-payment-group">{mode.group}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    const handleChange = (e) => setter(field.fieldName, e.target.value);
    const inputProps = {
      className: `ofd-input${field.type === 'textarea' ? ' ofd-textarea' : ''}${field.fieldName === 'pan' ? ' ofd-uppercase' : ''}`,
      value: val,
      onChange: field.fieldName === 'pan'
        ? (e) => setter(field.fieldName, e.target.value.toUpperCase())
        : handleChange,
      placeholder: field.label,
      required: field.isRequired,
    };

    let input;
    switch (field.type) {
      case 'textarea':
        input = <textarea {...inputProps} rows={2} />;
        break;
      case 'select':
        input = (
          <select {...inputProps}>
            <option value="">-- Select --</option>
            {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        );
        break;
      case 'date':
        input = <input type="date" {...inputProps} />;
        break;
      case 'number':
        input = <input type="number" {...inputProps} min={field.fieldName === 'amount' ? '1' : '0'} step="any" />;
        break;
      case 'tel':
        input = <input type="tel" {...inputProps} />;
        break;
      case 'email':
        input = <input type="email" {...inputProps} />;
        break;
      default:
        input = <input type="text" {...inputProps} />;
    }

    return (
      <div className="ofd-field" key={field._id || field.fieldName}>
        <label className="ofd-label" style={{ color: field.color }}>
          {field.label} {field.isRequired && <span className="ofd-required">*</span>}
        </label>
        {input}
      </div>
    );
  };

  const renderSection = (group, fields, formObj, setter, extraContent) => {
    if (fields.length === 0) return null;
    const accent = fields[0].color || '#7c3aed';
    const Icon = GROUP_ICONS[group] || FiFileText;
    return (
      <div className="ofd-section" style={{ '--sec-color': accent }} key={group}>
        <div className="ofd-section-header">
          <div className="ofd-section-icon" style={{ background: `${accent}18`, color: accent }}>
            <Icon />
          </div>
          <h3 className="ofd-section-title">{group}</h3>
        </div>
        <div className="ofd-section-body">
          {fields.map(f => renderField(f, formObj, setter))}
          {extraContent}
        </div>
      </div>
    );
  };

  const getActiveFieldsByGroup = (groups) => {
    const result = {};
    groups.forEach(g => { result[g] = []; });
    fieldSettings
      .filter(f => f.isActive !== false && groups.includes(f.group))
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach(f => {
        if (!result[f.group]) result[f.group] = [];
        result[f.group].push(f);
      });
    return result;
  };

  /* ── Validation helper ──────────────────────────────── */
  const hasRequiredFields = (groups) => {
    return fieldSettings.some(f =>
      f.isActive !== false && groups.includes(f.group) && f.isRequired
    );
  };

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title">Record Donation</h1>
          <p className="dm-subtitle">
            {donor ? `Donor: ${donor.donorName} (${donor.donorId})` : 'Find or register a donor'}
          </p>
        </div>
        {donor && (
          <button className="dm-btn-outline" onClick={handleNewDonor}>
            <FiUser /> New Donor
          </button>
        )}
      </div>

      {msg.text && <div className={`dm-alert dm-alert-${msg.type}`}>{msg.text}</div>}

      {/* Step 1: Donor Lookup */}
      {step === 'lookup' && (
        <div className="ofd-lookup-card">
          <div className="ofd-lookup-icon"><FiSearch /></div>
          <h3>Find or Register Donor</h3>
          <p>Search by mobile, email, or PAN to find an existing donor.</p>
          <div className="ofd-lookup-tabs">
            {['mobile', 'email', 'pan'].map(t => (
              <button key={t} className={`ofd-lookup-tab ${searchBy === t ? 'active' : ''}`}
                onClick={() => setSearchBy(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="ofd-lookup-input-row">
            <input className="ofd-input"
              placeholder={searchBy === 'mobile' ? '+91 9876543210' : searchBy === 'email' ? 'donor@example.com' : 'ABCDE1234F'}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button className="dm-btn-primary" onClick={handleSearch} disabled={searching}>
              <FiSearch /> {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
          <div className="ofd-lookup-or"><span>OR</span></div>
          <button className="dm-btn-outline" onClick={() => { setStep('register'); setDonorForm(EMPTY_DONOR); }}>
            <FiPlus /> Register New Donor
          </button>
        </div>
      )}

      {/* Step 2: Register New Donor — Dynamic from Field Settings */}
      {step === 'register' && (
        settingsLoading ? <div className="loading">Loading field settings...</div> :
        <form onSubmit={handleRegisterDonor}>
          <div className="ofd-grid">
            {Object.entries(getActiveFieldsByGroup(DONOR_GROUPS)).map(([group, fields]) =>
              renderSection(group, fields, donorForm, setDonorField)
            )}
          </div>
          {Object.values(getActiveFieldsByGroup(DONOR_GROUPS)).every(a => a.length === 0) && (
            <div className="dm-empty" style={{ padding: '2rem', textAlign: 'center' }}>
              No donor fields are configured. Go to <strong>Donor Field Settings</strong> to enable them.
            </div>
          )}
          <div className="ofd-submit-bar">
            <button type="button" className="dm-btn-outline" onClick={() => setStep('lookup')}>
              <FiChevronLeft /> Back
            </button>
            <button type="submit" className="dm-btn-primary" disabled={submitting}>
              <FiSave /> {submitting ? 'Registering...' : 'Register & Continue'}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Unified Donation Form — Dynamic from Field Settings */}
      {step === 'donation' && donor && (
        settingsLoading ? <div className="loading">Loading field settings...</div> :
        <>
          <div className="ofd-donor-summary">
            <div className="ofd-donor-summary-av" style={{ background: '#7c3aed' }}>
              {donor.donorName?.charAt(0)}
            </div>
            <div className="ofd-donor-summary-info">
              <strong>{donor.donorName}</strong>
              <span className="ofd-donor-summary-id">{donor.donorId}</span>
              <span>{donor.mobile}</span>
              {donor.email && <span>{donor.email}</span>}
            </div>
            <div className="ofd-donor-summary-stats">
              <div className="ofd-donor-stat">
                <span className="ofd-donor-stat-val">{donor.totalDonations || 0}</span>
                <span className="ofd-donor-stat-label">Donations</span>
              </div>
              <div className="ofd-donor-stat">
                <span className="ofd-donor-stat-val">₹{Number(donor.totalAmount || 0).toLocaleString('en-IN')}</span>
                <span className="ofd-donor-stat-label">Total Given</span>
              </div>
              <div className="ofd-donor-stat">
                <span className="ofd-donor-stat-val">{donationsTotal}</span>
                <span className="ofd-donor-stat-label">This Session</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveDonation}>
            <div className="ofd-grid">
              {Object.entries(getActiveFieldsByGroup(DONATION_GROUPS)).map(([group, fields]) =>
                renderSection(group, fields, donationForm, setDonation,
                  /* online-specific extras after paymentMode field */
                  group === 'Donation Details' && fields.some(f => f.fieldName === 'paymentMode') && (
                    <>
                      {isOnline && (
                        <div className="ofd-online-fields">
                          <div className="ofd-row">
                            <div className="ofd-field">
                              <label className="ofd-label">Payment Gateway</label>
                              <select className="ofd-input" value={donationForm.paymentGateway}
                                onChange={e => setDonation('paymentGateway', e.target.value)}>
                                <option value="">-- Select --</option>
                                <option value="Razorpay">Razorpay</option>
                                <option value="PhonePe">PhonePe</option>
                                <option value="Google Pay">Google Pay</option>
                                <option value="Paytm">Paytm</option>
                                <option value="BHIM UPI">BHIM UPI</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="ofd-field">
                              <label className="ofd-label">Transaction ID</label>
                              <input className="ofd-input" value={donationForm.transactionId}
                                onChange={e => setDonation('transactionId', e.target.value)}
                                placeholder="Online transaction reference" />
                            </div>
                          </div>

                          {qrConfigs.length > 0 && (
                            <div className="ofd-field">
                              <label className="ofd-label">QR Code Used</label>
                              <select className="ofd-input" value={donationForm.qrCode}
                                onChange={e => setDonation('qrCode', e.target.value)}>
                                <option value="">-- None --</option>
                                {qrConfigs.filter(q => q.isActive).map(q => (
                                  <option key={q._id} value={q._id}>
                                    {q.name} {q.amountType === 'fixed' && q.amount ? `(₹${q.amount})` : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cheque fields */}
                      {donationForm.paymentMode === 'cheque' && (
                        <div className="ofd-row">
                          <div className="ofd-field">
                            <label className="ofd-label">Cheque Number</label>
                            <input className="ofd-input" value={donationForm.chequeNumber || ''}
                              onChange={e => setDonation('chequeNumber', e.target.value)} placeholder="Cheque number" />
                          </div>
                          <div className="ofd-field">
                            <label className="ofd-label">Cheque Date</label>
                            <input type="date" className="ofd-input" value={donationForm.chequeDate || ''}
                              onChange={e => setDonation('chequeDate', e.target.value)} />
                          </div>
                          <div className="ofd-field">
                            <label className="ofd-label">Bank Name</label>
                            <input className="ofd-input" value={donationForm.bankName || ''}
                              onChange={e => setDonation('bankName', e.target.value)} placeholder="Bank name" />
                          </div>
                        </div>
                      )}

                      {/* 80G notice for ₹2000+ */}
                      {(Number(donationForm.amount) >= 2000) && (
                        <div className="ofd-field">
                          <div style={{ padding: '0.5rem 0.75rem', background: '#fef3c7', borderRadius: 'var(--radius)', fontSize: '0.78rem', color: '#92400e' }}>
                            <strong>80G Notice:</strong> Donations of ₹2,000+ require PAN for 80G tax exemption certificate.
                            {!donationForm.pan && !donor?.pan && ' Please collect PAN from donor.'}
                          </div>
                        </div>
                      )}

                      {/* CSR toggle */}
                      <div className="ofd-row">
                        <div className="ofd-field">
                          <label className="ofd-label">
                            <input type="checkbox" checked={donationForm.isCSR === 'true'}
                              onChange={e => setDonation('isCSR', e.target.checked ? 'true' : '')} style={{ marginRight: '0.4rem' }} />
                            CSR Donation
                          </label>
                          {donationForm.isCSR === 'true' && (
                            <input className="ofd-input" value={donationForm.cin || ''}
                              onChange={e => setDonation('cin', e.target.value)} placeholder="CIN Number (required)" style={{ marginTop: '0.3rem' }} />
                          )}
                        </div>
                        <div className="ofd-field">
                          <label className="ofd-label">
                            <input type="checkbox" checked={donationForm.isFCRA === 'true'}
                              onChange={e => setDonation('isFCRA', e.target.checked ? 'true' : '')} style={{ marginRight: '0.4rem' }} />
                            FCRA (Foreign Donation)
                          </label>
                          {donationForm.isFCRA === 'true' && (
                            <input className="ofd-input" value={donationForm.fcraReference || ''}
                              onChange={e => setDonation('fcraReference', e.target.value)} placeholder="FCRA reference" style={{ marginTop: '0.3rem' }} />
                          )}
                        </div>
                      </div>

                      {/* Backdate warning */}
                      {donationForm.donationDate && new Date(donationForm.donationDate).toDateString() !== new Date().toDateString() && (
                        <div className="ofd-field">
                          <div style={{ padding: '0.4rem 0.7rem', background: '#dbeafe', borderRadius: 'var(--radius)', fontSize: '0.78rem', color: '#1e40af' }}>
                            Backdated entry: {new Date(donationForm.donationDate).toLocaleDateString('en-IN')}. This will be logged in audit trail.
                          </div>
                        </div>
                      )}
                    </>
                  )
                )
              )}
            </div>

            {/* Center selection dropdown */}
            {centers.length > 0 && (
              <div className="dm-card" style={{ marginTop: '0.5rem', padding: '0.85rem 1.1rem' }}>
                <div className="ofd-field">
                  <label className="ofd-label" style={{ color: '#7c3aed' }}>Collection Center</label>
                  <select className="ofd-input" value={donationForm.center}
                    onChange={e => setDonation('center', e.target.value)}>
                    <option value="">-- Select Center (optional) --</option>
                    {centers.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.code ? `(${c.code})` : ''}{c.city ? ` - ${c.city}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <button type="submit" className="dm-btn-primary" disabled={submitting}>
                <FiSave /> {submitting ? 'Saving...' : editDonationId ? 'Update Donation' : 'Save Donation'}
              </button>
              {editDonationId && (
                <button type="button" className="dm-btn-outline"
                  onClick={() => { setEditDonationId(null); setDonationForm(EMPTY_DONATION); }}>
                  <FiX /> Cancel Edit
                </button>
              )}
            </div>
          </form>

          {/* Donations History */}
          <div className="dm-card">
            <div className="dm-card-header">
              <span className="dm-card-title">Donation History</span>
              <span className="dm-count-badge">{donationsTotal} total</span>
            </div>
            {loading ? (
              <div className="loading">Loading donations...</div>
            ) : donations.length === 0 ? (
              <div className="dm-empty">No donations recorded yet for this donor.</div>
            ) : (
              <div className="dm-table-wrap">
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th>Receipt</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Purpose</th>
                      <th>Payment Mode</th>
                      <th>Center</th>
                      <th>Gateway / Ref</th>
                      <th>Remark</th>
                      <th style={{ width: 120 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map(d => (
                      <tr key={d._id}>
                        <td className="dm-dim dm-mono" style={{ fontSize: '0.68rem' }}>{d.donationId ? d.donationId.slice(-10) : (d._id || '').slice(-8)}</td>
                        <td className="dm-dim">{new Date(d.donationDate).toLocaleDateString('en-IN')}</td>
                        <td className="dm-amount">₹{Number(d.amount).toLocaleString('en-IN')}</td>
                        <td>{d.purpose}</td>
                        <td>
                          <span className={`dm-status ${d.paymentMode === 'cash' || d.paymentMode === 'cheque' || d.paymentMode === 'bank_transfer' || d.paymentMode === 'dd' ? 'dm-status-success' : 'dm-status-pending'}`}>
                            {paymentModeLabel(d.paymentMode)}
                          </span>
                        </td>
                        <td className="dm-dim">{d.center?.name || '—'}</td>
                        <td className="dm-dim">
                          {d.paymentGateway || d.transactionId || d.walletDetails || '-'}
                        </td>
                        <td className="dm-dim">{d.remark || '-'}</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn-icon btn-edit" onClick={() => handleEditDonation(d)} title="Edit">
                              <FiEdit2 />
                            </button>
                            <button className="btn-icon btn-receipt" onClick={() => setReceiptDonation(d)} title="Generate Receipt">
                              <FiFileText />
                            </button>
                            <button className="btn-icon btn-delete" onClick={() => handleDeleteDonation(d._id)} title="Delete">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="dm-pagination">
                <button className="dm-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <FiChevronLeft />
                </button>
                <span className="dm-page-info">Page {page} of {totalPages}</span>
                <button className="dm-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Receipt Generator Modal */}
      {receiptDonation && (
        <ReceiptGenerator donation={receiptDonation} type="offline"
          onClose={() => setReceiptDonation(null)} />
      )}
    </div>
  );
};

export default OfflineDonation;
