import React from 'react';
import { User, Sun, Moon, CupSoda } from 'lucide-react';

const Header = ({ theme, toggleTheme, onOpenPortfolio }) => {
    return (
        <header style={{
            position: 'sticky',
            top: 0,
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            zIndex: 100,
            backdropFilter: 'blur(10px)',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 24px',
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '2rem', animation: 'float 3s ease-in-out infinite' }}>☕</div>
                    <div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: 'var(--accent-primary)', fontWeight: 700, margin: 0 }}>SipsNSecrets</h1>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>De-Centralized Truth</p>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Balance Badge */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--bg-tertiary)',
                        padding: '8px 16px',
                        borderRadius: '50px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <span>💰</span>
                        <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>1000 CC</span>
                    </div>

                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                    }}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* Profile Icon / Portfolio Toggle */}
                    <button onClick={onOpenPortfolio} style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <User size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
