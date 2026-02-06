import React from 'react';
import { X, TrendingUp, DollarSign, PieChart } from 'lucide-react';

const PortfolioSidebar = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 998,
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    transition: 'opacity 0.3s, visibility 0.3s'
                }}></div>

            {/* Sidebar */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                height: '100vh',
                width: '350px',
                background: 'var(--bg-secondary)',
                boxShadow: '-5px 0 30px rgba(0,0,0,0.2)',
                zIndex: 999,
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s ease-in-out',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>My Portfolio</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {/* Stats */}
                    <div style={{
                        background: 'var(--bg-tertiary)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '24px',
                        borderLeft: '4px solid var(--accent-gold)'
                    }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Total PnL</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>+24.5%</div>
                        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Invested</div>
                                <div style={{ fontWeight: 600 }}>450 CC</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Available</div>
                                <div style={{ fontWeight: 600 }}>550 CC</div>
                            </div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Active Positions</h3>

                    <div className="position-list">
                        {[1, 2].map(i => (
                            <div key={i} style={{
                                background: 'var(--bg-tertiary)',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Project Orion Cancelled?</span>
                                    <span style={{
                                        background: i === 1 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                        color: i === 1 ? 'var(--success)' : 'var(--danger)',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700
                                    }}>{i === 1 ? 'YES' : 'NO'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <span>100 Shares @ 0.45</span>
                                    <span style={{ color: 'var(--success)' }}>+12 CC</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PortfolioSidebar;
