import React from 'react';
import { Eye, CheckCircle, XCircle, Award, TrendingUp } from 'lucide-react';

const Oracle = () => {
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
                        Help resolve markets by providing evidence-based truth reports. Your reliability increases your verification power and rewards.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Award size={20} />
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 600 }}>Reliability</div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>98%</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <CheckCircle size={20} />
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 600 }}>Pending Votes</div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>12</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <TrendingUp size={20} />
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 600 }}>Total Earned</div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>450 CC</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Markets to Resolve */}
            <div className="markets-to-resolve" style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '32px',
                overflow: 'hidden'
            }}>
                <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pending Resolution</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                            padding: '20px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            transition: 'all 0.3s'
                        }} onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }} onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div style={{ marginBottom: '4px' }}>
                                <h4 style={{ marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
                                    {i === 1 ? "Did 'Project Orion' get cancelled?" : i === 2 ? "Is the Dean actually resigning?" : "Does the cafeteria serve sushi now?"}
                                </h4>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                                    Market ID: #{1000 + i} • Submitted 3 days ago • 45 traders
                                </div>
                            </div>

                            {/* Evidence Section */}
                            <div style={{
                                marginBottom: '16px',
                                padding: '12px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)'
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>Recent Evidence</div>
                                <div>Submit evidence or report to help resolve this market.</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <button style={{
                                    padding: '12px 16px',
                                    background: 'var(--success)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s',
                                    fontSize: '0.95rem'
                                }} onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                                }} onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}>
                                    <CheckCircle size={16} />
                                    True
                                </button>
                                <button style={{
                                    padding: '12px 16px',
                                    background: 'var(--danger)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s',
                                    fontSize: '0.95rem'
                                }} onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                                }} onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}>
                                    <XCircle size={16} />
                                    False
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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
                <div>Markets resolve when 75% of oracle votes agree. Oracles with higher reliability scores have more voting power. Accurate voters are rewarded with CC.</div>
            </div>
        </div>
    );
};

export default Oracle;
