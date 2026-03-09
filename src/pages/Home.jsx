import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { API_ENDPOINTS } from '../config';
import { showSuccessAlert, showErrorAlert, showInfoAlert } from '../utils/alert';

export default function Home() {
    const navigate = useNavigate();

    // Invite Modal specific state
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [fullName, setFullName] = useState('');
    const [upiId, setUpiId] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');

    const handleSellArb = () => {
        showInfoAlert("Coming Soon!", "This feature is currently under development.");
    };

    const handleBuyArb = () => {
        navigate('/buy-arb');
    };

    const handleGenerateReferral = async (e) => {
        e.preventDefault();
        setIsGenerating(true);

        const userId = parseInt(localStorage.getItem('userId'), 10);
        const phoneNumber = parseInt(localStorage.getItem('phoneNumber'), 10);
        const authToken = localStorage.getItem('authToken');

        if (!userId || !phoneNumber || !authToken) {
            showErrorAlert("Session Expired", "Session expired or missing authentication data. Please log in again.");
            navigate('/');
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.USER.REFERRAL_CODE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    upiId,
                    userId,
                    phoneNumber,
                    authToken
                }),
            });

            const data = await response.json();

            if (response.ok && data.data && data.data.referralCode) {
                const link = `${window.location.origin}/?ref=${data.data.referralCode}`;
                setGeneratedLink(link);
            } else {
                if (data.err === "ARB Side Problem | API fail" && data.json && data.json.data && data.json.data.msg) {
                    showErrorAlert("API Error", data.json.data.msg);
                } else {
                    showErrorAlert("Generation Failed", data.detail || data.err || 'Failed to generate referral code.');
                }
            }
        } catch (error) {
            console.error('Referral error:', error);
            showErrorAlert("Network Error", "A network error occurred while generating the referral.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        showSuccessAlert("Copied!", "Referral link copied to clipboard!");
    };

    return (
        <div className="container" style={{ position: 'relative' }}>
            <div className="bg-circle circle-1"></div>
            <div className="bg-circle circle-2"></div>
            <div className="bg-circle circle-3"></div>

            <div className="login-card">
                <div className="login-header">
                    <div className="header-top">
                        <ThemeToggle />
                    </div>
                    <h1 className="logo">Arb<span className="logo-highlight">hook</span></h1>
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
                        style={{ width: '100%', margin: '0', background: 'var(--text-secondary)' }}
                    >
                        <span className="btn-text">Sell ARB</span>
                        <span className="btn-icon">📈</span>
                    </button>

                    {/* Attractive Refer and Earn Banner */}
                    <div style={{
                        background: 'linear-gradient(135deg, #FF9900 0%, #FF5500 100%)',
                        borderRadius: '10px',
                        padding: '15px',
                        color: 'white',
                        textAlign: 'center',
                        boxShadow: '0 4px 15px rgba(255, 85, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '24px' }}>🎁</span> Refer & Earn
                        </h3>
                        <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '8px', padding: '10px', marginTop: '10px' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Friend Logs in:</span>
                                <strong style={{ fontSize: '16px', color: '#FFF5E1', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>₹20</strong>
                            </p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Buys Membership:</span>
                                <strong style={{ fontSize: '16px', color: '#FFF5E1', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>₹100</strong>
                            </p>
                            <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFD700', fontWeight: 'bold' }}>
                                <span>🎉 New Sign Up:</span>
                                <strong style={{ fontSize: '16px', color: '#FFF5E1', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>₹100</strong>
                            </p>
                        </div>
                    </div>

                    <button
                        className="login-btn"
                        onClick={() => setIsInviteOpen(!isInviteOpen)}
                        style={{ width: '100%', margin: '0', background: 'var(--accent-color)' }}
                    >
                        <span className="btn-text">Refer and Earn</span>
                        <span className="btn-icon">{isInviteOpen ? '▼' : '🎁'}</span>
                    </button>

                    {/* Expandable Invite Form */}
                    {isInviteOpen && (
                        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid var(--border-color)' }}>
                            {generatedLink ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <p style={{ color: 'var(--text-primary)', fontSize: '14px', textAlign: 'center', fontWeight: 'bold' }}>Your Referral Link:</p>
                                    <div className="input-wrapper" style={{ margin: 0 }}>
                                        <span className="input-icon">🔗</span>
                                        <input
                                            type="text"
                                            readOnly
                                            value={generatedLink}
                                            className="form-input"
                                        />
                                    </div>
                                    <button onClick={copyToClipboard} className="login-btn" style={{ padding: '10px', minHeight: '40px', fontSize: '14px', width: '100%', margin: '0', background: 'var(--accent-color)' }}>
                                        Copy Link
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleGenerateReferral} className="login-form" style={{ marginTop: 0 }}>
                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Full Name (Required)</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">👤</span>
                                            <input
                                                type="text"
                                                required
                                                minLength="3"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="form-input"
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '500' }}>UPI ID (Required)</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">💳</span>
                                            <input
                                                type="text"
                                                required
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                className="form-input"
                                                placeholder="username@bankname"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isGenerating}
                                        className="login-btn"
                                        style={{ padding: '12px', minHeight: '45px', fontSize: '15px', width: '100%', margin: '0', opacity: isGenerating ? 0.7 : 1 }}
                                    >
                                        <span className="btn-text">{isGenerating ? 'Generating...' : 'Get Referral Link'}</span>
                                        {!isGenerating && <span className="btn-icon">✨</span>}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
