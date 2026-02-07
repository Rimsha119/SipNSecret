import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Award, TrendingUp, AlertCircle } from 'lucide-react';
import { marketsAPI } from '../services/api';

const Oracle = () => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMarket, setSelectedMarket] = useState(null);
    const [verdict, setVerdict] = useState(null);
    const [evidence, setEvidence] = useState('');
    const [stake, setStake] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                setLoading(true);
                const data = await marketsAPI.getMarkets({ status: 'active', limit: 50 });
                setMarkets(data.markets || []);
            } catch (err) {
                setError(err.message || 'Failed to load markets');
            } finally {
                setLoading(false);
            }
        };

        fetchMarkets();
    }, []);

    const handleSubmitReport = async () => {
        if (!selectedMarket || !verdict || stake < 5) {
            setError('Please select market, verdict, and stake at least 5 CC');
            return;
        }

        setSubmitting(true);
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('Please initialize your pseudonym first');
                return;
            }

            const response = await fetch('/oracles/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oracle_id: userId,
                    market_id: selectedMarket.id,
                    verdict: verdict,
                    evidence: evidence ? [evidence] : [],
                    stake: parseFloat(stake)
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to submit report');
            }

            const result = await response.json();
            
            if (result.consensus_triggered) {
                setError(null);
                alert(`✅ Consensus reached! Market resolved to ${result.report.verdict === 'true' ? 'TRUE' : 'FALSE'}`);
            } else {
                alert('✅ Report submitted! Waiting for more oracles...');
            }

            // Reset form
            setSelectedMarket(null);
            setVerdict(null);
            setEvidence('');
            setStake(5);
            
            // Refresh markets
            const data = await marketsAPI.getMarkets({ status: 'active', limit: 50 });
            setMarkets(data.markets || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="oracle-container" style={{ maxWidth: '1000px', margin: '0 auto', animation: 'slideUp 0.5s ease-out' }}>
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                color: 'white',
                borderRadius: '12px',
                padding: '40px',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                        <Eye size={32} />
                        <h2 style={{ fontSize: '2rem', marginBottom: 0, fontWeight: 700 }}>Oracle Dashboard</h2>
                    </div>
                    <p style={{ opacity: 0.95, lineHeight: 1.6, fontSize: '1.05rem', marginBottom: '24px' }}>
                        Help resolve markets by submitting evidence-based truth reports. Build reputation and earn CC rewards for accurate predictions.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Award size={20} />
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 600 }}>Stake Required</div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>5+ CC</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <CheckCircle size={20} />
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 600 }}>Min. Oracles</div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>3</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <TrendingUp size={20} />
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 600 }}>Reward</div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>1.5-3x</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div style={{
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    color: '#dc2626',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    color: 'var(--text-secondary)'
                }}>
                    <div style={{ fontSize: '1.1rem' }}>Loading active markets...</div>
                </div>
            )}

            {/* Markets Grid */}
            {!loading && (
                <div className="markets-to-resolve" style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '32px',
                    overflow: 'hidden'
                }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Active Markets ({markets.length})
                    </h3>

                    {!selectedMarket ? (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {markets.slice(0, 5).map((market) => (
                                <div
                                    key={market.id}
                                    onClick={() => setSelectedMarket(market)}
                                    style={{
                                        padding: '20px',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: '8px',
                                        border: '2px solid var(--border-color)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <h4 style={{ marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
                                        {market.text}
                                    </h4>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                                        Category: {market.category} • Current Price: {(market.price * 100).toFixed(0)}%
                                    </div>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: 'var(--text-secondary)',
                                        padding: '10px',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '6px'
                                    }}>
                                        Click to submit oracle report and help resolve this market
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Oracle Report Submission Form */
                        <div style={{
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '24px'
                        }}>
                            <h4 style={{ marginBottom: '16px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                Submit Oracle Report
                            </h4>
                            <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Market</div>
                                <div style={{ color: 'var(--text-secondary)' }}>{selectedMarket.text}</div>
                            </div>

                            {/* Verdict Selection */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    Your Verdict
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button
                                        onClick={() => setVerdict('true')}
                                        style={{
                                            padding: '12px',
                                            background: verdict === 'true' ? 'var(--success)' : 'var(--bg-secondary)',
                                            border: `2px solid ${verdict === 'true' ? 'var(--success)' : 'var(--border-color)'}`,
                                            borderRadius: '6px',
                                            color: verdict === 'true' ? 'white' : 'var(--text-primary)',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <CheckCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                        TRUE
                                    </button>
                                    <button
                                        onClick={() => setVerdict('false')}
                                        style={{
                                            padding: '12px',
                                            background: verdict === 'false' ? 'var(--danger)' : 'var(--bg-secondary)',
                                            border: `2px solid ${verdict === 'false' ? 'var(--danger)' : 'var(--border-color)'}`,
                                            borderRadius: '6px',
                                            color: verdict === 'false' ? 'white' : 'var(--text-primary)',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <XCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                        FALSE
                                    </button>
                                </div>
                            </div>

                            {/* Evidence */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    Evidence/Reasoning (optional)
                                </label>
                                <textarea
                                    value={evidence}
                                    onChange={(e) => setEvidence(e.target.value)}
                                    placeholder="Provide evidence supporting your verdict..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'inherit',
                                        minHeight: '100px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* Stake */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    Oracle Stake (min 5 CC) - {stake} CC
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="50"
                                    value={stake}
                                    onChange={(e) => setStake(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button
                                    onClick={() => {
                                        setSelectedMarket(null);
                                        setVerdict(null);
                                        setEvidence('');
                                    }}
                                    disabled={submitting}
                                    style={{
                                        padding: '12px',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        fontWeight: 600,
                                        opacity: submitting ? 0.6 : 1
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReport}
                                    disabled={submitting || !verdict}
                                    style={{
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: 'white',
                                        cursor: submitting || !verdict ? 'not-allowed' : 'pointer',
                                        fontWeight: 600,
                                        opacity: submitting || !verdict ? 0.6 : 1
                                    }}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info Box */}
            <div style={{
                marginTop: '32px',
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(122, 74, 46, 0.15), rgba(156, 163, 175, 0.1))',
                borderLeft: '4px solid var(--accent-primary)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
            }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>📊 How Oracle Consensus Works</div>
                <div style={{ lineHeight: '1.6' }}>
                    Markets resolve when 3+ oracles report and 75% agree. Your stake increases your voting power. 
                    Accurate reports earn 1.5x-3x rewards. Help the community discover truth!
                </div>
            </div>
        </div>
    );
};

export default Oracle;
