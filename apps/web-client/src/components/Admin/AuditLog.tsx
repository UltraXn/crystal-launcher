import { useState, useEffect, useCallback } from "react"
import { FaGlobe, FaGamepad, FaUser } from "react-icons/fa"
import { useTranslation } from "react-i18next"
import Loader from "../UI/Loader"
import { supabase } from "../../services/supabaseClient"
import { getAuthHeaders } from "../../services/adminAuth"

const API_URL = import.meta.env.VITE_API_URL

interface LogEntry {
    id: string;
    created_at: number | string; // Can be string from JSON or number from timestamp
    username: string;
    action: string;
    details: string;
    source: 'web' | 'game';
}

interface GameLog {
    time: number;
    user: string;
    message: string;
}

interface WebLog {
    id: string | number;
    created_at: string;
    username: string;
    action: string;
    details: string;
}

interface AuditLogProps {
    mockLogs?: LogEntry[];
    mockTotal?: number;
}

export default function AuditLog({ mockLogs, mockTotal }: AuditLogProps = {}) {
    const [logs, setLogs] = useState<LogEntry[]>(mockLogs || [])
    const [loading, setLoading] = useState(!mockLogs)
    const [filterSource, setFilterSource] = useState('all') // 'all', 'web', 'game'
    const [page, setPage] = useState(1)
    const [limit] = useState(50) // Increased limit to enable scrolling
    const [totalPages, setTotalPages] = useState(mockTotal ? Math.ceil(mockTotal / 50) : 1)

    const { t } = useTranslation()
    const [search, setSearch] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearchTerm(search)
            setPage(1)
        }, 500)
        return () => clearTimeout(delayDebounceFn)
    }, [search])

    const fetchLogs = useCallback(async () => {
        if (mockLogs) return;
        setLoading(true)
        try {
            let fetchedLogs: LogEntry[] = [];
            let total = 0;

            if (filterSource === 'all') {
                // Fetch both in parallel
                const { data: { session } } = await supabase.auth.getSession();
                const headers: HeadersInit = getAuthHeaders(session?.access_token || null);

                const [resWeb, resGame] = await Promise.all([
                    fetch(`${API_URL}/logs?limit=${limit}&page=${page}&source=web&search=${searchTerm}`, { headers }),
                    fetch(`${API_URL}/logs/commands?limit=${limit}&page=${page}&search=${searchTerm}`, { headers })
                ]);

                const dataWeb = resWeb.ok ? await resWeb.json() : { logs: [], total: 0 };
                const dataGame = resGame.ok ? await resGame.json() : { data: [], total: 0 };

                // Normalize Game Logs
                const gameLogs = (dataGame.data || []).map((log: GameLog, index: number) => ({
                    id: `cp-${index}-${Date.now()}`,
                    created_at: log.time * 1000, 
                    username: log.user,
                    action: 'COMMAND',
                    details: log.message,
                    source: 'game'
                }));

                // Normalize Web Logs (ensure source is set)
                const webLogs = (dataWeb.logs || []).map((l: WebLog) => ({ ...l, source: 'web' }));

                // Merge and Sort by Date DESC
                fetchedLogs = [...webLogs, ...gameLogs].sort((a: LogEntry, b: LogEntry) => {
                    const dateA = new Date(a.created_at).getTime();
                    const dateB = new Date(b.created_at).getTime();
                    return dateB - dateA;
                });
                
                // Pagination Strategy: approximate by taking the larger total
                // (Since we are fetching page 1 of both, we show the top N recent combined)
                total = Math.max(dataWeb.total || 0, dataGame.total || 0); 

            } else if (filterSource === 'game') {
                const { data: { session } } = await supabase.auth.getSession();
                const headers: HeadersInit = getAuthHeaders(session?.access_token || null);

                const res = await fetch(`${API_URL}/logs/commands?limit=${limit}&page=${page}&search=${searchTerm}`, { headers });
                if (!res.ok) throw new Error("Error fetching game logs");
                const data = await res.json();
                
                fetchedLogs = (data.data || []).map((log: GameLog, index: number) => ({
                    id: `cp-${index}-${Date.now()}`,
                    created_at: log.time * 1000, 
                    username: log.user,
                    action: 'COMMAND',
                    details: log.message,
                    source: 'game'
                }));
                total = data.total || 0;

            } else {
                // Web only
                const { data: { session } } = await supabase.auth.getSession();
                const headers: HeadersInit = getAuthHeaders(session?.access_token || null);

                const res = await fetch(`${API_URL}/logs?limit=${limit}&page=${page}&source=${filterSource}&search=${searchTerm}`, { headers });
                if (!res.ok) throw new Error("Error fetching web logs");
                const data = await res.json();
                fetchedLogs = (data.logs || []).map((l: WebLog) => ({ ...l, source: 'web' }));
                total = data.total || 0;
            }

            setLogs(fetchedLogs);
            setTotalPages(Math.ceil(total / limit));

        } catch (err) {
            console.error("Failed to load logs", err)
            setLogs([])
        } finally {
            setLoading(false)
        }
    }, [filterSource, page, limit, searchTerm, mockLogs])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    // Reset to page 1 when filter changes
    useEffect(() => {
        setPage(1)
    }, [filterSource])

    // Helper for smart pagination
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 4) {
                // Beginning
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - 3) {
                // End
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                // Middle
                pages.push(1);
                pages.push('...');
                for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    }

    return (
        <div className="admin-card" style={{ background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', display: 'flex', flexDirection: 'column', height: 'auto', minHeight: 'calc(100vh - 140px)', gap: '0' }}>
            
            <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: '1', minWidth: '0' }}>
                        <h3 style={{ margin: 0, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px', wordBreak: 'break-word' }}>{t('admin.logs.title', 'Registro de Auditoría')}</h3>
                        <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>Monitorea la actividad del sistema y los usuarios</p>
                    </div>
                </div>

                {/* CONTROLS HEADER (Search & Filters) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 100%', minWidth: '200px' }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input 
                                type="text" 
                                placeholder={t('admin.logs.search_placeholder', 'Buscar usuario, comando...')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="admin-input-premium"
                                style={{ 
                                    paddingLeft: '3rem',
                                    borderRadius: '16px',
                                    paddingTop: '0.8rem',
                                    paddingBottom: '0.8rem',
                                    width: '100%'
                                }}
                            />
                             <FaUser style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                        </div>
                    </div>

                    <div className="audit-log-filters" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-start' }}>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{t('admin.logs.filter_source', 'FUENTE:')}</div>
                        
                        <button 
                            onClick={() => setFilterSource('all')}
                            className="hover-lift"
                            style={{
                                padding: '0.6rem 1.2rem', 
                                borderRadius: '12px',
                                border: filterSource === 'all' ? '1px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                                background: filterSource === 'all' ? '#fff' : 'rgba(255,255,255,0.05)',
                                color: filterSource === 'all' ? '#000' : 'rgba(255,255,255,0.6)',
                                cursor: 'pointer',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {t('admin.logs.filter_all', 'TODOS')}
                        </button>

                        <button 
                            onClick={() => setFilterSource('web')}
                            className="hover-lift"
                            style={{
                                padding: '0.6rem 1.2rem', 
                                borderRadius: '12px',
                                border: filterSource === 'web' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                background: filterSource === 'web' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                                color: filterSource === 'web' ? '#3b82f6' : 'rgba(255,255,255,0.6)',
                                cursor: 'pointer',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <FaGlobe /> {t('admin.logs.filter_web', 'WEB')}
                        </button>

                        <button 
                            onClick={() => setFilterSource('game')}
                            className="hover-lift"
                            style={{
                                padding: '0.6rem 1.2rem', 
                                borderRadius: '12px',
                                border: filterSource === 'game' ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                                background: filterSource === 'game' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.05)',
                                color: filterSource === 'game' ? '#22c55e' : 'rgba(255,255,255,0.6)',
                                cursor: 'pointer',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <FaGamepad /> {t('admin.logs.filter_game', 'JUEGO')}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* TABLE CONTAINER (FLEX GROW TO FILL) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {loading ? (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Loader 
                            text="Cargando registros..."
                            style={{ height: 'auto', minHeight: '200px' }} 
                        />
                    </div>
                ) : logs.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.4)', flexDirection: 'column', gap: '1rem' }}>
                         <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaGlobe size={24} opacity={0.5} />
                        </div>
                        <p>No hay registros encontrados.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            <table className="admin-table" style={{ borderCollapse: 'separate', borderSpacing: '0', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)', background: 'rgba(10,10,15,0.8)' }}>
                                    <tr>
                                        <th className="th-mobile-hide" style={{ width: '180px', padding: '1.25rem 2rem', color: '#666', fontSize:'0.75rem', background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>FECHA</th>
                                        <th style={{ padding: '1.25rem', color: '#666', fontSize:'0.75rem', background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>USUARIO</th>
                                        <th style={{ padding: '1.25rem', color: '#666', fontSize:'0.75rem', background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>ACCIÓN</th>
                                        <th className="th-mobile-hide" style={{ padding: '1.25rem', color: '#666', fontSize:'0.75rem', background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>DETALLES</th>
                                        <th style={{ width: '80px', padding: '1.25rem', textAlign: 'center', background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, index) => (
                                        <tr key={log.id} style={{ transition: 'background 0.2s', background: index % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }} className="hover:bg-white/5">
                                            <td className="th-mobile-hide" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <div style={{ fontWeight: '500' }}>{new Date(log.created_at).toLocaleDateString()}</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{new Date(log.created_at).toLocaleTimeString()}</div>
                                            </td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                    <div style={{ 
                                                        width: '32px', height: '32px', borderRadius: '8px', 
                                                        background: 'rgba(255,255,255,0.05)', 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'rgba(255,255,255,0.5)'
                                                    }}>
                                                        <FaUser size={12} />
                                                    </div>
                                                    <span style={{
                                                        color: log.username === 'Staff' ? 'var(--accent)' : '#fff', 
                                                        fontWeight: '700',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {log.username || 'System'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <span style={{
                                                    background: getActionColor(log.action),
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '800',
                                                    color: '#000',
                                                    display: 'inline-block',
                                                    letterSpacing: '0.5px',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="th-mobile-hide" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.02)', fontWeight: '500' }}>
                                                {log.details}
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                {log.source === 'web' ? (
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#3b82f6' }}>
                                                        <FaGlobe />
                                                    </div>
                                                ) : (
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#22c55e' }}>
                                                        <FaGamepad />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION FOOTER */}
                        <div style={{ 
                            padding: '1.5rem 2rem', 
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexShrink: 0,
                            flexWrap: 'wrap',
                            gap: '1rem',
                            background: 'rgba(255,255,255,0.01)'
                        }}>
                             <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>
                                Mirando página <strong style={{color:'#fff'}}>{page}</strong> de <strong style={{color:'#fff'}}>{totalPages}</strong>
                            </span>

                            {totalPages >= 1 && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <button 
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        style={{ 
                                            padding: '0 1rem',
                                            height: '36px', 
                                            cursor: 'pointer', 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border:'1px solid rgba(255,255,255,0.1)', 
                                            borderRadius:'10px', 
                                            color:'#fff', 
                                            opacity: page===1 ? 0.5:1,
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-lift"
                                    >
                                        &lt;
                                    </button>
                                    
                                    {getPageNumbers().map((p, idx) => (
                                        typeof p === 'number' ? (
                                            <button
                                                key={idx}
                                                onClick={() => setPage(p)}
                                                style={{
                                                    background: page === p ? 'var(--accent)' : 'transparent',
                                                    color: page === p ? '#000' : 'rgba(255,255,255,0.7)',
                                                    border: page === p ? 'none' : '1px solid transparent',
                                                    minWidth: '36px',
                                                    height: '36px',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                                className={page !== p ? "hover-lift" : ""}
                                            >
                                                {p}
                                            </button>
                                        ) : (
                                            <span key={idx} style={{ color: 'rgba(255,255,255,0.3)', lineHeight: '36px', padding: '0 5px' }}>...</span>
                                        )
                                    ))}

                                    <button 
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        style={{ 
                                            padding: '0 1rem', 
                                            height: '36px',
                                            cursor: 'pointer', 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border:'1px solid rgba(255,255,255,0.1)', 
                                            borderRadius:'10px', 
                                            color:'#fff', 
                                            opacity: page===totalPages?0.5:1,
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-lift"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function getActionColor(action: string) {
    if (!action) return '#ccc';
    if (action.includes('BAN')) return '#ef4444'; // Red
    if (action.includes('DELETE')) return '#f87171'; // Light Red
    if (action.includes('CREATE')) return '#4ade80'; // Green
    if (action.includes('UPDATE')) return '#facc15'; // Yellow
    if (action.includes('RESOLVE')) return '#60a5fa'; // Blue
    if (action === 'COMMAND') return '#d946ef'; // Magenta for game commands
    return '#ccc'; // Gray
}
