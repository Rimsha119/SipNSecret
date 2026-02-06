import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Info, AlertCircle } from 'lucide-react';

const TradeModal = ({ isOpen, onClose, market }) => {
    if (!isOpen || !market) return null;

    const [position, setPosition] = useState('yes'); // 'yes' or 'no'
    const [amount, setAmount] = useState(50);
    const [shares, setShares] = useState(0);
    const [potentialReturn, setPotentialReturn] = useState(0);

    // Mock price calculation based on probability
    const price = position === 'yes' ? market.probability / 100 : 1 - (market.probability / 100);

    useEffect(() => {
        // Calculate estimated shares and return
        // Simple mock formula: Shares = Amount / Price
        const estimatedShares = Math.floor(amount / price);
        setShares(estimatedShares);
        setPotentialReturn(estimatedShares); // In a binary market, 1 share pays out 1 CC if correct
    }, [amount, position, price]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'all' : 'none',
            transition: 'opacity 0.2s'
        }}>
            <div className="trade-modal" style={{
                background: 'var(--bg-secondary)',
                width: '100%',
                maxWidth: '480px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                animation: 'slideUp 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Trade Position</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {market.title}
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        padding: '4px'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>
                    {/* Toggle Switch */}
                    <div style={{
                        background: 'var(--bg-tertiary)',
                        padding: '4px',
                        borderRadius: '12px',
                        display: 'flex',
                        marginBottom: '24px'
                    }}>
                        <button
                            onClick={() => setPosition('yes')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                borderRadius: '8px',
                                background: position === 'yes' ? 'var(--success)' : 'transparent',
                                color: position === 'yes' ? 'white' : 'var(--text-secondary)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Buy YES ({market.probability}%)
                        </button>
                        <button
                            onClick={() => setPosition('no')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                borderRadius: '8px',
                                background: position === 'no' ? 'var(--danger)' : 'transparent',
                                color: position === 'no' ? 'white' : 'var(--text-secondary)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Buy NO ({100 - market.probability}%)
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        <div style={{ flex: 1, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Current Price</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {price.toFixed(2)} CC
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Max Payout</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                                {potentialReturn} CC
                            </div>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                            Amount to Invest (CC)
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    fontSize: '1.2rem',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)',
                                    fontWeight: 600
                                }}
                            />
                            <span style={{
                                position: 'absolute',
                                right: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-tertiary)',
                                fontWeight: 500
                            }}>CC</span>
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Balance: 1,250 CC</span>
                            <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => setAmount(1250)}>Max</span>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div style={{
                        padding: '16px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '12px',
                        marginBottom: '24px'
                    }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'start', color: 'var(--accent-primary)' }}>
                            <Info size={18} style={{ marginTop: '2px' }} />
                            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>
                                You are buying <strong>{shares} shares</strong> of "{position.toUpperCase()}" for <strong>{amount} CC</strong>. 
                                If the market validates {position === 'yes' ? 'TRUE' : 'FALSE'}, you win <strong>{potentialReturn} CC</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button style={{
                        width: '100%',
                        padding: '16px',
                        background: position === 'yes' ? 'var(--success)' : 'var(--danger)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'transform 0.1s'
                    }}>
                        Place {position === 'yes' ? 'Buy' : 'Short'} Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TradeModal;
