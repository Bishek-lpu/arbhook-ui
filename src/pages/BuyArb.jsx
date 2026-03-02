import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function BuyArb() {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null); // 'Target Price' or 'Price Range'

    // Form states for the new cards
    const [targetPrice, setTargetPrice] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const handlePaymentSelection = (method) => {
        setSelectedMethod(method);
    };

    const handleOptionClick = (option) => {
        setSelectedAction(option);
    };

    const handleBuySubmit = (e) => {
        e.preventDefault();

        if (selectedAction === 'Target Price') {
            const rawPrices = targetPrice
                .split(',')
                .map(p => p.trim())
                .filter(p => p !== '');

            if (rawPrices.length > 10) {
                alert("Please enter a maximum of 10 prices.");
                return;
            }

            const priceList = [];
            const seenPrices = new Set();
            for (let p of rawPrices) {
                // Must contain only digits (integer check)
                if (!/^\d+$/.test(p)) {
                    alert(`Invalid price '${p}'. Only integer values are allowed.`);
                    return;
                }
                const val = parseInt(p, 10);
                if (val < 100) {
                    alert(`Price must be at least 100. Invalid value: ${val}`);
                    return;
                }
                if (seenPrices.has(val)) {
                    alert(`Duplicate price found: ${val}. All target prices must be unique.`);
                    return;
                }

                seenPrices.add(val);
                priceList.push(val);
            }

            alert(`Order Placed! \nAction: ${selectedAction}\nMethod: ${selectedMethod}\nPrices: ${priceList.join(', ')}`);
        } else if (selectedAction === 'Price Range') {
            if (!/^\d+$/.test(minPrice) || !/^\d+$/.test(maxPrice)) {
                alert("Min and Max prices must be valid integers.");
                return;
            }

            const min = parseInt(minPrice, 10);
            const max = parseInt(maxPrice, 10);

            if (min < 100 || min > 100000 || max < 100 || max > 100000) {
                alert("Prices must be between 100 and 100,000.");
                return;
            }

            if (min >= max) {
                alert("Min price must be strictly less than Max price.");
                return;
            }

            alert(`Order Placed! \nAction: ${selectedAction}\nMethod: ${selectedMethod}\nStart Price: ${min}\nEnd Price: ${max}`);
        } else {
            alert(`Order Placed! \nAction: ${selectedAction}\nMethod: ${selectedMethod}`);
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
                    <h1 className="logo">ARB hook</h1>
                    <p className="subtitle">
                        {selectedAction
                            ? `${selectedAction} (${selectedMethod})`
                            : selectedMethod
                                ? `Selected: ${selectedMethod}`
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

                {selectedMethod && !selectedAction && (
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
                            onClick={() => setSelectedMethod(null)}
                            style={{ width: '100%', margin: '0', background: 'var(--text-secondary)' }}
                        >
                            <span className="btn-text">Back to Methods</span>
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
        </div>
    );
}
