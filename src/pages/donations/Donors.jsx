import { useState, useEffect } from 'react';
import api, { getFullUrl } from '../../api/client';
import { Link } from 'react-router-dom';
import {
  FiSearch, FiDownload, FiUser, FiMail, FiPhone,
  FiMapPin, FiFileText, FiDollarSign, FiGrid, FiList,
  FiSettings, FiX, FiCalendar, FiGlobe, FiHome,
  FiChevronLeft, FiChevronRight, FiEye, FiArchive,
  FiToggleLeft, FiToggleRight, FiPlus, FiBox
} from 'react-icons/fi';

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];
const avColor   = (s = '') => AV_COLORS[s.charCodeAt(0) % AV_COLORS.length];

const InfoRow = ({ icon: Icon, label, value, color }) => {
  if (!value) return null;
  return (
    <div className="donor-card-row">
      <div className="donor-card-row-icon" style={{ background: color + '18', color }}>
        <Icon />
      </div>
      <div className="donor-card-row-body">
        <span className="donor-card-row-label">{label}</span>
        <span className="donor-card-row-value">{value}</span>
      </div>
    </div>
  );
};

const DonorCard = ({ donor, onView }) => {
  const av = avColor(donor.donorName || 'A');
  return (
    <div className="donor-card">
      <div className="donor-card-accent" style={{ background: `linear-gradient(90deg, ${av}, ${av}88)` }} />
      <div className="donor-card-top">
        <div className="donor-card-av" style={{ background: av }}>
          {(donor.donorName || 'A')[0].toUpperCase()}
        </div>
        <div className="donor-card-identity">
          <div className="donor-card-name">{donor.donorName}</div>
          {donor.organizationName && <div className="donor-card-org" style={{ fontSize: '0.72rem', color: '#64748b' }}>{donor.organizationName}</div>}
          <span className="donor-card-id" style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 600 }}>
            {donor.donorCode || donor.donorId}
          </span>
          {donor.donorType && (
            <span className="donor-card-type" style={{ background: '#2563eb18', color: '#2563eb' }}>
              {donor.donorType}
            </span>
          )}
        </div>
        <div className="donor-card-total">
          <div className="donor-card-total-val">₹{Number(donor.totalAmount || 0).toLocaleString('en-IN')}</div>
          <div className="donor-card-total-label">{donor.totalDonations || 0} donation{(donor.totalDonations||0) !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div className="donor-card-rows">
        <InfoRow icon={FiMail}     label="Email"       value={donor.email}         color="#db2777" />
        <InfoRow icon={FiPhone}    label="Mobile"      value={donor.mobile}        color="#d97706" />
        <InfoRow icon={FiMapPin}   label="City"        value={[donor.city, donor.state].filter(Boolean).join(', ')} color="#dc2626" />
        <InfoRow icon={FiFileText} label="PAN"         value={donor.pan}           color="#92400e" />
        <InfoRow icon={FiBox} label="DCC"         value={donor.assignedDCC?.name || donor.assignedDCC} color="#7c3aed" />
        <InfoRow icon={FiCalendar} label="Last Donation" value={donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString('en-IN') : ''} color="#059669" />
      </div>
      <div className="donor-card-footer">
        <button className="dm-btn-sm" onClick={() => onView(donor)}>
          <FiUser size={11} /> View Details
        </button>
      </div>
    </div>
  );
};

const Donors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDonors, setTotalDonors] = useState(0);
  const [donorTab, setDonorTab] = useState('info');

  useEffect(() => { fetchDonors(); }, [page]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/donors?page=${page}&limit=50&search=${search}`);
      setDonors(res.data.data);
      setTotalDonors(res.data.total);
      setTotalPages(res.data.pages);
    } catch { setDonors([]); }
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(1);
    fetchDonors();
  };

  const filtered = donors;

  const exportCSV = () => {
    const rows = [['Donor Code','Name','Type','Organization','Email','Mobile','City','State','PAN','CIN','DCC','Total Donations','Total Amount','Last Donation','WhatsApp Receipt']];
    filtered.forEach(d => rows.push([
      d.donorCode||d.donorId||'', d.donorName||'', d.donorType||'', d.organizationName||'',
      d.email||'', d.mobile||'', d.city||'', d.state||'', d.pan||'', d.cin||'',
      d.assignedDCC?.name||'', d.totalDonations||0, d.totalAmount||0,
      d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString('en-IN') : '',
      d.whatsappReceipt !== false ? 'Yes' : 'No'
    ]));
    const csv = rows.map(r => r.map(c => `"${c||''}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'donors.csv';
    a.click();
  };

  const toggleWhatsApp = async (id) => {
    try {
      await api.put(`/donors/${id}/toggle-whatsapp`);
      fetchDonors();
    } catch {}
  };

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title">Donors</h1>
          <p className="dm-subtitle">{totalDonors} registered donors</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link to="/donations/field-settings" className="dm-btn-outline" style={{ textDecoration: 'none' }}>
            <FiSettings size={13} /> Field Settings
          </Link>
          <button className="dm-btn-outline" onClick={exportCSV}><FiDownload /> Export</button>
        </div>
      </div>

      <div className="dm-filters">
        <div className="dm-search-bar" style={{ flex: 1 }}>
          <FiSearch className="dm-search-icon" />
          <input className="dm-search-input" placeholder="Search by name, email, phone, PAN, ID..."
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          {search && <button className="dm-search-clear" onClick={() => { setSearch(''); setPage(1); }}><FiX size={12}/></button>}
        </div>
        <button className="dm-btn-primary" onClick={handleSearch}><FiSearch size={13} /> Search</button>
        <div className="dm-toggle-group">
          <button className={`dm-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')}>
            <FiGrid size={13} /> Cards
          </button>
          <button className={`dm-toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
            <FiList size={13} /> Table
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading donors...</div>
      ) : viewMode === 'cards' ? (
        <div className="donor-cards-grid">
          {filtered.length === 0 && (
            <div className="dm-empty-state">
              <div className="dm-empty-icon">👤</div>
              <h3>No donors found</h3>
              <p>Register a donor from the Offline Donation page.</p>
              <Link to="/donations/offline" className="dm-btn-primary" style={{ textDecoration: 'none' }}>
                + Add Offline Donation
              </Link>
            </div>
          )}
          {filtered.map(d => (
            <DonorCard key={d._id} donor={d} onView={setSelected} />
          ))}
        </div>
      ) : (
        <div className="dm-card">
          <div className="dm-table-wrap">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Donor Code</th><th>Name</th><th>Mobile</th><th>City</th>
                  <th>PAN</th><th>Type</th><th>DCC</th><th>Donations</th>
                  <th>Total</th><th>WhatsApp</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={11} className="dm-empty">No donors found.</td></tr>}
                {filtered.map(d => (
                  <tr key={d._id}>
                    <td className="dm-dim dm-mono" style={{ fontSize: '0.7rem' }}>{d.donorCode || d.donorId}</td>
                    <td>
                      <div className="dm-donor-cell">
                        <div className="dm-av" style={{ background: avColor(d.donorName||'A') }}>
                          {(d.donorName||'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="dm-donor-name">{d.donorName}</div>
                          <div className="dm-donor-email">{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="dm-dim">{d.mobile || '—'}</td>
                    <td className="dm-dim">{d.city || '—'}</td>
                    <td className="dm-dim">{d.pan || '—'}</td>
                    <td className="dm-dim" style={{ textTransform: 'capitalize' }}>{d.donorType || '—'}</td>
                    <td className="dm-dim">{d.assignedDCC?.name || '—'}</td>
                    <td><span className="dm-count-badge">{d.totalDonations || 0}</span></td>
                    <td className="dm-amount">₹{Number(d.totalAmount||0).toLocaleString('en-IN')}</td>
                    <td>
                      <button className="btn-icon" onClick={() => toggleWhatsApp(d._id)} title="Toggle WhatsApp receipt">
                        {d.whatsappReceipt !== false ? <FiToggleRight style={{ color: '#059669' }} /> : <FiToggleLeft style={{ color: '#94a3b8' }} />}
                      </button>
                    </td>
                    <td>
                      <button className="dm-btn-sm" onClick={() => setSelected(d)}>
                        <FiUser size={11} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      )}

      {selected && (
        <div className="dm-modal-overlay" onClick={() => setSelected(null)}>
          <div className="dm-modal" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <div className="dm-av dm-av-lg" style={{ background: avColor(selected.donorName||'A') }}>
                {(selected.donorName||'A')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h2 className="dm-modal-name">{selected.donorName}</h2>
                {selected.organizationName && <p className="dm-modal-sub" style={{ color: '#64748b' }}>{selected.organizationName}</p>}
                <p className="dm-modal-sub">
                  <strong>{selected.donorCode || selected.donorId}</strong>
                  &nbsp;·&nbsp;{selected.donorType}
                  &nbsp;·&nbsp;Total: <strong>₹{Number(selected.totalAmount||0).toLocaleString('en-IN')}</strong>
                  &nbsp;·&nbsp;{selected.totalDonations || 0} donations
                </p>
              </div>
              <button className="dm-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="dm-tabs" style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
              {['info', 'history', 'pdc'].map(t => (
                <button key={t} className={`dm-tab ${donorTab === t ? 'active' : ''}`}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.82rem', fontWeight: 600, background: 'none', border: 'none', borderBottom: '2px solid ' + (donorTab === t ? '#2563eb' : 'transparent'), color: donorTab === t ? '#2563eb' : '#64748b', cursor: 'pointer' }}
                  onClick={() => setDonorTab(t)}>
                  {t === 'info' ? 'Info' : t === 'history' ? 'Donation History' : 'PDC Tracking'}
                </button>
              ))}
            </div>

            {donorTab === 'info' && (
              <div className="dm-modal-info">
                {selected.email && <div className="dm-info-row"><FiMail size={13}/> {selected.email}</div>}
                {selected.mobile && <div className="dm-info-row"><FiPhone size={13}/> {selected.mobile}</div>}
                {selected.whatsapp && <div className="dm-info-row"><FiPhone size={13}/> WhatsApp: {selected.whatsapp}</div>}
                <div className="dm-info-row">
                  {selected.whatsappReceipt !== false ? <FiToggleRight style={{ color: '#059669' }}/> : <FiToggleLeft style={{ color: '#94a3b8' }}/>}
                  {' '}WhatsApp Receipt: {selected.whatsappReceipt !== false ? 'Enabled' : 'Disabled'}
                </div>
                {selected.city && <div className="dm-info-row"><FiMapPin size={13}/> {[selected.address, selected.area, selected.city, selected.state, selected.pincode].filter(Boolean).join(', ')}</div>}
                {selected.pan && <div className="dm-info-row"><FiFileText size={13}/> PAN: {selected.pan}</div>}
                {selected.cin && <div className="dm-info-row"><FiFileText size={13}/> CIN: {selected.cin}</div>}
                {selected.assignedDCC?.name && <div className="dm-info-row"><FiHome size={13}/> DCC: {selected.assignedDCC.name} ({selected.assignedDCC.city || ''})</div>}
                {selected.dob && <div className="dm-info-row"><FiCalendar size={13}/> DOB: {new Date(selected.dob).toLocaleDateString('en-IN')}</div>}
                {selected.anniversary && <div className="dm-info-row"><FiCalendar size={13}/> Anniversary: {new Date(selected.anniversary).toLocaleDateString('en-IN')}</div>}
                {selected.occupation && <div className="dm-info-row"><FiUser size={13}/> {selected.occupation}</div>}
                {selected.nationality && <div className="dm-info-row"><FiGlobe size={13}/> {selected.nationality} · {selected.country}</div>}
                {selected.lastDonationDate && <div className="dm-info-row"><FiCalendar size={13}/> Last: {new Date(selected.lastDonationDate).toLocaleDateString('en-IN')}</div>}
                {selected.notes && <div className="dm-info-row"><FiFileText size={13}/> Notes: {selected.notes}</div>}
              </div>
            )}

            {donorTab === 'history' && <DonorHistory donorId={selected._id} />}
            {donorTab === 'pdc' && <PDCTracker donorId={selected._id} />}

            <div className="dm-modal-footer">
              <Link to={`/donations/offline?donor=${selected._id}`} className="dm-btn-primary" style={{ textDecoration: 'none' }}>
                + Add Donation
              </Link>
              <button className="dm-btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DonorHistory = ({ donorId }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/offline-donations/donor/${donorId}?limit=20`).then(r => {
      setDonations(r.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [donorId]);

  if (loading) return <div className="loading" style={{ padding: '1rem' }}>Loading...</div>;

  return (
    <div className="dm-card-body">
      {donations.length === 0 ? (
        <p className="dm-empty" style={{ padding: '1rem' }}>No donations yet</p>
      ) : (
        <div className="dm-table-wrap">
          <table className="dm-table" style={{ fontSize: '0.78rem' }}>
            <thead>
              <tr><th>Date</th><th>Amount</th><th>Purpose</th><th>Mode</th><th>Receipt</th></tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d._id}>
                  <td className="dm-dim">{new Date(d.donationDate).toLocaleDateString('en-IN')}</td>
                  <td className="dm-amount">₹{Number(d.amount).toLocaleString('en-IN')}</td>
                  <td>{d.purpose}</td>
                  <td><span className="dm-status dm-status-success">{d.paymentMode}</span></td>
                  <td className="dm-dim dm-mono" style={{ fontSize: '0.68rem' }}>{d.receiptNumber || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const PDCTracker = ({ donorId }) => {
  const [pdcs, setPdcs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/donors/${donorId}/history`).then(r => {
      setPdcs(r.data.data?.upcomingPDCs || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [donorId]);

  if (loading) return <div className="loading" style={{ padding: '1rem' }}>Loading...</div>;

  return (
    <div className="dm-card-body">
      {pdcs.length === 0 ? (
        <p className="dm-empty" style={{ padding: '1rem' }}>No upcoming PDCs</p>
      ) : (
        <div className="dm-table-wrap">
          <table className="dm-table" style={{ fontSize: '0.78rem' }}>
            <thead>
              <tr><th>Cheque No.</th><th>Bank</th><th>Amount</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {pdcs.map(p => (
                <tr key={p._id}>
                  <td className="dm-mono">{p.chequeNumber}</td>
                  <td>{p.bankName || '—'}</td>
                  <td className="dm-amount">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                  <td className="dm-dim">{new Date(p.chequeDate).toLocaleDateString('en-IN')}</td>
                  <td><span className={`dm-status ${p.status === 'pending' ? 'dm-status-pending' : p.status === 'cleared' ? 'dm-status-success' : 'dm-status-error'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Donors;
