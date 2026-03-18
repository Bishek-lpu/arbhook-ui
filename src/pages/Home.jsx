import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { API_ENDPOINTS } from '../config';
import { showSuccessAlert, showErrorAlert, showInfoAlert } from '../utils/alert';
import SEO from '../components/SEO';

export default function Home() {
    const navigate = useNavigate();

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
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.USER.REFERRAL_CODE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: fullName,
                    upi_id: upiId,
                    user_id: userId,
                    phone_number: phoneNumber,
                    auth_token: authToken
                }),
            });

            const data = await response.json();

            if (response.ok && data.data && data.data.referral_code) {
                const link = `${window.location.origin}/?ref=${data.data.referral_code}`;
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
            <SEO title="Dashboard" description="Manage your Arbhook secure ARB wallet and dashboard." />
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

                <div className="action-stack">
                    <button className="login-btn full-btn" onClick={handleBuyArb}>
                        <span className="btn-text">Buy ARB</span>
                        <span className="btn-icon">💰</span>
                    </button>

                    <button className="login-btn full-btn secondary-btn" onClick={handleSellArb}>
                        <span className="btn-text">Sell ARB</span>
                        <span className="btn-icon">📈</span>
                    </button>

                    {/* Refer & Earn Banner */}
                    <div className="banner banner-refer">
                        <h3 className="banner-title">
                            <span className="banner-title-icon">🎁</span> Refer & Earn
                        </h3>
                        <div className="refer-details">
                            <p className="refer-row">
                                <span>Friend Logs in:</span>
                                <strong className="refer-amount">₹20</strong>
                            </p>
                            <p className="refer-row">
                                <span>Buys Membership:</span>
                                <strong className="refer-amount">₹100</strong>
                            </p>
                            <p className="refer-row refer-row-highlight">
                                <span>🎉 New Sign Up:</span>
                                <strong className="refer-amount">₹100</strong>
                            </p>
                        </div>
                    </div>

                    <button className="login-btn full-btn accent-btn" onClick={() => setIsInviteOpen(!isInviteOpen)}>
                        <span className="btn-text">Refer and Earn</span>
                        <span className="btn-icon">{isInviteOpen ? '▼' : '🎁'}</span>
                    </button>

                    {/* Expandable Invite Form */}
                    {isInviteOpen && (
                        <div className="invite-panel">
                            {generatedLink ? (
                                <div className="action-stack" style={{ marginTop: 0 }}>
                                    <p className="invite-link-text">Your Referral Link:</p>
                                    <div className="input-wrapper" style={{ margin: 0 }}>
                                        <span className="input-icon">🔗</span>
                                        <input type="text" readOnly value={generatedLink} className="form-input" />
                                    </div>
                                    <button onClick={copyToClipboard} className="login-btn full-btn accent-btn">
                                        Copy Link
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleGenerateReferral} className="login-form" style={{ marginTop: 0 }}>
                                    <div className="form-group">
                                        <label className="invite-label">Full Name (Required)</label>
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
                                    <div className="form-group">
                                        <label className="invite-label">UPI ID (Required)</label>
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
                                        className="login-btn full-btn"
                                        style={{ opacity: isGenerating ? 0.7 : 1 }}
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
