import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiHome } from 'react-icons/fi';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 450 }}>
        <FiAlertTriangle size={64} style={{ color: 'var(--warning)', margin: '0 auto 1rem' }} />
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>404</h1>
        <h2 style={{ color: 'var(--text-dim)', margin: '0.5rem 0' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          <FiHome style={{ marginRight: 8 }} /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
