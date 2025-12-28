import { useState } from 'react';
import { FaTerminal, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function SecureConsole() {
    useAuth(); // Hook still needed for context, but we don't need 'user' here directly as we get session later
    const { t } = useTranslation();
    const [command, setCommand] = useState('');
    const [output, setOutput] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSendCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        setLoading(true);
        const cmdToSend = command;
        setCommand(''); 

        // Optimistic UI
        setOutput(prev => [...prev.slice(-9), `> ${cmdToSend}`]);

        try {
            // Get session directly from AuthContext if possible, or usually Supabase client
            // But here we might just need the session from local storage or context if exposed.
            // Let's assume we import the client correctly now.
            const { data: { session } } = await import('../../../services/supabaseClient').then(m => m.supabase.auth.getSession());
            
            const res = await fetch(`${API_URL}/bridge/queue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ command: cmdToSend })
            });

            if (res.ok) {
                const data = await res.json();
                setOutput(prev => [...prev, `[System]: OK (ID: ${data.id}) - Queued for execution.`]);
            } else {
                const err = await res.json();
                setOutput(prev => [...prev, `[Error]: ${err.error || 'Failed to send command'}`]);
            }
        } catch {
            setOutput(prev => [...prev, `[Error]: Network or Server Error`]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaTerminal /> {t('admin.settings.console.title')}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem' }}>
                {t('admin.settings.console.desc')}
            </p>

            <div style={{
                background: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '1rem',
                fontFamily: 'monospace',
                height: '200px',
                overflowY: 'auto',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
                color: '#e0e0e0'
            }}>
                {output.length === 0 && <span style={{ color: '#555' }}>{t('admin.settings.console.logs_ph')}</span>}
                {output.map((line, i) => (
                    <div key={i} style={{ 
                        color: line.startsWith('>') ? '#aaa' : line.startsWith('[Error]') ? '#ff5555' : '#55ff55'
                    }}>
                        {line}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSendCommand} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                    className="admin-input" 
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder={t('admin.settings.console.cmd_ph')}
                    style={{ flex: 1, fontFamily: 'monospace' }}
                />
                <button type="submit" className="btn-primary" disabled={loading || !command.trim()}>
                    {loading ? '...' : <><FaPaperPlane /> {t('admin.settings.console.send_btn')}</>}
                </button>
            </form>
        </div>
    );
}
