import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
    const navigate = useNavigate();

    const handleSellArb = () => {
        alert("Coming soon!");
    };

    const handleBuyArb = () => {
        navigate('/buy-arb');
    };

    return (
        <div className="container">
            <div className="bg-circle circle-1"></div>
            <div className="bg-circle circle-2"></div>
            <div className="bg-circle circle-3"></div>

            <div className="login-card">
                <div className="login-header">
                    <div className="header-top">
                        <ThemeToggle />
                    </div>
                    <h1 className="logo">ARB hook</h1>
                    <p className="subtitle">Welcome to your dashboard</p>
                </div>

                <div className="home-actions" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                    <button
                        className="login-btn"
                        onClick={handleBuyArb}
                        style={{ width: '100%', margin: '0' }}
                    >
                        <span className="btn-text">Buy ARB</span>
                        <span className="btn-icon">💰</span>
                    </button>

                    <button
                        className="login-btn"
                        onClick={handleSellArb}
                        style={{ width: '100%', margin: '0', background: 'linear-gradient(135deg, #475569, #1e293b)' }}
                    >
                        <span className="btn-text">Sell ARB</span>
                        <span className="btn-icon">📈</span>
                    </button>

                    <button
                        className="login-btn"
                        onClick={() => alert('Coming soon!')}
                        style={{ width: '100%', margin: '0', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
                    >
                        <span className="btn-text">Invite</span>
                        <span className="btn-icon">🎁</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
