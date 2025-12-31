import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaShieldAlt, FaTrash, FaCopy, FaKey } from 'react-icons/fa';
import { setup2FA, enable2FA, disable2FA, get2FAStatus } from '../../../services/twoFactorService';
import { supabase } from '../../../services/supabaseClient';
import Loader from '../../UI/Loader';

export default function TwoFactorSetup() {
    const { t } = useTranslation();
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        try {
            const res = await get2FAStatus(session.access_token);
            if (res.success) {
                setEnabled(res.data.enabled);
            }
        } catch {
            // ignore error
        } finally {
            setLoading(false);
        }
    };

    const handleSetup = async () => {
        setLoading(true);
        setError('');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            const res = await setup2FA(session.access_token);
            if (res.success) {
                setSetupData(res.data); // { secret, qrCode }
            } else {
                setError(t('account.security.setup_failed', 'Failed to start setup'));
            }
        } catch {
            setError(t('account.security.secret_error', 'Error generating secret'));
        } finally {
            setLoading(false);
        }
    };

    const handleEnable = async () => {
        if(!setupData) return;
        setConfirming(true);
        setError('');
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            const res = await enable2FA(session.access_token, token, setupData.secret);
            if (res.success) {
                setEnabled(true);
                setSetupData(null);
                setSuccess(t('account.security.2fa_enabled', '2FA Enabled Successfully!'));
            } else {
                setError(res.error || t('account.security.invalid_code', 'Invalid code'));
            }
        } catch {
            setError(t('account.security.verify_failed', 'Verification failed'));
        } finally {
            setConfirming(false);
        }
    };

    const handleDisable = async () => {
        if(!confirm(t('account.security.2fa_disable_confirm', 'Are you sure you want to disable 2FA?'))) return;
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            await disable2FA(session.access_token);
            setEnabled(false);
            setSuccess(t('account.security.2fa_disabled', '2FA Disabled'));
        } catch {
            setError(t('account.security.disable_failed', 'Failed to disable'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="security-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '10px', borderRadius: '50%' }}>
                    <FaShieldAlt size={20} />
                </div>
                <div>
                    <h3 style={{ margin: 0, color: '#fff' }}>{t('account.security.2fa_title', 'Two-Factor Authentication')}</h3>
                    <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.9rem' }}>
                        {enabled 
                            ? t('account.security.2fa_active', 'Your account is secured with 2FA.') 
                            : t('account.security.2fa_inactive', 'Add an extra layer of security to your account.')}
                    </p>
                </div>
            </div>

            {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            {success && <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</div>}

            {!enabled && !setupData && (
                <button 
                    onClick={handleSetup}
                    disabled={loading}
                    className="btn-primary"
                    style={{ background: 'var(--accent)', color: '#000', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                    {loading ? <Loader minimal /> : t('account.security.setup_2fa', 'Setup 2FA')}
                </button>
            )}

            {!enabled && setupData && (
                <div className="setup-box animate-fade-in" style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
                    <h4 style={{ color: '#fff', marginBottom: '1rem' }}>1. {t('account.security.scan_qr', 'Scan QR Code')}</h4>
                    <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', width: 'fit-content', marginBottom: '1.5rem' }}>
                        <img src={setupData.qrCode} alt="2FA QR" style={{ width: '150px', height: '150px' }} />
                    </div>

                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaKey size={12} /> {t('account.security.cant_scan', "Can't scan the QR code?")}
                        </p>
                        
                        <div 
                            onClick={() => {
                                navigator.clipboard.writeText(setupData.secret);
                                setSuccess(t('account.security.copied', 'Copiado!'));
                                setTimeout(() => setSuccess(''), 2000);
                            }}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                background: 'rgba(0,0,0,0.3)', 
                                padding: '8px 12px', 
                                borderRadius: '6px', 
                                border: '1px dashed rgba(255,255,255,0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            className="hover:bg-white/5 hover:border-white/40 group"
                        >
                            <code style={{ color: 'var(--accent)', fontSize: '0.9rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {setupData.secret}
                            </code>
                            <FaCopy size={12} style={{ color: '#666' }} className="group-hover:text-white transition-colors" />
                        </div>
                    </div>
                    
                    <h4 style={{ color: '#fff', marginBottom: '1rem' }}>2. {t('account.security.enter_code', 'Enter Code')}</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            maxLength={6}
                            placeholder="000000"
                            value={token}
                            onChange={e => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                            style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff', fontSize: '1.1rem', width: '120px', textAlign: 'center', letterSpacing: '2px' }}
                        />
                        <button 
                            onClick={handleEnable}
                            disabled={confirming || token.length !== 6}
                            className="btn-primary"
                        >
                            {confirming ? <Loader minimal /> : t('account.security.activate', 'Activate')}
                        </button>
                    </div>
                </div>
            )}

            {enabled && (
                <button 
                    onClick={handleDisable}
                    disabled={loading}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                >
                    {loading ? <Loader minimal /> : <><FaTrash size={14} /> {t('account.security.disable_2fa', 'Disable 2FA')}</>}
                </button>
            )}
        </div>
    );
}
