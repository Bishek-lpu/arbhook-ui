import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { API_ENDPOINTS } from '../config';

export default function BuyArb() {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null); // 'Target Price' or 'Price Range'

    // Payment list states
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState(false);
    const [selectedBank, setSelectedBank] = useState(null);

    // Form states for the new cards
    const [targetPrice, setTargetPrice] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const [isExecuting, setIsExecuting] = useState(false);
    const [executionSuccess, setExecutionSuccess] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [sseCurrentPrice, setSseCurrentPrice] = useState(null); // Real Server Price
    const [executionMessage, setExecutionMessage] = useState('');
    const abortControllerRef = useRef(null);

    // Purchase Blocked States
    const [isBlocked, setIsBlocked] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [executionError, setExecutionError] = useState('');

    // High frequency random price simulation effect
    useEffect(() => {
        let interval;
        if (isExecuting && !executionSuccess) {
            interval = setInterval(() => {
                setCurrentPrice(prev => {
                    let basePrice = prev;
                    // If we haven't received a real price yet, base it off their input targets
                    if (prev === 0) {
                        if (selectedAction === 'Target Price' && targetPrice) {
                            basePrice = parseInt(targetPrice.split(',')[0], 10);
                        } else if (selectedAction === 'Price Range' && minPrice) {
                            basePrice = parseInt(minPrice, 10);
                        } else {
                            basePrice = 10000;
                        }
                    }
                    if (isNaN(basePrice)) return prev;

                    // Generate random multiple of 100 fluctuation between -500 and 500
                    const fluctuation = (Math.floor(Math.random() * 11) - 5) * 100;
                    const newPrice = basePrice + fluctuation;
                    return newPrice > 0 ? newPrice : prev;
                });
            }, 80); // ultra-fast 80ms refresh rate
        }
        return () => clearInterval(interval);
    }, [isExecuting, executionSuccess, selectedAction, targetPrice, minPrice]);

    // Cooldown countdown effect
    useEffect(() => {
        let interval;
        if (isBlocked && cooldownSeconds > 0) {
            interval = setInterval(() => {
                setCooldownSeconds((prev) => prev - 1);
            }, 1000);
        } else if (isBlocked && cooldownSeconds <= 0) {
            setIsBlocked(false); // Auto clear block when time expires
        }
        return () => clearInterval(interval);
    }, [isBlocked, cooldownSeconds]);

    const formatCooldown = (totalSeconds) => {
        if (totalSeconds <= 0) return "Ready";
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const handlePaymentSelection = async (method) => {
        setSelectedMethod(method);
        setSelectedBank(null); // Reset when switching methods
        setIsLoadingPayments(true);
        setPaymentMethods([]);

        const userId = parseInt(localStorage.getItem('userId'), 10);
        const phoneNumber = parseInt(localStorage.getItem('phoneNumber'), 10);
        const authToken = localStorage.getItem('authToken');

        if (!userId || !phoneNumber || !authToken) {
            alert("Session expired or missing authentication data. Please log in again.");
            navigate('/');
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.USER.PAYMENT_LIST, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    phoneNumber,
                    authToken
                }),
            });

            const data = await response.json();

            if (response.ok && data.data && data.data.boundBanks) {
                setPaymentMethods(data.data.boundBanks);
            } else {
                if (data.status_code === 401 || data.err === "Unauthorized / Session Expired") {
                    alert("Session expired. Please log in again.");
                    localStorage.clear();
                    navigate('/');
                    return;
                }

                if (data.err === "ARB Side Problem | API fail" && data.json && data.json.data && data.json.data.msg) {
                    alert(data.json.data.msg);
                } else {
                    alert(`Error: ${data.detail || data.err || 'Failed to fetch payment methods.'}`);
                }
            }
        } catch (error) {
            console.error('Payment list error:', error);
            alert('A network error occurred while fetching payment methods.');
        } finally {
            setIsLoadingPayments(false);
        }
    };

    const handleOptionClick = (option) => {
        setSelectedAction(option);
    };

    const handleBuySubmit = async (e) => {
        e.preventDefault();

        const userId = parseInt(localStorage.getItem('userId'), 10);
        const phoneNumber = parseInt(localStorage.getItem('phoneNumber'), 10);
        const authToken = localStorage.getItem('authToken');

        if (!userId || !phoneNumber || !authToken) {
            alert("Session expired or missing authentication data. Please log in again.");
            navigate('/');
            return;
        }

        let payloadPrices = {};
        const orderTypeMap = { 'UPI': 0, 'OTP-UPI': 1, 'Bank': 2 };

        if (selectedAction === 'Target Price') {
            const rawPrices = targetPrice.split(',').map(p => p.trim()).filter(p => p !== '');
            if (rawPrices.length > 10) return alert("Please enter a maximum of 10 prices.");

            const priceList = [];
            const seenPrices = new Set();
            for (let p of rawPrices) {
                if (!/^\d+$/.test(p)) return alert(`Invalid price '${p}'. Only integer values are allowed.`);
                const val = parseInt(p, 10);
                if (val < 100) return alert(`Price must be at least 100. Invalid value: ${val}`);
                if (seenPrices.has(val)) return alert(`Duplicate price found: ${val}. All target prices must be unique.`);
                seenPrices.add(val);
                priceList.push(val);
            }
            payloadPrices = { priceFilter: 'targetPrice', targetPrice: priceList };

        } else if (selectedAction === 'Price Range') {
            if (!/^\d+$/.test(minPrice) || !/^\d+$/.test(maxPrice)) return alert("Min and Max prices must be valid integers.");
            const min = parseInt(minPrice, 10);
            const max = parseInt(maxPrice, 10);

            if (min < 100 || min > 100000 || max < 100 || max > 100000) return alert("Prices must be between 100 and 100,000.");
            if (min >= max) return alert("Min price must be strictly less than Max price.");

            payloadPrices = { priceFilter: 'priceRange', priceRange: [min, max] };
        } else {
            return;
        }

        const payload = {
            userId,
            phoneNumber,
            authToken,
            orderType: orderTypeMap[selectedMethod],
            upiApp: selectedBank?.upiApp,
            upiAppId: selectedBank?.upiAppId,
            ...payloadPrices
        };

        // Reset and show modal
        setIsExecuting(true);
        setExecutionSuccess(false);
        setCurrentPrice(0);
        setSseCurrentPrice(null);
        setExecutionMessage("Matching price..");

        // Cancel any existing streams
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const response = await fetch(API_ENDPOINTS.ORDER.EXECUTE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: abortController.signal
            });

            if (!response.body) {
                throw new Error("ReadableStream not supported by the browser.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let isDone = false;
            let buffer = '';

            while (!isDone) {
                const { value, done } = await reader.read();
                if (done) {
                    isDone = true;
                    break;
                }
                buffer += decoder.decode(value, { stream: true });

                const events = buffer.split('\n\n');
                buffer = events.pop(); // keep the incomplete chunk

                for (let ev of events) {
                    if (ev.trim() === '') continue;

                    const lines = ev.split('\n');
                    let eventType = '';
                    let eventDataStr = '';

                    for (let line of lines) {
                        if (line.startsWith('event:')) {
                            eventType = line.substring(6).trim();
                        } else if (line.startsWith('data:')) {
                            eventDataStr = line.substring(5).trim();
                        }
                    }

                    if (eventDataStr) {
                        try {
                            const parsedData = JSON.parse(eventDataStr);
                            console.log(`SSE Event: ${eventType} | Current Price from Server:`, parsedData?.data?.current_price);
                            if (eventType === 'success') {
                                if (parsedData.data.is_success) {
                                    setExecutionSuccess(true);
                                    setExecutionMessage("Purchase Successfully Executed");
                                    setCurrentPrice(parsedData.data.current_price);
                                    isDone = true;
                                    break;
                                } else {
                                    setSseCurrentPrice(parsedData.data.current_price);
                                }
                            } else if (eventType === 'error') {
                                if (parsedData.status_code === 401 || parsedData.err === "Unauthorized / Session Expired") {
                                    alert("Session expired. Please log in again.");
                                    localStorage.clear();
                                    navigate('/');
                                    isDone = true;
                                    break;
                                } else if (parsedData.err === "Limited buy functionality" && parsedData.json) {
                                    const msg = parsedData.json.msg || parsedData.err;
                                    const seconds = parsedData.json.data?.remainingSeconds || 0;

                                    setExecutionError(msg);
                                    setCooldownSeconds(seconds);
                                    setIsBlocked(true);
                                    setIsExecuting(false);
                                    isDone = true;
                                    break;
                                }
                                alert(`Server error: ${parsedData.err || 'Stream terminated.'}`);
                                setIsExecuting(false);
                                isDone = true;
                                break;
                            }
                        } catch (err) {
                            console.error("Error parsing SSE JSON:", err);
                        }
                    }
                }
            }
            if (!executionSuccess) {
                // Stream finished but success wasn't fully triggered (or stopped unexpectedly)
                // The finally block handles cleaning the layout up.
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Stream manually canceled.');
            } else {
                console.error('Execution stream error:', error);
                alert('A network error occurred while executing the order.');
            }
            setIsExecuting(false);
        }
    };

    const handleCancelStream = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsExecuting(false);
        setExecutionSuccess(false);
    };

    const closeExecutionModal = () => {
        setIsExecuting(false);
        setExecutionSuccess(false);
        // Do we navigate home upon success? Optional, leaving user on page.
    };

    return (
        <div className="container">
            <div className="bg-circle circle-1"></div>
            <div className="bg-circle circle-2"></div>
            <div className="bg-circle circle-3"></div>

            {!isExecuting && !isBlocked ? (
                <div className="login-card">
                    <div className="login-header">
                        <div className="header-top">
                            <ThemeToggle />
                        </div>
                        <h1 className="logo">ARB hook</h1>
                        <p className="subtitle">
                            {selectedAction
                                ? `${selectedAction} (${selectedMethod})`
                                : selectedBank
                                    ? `Selected Bank`
                                    : selectedMethod
                                        ? `Select Bank`
                                        : "Select Your Payment method"}
                        </p>
                    </div>

                    {!selectedMethod && !selectedAction && (
                        <div className="home-actions" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px', marginBottom: '20px' }}>
                            <button
                                className="login-btn"
                                onClick={() => handlePaymentSelection('UPI')}
                                style={{ width: '100%', margin: '0' }}
                            >
                                <span className="btn-text">UPI</span>
                                <span className="btn-icon">⚡</span>
                            </button>

                            <button
                                className="login-btn"
                                onClick={() => handlePaymentSelection('OTP-UPI')}
                                style={{ width: '100%', margin: '0' }}
                            >
                                <span className="btn-text">OTP-UPI</span>
                                <span className="btn-icon">📱</span>
                            </button>

                            <button
                                className="login-btn"
                                onClick={() => handlePaymentSelection('Bank')}
                                style={{ width: '100%', margin: '0' }}
                            >
                                <span className="btn-text">Bank</span>
                                <span className="btn-icon">🏦</span>
                            </button>

                            <button
                                className="login-btn"
                                onClick={() => navigate('/home')}
                                style={{ width: '100%', margin: '0', background: 'var(--text-secondary)' }}
                            >
                                <span className="btn-text">Go Back</span>
                                <span className="btn-icon">🔙</span>
                            </button>
                        </div>
                    )}

                    {selectedMethod && !selectedBank && (
                        <div className="home-actions" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px', marginBottom: '20px' }}>
                            {isLoadingPayments ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading payment methods...</p>
                            ) : paymentMethods.length > 0 ? (
                                paymentMethods.map((bank) => (
                                    <button
                                        key={bank.id}
                                        className="login-btn"
                                        onClick={() => setSelectedBank({ upiAppId: bank.id, upiApp: bank.bankCode, bankName: bank.bankName })}
                                        style={{ width: '100%', margin: '0', display: 'flex', alignItems: 'center', position: 'relative' }}
                                    >
                                        {bank.iconUrl && (
                                            <div style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center' }}>
                                                <img src={bank.iconUrl} alt={bank.bankName} style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                                            </div>
                                        )}
                                        <span className="btn-text" style={{ width: '100%', textAlign: 'center' }}>{bank.bankName}</span>
                                    </button>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No bound payment methods found.</p>
                            )}

                            <button
                                className="login-btn"
                                onClick={() => setSelectedMethod(null)}
                                style={{ width: '100%', margin: '0', background: 'var(--text-secondary)', marginTop: '10px' }}
                            >
                                <span className="btn-text">Back to Methods</span>
                                <span className="btn-icon">🔙</span>
                            </button>
                        </div>
                    )}

                    {selectedMethod && selectedBank && !selectedAction && (
                        <div className="home-actions" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px', marginBottom: '20px' }}>
                            <button
                                className="login-btn"
                                onClick={() => handleOptionClick('Target Price')}
                                style={{ width: '100%', margin: '0' }}
                            >
                                <span className="btn-text">Target Price</span>
                                <span className="btn-icon">🎯</span>
                            </button>

                            <button
                                className="login-btn"
                                onClick={() => handleOptionClick('Price Range')}
                                style={{ width: '100%', margin: '0' }}
                            >
                                <span className="btn-text">Price Range</span>
                                <span className="btn-icon">📊</span>
                            </button>

                            <button
                                className="login-btn"
                                onClick={() => setSelectedBank(null)}
                                style={{ width: '100%', margin: '0', background: 'var(--text-secondary)' }}
                            >
                                <span className="btn-text">Back to Banks</span>
                                <span className="btn-icon">🔙</span>
                            </button>
                        </div>
                    )}

                    {selectedAction === 'Target Price' && (
                        <form className="login-form" onSubmit={handleBuySubmit} style={{ marginTop: '10px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Target Price (INR)
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        Enter up to 10 prices separated by comma
                                    </span>
                                </label>
                                <div className="input-wrapper">
                                    <span className="input-icon">₹</span>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. 100, 105, 110"
                                        value={targetPrice}
                                        onChange={(e) => setTargetPrice(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="home-actions" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px', marginBottom: '10px' }}>
                                <button type="submit" className="login-btn" style={{ width: '100%', margin: '0' }}>
                                    <span className="btn-text">Place Buy Order</span>
                                    <span className="btn-icon">✓</span>
                                </button>
                                <button
                                    type="button"
                                    className="login-btn"
                                    onClick={() => setSelectedAction(null)}
                                    style={{ width: '100%', margin: '0', background: 'linear-gradient(135deg, #475569, #1e293b)' }}
                                >
                                    <span className="btn-text">Back to Options</span>
                                    <span className="btn-icon">🔙</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {selectedAction === 'Price Range' && (
                        <form className="login-form" onSubmit={handleBuySubmit} style={{ marginTop: '10px' }}>
                            <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Min Price</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">₹</span>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Max Price</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">₹</span>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="home-actions" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px', marginBottom: '10px' }}>
                                <button type="submit" className="login-btn" style={{ width: '100%', margin: '0' }}>
                                    <span className="btn-text">Place Range Order</span>
                                    <span className="btn-icon">✓</span>
                                </button>
                                <button
                                    type="button"
                                    className="login-btn"
                                    onClick={() => setSelectedAction(null)}
                                    style={{ width: '100%', margin: '0', background: 'linear-gradient(135deg, #475569, #1e293b)' }}
                                >
                                    <span className="btn-text">Back to Options</span>
                                    <span className="btn-icon">🔙</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : isExecuting ? (
                <div className="login-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="login-header" style={{ width: '100%', marginBottom: '20px' }}>
                        <div className="header-top">
                            <ThemeToggle />
                        </div>
                        <h1 className="logo">Live Matching</h1>
                        <p className="subtitle">{executionSuccess ? "Order Executed Successfully" : executionMessage}</p>
                    </div>

                    {executionSuccess ? (
                        <>
                            <div className="success-icon" style={{ fontSize: '2.5rem', marginBottom: '20px', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', color: 'white' }}>✅</div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '10px 0', color: 'var(--text-primary)' }}>
                                At: ₹{currentPrice}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', textAlign: 'center' }}>
                                Your targeted purchase was processed successfully.
                            </p>
                            <button
                                className="login-btn"
                                style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                                onClick={closeExecutionModal}
                            >
                                <span className="btn-text">Done</span>
                                <span className="btn-icon">➔</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="modern-scanner" style={{ transform: 'scale(1.2)', margin: '30px 0 40px 0' }}>
                            </div>

                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px' }}>Scanning variants near...</p>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 15px 0', color: 'var(--text-primary)' }}>
                                ₹ {currentPrice !== 0 ? currentPrice : '--'}
                            </h2>

                            {sseCurrentPrice !== null && (
                                <p style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: 700, margin: '5px 0 15px 0', background: 'rgba(251, 191, 36, 0.1)', padding: '6px 16px', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                                    Live Server Price: ₹ {sseCurrentPrice}
                                </p>
                            )}

                            <p style={{ color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: 500, marginBottom: '20px' }}>
                                Target: ₹{selectedAction === 'Target Price' ? targetPrice : `${minPrice} - ${maxPrice}`}
                            </p>

                            <button
                                className="login-btn"
                                style={{ width: '100%', background: '#c1121f', marginTop: '20px' }}
                                onClick={handleCancelStream}
                            >
                                <span className="btn-text">Cancel Scanning</span>
                                <span className="btn-icon">✖</span>
                            </button>
                        </>
                    )}
                </div>
            ) : isBlocked ? (
                <div className="login-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="login-header" style={{ width: '100%', marginBottom: '20px' }}>
                        <div className="header-top">
                            <ThemeToggle />
                        </div>
                        <h1 className="logo" style={{ color: '#c1121f' }}>Purchase Blocked</h1>
                        <p className="subtitle">{executionError}</p>
                    </div>

                    <div className="success-icon" style={{ fontSize: '2.5rem', marginBottom: '20px', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(193, 18, 31, 0.1)', border: '2px solid #c1121f', borderRadius: '50%', color: '#c1121f' }}>🚫</div>

                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '10px 0', color: 'var(--text-primary)' }}>
                        Cooldown Remaining
                    </h2>

                    <p style={{ color: '#c1121f', fontSize: '1.8rem', fontWeight: 800, marginBottom: '30px', textAlign: 'center', letterSpacing: '1px' }}>
                        {formatCooldown(cooldownSeconds)}
                    </p>

                    <button
                        className="login-btn"
                        style={{ width: '100%', background: 'linear-gradient(135deg, #475569, #1e293b)' }}
                        onClick={() => setIsBlocked(false)}
                    >
                        <span className="btn-text">Back to Options</span>
                        <span className="btn-icon">🔙</span>
                    </button>
                </div>
            ) : null}
        </div>
    );
}
