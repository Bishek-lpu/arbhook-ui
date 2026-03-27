import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { API_ENDPOINTS } from '../config';
import { showErrorAlert } from '../utils/alert';
import SEO from '../components/SEO';

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const refCode = searchParams.get('ref') || '';

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [invitationCode, setInvitationCode] = useState(refCode);

    const [showTrialModal, setShowTrialModal] = useState(false);
    const [freeTrialDays, setFreeTrialDays] = useState(0);

    useEffect(() => {
        if (refCode) {
            setInvitationCode(refCode);
        }
    }, [refCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                phone_number: parseInt(mobile, 10),
                password: password
            };

            if (invitationCode.trim() !== '') {
                payload.invitation_code = invitationCode.trim();
            }

            const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                // Save the auth token (e.g., in localStorage)
                if (data.data) {
                    if (data.data.auth_token) localStorage.setItem('authToken', data.data.auth_token);
                    if (data.data.user_id) localStorage.setItem('userId', data.data.user_id);
                    if (data.data.phone_number) localStorage.setItem('phoneNumber', data.data.phone_number);
                }

                if (data.isNewUser) {
                    setFreeTrialDays(data.freeTrialDays || 7);
                    setShowTrialModal(true);
                } else {
                    navigate('/home');
                }
            } else {
                // Handle specified errors appropriately
                if (data.err === "ARB Side Problem | API fail" && data.json && data.json.data && data.json.data.msg) {
                    showErrorAlert("API Error", data.json.data.msg);
                } else if (response.status === 400 && data.detail === "Subscription Expired") {
                    navigate('/plan', { state: { mobile } });
                } else if (response.status === 400) {
                    showErrorAlert("Login Failed", data.detail || data.err || 'Bad Request');
                } else if (response.status === 502) {
                    showErrorAlert("Server Error", data.detail || data.err || 'Invalid ARB response');
                } else {
                    showErrorAlert("Error", data.detail || data.err || 'An unexpected error occurred.');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            showErrorAlert("Network Error", "A network error occurred. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <SEO title="Login" description="Login to your Arbhook dashboard to access your secure ARB wallet." />
            <div className="bg-circle circle-1"></div>
            <div className="bg-circle circle-2"></div>
            <div className="bg-circle circle-3"></div>

            <div className="login-card">
                <div className="login-header">
                    <div className="header-top">
                        <ThemeToggle />
                    </div>
                    <h1 className="logo">Arb<span className="logo-highlight">hook</span></h1>
                </div>

                {/* Free Trial Banner */}
                <div className="banner banner-blue">
                    <h3 className="banner-title">
                        <span className="banner-title-icon">🎁</span> Special Offer
                    </h3>
                    <p className="banner-text">
                        Login now and get a <strong className="banner-highlight">7-Day Free Trial</strong> instantly!
                    </p>
                </div>

                {/* Login Instruction Note */}
                <div className="banner banner-note">
                    <p className="banner-text">📝 Login with your <strong>ARB Wallet</strong> phone number and password</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="mobile" className="form-label">Mobile Number</label>
                        <div className="input-wrapper">
                            <span className="input-icon">📱</span>
                            <input
                                type="tel"
                                id="mobile"
                                name="mobile"
                                autoComplete="tel"
                                className="form-input"
                                placeholder="Enter your mobile number"
                                pattern="[0-9]{10}"
                                maxLength="10"
                                required
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                className="form-input"
                                placeholder="Enter your password"
                                minLength="5"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <span className="eye-icon">{showPassword ? '🙈' : '👁️'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="invitationCode" className="form-label">Invitation Code (Optional)</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🎁</span>
                            <input
                                type="text"
                                id="invitationCode"
                                className="form-input"
                                placeholder="Enter invitation code"
                                value={invitationCode}
                                onChange={(e) => setInvitationCode(e.target.value)}
                                readOnly={!!refCode}
                            />
                        </div>
                    </div>


                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" id="remember" />
                            <span className="checkmark"></span>
                            <span className="remember-text">Remember me</span>
                        </label>
                        <a href="#" className="forgot-password">Forgot Password?</a>
                    </div>

                    <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`}>
                        <span className="btn-text">Login</span>
                        <span className="btn-icon">→</span>
                    </button>
                </form >

                <div className="signup-prompt">
                    <p>Don't have an account? <Link to={`/signup${refCode ? `?ref=${refCode}` : ''}`} className="signup-link">Sign Up</Link></p>
                </div>
            </div>

            {/* Free Trial Modal */}
            <div className={`success-modal ${showTrialModal ? 'show' : ''}`}>
                <div className="success-content">
                    <div className="success-icon">🎁</div>
                    <h2 className="success-title">Congratulations!</h2>
                    <p className="success-message">
                        You've unlocked a <b>{freeTrialDays}-Day Free Trial</b>!<br />
                        Enjoy full access to our premium features.
                    </p>
                    <button className="success-btn" onClick={() => navigate('/home')}>
                        <span>Start Exploring</span>
                        <span>&rarr;</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
