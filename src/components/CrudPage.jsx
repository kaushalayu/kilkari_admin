import { useState } from 'react';
import useCRUD from '@api/useCRUD';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiFile } from 'react-icons/fi';
import ImageUpload from './ImageUpload';
import FileUpload from './FileUpload';
import { getFullUrl } from '../api/client';

const CrudPage = ({ title, endpoint, fields, customActions, renderExtra, useSlug = false }) => {
  const { data, loading, error, create, update, remove, total, fetchAll, getIdentifier } = useCRUD(endpoint, useSlug);
  const [showForm, setShowForm]         = useState(false);
  const [editId, setEditId]             = useState(null);
  const [formData, setFormData]         = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [msg, setMsg]                   = useState('');
  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');

  const resetForm = () => {
    setFormData({});
    setEditId(null);
    setShowForm(false);
    setMsg('');
  };

  const openEdit = (item) => {
    setFormData(item);
    setEditId(getIdentifier(item));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (editId) await update(editId, formData);
      else await create(formData);
      setMsg(editId ? 'Updated successfully!' : 'Created successfully!');
      setTimeout(() => setMsg(''), 3000);
      resetForm();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      await remove(id);
      setMsg('Deleted successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Delete failed. Please try again.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchAll({ search: searchInput });
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    fetchAll();
  };

  // ── Field renderers ───────────────────────────────────────────────────────
  const renderField = (f) => {
    const val = formData[f.key] ?? '';
    const req = f.required;

    if (f.type === 'textarea') {
      return (
        <textarea
          value={val}
          onChange={(e) => handleChange(f.key, e.target.value)}
          placeholder={f.placeholder}
          rows={4}
          required={req}
        />
      );
    }
    if (f.type === 'select') {
      return (
        <select value={val} onChange={(e) => handleChange(f.key, e.target.value)} required={req}>
          <option value="">Select {f.label}...</option>
          {f.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    if (f.type === 'image') {
      return (
        <ImageUpload
          value={val}
          onChange={(v) => handleChange(f.key, v)}
          folder={endpoint}
        />
      );
    }
    if (f.type === 'file') {
      return (
        <FileUpload
          value={val}
          onChange={(v) => handleChange(f.key, v)}
          folder={endpoint}
          accept={f.accept || '*'}
        />
      );
    }
    if (f.type === 'boolean') {
      return (
        <select value={String(!!val)} onChange={(e) => handleChange(f.key, e.target.value === 'true')}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }
    return (
      <input
        type={f.type || 'text'}
        value={val}
        onChange={(e) => handleChange(f.key, e.target.value)}
        placeholder={f.placeholder}
        required={req}
      />
    );
  };

  const renderCell = (f, item) => {
    if (f.render) return f.render(item[f.key], item);
    if (f.type === 'boolean') {
      return item[f.key]
        ? <span className="status-badge status-success">Yes</span>
        : <span className="status-badge status-failed">No</span>;
    }
    if (f.type === 'image') {
      return item[f.key]
        ? <img src={getFullUrl(item[f.key])} alt="" className="image-preview" />
        : '—';
    }
    if (f.type === 'file') {
      return item[f.key]
        ? <a href={getFullUrl(item[f.key])} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiFile /> View</a>
        : '—';
    }
    if (f.type === 'date') {
      return item[f.key] ? new Date(item[f.key]).toLocaleDateString('en-IN') : '—';
    }
    if (typeof item[f.key] === 'string' && item[f.key].length > 60) {
      return item[f.key].substring(0, 60) + '…';
    }
    return item[f.key] || '—';
  };

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <h2 className="page-title">
          {title}
          {total > 0 && (
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-dim)', marginLeft: '0.5rem' }}>
              ({total} total)
            </span>
          )}
        </h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          {showForm ? <><FiX /> Cancel</> : <><FiPlus /> Add {title}</>}
        </button>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────────────── */}
      {!showForm && (
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text)',
              fontSize: '0.85rem',
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            Search
          </button>
          {search && (
            <button type="button" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={clearSearch}>
              <FiX /> Clear
            </button>
          )}
        </form>
      )}
      {search && (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
          Showing results for: <strong>"{search}"</strong>
        </p>
      )}

      {/* ── Alert ──────────────────────────────────────────────────────────── */}
      {msg && (
        <div className={`alert ${msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error') ? 'alert-error' : 'alert-success'}`}>
          {msg}
        </div>
      )}

      {/* ── Form ───────────────────────────────────────────────────────────── */}
      {showForm && (
        <form className="crud-form" onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div key={f.key} className={`form-group ${f.fullWidth ? 'full' : ''}`}>
              <label>{f.label}{f.required && ' *'}</label>
              {renderField(f)}
            </div>
          ))}
          {renderExtra && renderExtra(formData, handleChange)}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitLoading}>
              {submitLoading ? 'Saving...' : editId ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {loading && <div className="loading">Loading {title}...</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && data.length === 0 && !error && (
        <p className="empty">No {title.toLowerCase()} found. Add one above!</p>
      )}

      {!loading && data.length > 0 && (
        <div className="table-container">
          <div className="table-scroll-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {fields.filter(f => !f.hideInList).map(f => (
                    <th key={f.key}>{f.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item._id}>
                    {fields.filter(f => !f.hideInList).map(f => (
                      <td key={f.key}>{renderCell(f, item)}</td>
                    ))}
                    <td className="actions">
                      {customActions && customActions.map(action => action(item))}
                      <button className="btn-icon btn-edit" onClick={() => openEdit(item)} title="Edit">
                        <FiEdit2 />
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(getIdentifier(item))} title="Delete">
                        <FiTrash2 />
                      </button>
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

export default CrudPage;
