import React, { useState } from 'react';
import { Search, Filter, TrendingUp, Clock, AlertTriangle, Bot, CheckCircle } from 'lucide-react';
import TradeModal from './TradeModal';

const Markets = () => {
    const [filter, setFilter] = useState('all');
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState(null);
    const [showAiAnalysis, setShowAiAnalysis] = useState(null); // ID of market to show analysis for

    const markets = [
        {
            id: 1,
            title: "Will 'Project Orion' be cancelled by Q3?",
            category: "Tech",
            probability: 75,
            volume: "125k",
            liquidity: "45k",
            expires: "14d left",
            aiAnalysis: "High probability based on recent earnings call sentiment and reallocation of engineering resources."
        },
        {
            id: 2,
            title: "Campus Rumor: Dean resigning next week?",
            category: "Campus",
            probability: 30,
            volume: "85k",
            liquidity: "12k",
            expires: "4d left",
            aiAnalysis: "No official announcements found. Social media sentiment is mixed but lacks credible sources."
        },
        {
            id: 3,
            title: "New cafetaria menu includes sushi?",
            category: "Lifestyle",
            probability: 90,
            volume: "210k",
            liquidity: "80k",
            expires: "24h left",
            aiAnalysis: "Confirmed by 3 student council posts and a leaked vendor email."
        }
    ];

    const handleTrade = (market) => {
        setSelectedMarket(market);
        setIsTradeModalOpen(true);
    };

    const toggleAi = (id) => {
        setShowAiAnalysis(showAiAnalysis === id ? null : id);
    };

    return (
        <div className="markets-container">
            <div className="markets-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Active Markets</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['All', 'Tech', 'Campus', 'Lifestyle'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f.toLowerCase())}
                            style={{
                                padding: '8px 16px',
                                background: filter === f.toLowerCase() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                color: filter === f.toLowerCase() ? 'white' : 'var(--text-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="markets-grid" style={{ display: 'grid', gap: '20px' }}>
                {markets.map(market => (
                    <div key={market.id} className="market-card" style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '24px',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div className="market-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{market.title}</h3>
                            <div style={{
                                background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-primary))',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '1.1rem'
                            }}>
                                {market.probability}%
                            </div>
                        </div>

                        <div className="market-meta" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '16px',
                            padding: '16px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Volume</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{market.volume}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Liquidity</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{market.liquidity}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Expires</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{market.expires}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Cat</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{market.category}</div>
                            </div>
                        </div>

                        {/* AI Analysis Section */}
                        <div style={{ marginBottom: '20px' }}>
                            <button
                                onClick={() => toggleAi(market.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--accent-primary)',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    padding: '0'
                                }}
                            >
                                <Bot size={16} />
                                {showAiAnalysis === market.id ? 'Hide AI Analysis' : 'View AI Analysis'}
                            </button>

                            {showAiAnalysis === market.id && (
                                <div style={{
                                    marginTop: '10px',
                                    padding: '12px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '8px',
                                    borderLeft: '3px solid var(--accent-primary)',
                                    animation: 'fadeIn 0.3s'
                                }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {market.aiAnalysis}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="trading-section" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                                onClick={() => handleTrade(market)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    background: 'var(--success)',
                                    color: 'white'
                                }}>Yes</button>
                            <button
                                onClick={() => handleTrade(market)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    background: 'var(--danger)',
                                    color: 'white'
                                }}>No</button>
                        </div>
                    </div>
                ))}
            </div>

            <TradeModal
                isOpen={isTradeModalOpen}
                onClose={() => setIsTradeModalOpen(false)}
                market={selectedMarket}
            />
        </div>
    );
};

export default Markets;
