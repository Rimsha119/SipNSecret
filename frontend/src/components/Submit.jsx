import React from 'react';
import { Send, AlertCircle, Zap } from 'lucide-react';

const Submit = () => {
    return (
        <div className="submit-container" style={{ maxWidth: '700px', margin: '0 auto', animation: 'slideUp 0.5s ease-out' }}>
            <div className="submit-card" style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '40px',
                boxShadow: 'var(--shadow-md)'
            }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Submit a Rumor</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    Create a new prediction market on a verifiable rumor. Your initial stake (50 CC) will be returned if the market resolves.
                </p>

                <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            Rumor Statement
                            <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>
                        </label>
                        <textarea
                            placeholder="e.g., 'Will the new library open before finals week?'"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                minHeight: '120px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                fontSize: '0.95rem',
                                lineHeight: 1.5
                            }}
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>Be clear and specific. Avoid ambiguous claims.</p>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            Category
                            <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>
                        </label>
                        <select style={{
                            width: '100%',
                            padding: '14px 16px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }}>
                            <option value="">Select a category...</option>
                            <option value="campus">Campus Life</option>
                            <option value="tech">Tech & Innovation</option>
                            <option value="events">Local Events</option>
                            <option value="academics">Academics & Courses</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="stake-info" style={{
                        background: 'linear-gradient(135deg, rgba(122, 74, 46, 0.15), rgba(156, 163, 175, 0.1))',
                        borderLeft: '4px solid var(--accent-primary)',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'start',
                        gap: '12px'
                    }}>
                        <AlertCircle size={18} style={{ minWidth: '18px', marginTop: '2px', color: 'var(--accent-primary)' }} />
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Initial Stake: 50 CC</div>
                            <div>If verified as true, you'll receive rewards. If marked as spam, you lose your stake.</div>
                        </div>
                    </div>

                    <div className="term-info" style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
                        borderLeft: '4px solid var(--warning)',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'start',
                        gap: '12px'
                    }}>
                        <Zap size={18} style={{ minWidth: '18px', marginTop: '2px', color: 'var(--warning)' }} />
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Market Duration</div>
                            <div>Markets typically resolve within 30 days or upon reaching oracle consensus.</div>
                        </div>
                    </div>

                    <button style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        marginTop: '12px'
                    }} onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = 'var(--shadow-lg)';
                    }} onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'var(--shadow-md)';
                    }}>
                        <Send size={18} />
                        Submit Rumor
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Submit;
