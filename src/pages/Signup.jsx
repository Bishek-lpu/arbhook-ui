import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { API_ENDPOINTS } from '../config';
import { showSuccessAlert, showErrorAlert } from '../utils/alert';
import SEO from '../components/SEO';

export default function Signup() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const refCode = searchParams.get('ref') || '';

    const [isLoading, setIsLoading] = useState(false);
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [invitationCode, setInvitationCode] = useState(refCode);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    // Update invitationCode if refCode changes
    useEffect(() => {
        if (refCode) {
            setInvitationCode(refCode);
        }
    }, [refCode]);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const getStrength = (pass) => {
        let strength = 0;
        if (pass.length >= 6) strength++;
        if (pass.length >= 10) strength++;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[^a-zA-Z0-9]/.test(pass)) strength++;
        return strength;
    };

    const strength = getStrength(password);
    const getStrengthClass = () => {
        if (password.length === 0) return '';
        if (strength <= 2) return 'weak';
        if (strength <= 3) return 'medium';
        return 'strong';
    };
    const getStrengthWidth = () => {
        if (password.length === 0) return '0%';
        if (strength <= 2) return '33%';
        if (strength <= 3) return '66%';
        return '100%';
    };

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const passwordsNoMatch = confirmPassword.length > 0 && password !== confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showErrorAlert("Passwords Mismatch", "The passwords you entered do not match!");
            return;
        }

        if (!termsAccepted) {
            showErrorAlert("Terms Required", "Please accept the Terms & Conditions to continue.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.SEND_OTP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone_number: parseInt(mobile, 10),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store registration data for the OTP page to pick up and process
                sessionStorage.setItem('signupMobile', mobile);
                sessionStorage.setItem('signupPassword', password);
                if (invitationCode.trim() !== '') {
                    sessionStorage.setItem('signupInvitationCode', invitationCode.trim());
                }

                showSuccessAlert("OTP Sent", `An OTP has been sent to ${mobile}`);
                navigate('/otp');
            } else {
                if (data.err === "ARB Side Problem | API fail" && data.json && data.json.data && data.json.data.msg) {
                    showErrorAlert("API Error", data.json.data.msg);
                } else {
                    showErrorAlert("Failed", data.detail || data.err || 'Failed to send OTP.');
                }
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            showErrorAlert("Network Error", "A network error occurred. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <SEO title="Create an Account" description="Create an Arbhook account today and get a 7-Day Free Premium Trial." />
            <div className="bg-circle circle-1"></div>
            <div className="bg-circle circle-2"></div>
            <div className="bg-circle circle-3"></div>

            <div className="login-card">
                <div className="login-header">
                    <div className="header-top">
                        <ThemeToggle />
                    </div>
                    <h1 className="logo">Arb<span className="logo-highlight">hook</span></h1>
                    <p className="subtitle">Create your account and join us today!</p>
                </div>

                {/* Signup Bonus Banner */}
                <div className="banner banner-orange">
                    <h3 className="banner-title">
                        <span className="banner-title-icon">🎉</span> Sign Up Bonus!
                    </h3>
                    <p className="banner-text">
                        Create an account now and get <strong className="banner-highlight">₹100</strong> instantly!
                    </p>
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
                        <label htmlFor="password" className="form-label">Login Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className="form-input"
                                placeholder="Create a strong password"
                                minLength="6"
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
                        <div className="password-strength">
                            <div className={`strength-bar ${getStrengthClass()}`} style={{ width: getStrengthWidth() }}></div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">✓</span>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                autoComplete="new-password"
                                className="form-input"
                                placeholder="Re-enter your password"
                                minLength="6"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <span className="eye-icon">{showConfirmPassword ? '🙈' : '👁️'}</span>
                            </button>
                        </div>
                        <div className={`password-match-msg ${passwordsMatch ? 'match' : ''} ${passwordsNoMatch ? 'no-match' : ''}`}>
                            {passwordsMatch && '✓ Passwords match'}
                            {passwordsNoMatch && '✗ Passwords do not match'}
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
                            />
                        </div>
                    </div>

                    <div className="terms-checkbox">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                required
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            <span className="remember-text">I agree to the <a href="#" className="terms-link">Terms & Conditions</a></span>
                        </label>
                    </div>

                    <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`}>
                        <span className="btn-text">Send OTP</span>
                        <span className="btn-icon">📤</span>
                    </button>
                </form>

                <div className="signup-prompt">
                    <p>Already have an account? <Link to={`/login${refCode ? `?ref=${refCode}` : ''}`} className="signup-link">Login</Link></p>
                </div>
            </div>
        </div>
    );
}
