import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <label className="theme-switch" aria-label="Toggle theme">
            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
            <span className="slider round">
                <span className="icon sun">☀️</span>
                <span className="icon moon">🌙</span>
            </span>
        </label>
    );
}
