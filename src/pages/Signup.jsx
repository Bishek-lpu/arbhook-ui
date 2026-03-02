
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Signup() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (!termsAccepted) {
            alert('Please accept the Terms & Conditions');
            return;
        }

        setIsLoading(true);

        sessionStorage.setItem('signupMobile', mobile);
        sessionStorage.setItem('signupPassword', password);

        setTimeout(() => {
            setIsLoading(false);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            sessionStorage.setItem('generatedOTP', otp);

            console.log('Generated OTP:', otp);
            alert(`OTP has been sent to ${mobile} \n(For demo: ${otp})`);

            navigate('/otp');
        }, 1500);
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
                    <p className="subtitle">Create your account and join us today!</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="mobile" className="form-label">Mobile Number</label>
                        <div className="input-wrapper">
                            <span className="input-icon">📱</span>
                            <input
                                type="tel"
                                id="mobile"
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
                    <p>Already have an account? <Link to="/" className="signup-link">Login</Link></p>
                </div>
            </div>
        </div>
    );
}
