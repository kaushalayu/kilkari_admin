import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiSave, FiImage, FiGlobe, FiCreditCard, FiBarChart2, FiMap, FiPlus, FiTrash2, FiLink } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';

const SiteSettings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/site-settings').then(res => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  const handleChange = (section, key, value) => {
    setData(prev => {
      const updated = { ...prev };
      if (section) updated[section] = { ...updated[section], [key]: value };
      else updated[key] = value;
      return updated;
    });
  };

  const updateStat = (i, k, v) => {
    const stats = [...(data?.stats || [])];
    stats[i] = { ...stats[i], [k]: v };
    setData(p => ({ ...p, stats }));
  };
  const addStat = () => setData(p => ({ ...p, stats: [...(p.stats || []), { value: '', label: '', icon: 'bi-people-fill' }] }));
  const removeStat = (i) => setData(p => ({ ...p, stats: (p.stats || []).filter((_, x) => x !== i) }));

  const updateBank = (i, k, v) => {
    const banks = [...(data?.bankAccounts || [])];
    banks[i] = { ...banks[i], [k]: v };
    setData(p => ({ ...p, bankAccounts: banks }));
  };
  const addBank = () => setData(p => ({ ...p, bankAccounts: [...(p.bankAccounts || []), { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '', accountType: 'Current Account' }] }));
  const removeBank = (i) => setData(p => ({ ...p, bankAccounts: (p.bankAccounts || []).filter((_, x) => x !== i) }));

  const updateMapTag = (i, k, v) => {
    const tags = [...(data?.mapTags || [])];
    tags[i] = { ...tags[i], [k]: v };
    setData(p => ({ ...p, mapTags: tags }));
  };
  const addMapTag = () => setData(p => ({ ...p, mapTags: [...(p.mapTags || []), { icon: '', label: '', color: 'tag-green' }] }));
  const removeMapTag = (i) => setData(p => ({ ...p, mapTags: (p.mapTags || []).filter((_, x) => x !== i) }));

  const handleSave = async () => {
    try {
      await api.put('/site-settings', data);
      setMsg('Settings saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to save settings');
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Site Settings</h2>
        <button className="btn btn-primary" onClick={handleSave}><FiSave /> Save All Changes</button>
      </div>
      {msg && <div className={`alert ${msg.includes('fail') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      <div className="site-settings-form">
        <h3 className="section-title"><FiImage /> Branding & Logo</h3>
        <div className="form-group full"><label>Site Name</label><input value={data?.siteName || ''} onChange={(e) => handleChange(null, 'siteName', e.target.value)} placeholder="Kilkari Care Foundation" /></div>
        <div className="form-group"><label>Logo</label><ImageUpload value={data?.logo || ''} onChange={(val) => handleChange(null, 'logo', val)} folder="logo" /></div>
        <div className="form-group"><label>Favicon</label><ImageUpload value={data?.favicon || ''} onChange={(val) => handleChange(null, 'favicon', val)} folder="logo" /></div>
        <div className="form-group"><label>Donation QR Code</label><ImageUpload value={data?.qrCode || ''} onChange={(val) => handleChange(null, 'qrCode', val)} folder="qr" /></div>

        <h3 className="section-title"><FiGlobe /> Contact & Location</h3>
        <div className="form-group"><label>Email</label><input value={data?.contactEmail || ''} onChange={(e) => handleChange(null, 'contactEmail', e.target.value)} placeholder="contact@kilkaricarefoundation.org" /></div>
        <div className="form-group"><label>Phone</label><input value={data?.contactPhone || ''} onChange={(e) => handleChange(null, 'contactPhone', e.target.value)} placeholder="+91-98733-36611" /></div>
        <div className="form-group full"><label>Address</label><input value={data?.contactAddress || ''} onChange={(e) => handleChange(null, 'contactAddress', e.target.value)} placeholder="S-522 School Block Shakarpur, 110092 Delhi" /></div>
        <div className="form-group full"><label>Google Map Embed URL</label><input value={data?.mapEmbedUrl || ''} onChange={(e) => handleChange(null, 'mapEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." /></div>

        <h3 className="section-title"><FiLink /> Social Media</h3>
        <div className="form-group"><label>Facebook</label><input value={data?.socialLinks?.facebook || ''} onChange={(e) => handleChange('socialLinks', 'facebook', e.target.value)} placeholder="https://facebook.com/..." /></div>
        <div className="form-group"><label>Instagram</label><input value={data?.socialLinks?.instagram || ''} onChange={(e) => handleChange('socialLinks', 'instagram', e.target.value)} placeholder="https://instagram.com/..." /></div>
        <div className="form-group"><label>Twitter / X</label><input value={data?.socialLinks?.twitter || ''} onChange={(e) => handleChange('socialLinks', 'twitter', e.target.value)} placeholder="https://twitter.com/..." /></div>
        <div className="form-group"><label>YouTube</label><input value={data?.socialLinks?.youtube || ''} onChange={(e) => handleChange('socialLinks', 'youtube', e.target.value)} placeholder="https://youtube.com/..." /></div>
        <div className="form-group"><label>WhatsApp Number</label><input value={data?.socialLinks?.whatsapp || ''} onChange={(e) => handleChange('socialLinks', 'whatsapp', e.target.value)} placeholder="919873336611" /></div>

        <h3 className="section-title"><FiBarChart2 /> Stats / Counters</h3>
        {(data?.stats || []).map((s, i) => (
          <div key={i} className="form-sub">
            <input value={s.value || ''} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="e.g. 5000+" />
            <input value={s.label || ''} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="e.g. Children Supported" />
            <input value={s.icon || ''} onChange={e => updateStat(i, 'icon', e.target.value)} placeholder="bi-people-fill" />
            <button type="button" className="btn-icon btn-delete" onClick={() => removeStat(i)}><FiTrash2 /></button>
          </div>
        ))}
        <div style={{ gridColumn: '1/-1' }}><button type="button" className="btn btn-secondary" onClick={addStat}><FiPlus /> Add Stat</button></div>

        <h3 className="section-title"><FiCreditCard /> Bank Details (Primary)</h3>
        <div className="form-group"><label>Account Name</label><input value={data?.bankDetails?.accountName || ''} onChange={(e) => handleChange('bankDetails', 'accountName', e.target.value)} /></div>
        <div className="form-group"><label>Account Number</label><input value={data?.bankDetails?.accountNumber || ''} onChange={(e) => handleChange('bankDetails', 'accountNumber', e.target.value)} /></div>
        <div className="form-group"><label>IFSC Code</label><input value={data?.bankDetails?.ifsc || ''} onChange={(e) => handleChange('bankDetails', 'ifsc', e.target.value)} /></div>
        <div className="form-group"><label>Bank Name</label><input value={data?.bankDetails?.bankName || ''} onChange={(e) => handleChange('bankDetails', 'bankName', e.target.value)} /></div>
        <div className="form-group"><label>Branch</label><input value={data?.bankDetails?.branch || ''} onChange={(e) => handleChange('bankDetails', 'branch', e.target.value)} /></div>
        <div className="form-group"><label>Account Type</label><input value={data?.bankDetails?.accountType || ''} onChange={(e) => handleChange('bankDetails', 'accountType', e.target.value)} placeholder="Current Account" /></div>

        <h3 className="section-title"><FiCreditCard /> Multiple Bank Accounts</h3>
        {(data?.bankAccounts || []).map((b, i) => (
          <div key={i} style={{ gridColumn: '1/-1', background: 'var(--bg)', padding: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <strong style={{ fontSize: '0.82rem' }}>Bank Account {i + 1}</strong>
              <button type="button" className="btn-icon btn-delete" onClick={() => removeBank(i)}><FiTrash2 /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input value={b.bankName || ''} onChange={e => updateBank(i, 'bankName', e.target.value)} placeholder="Bank Name" />
              <input value={b.accountName || ''} onChange={e => updateBank(i, 'accountName', e.target.value)} placeholder="Account Name" />
              <input value={b.accountNumber || ''} onChange={e => updateBank(i, 'accountNumber', e.target.value)} placeholder="Account Number" />
              <input value={b.ifsc || ''} onChange={e => updateBank(i, 'ifsc', e.target.value)} placeholder="IFSC Code" />
              <input value={b.branch || ''} onChange={e => updateBank(i, 'branch', e.target.value)} placeholder="Branch" />
              <input value={b.accountType || ''} onChange={e => updateBank(i, 'accountType', e.target.value)} placeholder="Account Type" />
            </div>
          </div>
        ))}
        <div style={{ gridColumn: '1/-1' }}><button type="button" className="btn btn-secondary" onClick={addBank}><FiPlus /> Add Bank Account</button></div>

        <h3 className="section-title"><FiCreditCard /> Donation Amounts</h3>
        <div className="form-group full"><label>Give Once Amounts (comma separated)</label><input value={(data?.donationSettings?.onceAmounts || [1000, 2000, 5000, 10000]).join(', ')} onChange={(e) => { setData(p => ({ ...p, donationSettings: { ...p.donationSettings, onceAmounts: e.target.value.split(',').map(v => Number(v.trim())).filter(v => !isNaN(v)) } })); }} placeholder="1000, 2000, 5000, 10000" /></div>
        <div className="form-group full"><label>Give Monthly Amounts (comma separated)</label><input value={(data?.donationSettings?.monthlyAmounts || [500, 1000, 1500, 2000]).join(', ')} onChange={(e) => { setData(p => ({ ...p, donationSettings: { ...p.donationSettings, monthlyAmounts: e.target.value.split(',').map(v => Number(v.trim())).filter(v => !isNaN(v)) } })); }} placeholder="500, 1000, 1500, 2000" /></div>

        <h3 className="section-title"><FiGlobe /> Registration & Legal</h3>
        <div className="form-group"><label>Registration Number</label><input value={data?.registrationNumber || ''} onChange={(e) => handleChange(null, 'registrationNumber', e.target.value)} placeholder="1823/2017" /></div>
        <div className="form-group"><label>Registration ID</label><input value={data?.registrationId || ''} onChange={(e) => handleChange(null, 'registrationId', e.target.value)} placeholder="DL/2018/0198339" /></div>
        <div className="form-group"><label>Certification</label><input value={data?.certification || ''} onChange={(e) => handleChange(null, 'certification', e.target.value)} placeholder="80G & 12A Certified" /></div>
        <div className="form-group full"><label>Admin Panel URL</label><input value={data?.adminUrl || ''} onChange={(e) => handleChange(null, 'adminUrl', e.target.value)} placeholder="https://admin.kilkaricarefoundation.org" /></div>

        <h3 className="section-title"><FiMap /> Map Settings</h3>
        <div className="form-group"><label>Latitude</label><input type="number" step="any" value={data?.mapLatitude || ''} onChange={(e) => handleChange(null, 'mapLatitude', parseFloat(e.target.value))} placeholder="28.6237" /></div>
        <div className="form-group"><label>Longitude</label><input type="number" step="any" value={data?.mapLongitude || ''} onChange={(e) => handleChange(null, 'mapLongitude', parseFloat(e.target.value))} placeholder="77.2797" /></div>
        <div className="form-group full"><label>Map Popup Text (HTML)</label><textarea value={data?.mapPopupText || ''} onChange={(e) => handleChange(null, 'mapPopupText', e.target.value)} rows={3} placeholder="<strong>Kilkari Care Foundation</strong><br>Address here..." /></div>

        <h3 className="section-title"><FiMap /> Map Tags</h3>
        {(data?.mapTags || []).map((t, i) => (
          <div key={i} className="form-sub">
            <input value={t.icon || ''} onChange={e => updateMapTag(i, 'icon', e.target.value)} placeholder="fa-solid fa-hand-holding-heart" />
            <input value={t.label || ''} onChange={e => updateMapTag(i, 'label', e.target.value)} placeholder="NGO" />
            <input value={t.color || ''} onChange={e => updateMapTag(i, 'color', e.target.value)} placeholder="tag-green" />
            <button type="button" className="btn-icon btn-delete" onClick={() => removeMapTag(i)}><FiTrash2 /></button>
          </div>
        ))}
        <div style={{ gridColumn: '1/-1' }}><button type="button" className="btn btn-secondary" onClick={addMapTag}><FiPlus /> Add Map Tag</button></div>
      </div>
    </div>
  );
};

export default SiteSettings;
