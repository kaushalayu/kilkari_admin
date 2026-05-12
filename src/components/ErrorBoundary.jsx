import { Component } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Admin ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
                    <div style={{ textAlign: 'center', maxWidth: 500 }}>
                        <FiAlertTriangle size={64} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
                        <h2 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>Dashboard Error</h2>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                            className="btn btn-primary"
                        >
                            <FiRefreshCw /> Try Again
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
