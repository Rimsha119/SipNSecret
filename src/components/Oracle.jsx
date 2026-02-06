import React from 'react';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

const Oracle = () => {
    return (
        <div className="oracle-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: 'white',
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '32px'
            }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Oracle Dashboard</h2>
                <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
                    Vote on the outcome of resolved events. Consistent honesty increases your Oracle Score and earning power.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>98</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Relability Score</div>
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
                {/* Mock Item */}
                <div style={{
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    marginBottom: '16px'
                }}>
                    <h4 style={{ marginBottom: '8px' }}>Did 'Project Orion' get cancelled?</h4>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button style={{ flex: 1, padding: '10px', background: 'var(--success)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <CheckCircle size={16} /> Yes
                        </button>
                        <button style={{ flex: 1, padding: '10px', background: 'var(--danger)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <XCircle size={16} /> No
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Oracle;
