import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, Bot, Check, XCircle, Loader2 } from 'lucide-react';

const Submit = () => {
    const [rumorText, setRumorText] = useState('');
    const [category, setCategory] = useState('');
    const [stakeAmount, setStakeAmount] = useState(50);
    const [isChecking, setIsChecking] = useState(false); // AI checking state
    const [aiFeedback, setAiFeedback] = useState(null); // 'safe', 'duplicate', 'unsafe'

    // Mock User Balance
    const userBalance = 1250;

    // Debounced AI Check Simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (rumorText.length > 20) {
                runAiCheck(rumorText);
            } else {
                setAiFeedback(null);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [rumorText]);

    const runAiCheck = (text) => {
        setIsChecking(true);
        // Simulate API call delay
        setTimeout(() => {
            setIsChecking(false);
            // Mock logic: if text contains "duplicate", flag it.
            if (text.toLowerCase().includes('duplicate')) {
                setAiFeedback('duplicate');
            } else if (text.toLowerCase().includes('hate')) {
                setAiFeedback('unsafe');
            } else {
                setAiFeedback('safe');
            }
        }, 1500);
    };

    return (
        <div className="submit-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="submit-card" style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Submit a Rumor</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    Propose a market based on a verifiable rumor.
                </p>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>Rumor Statement</label>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            value={rumorText}
                            onChange={(e) => setRumorText(e.target.value)}
                            placeholder="e.g. 'Will the new library open before finals week?'"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: `1px solid ${aiFeedback === 'unsafe' ? 'var(--danger)' : 'var(--border-color)'}`,
                                borderRadius: '8px',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                minHeight: '120px',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                        {/* AI Status Indicator */}
                        <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.8rem',
                            background: 'var(--bg-secondary)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {isChecking && (
                                <>
                                    <Loader2 size={14} className="spin" />
                                    <span style={{ color: 'var(--text-secondary)' }}>AI Checking unique...</span>
                                </>
                            )}
                            {!isChecking && aiFeedback === 'safe' && (
                                <>
                                    <Check size={14} color="var(--success)" />
                                    <span style={{ color: 'var(--success)' }}>AI Verified Unique</span>
                                </>
                            )}
                            {!isChecking && aiFeedback === 'duplicate' && (
                                <>
                                    <Bot size={14} color="var(--warning)" />
                                    <span style={{ color: 'var(--warning)' }}>Similar rumor found</span>
                                </>
                            )}
                            {!isChecking && aiFeedback === 'unsafe' && (
                                <>
                                    <XCircle size={14} color="var(--danger)" />
                                    <span style={{ color: 'var(--danger)' }}>Content flagged</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit'
                        }}>
                        <option value="">Select a category...</option>
                        <option>Campus Life</option>
                        <option>Tech & Innovation</option>
                        <option>Local Events</option>
                        <option>Professors & Classes</option>
                    </select>
                </div>

                {/* Staking Section */}
                <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>Initial Stake (CC)</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="number"
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(Number(e.target.value))}
                                min="50"
                                max={userBalance}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    background: 'var(--bg-tertiary)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'inherit',
                                    fontWeight: 600
                                }}
                            />
                            <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>CC</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Balance: <strong>{userBalance} CC</strong>
                        </div>
                    </div>
                    {stakeAmount < 50 && (
                        <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '4px' }}>Minimum stake is 50 CC</p>
                    )}
                </div>

                <div className="stake-info" style={{
                    background: 'var(--bg-tertiary)',
                    borderLeft: '3px solid var(--accent-gold)',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    marginBottom: '24px',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} />
                        <span>Cost: <strong>{stakeAmount} CC</strong>. If your rumor is verified as a duplicate or spam, you lose your stake.</span>
                    </div>
                </div>

                <button
                    disabled={stakeAmount < 50 || aiFeedback === 'unsafe' || !rumorText}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: (stakeAmount < 50 || aiFeedback === 'unsafe' || !rumorText) ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                        color: (stakeAmount < 50 || aiFeedback === 'unsafe' || !rumorText) ? 'var(--text-secondary)' : 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: (stakeAmount < 50 || aiFeedback === 'unsafe' || !rumorText) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                    }}>
                    <Send size={18} />
                    Submit Rumor
                </button>
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Submit;
