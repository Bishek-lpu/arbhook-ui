import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import PromotionalBanner from '../components/PromotionalBanner';
import { API_ENDPOINTS } from '../config';
import { showErrorAlert } from '../utils/alert';

export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();

    const prefilledMobile = location.state?.mobile || '';

    const [isLoading, setIsLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState(prefilledMobile);

    useEffect(() => {
        if (!prefilledMobile && !mobile) {
            // Let user manually enter mobile
        }
    }, [prefilledMobile, mobile]);

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                full_name: fullName.trim(),
                phone_number: parseInt(mobile, 10),
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
                window.location.href = data.data.payment_url;
            } else {
                if (response.status === 404) {
                    showErrorAlert("User Error", data.detail || 'User not found.');
                } else if (response.status === 500) {
                    showErrorAlert("Payment Error", data.detail || 'Could not generate payment link.');
                } else {
                    showErrorAlert("Error", data.detail || data.err || 'Failed to initialize payment gateway.');
                }
            }
        } catch (error) {
            console.error('Payment initialization error:', error);
            showErrorAlert("Network Error", "A network error occurred while reaching the payment gateway.");
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
                    <div className="subscription-icon">🔒</div>
                    <h1 className="logo subscription-title">Subscription Expired</h1>
                    <p className="subtitle">Your trial or subscription period has ended. Please renew to continue accessing Arbhook.</p>
                </div>

                <PromotionalBanner />

                <form className="login-form" onSubmit={handlePaymentSubmit}>
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
                                style={{ opacity: prefilledMobile ? 0.7 : 1 }}
                            />
                        </div>
                    </div>

                    <div className="action-stack">
                        <button type="submit" className={`login-btn full-btn ${isLoading ? 'loading' : ''}`} style={{ background: '#eab308' }}>
                            <span className="btn-text">{isLoading ? 'Processing...' : 'Pay Now'}</span>
                            {!isLoading && <span className="btn-icon">💳</span>}
                        </button>

                        <button type="button" className="login-btn full-btn back-btn" onClick={() => navigate('/login')}>
                            <span className="btn-text">Back to Login</span>
                            <span className="btn-icon">🔙</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
