import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiSave, FiCreditCard, FiMail, FiMessageCircle, FiEye, FiEyeOff } from 'react-icons/fi';

const PaymentSettings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showWaToken, setShowWaToken] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [waTestResult, setWaTestResult] = useState('');

  useEffect(() => {
    api.get('/site-settings/admin').then(res => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  const handleChange = (section, key, value) => {
    setData(prev => {
      const updated = { ...prev };
      if (section) updated[section] = { ...updated[section], [key]: value };
      else updated[key] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    if (!data) return setMsg('No settings to save. Please wait for data to load.');
    try {
      await api.put('/site-settings', { razorpayKeys: data?.razorpayKeys, smtpConfig: data?.smtpConfig, whatsappConfig: data?.whatsappConfig });
      setMsg('Payment settings saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to save settings');
    }
  };

  const testEmail = async () => {
    setTestResult('Sending test email...');
    try {
      const res = await api.post('/site-settings/test-email', { smtp: data?.smtpConfig });
      setTestResult(res.data.message || 'Test email sent!');
    } catch (err) {
      setTestResult(err.response?.data?.message || 'Test email failed');
    }
  };

  const testWhatsApp = async () => {
    setWaTestResult('Sending test WhatsApp...');
    try {
      const res = await api.post('/site-settings/test-whatsapp', { whatsapp: data?.whatsappConfig, phone: data?.whatsappConfig?.phoneNumber });
      setWaTestResult(res.data.message || 'Test WhatsApp sent!');
    } catch (err) {
      setWaTestResult(err.response?.data?.message || 'Test WhatsApp failed');
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title"><FiCreditCard /> Payment & Email Settings</h2>
        <button className="btn btn-primary" onClick={handleSave}><FiSave /> Save Changes</button>
      </div>
      {msg && <div className={`alert ${msg.includes('fail') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      <div className="site-settings-form">
        <h3 className="section-title"><FiCreditCard /> Razorpay Payment Gateway</h3>
        <p className="form-hint" style={{ margin: '-0.5rem 0 0.75rem', gridColumn: '1 / -1' }}>
          Keys from DB will be used first. If empty, <code>.env</code> file keys will be used as fallback.
        </p>
        <div className="form-group full">
          <label>Key ID</label>
          <div className="input-with-toggle">
            <input value={data?.razorpayKeys?.keyId || ''} onChange={(e) => handleChange('razorpayKeys', 'keyId', e.target.value)} placeholder="rzp_live_... or rzp_test_..." type={showKey ? 'text' : 'password'} />
            <button type="button" className="btn-icon" onClick={() => setShowKey(!showKey)}>{showKey ? <FiEyeOff /> : <FiEye />}</button>
          </div>
        </div>
        <div className="form-group full">
          <label>Key Secret</label>
          <div className="input-with-toggle">
            <input value={data?.razorpayKeys?.keySecret || ''} onChange={(e) => handleChange('razorpayKeys', 'keySecret', e.target.value)} placeholder="Secret Key" type={showSecret ? 'text' : 'password'} />
            <button type="button" className="btn-icon" onClick={() => setShowSecret(!showSecret)}>{showSecret ? <FiEyeOff /> : <FiEye />}</button>
          </div>
        </div>

        <h3 className="section-title"><FiMail /> SMTP / Email Settings</h3>
        <p className="form-hint" style={{ margin: '-0.5rem 0 0.75rem', gridColumn: '1 / -1' }}>
          SMTP settings from DB will be used first. If empty, <code>.env</code> file settings will be used.
        </p>
        <div className="form-group"><label>SMTP Host</label><input value={data?.smtpConfig?.host || ''} onChange={(e) => handleChange('smtpConfig', 'host', e.target.value)} placeholder="smtp.gmail.com" /></div>
        <div className="form-group"><label>Port</label><input type="number" value={data?.smtpConfig?.port || 587} onChange={(e) => handleChange('smtpConfig', 'port', Number(e.target.value))} placeholder="587" /></div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
          <label style={{ margin: 0 }}>Use SSL (port 465)</label>
          <input type="checkbox" checked={data?.smtpConfig?.secure || false} onChange={(e) => handleChange('smtpConfig', 'secure', e.target.checked)} />
        </div>
        <div className="form-group"><label>Email (SMTP User)</label><input value={data?.smtpConfig?.user || ''} onChange={(e) => handleChange('smtpConfig', 'user', e.target.value)} placeholder="your-email@gmail.com" /></div>
        <div className="form-group full">
          <label>Password (App Password)</label>
          <div className="input-with-toggle">
            <input value={data?.smtpConfig?.pass || ''} onChange={(e) => handleChange('smtpConfig', 'pass', e.target.value)} placeholder="App Password" type={showPass ? 'text' : 'password'} />
            <button type="button" className="btn-icon" onClick={() => setShowPass(!showPass)}>{showPass ? <FiEyeOff /> : <FiEye />}</button>
          </div>
        </div>
        <div className="form-group"><label>Sender Name</label><input value={data?.smtpConfig?.name || ''} onChange={(e) => handleChange('smtpConfig', 'name', e.target.value)} placeholder="Kilkari Care Foundation" /></div>

        <div className="form-actions" style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={testEmail}><FiMail /> Test Email</button>
          {testResult && <span style={{ fontSize: '0.82rem', alignSelf: 'center', color: testResult.includes('fail') || testResult.includes('Failed') ? 'var(--danger)' : 'var(--success)' }}>{testResult}</span>}
        </div>

        <h3 className="section-title" style={{ marginTop: '2rem' }}><FiMessageCircle /> WhatsApp Settings</h3>
        <p className="form-hint" style={{ margin: '-0.5rem 0 0.75rem', gridColumn: '1 / -1' }}>
          Configure WhatsApp API for sending receipts and bulk messages. Supports Twilio, UltraMsg, and WATI.
        </p>
        <div className="form-group"><label>Provider</label>
          <select value={data?.whatsappConfig?.provider || 'twilio'} onChange={(e) => handleChange('whatsappConfig', 'provider', e.target.value)}>
            <option value="twilio">Twilio</option>
            <option value="ultramsg">UltraMsg</option>
            <option value="wati">WATI</option>
          </select>
        </div>
        <div className="form-group"><label>Account SID (Twilio)</label><input value={data?.whatsappConfig?.accountSid || ''} onChange={(e) => handleChange('whatsappConfig', 'accountSid', e.target.value)} placeholder="ACxxxxxxxxxxxx" /></div>
        <div className="form-group full">
          <label>Auth Token (Twilio)</label>
          <div className="input-with-toggle">
            <input value={data?.whatsappConfig?.authToken || ''} onChange={(e) => handleChange('whatsappConfig', 'authToken', e.target.value)} placeholder="Auth Token" type={showWaToken ? 'text' : 'password'} />
            <button type="button" className="btn-icon" onClick={() => setShowWaToken(!showWaToken)}>{showWaToken ? <FiEyeOff /> : <FiEye />}</button>
          </div>
        </div>
        <div className="form-group"><label>WhatsApp Number / Sender ID</label><input value={data?.whatsappConfig?.phoneNumber || ''} onChange={(e) => handleChange('whatsappConfig', 'phoneNumber', e.target.value)} placeholder="+14155238886 or 919873336611" /></div>
        <div className="form-group"><label>API Key (UltraMsg / WATI)</label><input value={data?.whatsappConfig?.apiKey || ''} onChange={(e) => handleChange('whatsappConfig', 'apiKey', e.target.value)} placeholder="Your API Key" /></div>
        <div className="form-group full"><label>API Endpoint (WATI / custom)</label><input value={data?.whatsappConfig?.apiEndpoint || ''} onChange={(e) => handleChange('whatsappConfig', 'apiEndpoint', e.target.value)} placeholder="https://live.wati.io or https://api.ultramsg.com/instance123" /></div>

        <div className="form-actions" style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={testWhatsApp}><FiMessageCircle /> Test WhatsApp</button>
          {waTestResult && <span style={{ fontSize: '0.82rem', alignSelf: 'center', color: waTestResult.includes('fail') || waTestResult.includes('Failed') ? 'var(--danger)' : 'var(--success)' }}>{waTestResult}</span>}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
