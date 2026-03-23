import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import SEO from '../components/SEO';
import './Plan.css';

const plans = [
    { id: 1, duration: '7 Days', price: 49, tag: 'Budget friendly', features: ['Starter tools', 'Standard support'], highlight: false },
    { id: 2, duration: '30 Days', price: 99, tag: 'Most Popular', features: ['All core features', 'Priority support', 'Ad-free experience'], highlight: true, highlightColor: 'blue' },
    { id: 3, duration: '2 Months', price: 159, tag: '', features: ['All core features', 'Extended validity'], highlight: false },
    { id: 4, duration: '3 Months', price: 199, tag: 'Best Value', features: ['Premium tools', 'Dedicated support', 'Maximum savings'], highlight: true, highlightColor: 'orange' },
    { id: 5, duration: '6 Months', price: 398, tag: '', features: ['Long-term peace of mind', 'VIP support group'], highlight: false },
];

export default function Plan() {
    const navigate = useNavigate();
    const location = useLocation();

    const prefilledMobile = location.state?.mobile || '';

    const handleSelectPlan = (plan) => {
        // We can pass state if payment page supports it
        navigate('/payment', { state: { planId: plan.id, price: plan.price, duration: plan.duration, mobile: prefilledMobile } });
    };

    return (
        <div className="plan-page-container">
            <SEO title="Our Plans" description="Choose the perfect Arbhook plan for you." />
            
            {/* Background Animations */}
            <div className="bg-circle circle-1"></div>
            <div className="bg-circle circle-2"></div>
            <div className="bg-circle circle-3"></div>

            <div className="plan-header-wrapper">
                <div className="plan-header-top">
                    <button className="plan-back-btn" onClick={() => navigate(-1)}>🔙 Back</button>
                    <ThemeToggle />
                </div>
                <h1 className="plan-title">Choose Your <span className="logo-highlight">Plan</span></h1>
                <p className="plan-subtitle">Unlock premium features and elevate your experience.</p>
            </div>

            <div className="plan-cards-container">
                {plans.map((plan) => (
                    <div 
                        key={plan.id} 
                        className={`plan-card ${plan.highlight ? 'highlight-' + plan.highlightColor : ''}`}
                    >
                        {plan.tag && <div className="plan-badge">{plan.tag}</div>}
                        
                        <div className="plan-duration">{plan.duration}</div>
                        
                        <div className="plan-price">
                            <span className="currency">₹</span>
                            <span className="amount">{plan.price}</span>
                        </div>
                        
                        <ul className="plan-features">
                            {plan.features.map((feature, idx) => (
                                <li key={idx}>
                                    <span className="check-icon">✓</span> <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        
                        <button 
                            className={`plan-btn ${plan.highlight ? '' : 'plan-btn-outline'}`}
                            onClick={() => handleSelectPlan(plan)}
                        >
                            Select Plan
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
