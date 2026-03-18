import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import SEO from '../components/SEO';

export default function About() {
    const navigate = useNavigate();

    return (
        <div className="container-lg" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
            <SEO title="About Us" description="Learn more about Arbhook, your ultimate gateway to Safe ARB." />
            <div className="bg-circle circle-1"></div>
            <div className="bg-circle circle-2" style={{ bottom: '20%', right: '10%' }}></div>
            <div className="bg-circle circle-3" style={{ top: '20%', left: '10%' }}></div>

            <div className="login-card about-card">
                <div className="header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <button 
                        onClick={() => navigate('/')} 
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'var(--text-secondary)', 
                            fontSize: '1.2rem', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>←</span> Back to Home
                    </button>
                    <ThemeToggle />
                </div>
                
                <h1 className="logo about-logo">
                    About Arb<span className="logo-highlight">hook</span>
                </h1>
                
                <div className="about-content">
                    <p className="about-intro">
                        Arbhook is the premier destination to buy ARB tokens safely, securely, and instantly.
                    </p>

                    <div className="about-grid">
                        <div className="about-feature">
                            <div className="about-icon">⚡</div>
                            <h3>No Waiting Time</h3>
                            <p>Experience instant transactions. Once your payment clears, your ARB is available immediately. No delays, no pending buffers.</p>
                        </div>
                        
                        <div className="about-feature">
                            <div className="about-icon">🛡️</div>
                            <h3>Safe & Secure</h3>
                            <p>We utilize top-tier encryption and trusted payment gateways to ensure your financial data and assets are always protected.</p>
                        </div>

                        <div className="about-feature">
                            <div className="about-icon">🎯</div>
                            <h3>Custom Options</h3>
                            <p>Buy ARB that fits your specific budget. Whether you're a beginner or a whale, we have optimal packages designed just for you.</p>
                        </div>
                    </div>

                    <p style={{ marginBottom: '20px' }}>
                        Our platform was built from the ground up to eliminate the friction commonly found in crypto exchanges. By focusing solely on a streamlined acquisition process, we ensure that buying ARB is a completely hassle-free experience. 
                    </p>
                    
                    <p>
                        Ready to dive in? Return to the home screen and create your account to get started with an exclusive 7-day free trial on our premium dashboard!
                    </p>
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <button 
                        className="login-btn" 
                        onClick={() => navigate('/signup')}
                        style={{ padding: '14px 30px', margin: '0 auto', display: 'inline-flex' }}
                    >
                        <span className="btn-text">Get Started Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
