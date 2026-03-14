import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { API_ENDPOINTS } from '../config';
import { showSuccessAlert, showErrorAlert, showInfoAlert } from '../utils/alert';

export default function Otp() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [showSuccess, setShowSuccess] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    const inputRefs = useRef([]);

    const signupMobile = sessionStorage.getItem('signupMobile') || '';
    const maskedMobile = signupMobile
        ? signupMobile.substring(0, 2) + '******' + signupMobile.substring(8)
        : '';

    useEffect(() => {
        if (!signupMobile) {
            showInfoAlert("Missing Info", "Please complete the sign-up form first.");
            navigate('/signup');
        }

        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [navigate, signupMobile]);

    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else {
            setIsResendDisabled(false);
        }
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleChange = (element, index) => {
        const value = element.value;
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setStatus({ type: '', message: '' });

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }

        if (newOtp.every(val => val !== '')) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            inputRefs.current[5].focus();
            handleVerify(pastedData);
        }
    };

    const handleResend = async () => {
        setIsResendDisabled(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.SEND_OTP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone_number: parseInt(signupMobile, 10),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showSuccessAlert("OTP Resent", `New OTP has been sent to ${signupMobile}!`);
                setTimeLeft(60);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0].focus();
            } else {
                if (data.err === "ARB Side Problem | API fail" && data.json && data.json.data && data.json.data.msg) {
                    setStatus({ type: 'error', message: '✗ ' + data.json.data.msg });
                } else {
                    setStatus({ type: 'error', message: `✗ ${data.detail || data.err || 'Failed to resend OTP.'}` });
                }
                setIsResendDisabled(false);
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            setStatus({ type: 'error', message: '✗ Network error. Please try again.' });
            setIsResendDisabled(false);
        }
    };

    const handleVerify = async (enteredOtpValue) => {
        setIsVerifying(true);
        setStatus({ type: '', message: '' });

        const signupPassword = sessionStorage.getItem('signupPassword');
        const signupInvitationCode = sessionStorage.getItem('signupInvitationCode');

        if (!signupPassword) {
            showErrorAlert("Missing Info", "Missing registration information. Please sign up again.");
            navigate('/signup');
            return;
        }

        try {
            const payload = {
                phone_number: parseInt(signupMobile, 10),
                password: signupPassword,
                otp: parseInt(enteredOtpValue, 10),
            };

            if (signupInvitationCode) {
                payload.invitation_code = signupInvitationCode;
            }

            const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: '✓ Registration Successful!' });
                setTimeout(() => setShowSuccess(true), 500);
            } else {
                let errorMessage = data.detail || data.err || 'Registration failed. Please try again.';
                if (data.err === "ARB Side Problem | API fail" && data.json && data.json.data && data.json.data.msg) {
                    errorMessage = data.json.data.msg;
                }

                setStatus({ type: 'error', message: '✗ ' + errorMessage });
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0].focus();

                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 400);
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            setStatus({ type: 'error', message: '✗ Network error verification failed.' });
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const enteredOTP = otp.join('');
        if (enteredOTP.length === 6) {
            handleVerify(enteredOTP);
        }
    };

    const handleSuccessClick = () => {
        sessionStorage.removeItem('signupMobile');
        sessionStorage.removeItem('signupPassword');
        sessionStorage.removeItem('signupInvitationCode');
        navigate('/');
    };

    return (
        <div className="container">
            <div className="bg-circle circle-1"></div>
            <div className="bg-circle circle-2"></div>
            <div className="bg-circle circle-3"></div>

            <div className="login-card otp-card">
                <div className="login-header">
                    <div className="header-top">
                        <ThemeToggle />
                    </div>
                    <h1 className="logo">Arb<span className="logo-highlight">hook</span></h1>
                    <p className="subtitle">Enter the 6-digit code sent to</p>
                    <p className="mobile-display">{maskedMobile}</p>
                </div>

                <form className="login-form otp-form" onSubmit={handleSubmit}>
                    <div className={`otp-inputs ${isShaking ? 'shake' : ''}`}>
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                className="otp-input"
                                maxLength="1"
                                inputMode="numeric"
                                pattern="[0-9]"
                                required
                                value={data}
                                ref={el => inputRefs.current[index] = el}
                                onChange={e => handleChange(e.target, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                onPaste={handlePaste}
                            />
                        ))}
                    </div>

                    <div className={`otp-error ${status.type}`}>
                        {status.message}
                    </div>

                    <div className="resend-section">
                        {timeLeft > 0 ? (
                            <p className="timer-text">Resend OTP in <span>{timeLeft}</span>s</p>
                        ) : null}
                        <button
                            type="button"
                            className="resend-btn"
                            onClick={handleResend}
                            disabled={isResendDisabled}
                        >
                            <span>↻ Resend OTP</span>
                        </button>
                    </div>

                    <button type="submit" className={`login-btn ${isVerifying ? 'loading' : ''}`}>
                        <span className="btn-text">Verify OTP</span>
                        <span className="btn-icon">✓</span>
                    </button>
                </form>

                <div className="signup-prompt">
                    <p><Link to="/signup" className="signup-link">← Back to Sign Up</Link></p>
                </div>
            </div>

            {/* Success Modal */}
            <div className={`success-modal ${showSuccess ? 'show' : ''}`}>
                <div className="success-content">
                    <div className="success-icon">✓</div>
                    <h2 className="success-title">Sign Up Successful!</h2>
                    <p className="success-message">Your account has been created successfully.</p>
                    <button className="success-btn" onClick={handleSuccessClick}>
                        <span>Go to Login</span>
                        <span>→</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
