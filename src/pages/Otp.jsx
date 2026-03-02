
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

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
            alert('Please complete the sign-up form first.');
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

    const handleResend = () => {
        const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
        sessionStorage.setItem('generatedOTP', newOtpCode);
        console.log('New OTP:', newOtpCode);
        alert(`New OTP has been sent!\n(For demo: ${newOtpCode})`);

        setTimeLeft(60);
        setIsResendDisabled(true);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
    };

    const handleVerify = (enteredOtpValue) => {
        setIsVerifying(true);
        const correctOTP = sessionStorage.getItem('generatedOTP');

        setTimeout(() => {
            setIsVerifying(false);
            if (enteredOtpValue === correctOTP) {
                setStatus({ type: 'success', message: '✓ OTP Verified Successfully!' });
                setTimeout(() => setShowSuccess(true), 500);
            } else {
                setStatus({ type: 'error', message: '✗ Invalid OTP. Please try again.' });
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0].focus();

                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 400);
            }
        }, 1000);
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
        sessionStorage.removeItem('generatedOTP');
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
                    <h1 className="logo">ARB hook</h1>
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
