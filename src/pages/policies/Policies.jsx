import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiShield, FiSave } from 'react-icons/fi';

const policies = [
  { slug: 'terms-and-conditions', title: 'Terms & Conditions', icon: FiShield },
  { slug: 'privacy-policy', title: 'Privacy Policy', icon: FiShield },
  { slug: 'refund-policy', title: 'Refund Policy', icon: FiShield },
  { slug: 'csr-policy', title: 'CSR Policy', icon: FiShield },
];

const Policies = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all(policies.map(async p => {
      try {
        const res = await api.get(`/policies/${p.slug}`);
        return [p.slug, res.data.data];
      } catch { return [p.slug, { title: p.title, breadcrumbTitle: p.title, content: '' }]; }
    })).then(results => {
      setData(Object.fromEntries(results));
      setLoading(false);
    });
  }, []);

  const handleSave = async (slug) => {
    try {
      await api.put(`/policies/${slug}`, data[slug]);
      setMsg(`${data[slug]?.title} saved!`);
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to save');
    }
  };

  const handleChange = (slug, value) => {
    setData(prev => ({ ...prev, [slug]: { ...prev[slug], content: value } }));
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div>
      <h2 className="page-title">Policies</h2>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="policies-grid">
        {policies.map(p => (
          <div key={p.slug} className="policy-card">
            <h3>{data[p.slug]?.title || p.title}</h3>
            <p>Edit the policy content below and click save.</p>
            <textarea
              value={data[p.slug]?.content || ''}
              onChange={(e) => handleChange(p.slug, e.target.value)}
              placeholder="Enter policy content..."
            />
            <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => handleSave(p.slug)}>
              <FiSave /> Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Policies;
