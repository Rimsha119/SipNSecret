import React, { useState } from 'react';
import { Search, Filter, TrendingUp, Clock, Users, Volume2 } from 'lucide-react';

const Markets = () => {
    const [filter, setFilter] = useState('all');

    const markets = [
        {
            id: 1,
            title: "Will 'Project Orion' be cancelled by Q3?",
            category: "Tech",
            probability: 75,
            volume: "125k CC",
            liquidity: "45k CC",
            expires: "14d left",
            participants: 234,
            status: "active"
        },
        {
            id: 2,
            title: "Campus Rumor: Dean resigning next week?",
            category: "Campus",
            probability: 30,
            volume: "85k CC",
            liquidity: "12k CC",
            expires: "4d left",
            participants: 156,
            status: "active"
        },
        {
            id: 3,
            title: "New cafeteria menu includes sushi?",
            category: "Lifestyle",
            probability: 90,
            volume: "210k CC",
            liquidity: "80k CC",
            expires: "24h left",
            participants: 412,
            status: "active"
        }
    ];

    const getProbabilityColor = (prob) => {
        if (prob >= 70) return 'var(--success)';
        if (prob >= 40) return 'var(--warning)';
        return 'var(--danger)';
    };

    return (
        <div className="markets-container" style={{ animation: 'slideUp 0.5s ease-out' }}>
            <div className="markets-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Active Markets</h2>
                    <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '0.9rem' }}>Trade on campus rumors with prediction markets</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['All', 'Tech', 'Campus', 'Lifestyle'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f.toLowerCase())}
                            style={{
                                padding: '8px 16px',
                                background: filter === f.toLowerCase() ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--bg-tertiary)',
                                color: filter === f.toLowerCase() ? 'white' : 'var(--text-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                fontWeight: 500,
                                fontSize: '0.9rem'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="markets-grid" style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
                {markets.map(market => (
                    <div key={market.id} className="market-card" style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '24px',
                        transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }} onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    }} onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}>
                        <div className="market-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', gap: '12px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>{market.title}</h3>
                            <div style={{
                                background: getProbabilityColor(market.probability),
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '1rem',
                                whiteSpace: 'nowrap'
                            }}>
                                {market.probability}%
                            </div>
                        </div>

                        <div className="market-meta" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px',
                            padding: '16px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            flex: 1
                        }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Volume</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{market.volume}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Liquidity</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{market.liquidity}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Expires</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={14} />
                                    {market.expires}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Traders</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Users size={14} />
                                    {market.participants}
                                </div>
                            </div>
                        </div>

                        <div className="trading-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 'auto' }}>
                            <button style={{
                                padding: '12px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: 'var(--success)',
                                color: 'white',
                                transition: 'all 0.3s',
                                fontSize: '0.95rem'
                            }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                                Yes
                            </button>
                            <button style={{
                                padding: '12px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: 'var(--danger)',
                                color: 'white',
                                transition: 'all 0.3s',
                                fontSize: '0.95rem'
                            }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                                No
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Markets;
