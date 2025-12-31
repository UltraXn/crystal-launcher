import { useState } from 'react';
import { FaTerminal, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function SecureConsole() {
    useAuth(); // Hook still needed for context, but we don't need 'user' here directly as we get session later
    const { t } = useTranslation();
    const [command, setCommand] = useState('');
    const [output, setOutput] = useState<{ text: string, time: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSendCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        setLoading(true);
        const cmdToSend = command;
        setCommand(''); 
        const now = new Date().toLocaleTimeString();

        // Optimistic UI
        setOutput(prev => [...prev.slice(-9), { text: `> ${cmdToSend}`, time: now }]);

        try {
            // Get session directly from AuthContext if possible, or usually Supabase client
            // But here we might just need the session from local storage or context if exposed.
            // Let's assume we import the client correctly now.
            const { data: { session } } = await import('../../../services/supabaseClient').then(m => m.supabase.auth.getSession());
            
            const twoFactorToken = sessionStorage.getItem('admin_2fa_token');
            const res = await fetch(`${API_URL}/bridge/queue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                    'x-admin-token': twoFactorToken || ''
                },
                body: JSON.stringify({ command: cmdToSend })
            });

            if (res.ok) {
                const data = await res.json();
                setOutput(prev => [...prev, { text: `[System]: OK (ID: ${data.id}) - Queued for execution.`, time: new Date().toLocaleTimeString() }]);
            } else {
                const err = await res.json();
                setOutput(prev => [...prev, { text: `[Error]: ${err.error || 'Failed to send command'}`, time: new Date().toLocaleTimeString() }]);
            }
        } catch {
            setOutput(prev => [...prev, { text: `[Error]: Network or Server Error`, time: new Date().toLocaleTimeString() }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTerminal style={{ color: 'var(--accent)' }} /> 
                </div>
                {t('admin.settings.console.title')}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                {t('admin.settings.console.desc')}
            </p>

            <div className="custom-scrollbar" style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                fontFamily: 'JetBrains Mono, monospace',
                height: '240px',
                overflowY: 'auto',
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                color: '#e0e0e0',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
            }}>
                {output.length === 0 && (
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ height: '8px', width: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></span>
                        {t('admin.settings.console.logs_ph')}
                    </div>
                )}
                {output.map((line, i) => (
                    <div key={i} style={{ 
                        color: line.text.startsWith('>') ? 'rgba(255,255,255,0.6)' : line.text.startsWith('[Error]') ? '#ef4444' : '#4ade80',
                        fontSize: '0.9rem',
                        display: 'flex',
                        gap: '10px',
                        lineHeight: '1.4'
                    }}>
                        <span style={{ opacity: 0.3, userSelect: 'none' }}>{line.time}</span>
                        <span>{line.text}</span>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSendCommand} style={{ display: 'flex', gap: '1rem' }}>
                <input 
                    className="admin-input-premium" 
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder={t('admin.settings.console.cmd_ph', 'Escribe un comando...')}
                    style={{ flex: 1, fontFamily: 'monospace', borderRadius: '16px' }}
                />
                <button 
                    type="submit" 
                    className="modal-btn-primary hover-lift" 
                    disabled={loading || !command.trim()}
                    style={{ 
                        borderRadius: '16px',
                        height: 'auto',
                        padding: '0 2.5rem',
                        boxShadow: '0 10px 20px rgba(var(--accent-rgb), 0.15)'
                    }}
                >
                    {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                    ) : (
                        <><FaPaperPlane /> {t('admin.settings.console.send_btn')}</>
                    )}
                </button>
            </form>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
