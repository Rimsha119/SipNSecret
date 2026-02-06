import React, { useEffect, useState } from 'react';
import '../styles/variables.css';

const SplashScreen = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500); // Wait for fade out
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div className={`splash-screen ${!isVisible ? 'hidden' : ''}`} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'linear-gradient(135deg, var(--tea-medium) 0%, var(--tea-dark) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            transition: 'opacity 0.5s, visibility 0.5s',
            opacity: isVisible ? 1 : 0,
            visibility: isVisible ? 'visible' : 'hidden'
        }}>
            <div className="teacup-container" style={{
                position: 'relative',
                width: '200px',
                height: '200px',
                marginBottom: '40px',
                animation: 'float 3s ease-in-out infinite'
            }}>
                <div className="steam" style={{
                    position: 'absolute',
                    top: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex'
                }}>
                    <span style={{
                        display: 'block', width: '8px', height: '30px', background: 'rgba(255, 255, 255, 0.6)', margin: '0 4px', borderRadius: '50%', filter: 'blur(5px)', animation: 'steam 3s ease-out infinite', animationDelay: '0s'
                    }}></span>
                    <span style={{
                        display: 'block', width: '8px', height: '30px', background: 'rgba(255, 255, 255, 0.6)', margin: '0 4px', borderRadius: '50%', filter: 'blur(5px)', animation: 'steam 3s ease-out infinite', animationDelay: '0.5s'
                    }}></span>
                    <span style={{
                        display: 'block', width: '8px', height: '30px', background: 'rgba(255, 255, 255, 0.6)', margin: '0 4px', borderRadius: '50%', filter: 'blur(5px)', animation: 'steam 3s ease-out infinite', animationDelay: '1s'
                    }}></span>
                </div>
                <div className="teacup" style={{
                    width: '120px',
                    height: '80px',
                    background: 'var(--tea-cream)',
                    borderRadius: '0 0 50px 50px',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    border: '4px solid var(--tea-gold)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }}>
                    <div style={{
                        position: 'absolute',
                        width: '40px',
                        height: '50px',
                        border: '4px solid var(--tea-gold)',
                        borderLeft: 'none',
                        borderRadius: '0 30px 30px 0',
                        right: '-44px',
                        top: '10px'
                    }}></div>
                    <div className="tea-liquid" style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(180deg, #8D6E63 0%, #6D4C41 100%)',
                        borderRadius: '0 0 46px 46px',
                        animation: 'teaFill 2s ease-out forwards',
                        height: '100%'
                    }}></div>
                </div>
            </div>
            <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '3.5rem',
                color: 'var(--tea-gold)',
                textAlign: 'center',
                marginBottom: '20px',
                animation: 'pulse 2s ease-in-out infinite'
            }}>SipsNSecrets</h1>
            <p style={{
                fontSize: '1.5rem',
                color: 'var(--tea-cream)',
                textAlign: 'center',
                fontWeight: 300,
                letterSpacing: '2px',
                animation: 'fadeIn 2s ease-in'
            }}>Sip the Tea, Spill the Secret</p>
        </div>
    );
};

export default SplashScreen;
