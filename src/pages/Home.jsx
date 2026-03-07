import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { API_ENDPOINTS } from '../config';

export default function Home() {
    const navigate = useNavigate();

    // Invite Modal specific state
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [fullName, setFullName] = useState('');
    const [upiId, setUpiId] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');

    const handleSellArb = () => {
        alert("Coming soon!");
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
            alert("Session expired or missing authentication data. Please log in again.");
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
                    alert(data.json.data.msg);
                } else {
                    alert(`Error: ${data.detail || data.err || 'Failed to generate referral code.'}`);
                }
            }
        } catch (error) {
            console.error('Referral error:', error);
            alert('A network error occurred while generating the referral.');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        alert("Referral link copied!");
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
                        style={{ width: '100%', margin: '0', background: 'var(--text-secondary)' }}
                    >
                        <span className="btn-text">Sell ARB</span>
                        <span className="btn-icon">📈</span>
                    </button>

                    <button
                        className="login-btn"
                        onClick={() => setIsInviteOpen(!isInviteOpen)}
                        style={{ width: '100%', margin: '0', background: 'var(--accent-color)' }}
                    >
                        <span className="btn-text">Invite</span>
                        <span className="btn-icon">{isInviteOpen ? '▼' : '🎁'}</span>
                    </button>

                    {/* Expandable Invite Form */}
                    {isInviteOpen && (
                        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', marginTop: '10px' }}>
                            {generatedLink ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <p style={{ color: 'var(--text-primary)', fontSize: '14px', textAlign: 'center' }}>Your Referral Link:</p>
                                    <input
                                        type="text"
                                        readOnly
                                        value={generatedLink}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    />
                                    <button onClick={copyToClipboard} className="login-btn" style={{ padding: '10px', minHeight: '40px', fontSize: '14px', width: '100%', margin: '0' }}>
                                        Copy Link
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleGenerateReferral} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div>
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '5px', display: 'block' }}>Full Name (required)</label>
                                        <input
                                            type="text"
                                            required
                                            minLength="3"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '5px', display: 'block' }}>UPI ID (required)</label>
                                        <input
                                            type="text"
                                            required
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                            placeholder="username@bankname"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isGenerating}
                                        className="login-btn"
                                        style={{ padding: '10px', minHeight: '40px', fontSize: '14px', width: '100%', margin: '0', opacity: isGenerating ? 0.7 : 1 }}
                                    >
                                        {isGenerating ? 'Generating...' : 'Get Referral Link'}
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
