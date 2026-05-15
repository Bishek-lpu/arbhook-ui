import React, { useState, useEffect, useRef } from 'react';
import SEO from '../components/SEO';
import './Download.css';

export default function Download() {
    const STORAGE_KEY = 'arbhook_v2_end';
    const DURATION = 5 * 60 * 60 * 1000; // 5 hours
    const APK_LINK = '/Arbhook.apk';

    const [timeLeft, setTimeLeft] = useState({ h: '05', m: '00', s: '00' });
    const [showWelcome, setShowWelcome] = useState(false);
    const [confetti, setConfetti] = useState([]);
    const [barWidth, setBarWidth] = useState(0);
    const linkRef = useRef(null);

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

    // Timer logic
    useEffect(() => {
        let endTime;
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                endTime = parseInt(saved, 10);
                if (Date.now() > endTime) {
                    localStorage.removeItem(STORAGE_KEY);
                    endTime = null;
                }
            }
        } catch(e) {}

        if (!endTime) {
            endTime = Date.now() + DURATION;
            try { localStorage.setItem(STORAGE_KEY, endTime.toString()); } catch(e) {}
        }

        const pad = (n) => String(n).padStart(2, '0');

        const tick = () => {
            const diff = endTime - Date.now();
            if (diff <= 0) {
                setShowWelcome(true);
                return;
            }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft({ h: pad(h), m: pad(m), s: pad(s) });
        };

        tick();
        const intervalId = setInterval(tick, 1000);
        return () => clearInterval(intervalId);
    }, []);

    // Welcome screen logic
    useEffect(() => {
        if (showWelcome) {
            // Spawn Confetti
            const generatedConfetti = [];
            const COLORS = ['#f5a623','#f76c2f','#43c850','#1e6fff','#ff4f81','#fff176','#00d2ff'];
            for (let i = 0; i < 80; i++) {
                generatedConfetti.push({
                    id: i,
                    left: Math.random() * 100,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    width: 6 + Math.random() * 8,
                    height: 6 + Math.random() * 8,
                    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    dur: 2 + Math.random() * 3,
                    delay: Math.random() * 1.5
                });
            }
            setConfetti(generatedConfetti);

            // Progress bar
            setTimeout(() => {
                setBarWidth(100);
            }, 100);

            // Auto trigger download
            setTimeout(() => {
                if (linkRef.current) {
                    linkRef.current.click();
                }
            }, 3100);
        }
    }, [showWelcome]);

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
                    <div className="tagline">We are moving to a new home</div>

                    <div className="icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                        </svg>
                    </div>

                    <h1>Big upgrade in progress!</h1>
                    <p className="sub">We're shifting to our own application to give you a much faster, smoother experience. Sit tight — we'll be live very soon.</p>

                    <div className="timer-label">Back online in</div>
                    <div className="timer-row">
                        <div className="timer-box"><div className="timer-num">{timeLeft.h}</div><div className="timer-unit">Hours</div></div>
                        <div className="timer-box"><div className="timer-num">{timeLeft.m}</div><div className="timer-unit">Mins</div></div>
                        <div className="timer-box"><div className="timer-num">{timeLeft.s}</div><div className="timer-unit">Secs</div></div>
                    </div>

                    <div className="free-badge">
                        🎁 100% Free for 7 Days — No payment needed
                    </div>

                    <div className="app-banner">
                        <div className="ab-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7db8ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><circle cx="18" cy="6" r="3" fill="#7db8ff" stroke="none"/></svg>
                            We are moving to our App!
                        </div>
                        <div className="ab-desc">We're shifting from the website to our dedicated application. Download it now so you're all set the moment we go live.</div>
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
                </div>
            </div>

            {showWelcome && (
                <div className="welcomeOverlay">
                    <div className="confetti-wrap">
                        {confetti.map(c => (
                            <div 
                                key={c.id} 
                                className="confetti-piece"
                                style={{
                                    left: `${c.left}%`,
                                    background: c.color,
                                    width: `${c.width}px`,
                                    height: `${c.height}px`,
                                    borderRadius: c.borderRadius,
                                    '--cf-dur': `${c.dur}s`,
                                    '--cf-delay': `${c.delay}s`
                                }}
                            ></div>
                        ))}
                    </div>
                    <div className="welcome-card">
                        <div className="welcome-logo">Arb<span>hook</span></div>

                        <div className="check-circle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#43c850" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>

                        <div className="welcome-title">We're Back! 🎉</div>
                        <p className="welcome-sub">The upgrade is complete. Arbhook is now faster, smarter, and fully ready for you. Download the app to get started!</p>

                        <div className="steps">
                            <div className="steps-title">How to get started</div>
                            <div className="step">
                                <div className="step-num">1</div>
                                <div className="step-text">Tap <span>Download Arbhook App</span> below</div>
                            </div>
                            <div className="step">
                                <div className="step-num">2</div>
                                <div className="step-text">Open the <span>.apk file</span> from your downloads</div>
                            </div>
                            <div className="step">
                                <div className="step-num">3</div>
                                <div className="step-text">Allow installation from <span>unknown sources</span> if prompted</div>
                            </div>
                            <div className="step">
                                <div className="step-num">4</div>
                                <div className="step-text"><span>Install & enjoy</span> — 100% free for 7 days! 🎁</div>
                            </div>
                        </div>

                        <a ref={linkRef} href={APK_LINK} className="dl-btn-welcome" download>
                            <svg className="download-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Download Arbhook App
                        </a>

                        <div className="redir-bar-wrap">
                            Downloading will start automatically in 3 seconds...
                            <div className="redir-bar">
                                <div className="redir-bar-fill" style={{ width: `${barWidth}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
