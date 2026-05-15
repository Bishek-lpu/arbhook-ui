import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import './Download.css';

export default function Download() {
    const APK_LINK = '/Arbhook.apk';

    // Stars generation
    const [stars, setStars] = useState([]);
    useEffect(() => {
        const generatedStars = [];
        for (let i = 0; i < 120; i++) {
            const size = Math.random() * 2.5 + 0.5;
            generatedStars.push({
                id: i,
                size,
                top: Math.random() * 100,
                left: Math.random() * 100,
                dur: 2 + Math.random() * 4,
                delay: Math.random() * 4
            });
        }
        setStars(generatedStars);
    }, []);

    return (
        <div className="download-page-wrapper">
            <SEO title="Arbhook - Big Upgrade In Progress" description="Download the official Arbhook mobile app." />
            
            <div className="stars">
                {stars.map(s => (
                    <div 
                        key={s.id} 
                        className="star" 
                        style={{
                            width: `${s.size}px`, 
                            height: `${s.size}px`, 
                            top: `${s.top}%`, 
                            left: `${s.left}%`, 
                            '--dur': `${s.dur}s`, 
                            animationDelay: `${s.delay}s`
                        }}
                    ></div>
                ))}
            </div>
            <div className="orb orb1"></div>
            <div className="orb orb2"></div>

            <div className="wrapper-inner">
                <div className="dl-card">
                    <div className="dl-logo">Arb<span>hook</span></div>
                    <div className="new-badge">
                        <span className="pulse-dot"></span>
                        New App Available
                    </div>

                    <div className="icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="url(#gold-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <defs>
                                <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f5a623" />
                                    <stop offset="100%" stopColor="#f76c2f" />
                                </linearGradient>
                            </defs>
                            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                        </svg>
                    </div>

                    <h1 className="title-gradient">We are moving to our App!</h1>
                    <p className="sub">We're shifting from the website to our dedicated application. Download it now so you're all set the moment we go live.</p>

                    <div className="free-badge">
                        🎁 <span>100% Free for 7 Days</span> — No payment needed
                    </div>

                    <div className="dl-label">Get ready — Download the App</div>
                    <a href={APK_LINK} className="dl-btn" download>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download Arbhook App
                    </a>
                    <div className="dl-note">Direct APK download — no Play Store needed</div>
                    
                    <div className="sub-reassurance">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span><strong>Existing subscriber?</strong> Your plan carries over automatically. No need to purchase again.</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
