import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import Header from './components/Header';
import PortfolioSidebar from './components/PortfolioSidebar';
import Markets from './components/Markets';
import Submit from './components/Submit';
import Oracle from './components/Oracle';
import { BarChart3, Send, Eye } from 'lucide-react';
import './styles/global.css';

function App() {
    const [splashComplete, setSplashComplete] = useState(false);
    const [theme, setTheme] = useState('light');
    const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
    const [currentView, setCurrentView] = useState('markets');

    useEffect(() => {
        // Apply theme to body
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const renderView = () => {
        switch (currentView) {
            case 'markets': return <Markets />;
            case 'submit': return <Submit />;
            case 'oracle': return <Oracle />;
            default: return <Markets />;
        }
    };

    return (
        <>
            <SplashScreen onComplete={() => setSplashComplete(true)} />

            {splashComplete && (
                <div className="app-container" style={{ animation: 'fadeIn 0.6s ease-in' }}>
                    <Header
                        theme={theme}
                        toggleTheme={toggleTheme}
                        onOpenPortfolio={() => setIsPortfolioOpen(true)}
                    />

                    <PortfolioSidebar
                        isOpen={isPortfolioOpen}
                        onClose={() => setIsPortfolioOpen(false)}
                    />

                    <main className="main-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
                        {/* Navigation Tabs */}
                        <div className="nav-tabs" style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            gap: '8px',
                            boxShadow: 'var(--shadow-sm)',
                            marginBottom: '40px',
                            border: '1px solid var(--border-color)'
                        }}>
                            {[
                                { id: 'markets', label: 'Markets', icon: <BarChart3 size={18} /> },
                                { id: 'submit', label: 'Submit Rumor', icon: <Send size={18} /> },
                                { id: 'oracle', label: 'Oracle', icon: <Eye size={18} /> }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setCurrentView(tab.id)}
                                    style={{
                                        flex: 1,
                                        padding: '14px 20px',
                                        background: currentView === tab.id ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)' : 'transparent',
                                        color: currentView === tab.id ? 'white' : 'var(--text-secondary)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        boxShadow: currentView === tab.id ? 'var(--shadow-md)' : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (currentView !== tab.id) {
                                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentView !== tab.id) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="view-container">
                            {renderView()}
                        </div>
                    </main>
                </div>
            )}
        </>
    );
}

export default App;
