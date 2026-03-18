import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { API_ENDPOINTS } from '../config';
import { showErrorAlert, showInfoAlert } from '../utils/alert';

export default function BuyArb() {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null);

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState(false);
    const [selectedBank, setSelectedBank] = useState(null);

    const [targetPrice, setTargetPrice] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const [isExecuting, setIsExecuting] = useState(false);
    const [executionSuccess, setExecutionSuccess] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [sseCurrentPrice, setSseCurrentPrice] = useState(null);
    const [executionMessage, setExecutionMessage] = useState('');
    const abortControllerRef = useRef(null);

    const [isBlocked, setIsBlocked] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [executionError, setExecutionError] = useState('');

    useEffect(() => {
        let interval;
        if (isExecuting && !executionSuccess) {
            interval = setInterval(() => {
                setCurrentPrice(prev => {
                    let basePrice = prev;
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
                    const fluctuation = (Math.floor(Math.random() * 11) - 5) * 100;
                    const newPrice = basePrice + fluctuation;
                    return newPrice > 0 ? newPrice : prev;
                });
            }, 80);
        }
        return () => clearInterval(interval);
    }, [isExecuting, executionSuccess, selectedAction, targetPrice, minPrice]);

    useEffect(() => {
        let interval;
        if (isBlocked && cooldownSeconds > 0) {
            interval = setInterval(() => {
                setCooldownSeconds((prev) => prev - 1);
            }, 1000);
        } else if (isBlocked && cooldownSeconds <= 0) {
            setIsBlocked(false);
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
        setSelectedBank(null);
        setIsLoadingPayments(true);
        setPaymentMethods([]);

        const userId = parseInt(localStorage.getItem('userId'), 10);
        const phoneNumber = parseInt(localStorage.getItem('phoneNumber'), 10);
        const authToken = localStorage.getItem('authToken');

        if (!userId || !phoneNumber || !authToken) {
            showInfoAlert("Session Expired", "Session expired or missing authentication data. Please log in again.");
            navigate('/login');
            return;
        }

        const orderTypeMap = { 'UPI': 0, 'OTP-UPI': 1, 'Bank': 2 };

        try {
            const response = await fetch(API_ENDPOINTS.USER.PAYMENT_LIST, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    phone_number: phoneNumber,
                    auth_token: authToken,
                    order_type: orderTypeMap[method]
                }),
            });

            const data = await response.json();

            if (response.ok && data.data && data.data.all_banks) {
                setPaymentMethods(data.data.all_banks);
            } else {
                if (data.status_code === 401 || data.err === "Unauthorized / Session Expired") {
                    showInfoAlert("Session Expired", "Session expired. Please log in again.");
                    localStorage.clear();
                    navigate('/login');
                    return;
                }
                if (data.err === "ARB Side Problem | API fail" && data.json && data.json.data && data.json.data.msg) {
                    showErrorAlert("API Error", data.json.data.msg);
                } else {
                    showErrorAlert("Fetch Failed", data.detail || data.err || 'Failed to fetch payment methods.');
                }
            }
        } catch (error) {
            console.error('Payment list error:', error);
            showErrorAlert("Network Error", "A network error occurred while fetching payment methods.");
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
            showInfoAlert("Session Expired", "Session expired or missing authentication data. Please log in again.");
            navigate('/login');
            return;
        }

        let payloadPrices = {};
        const orderTypeMap = { 'UPI': 0, 'OTP-UPI': 1, 'Bank': 2 };

        if (selectedAction === 'Target Price') {
            const rawPrices = targetPrice.split(',').map(p => p.trim()).filter(p => p !== '');
            if (rawPrices.length > 10) { showErrorAlert("Limit Exceeded", "Please enter a maximum of 10 prices."); return; }

            const priceList = [];
            const seenPrices = new Set();
            for (let p of rawPrices) {
                if (!/^\d+$/.test(p)) { showErrorAlert("Invalid Input", `Invalid price '${p}'. Only integer values are allowed.`); return; }
                const val = parseInt(p, 10);
                if (val < 100) { showErrorAlert("Too Low", `Price must be at least 100. Invalid value: ${val}`); return; }
                if (seenPrices.has(val)) { showErrorAlert("Duplicate Price", `Duplicate price found: ${val}. All target prices must be unique.`); return; }
                seenPrices.add(val);
                priceList.push(val);
            }
            payloadPrices = { price_filter: 'target_price', target_price: priceList };

        } else if (selectedAction === 'Price Range') {
            if (!/^\d+$/.test(minPrice) || !/^\d+$/.test(maxPrice)) { showErrorAlert("Invalid Input", "Min and Max prices must be valid integers."); return; }
            const min = parseInt(minPrice, 10);
            const max = parseInt(maxPrice, 10);
            if (min < 100 || min > 100000 || max < 100 || max > 100000) { showErrorAlert("Out of Range", "Prices must be between 100 and 100,000."); return; }
            if (min >= max) { showErrorAlert("Invalid Range", "Min price must be strictly less than Max price."); return; }
            payloadPrices = { price_filter: 'price_range', price_range: [min, max] };
        } else {
            return;
        }

        const payload = {
            user_id: userId,
            phone_number: phoneNumber,
            auth_token: authToken,
            order_type: orderTypeMap[selectedMethod],
            upi_app_code: selectedBank?.upiApp,
            upi_app_id: selectedBank?.upiAppId || 0,
            ...payloadPrices
        };

        setIsExecuting(true);
        setExecutionSuccess(false);
        setCurrentPrice(0);
        setSseCurrentPrice(null);
        setExecutionMessage("Matching price..");

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const response = await fetch(API_ENDPOINTS.ORDER.EXECUTE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                if (done) { isDone = true; break; }
                buffer += decoder.decode(value, { stream: true });

                const events = buffer.split('\n\n');
                buffer = events.pop();

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
                                    showInfoAlert("Session Expired", "Session expired. Please log in again.");
                                    localStorage.clear();
                                    navigate('/login');
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
                                showErrorAlert("Server Error", parsedData.err || 'Stream terminated.');
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
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Stream manually canceled.');
            } else {
                console.error('Execution stream error:', error);
                showErrorAlert("Network Error", "A network error occurred while executing the order.");
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
                        <h1 className="logo">Arb<span className="logo-highlight">hook</span></h1>
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
                        <div className="action-stack">
                            <button className="login-btn full-btn" onClick={() => handlePaymentSelection('UPI')}>
                                <span className="btn-text">UPI</span>
                                <span className="btn-icon">⚡</span>
                            </button>
                            <button className="login-btn full-btn" onClick={() => handlePaymentSelection('OTP-UPI')}>
                                <span className="btn-text">OTP-UPI</span>
                                <span className="btn-icon">📱</span>
                            </button>
                            <button className="login-btn full-btn" onClick={() => handlePaymentSelection('Bank')}>
                                <span className="btn-text">Bank</span>
                                <span className="btn-icon">🏦</span>
                            </button>
                            <button className="login-btn full-btn secondary-btn" onClick={() => navigate('/home')}>
                                <span className="btn-text">Go Back</span>
                                <span className="btn-icon">🔙</span>
                            </button>
                        </div>
                    )}

                    {selectedMethod && !selectedBank && (
                        <div className="action-stack">
                            {isLoadingPayments ? (
                                <p className="loading-text">Loading payment methods...</p>
                            ) : paymentMethods.length > 0 ? (
                                paymentMethods.map((bank) => (
                                    <button
                                        key={bank.upi_app_id}
                                        className="login-btn full-btn"
                                        onClick={() => setSelectedBank({ upiAppId: bank.upi_app_id, upiApp: bank.upi_code, bankName: bank.upi_app_name })}
                                        style={{ position: 'relative' }}
                                    >
                                        {bank.icon_url && (
                                            <div style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center' }}>
                                                <img src={bank.icon_url} alt={bank.upi_app_name} style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                                            </div>
                                        )}
                                        <span className="btn-text" style={{ width: '100%', textAlign: 'center' }}>{bank.upi_app_name}</span>
                                    </button>
                                ))
                            ) : (
                                <p className="loading-text">No bound payment methods found.</p>
                            )}
                            <button className="login-btn full-btn back-btn" onClick={() => setSelectedMethod(null)}>
                                <span className="btn-text">Back to Methods</span>
                                <span className="btn-icon">🔙</span>
                            </button>
                        </div>
                    )}

                    {selectedMethod && selectedBank && !selectedAction && (
                        <div className="action-stack">
                            <button className="login-btn full-btn" onClick={() => handleOptionClick('Target Price')}>
                                <span className="btn-text">Target Price</span>
                                <span className="btn-icon">🎯</span>
                            </button>
                            <button className="login-btn full-btn" onClick={() => handleOptionClick('Price Range')}>
                                <span className="btn-text">Price Range</span>
                                <span className="btn-icon">📊</span>
                            </button>
                            <button className="login-btn full-btn secondary-btn" onClick={() => setSelectedBank(null)}>
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
                                    <span className="form-sublabel">Enter up to 10 prices separated by comma</span>
                                </label>
                                <div className="input-wrapper">
                                    <span className="input-icon">₹</span>
                                    <input type="text" className="form-input" placeholder="e.g. 100, 105, 110" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} required />
                                </div>
                            </div>
                            <div className="action-stack">
                                <button type="submit" className="login-btn full-btn">
                                    <span className="btn-text">Place Buy Order</span>
                                    <span className="btn-icon">✓</span>
                                </button>
                                <button type="button" className="login-btn full-btn back-btn" onClick={() => setSelectedAction(null)}>
                                    <span className="btn-text">Back to Options</span>
                                    <span className="btn-icon">🔙</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {selectedAction === 'Price Range' && (
                        <form className="login-form" onSubmit={handleBuySubmit} style={{ marginTop: '10px' }}>
                            <div className="form-row">
                                <div>
                                    <label className="form-label">Min Price</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">₹</span>
                                        <input type="text" className="form-input" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Max Price</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">₹</span>
                                        <input type="text" className="form-input" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                            <div className="action-stack">
                                <button type="submit" className="login-btn full-btn">
                                    <span className="btn-text">Place Range Order</span>
                                    <span className="btn-icon">✓</span>
                                </button>
                                <button type="button" className="login-btn full-btn back-btn" onClick={() => setSelectedAction(null)}>
                                    <span className="btn-text">Back to Options</span>
                                    <span className="btn-icon">🔙</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : isExecuting ? (
                <div className="login-card exec-card">
                    <div className="login-header exec-header">
                        <div className="header-top">
                            <ThemeToggle />
                        </div>
                        <h1 className="logo">Live Matching</h1>
                        <p className="subtitle">{executionSuccess ? "Order Executed Successfully" : executionMessage}</p>
                    </div>

                    {executionSuccess ? (
                        <>
                            <div className="exec-icon exec-icon-success">✅</div>
                            <h2 className="exec-price">At: ₹{currentPrice}</h2>
                            <p className="exec-message">Your targeted purchase was processed successfully.</p>
                            <button className="login-btn full-btn success-bg" onClick={closeExecutionModal}>
                                <span className="btn-text">Done</span>
                                <span className="btn-icon">➔</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="exec-scanner-wrap">
                                <div className="modern-scanner"></div>
                            </div>
                            <p className="exec-scan-label">Scanning variants near...</p>
                            <h2 className="exec-live-price">₹ {currentPrice !== 0 ? currentPrice : '--'}</h2>

                            {sseCurrentPrice !== null && (
                                <p className="exec-server-price">Live Server Price: ₹ {sseCurrentPrice}</p>
                            )}

                            <p className="exec-target">
                                Target: ₹{selectedAction === 'Target Price' ? targetPrice : `${minPrice} - ${maxPrice}`}
                            </p>

                            <button className="login-btn full-btn danger-bg" onClick={handleCancelStream}>
                                <span className="btn-text">Cancel Scanning</span>
                                <span className="btn-icon">✖</span>
                            </button>
                        </>
                    )}
                </div>
            ) : isBlocked ? (
                <div className="login-card exec-card">
                    <div className="login-header exec-header">
                        <div className="header-top">
                            <ThemeToggle />
                        </div>
                        <h1 className="logo blocked-title">Purchase Blocked</h1>
                        <p className="subtitle">{executionError}</p>
                    </div>

                    <div className="exec-icon exec-icon-blocked">🚫</div>
                    <h2 className="exec-price">Cooldown Remaining</h2>
                    <p className="cooldown-text">{formatCooldown(cooldownSeconds)}</p>

                    <button className="login-btn full-btn back-btn" onClick={() => setIsBlocked(false)}>
                        <span className="btn-text">Back to Options</span>
                        <span className="btn-icon">🔙</span>
                    </button>
                </div>
            ) : null}
        </div>
    );
}
