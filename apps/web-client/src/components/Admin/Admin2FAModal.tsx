import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaShieldAlt, FaUnlock, FaTimes } from 'react-icons/fa';
import { verify2FA } from '../../services/twoFactorService';
import { setAdminToken } from '../../services/adminAuth';
import { supabase } from '../../services/supabaseClient';
import Loader from '../UI/Loader';

interface Admin2FAModalProps {
    isOpen: boolean;
    onVerified: () => void;
    onClose: () => void;
}

export default function Admin2FAModal({ isOpen, onVerified, onClose }: Admin2FAModalProps) {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token || code.length < 6) return;

        setLoading(true);
        setError(null);

        try {
            const res = await verify2FA(session.access_token, code);
            if (res.success) {
                setAdminToken(res.data.adminToken);
                onVerified();
            } else {
                // UX: Clear code to allow easy retry
                setCode('');
                
                // UX: Friendly error message
                const userMessage = t('admin.2fa.error_retry', 'Código incorrecto. Inténtalo de nuevo.');
                
                // Optional: Use server message if specific logic requires it, but general "Wrong Code" is better for security/UX usually.
                if (res.error && typeof res.error === 'string') {
                     // If the server sends a specific plain text error, maybe log it or use it if it helps (e.g. "Expired")
                     // userMessage = res.error; 
                }

                setError(userMessage);
                
                // Shake effect or focus? Input is autoFocus, but let's ensure focus if we had a ref (optional, simple clear is good enough)
            }
        } catch (err: unknown) {
             console.error(err);
             setError(t('admin.2fa.error_generic', 'Error de verificación. Inténtalo de nuevo.'));
             setCode('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s'
        }}>
            <div style={{
                background: '#0a0a0a', 
                border: '1px solid rgba(255,50,50,0.2)',
                boxShadow: '0 0 40px rgba(220, 20, 60, 0.1)',
                padding: '2.5rem', 
                borderRadius: '24px', 
                maxWidth: '420px', 
                width: '90%',
                position: 'relative', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'color 0.2s' }}
                    className="hover:text-white"
                >
                    <FaTimes size={20} />
                </button>

                <div style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                    width: '80px', height: '80px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                    <FaShieldAlt size={36} />
                </div>

                <div>
                    <h2 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '800' }}>{t('admin.2fa.title', 'Acceso Restringido')}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        {t('admin.2fa.desc', 'Esta área requiere autenticación de dos factores. Ingresa tu código para continuar.')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            autoFocus
                            type="text"
                            maxLength={6}
                            value={code}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setCode(val);
                                if(error) setError(null); // Clear error on typing
                            }}
                            placeholder="000 000"
                            style={{
                                width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)',
                                border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: '#fff', fontSize: '1.8rem', textAlign: 'center',
                                letterSpacing: '8px', 
                                outline: 'none',
                                fontWeight: '700',
                                transition: 'all 0.2s'
                            }}
                        />
                         {error && (
                            <div style={{ 
                                color: '#ef4444', 
                                fontSize: '0.9rem', 
                                marginTop: '0.8rem',
                                fontWeight: '600',
                                animation: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both'
                            }}>
                                {error}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <button
                            type="submit"
                            disabled={loading || code.length !== 6}
                            className="btn-primary"
                            style={{ 
                                width: '100%', padding: '1rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '10px',
                                borderRadius: '12px', fontSize: '1rem', fontWeight: '700'
                            }}
                        >
                            {loading ? <Loader minimal size={20} /> : <><FaUnlock /> {t('admin.2fa.verify', 'Verificar Acceso')}</>}
                        </button>
                        
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'rgba(255,255,255,0.4)', 
                                padding: '0.5rem', 
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                textDecoration: 'underline'
                            }}
                        >
                            {t('admin.back_home', 'Cancelar y volver al inicio')}
                        </button>
                    </div>
                </form>
                <style>{`
                    @keyframes shake {
                        10%, 90% { transform: translate3d(-1px, 0, 0); }
                        20%, 80% { transform: translate3d(2px, 0, 0); }
                        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                        40%, 60% { transform: translate3d(4px, 0, 0); }
                    }
                `}</style>
            </div>
        </div>
    );
}
