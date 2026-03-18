import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

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

                    <h1 className="logo landing-logo">
                        Arb<span className="logo-highlight">hook</span>
                    </h1>
                </div>

                <div className="hero-content">
                    <div className="banner banner-orange" style={{ marginBottom: '25px', textAlign: 'left' }}>
                        <h3 className="banner-title" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                            The Ultimate ARB Tool
                        </h3>
                        <ul className="banner-text" style={{ paddingLeft: '20px', margin: 0 }}>
                            <li style={{ marginBottom: '8px' }}>Arbhook seamlessly hooks ARB coins for you.</li>
                            <li>
                                make ARB wallet easy <br />
                                <strong className="banner-highlight">buy ARB coins hassle-free.</strong>
                            </li>
                        </ul>
                    </div>

                    {/* 7-Day Free Trial Highlight */}
                    <div className="landing-trial-banner">
                        <span className="trial-icon">🎁</span>
                        <span className="trial-text">Claim your 7-Day Premium Free Trial today!</span>
                    </div>

                    {/* Unified Features Banner */}
                    <div className="banner banner-blue" style={{ marginTop: '20px', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', padding: '0 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '1.4rem' }}>⚡</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Fast</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '1.4rem' }}>🛡️</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Secure</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '1.4rem' }}>💫</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Hassle-free</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="action-buttons landing-actions">
                    <button
                        className="login-btn landing-btn main-btn"
                        onClick={() => navigate('/login')}
                    >
                        <span className="btn-text">Login to Dashboard</span>
                        <span className="btn-icon">→</span>
                    </button>

                    <button
                        className="login-btn landing-btn outline-btn"
                        onClick={() => navigate('/signup')}
                    >
                        <span className="btn-text">Create an Account</span>
                    </button>
                </div>

                <div className="landing-footer">
                    <Link to="/about" className="signup-link landing-info-link">
                        ℹ️ Click for more information about Arbhook
                    </Link>
                </div>
            </div>
        </div>
    );
}
