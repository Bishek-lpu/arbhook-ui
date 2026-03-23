import React from 'react';

const PromotionalBanner = ({ duration = "6 Months", price = 499 }) => {
    const oldPrice = parseInt(price) * 2;
    const displayTitle = duration.toLowerCase().includes('subscription') 
        ? duration 
        : `${duration} Subscription`;

    return (
        <div className="promo-banner">
            <div className="promo-badge">Limited Time Offer</div>
            
            <div className="promo-content">
                <h2 className="promo-title">{displayTitle}</h2>
                
                <div className="promo-pricing">
                    <div className="price-old">
                        <span className="currency">₹</span>{oldPrice}
                    </div>
                    <div className="price-new">
                        <span className="currency">₹</span>{price}
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
