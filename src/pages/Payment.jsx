import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { API_ENDPOINTS } from '../config';

export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if the user was pushed here from Login with a known mobile number
    const prefilledMobile = location.state?.mobile || '';

    const [isLoading, setIsLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState(prefilledMobile);

    useEffect(() => {
        // If they navigate directly here by URL without context, clear state
        if (!prefilledMobile && !mobile) {
            // Optional: you could force them back to login here, but 
            // since this is a demo, we will let them manually enter it
        }
    }, [prefilledMobile, mobile]);

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                fullName: fullName.trim(),
                phoneNumber: parseInt(mobile, 10),
                email: email.trim()
            };

            const response = await fetch(API_ENDPOINTS.PAYMENTS.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.success && data.data?.payment_url) {
                // Redirect user to the Instamojo checkout URL
                window.location.href = data.data.payment_url;
            } else {
                if (response.status === 404) {
                    alert(`User Error: ${data.detail || 'User not found.'}`);
                } else if (response.status === 500) {
                    alert(`Payment Error: ${data.detail || 'Could not generate payment link.'}`);
                } else {
                    alert(`Error: ${data.detail || data.err || 'Failed to initialize payment gateway.'}`);
                }
            }
        } catch (error) {
            console.error('Payment initialization error:', error);
            alert('A network error occurred while reaching the payment gateway.');
        } finally {
            setIsLoading(false);
        }
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
                    <div className="success-icon" style={{ fontSize: '2.5rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(251, 191, 36, 0.1)', border: '2px solid #fbbf24', borderRadius: '50%', color: '#fbbf24', margin: '0 auto 15px auto' }}>🔒</div>
                    <h1 className="logo" style={{ color: '#fbbf24', fontSize: '1.8rem' }}>Subscription Expired</h1>
                    <p className="subtitle">Your trial or subscription period has ended. Please renew to continue accessing ARB hook.</p>
                </div>

                <form className="login-form" onSubmit={handlePaymentSubmit} style={{ marginTop: '20px' }}>
                    <div className="form-group">
                        <label htmlFor="fullName" className="form-label">Full Name</label>
                        <div className="input-wrapper">
                            <span className="input-icon">👤</span>
                            <input
                                type="text"
                                id="fullName"
                                className="form-input"
                                placeholder="Enter your full name"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email ID</label>
                        <div className="input-wrapper">
                            <span className="input-icon">✉️</span>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder="Enter your email address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="mobile" className="form-label">Mobile Number</label>
                        <div className="input-wrapper">
                            <span className="input-icon">📱</span>
                            <input
                                type="tel"
                                id="mobile"
                                className="form-input"
                                placeholder="Mobile number"
                                pattern="[0-9]{10}"
                                maxLength="10"
                                required
                                value={mobile}
                                readOnly={!!prefilledMobile}
                                onChange={(e) => setMobile(e.target.value)}
                                style={{ backgroundColor: prefilledMobile ? 'var(--input-bg)' : undefined, opacity: prefilledMobile ? 0.7 : 1 }}
                            />
                        </div>
                    </div>

                    <div className="home-actions" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '30px', marginBottom: '10px' }}>
                        <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} style={{ width: '100%', margin: '0', background: '#eab308' }}>
                            <span className="btn-text">{isLoading ? 'Processing...' : 'Pay Now'}</span>
                            {!isLoading && <span className="btn-icon">💳</span>}
                        </button>

                        <button
                            type="button"
                            className="login-btn"
                            onClick={() => navigate('/')}
                            style={{ width: '100%', margin: '0', background: 'linear-gradient(135deg, #475569, #1e293b)' }}
                        >
                            <span className="btn-text">Back to Login</span>
                            <span className="btn-icon">🔙</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
