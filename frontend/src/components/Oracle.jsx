import React from 'react';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

import React, { useState } from 'react';
import { Eye, CheckCircle, XCircle, Upload, Link as LinkIcon, AlertTriangle } from 'lucide-react';

const Oracle = () => {
    const [selectedMarketId, setSelectedMarketId] = useState(null);
    const [evidenceLink, setEvidenceLink] = useState('');

    const pendingMarkets = [
        {
            id: 1,
            title: "Did 'Project Orion' get cancelled?",
            consensus: "Pending",
            reports: 12,
            timeLeft: "2h 15m"
        },
        {
            id: 2,
            title: "Was the library closed yesterday?",
            consensus: "Pending",
            reports: 4,
            timeLeft: "5h 30m"
        }
    ];

    const handleSubmitEvidence = (id) => {
        alert(`Evidence submitted for Market #${id}`);
        setEvidenceLink('');
        setSelectedMarketId(null);
    };

    return (
        <div className="oracle-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: 'white',
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '32px'
            }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Eye size={28} /> Oracle Dashboard
                </h2>
                <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
                    Vote on the outcome of resolved events. Consistent honesty increases your Oracle Score and earning power.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>98</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Reliability Score</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>12</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Pending Votes</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>450 CC</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Earned</div>
                    </div>
                </div>
            </div>

            <div className="markets-to-resolve" style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px'
            }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Pending Resolution</h3>

                {pendingMarkets.map(market => (
                    <div key={market.id} style={{
                        padding: '20px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        borderLeft: `4px solid ${selectedMarketId === market.id ? 'var(--accent-primary)' : 'transparent'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                            <div>
                                <h4 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>{market.title}</h4>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <span>Time Left: {market.timeLeft}</span>
                                    <span>•</span>
                                    <span>{market.reports} Reports Submitted</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedMarketId(selectedMarketId === market.id ? null : market.id)}
                                style={{
                                    padding: '8px 16px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                {selectedMarketId === market.id ? 'Cancel' : 'Submit Evidence'}
                            </button>
                        </div>

                        {selectedMarketId === market.id && (
                            <div style={{
                                padding: '16px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                animation: 'fadeIn 0.3s'
                            }}>
                                <h5 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Upload size={16} /> Submit Evidence
                                </h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                    Provide a link to official sources (university emails, news articles, verified social media posts).
                                </p>

                                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={evidenceLink}
                                            onChange={(e) => setEvidenceLink(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px 10px 36px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-tertiary)',
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                        <LinkIcon size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                    </div>
                                    <button
                                        onClick={() => handleSubmitEvidence(market.id)}
                                        disabled={!evidenceLink}
                                        style={{
                                            padding: '10px 20px',
                                            background: !evidenceLink ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                                            color: !evidenceLink ? 'var(--text-secondary)' : 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: !evidenceLink ? 'not-allowed' : 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        Submit
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px' }}>
                                    <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <strong>Warning:</strong> Submitting false evidence will result in a permanent loss of Oracle Score and slashing of staked CC.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                            <button style={{ flex: 1, padding: '10px', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid var(--success)', borderRadius: '6px', color: 'var(--success)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}>
                                <CheckCircle size={16} /> Vote TRUE
                            </button>
                            <button style={{ flex: 1, padding: '10px', background: 'rgba(244, 67, 54, 0.1)', border: '1px solid var(--danger)', borderRadius: '6px', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}>
                                <XCircle size={16} /> Vote FALSE
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Oracle;
