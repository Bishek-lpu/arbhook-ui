import React from 'react';

const PromotionalBanner = () => {
    return (
        <div className="promo-banner">
            <div className="promo-badge">Limited Time Offer</div>
            
            <div className="promo-content">
                <h2 className="promo-title">6 Months Subscription</h2>
                
                <div className="promo-pricing">
                    <div className="price-old">
                        <span className="currency">₹</span>998
                    </div>
                    <div className="price-new">
                        <span className="currency">₹</span>499
                    </div>
                </div>
                
                <div className="promo-saving">
                    <span className="saving-badge">Save 50%</span>
                </div>
            </div>
            
            <div className="promo-bg-elements">
                <div className="promo-glow"></div>
                <div className="promo-sparkle s1">✨</div>
                <div className="promo-sparkle s2">✨</div>
            </div>
        </div>
    );
};

export default PromotionalBanner;
