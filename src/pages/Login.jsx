import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login process
        setTimeout(() => {
            setIsLoading(false);

            if (mobile === '9630994006' && password === '12345') {
                // Real app would set auth state/tokens here
                navigate('/home');
            } else {
                alert(`Invalid credentials. Please try again.`);
            }
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
                    <p className="subtitle">Welcome back! Please login to your account.</p>
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
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
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
                </form>

                <div className="signup-prompt">
                    <p>Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
}
