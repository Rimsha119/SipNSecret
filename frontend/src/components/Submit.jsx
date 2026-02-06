import React from 'react';
import { Send, AlertCircle } from 'lucide-react';

const Submit = () => {
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
                    Propose a market based on a verifiable rumor. Requires a stake of 50 CC.
                </p>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>Rumor Statement</label>
                    <textarea
                        placeholder="e.g. 'Will the new library open before finals week?'"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            minHeight: '120px',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>Category</label>
                    <select style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit'
                    }}>
                        <option>Select a category...</option>
                        <option>Campus Life</option>
                        <option>Tech & Innovation</option>
                        <option>Local Events</option>
                        <option>Professors & Classes</option>
                    </select>
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
                        <span>Cost: <strong>50 CC</strong>. If your rumor is verified as a duplicate or spam, you lose your stake.</span>
                    </div>
                </div>

                <button style={{
                    width: '100%',
                    padding: '14px',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                    <Send size={18} />
                    Submit Rumor
                </button>
            </div>
        </div>
    );
};

export default Submit;
