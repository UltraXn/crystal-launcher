import { useState, useEffect, useCallback } from "react"
import { FaGlobe, FaGamepad, FaUser } from "react-icons/fa"
import { useTranslation } from "react-i18next"
import Loader from "../UI/Loader"
import { supabase } from "../../services/supabaseClient"

const API_URL = import.meta.env.VITE_API_URL

interface LogEntry {
    id: string;
    created_at: number | string; // Can be string from JSON or number from timestamp
    username: string;
    action: string;
    details: string;
    source: 'web' | 'game';
}

export default function AuditLog() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [filterSource, setFilterSource] = useState('all') // 'all', 'web', 'game'
    const [page, setPage] = useState(1)
    const [limit] = useState(50) // Increased limit to enable scrolling
    const [totalPages, setTotalPages] = useState(1)

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
        setLoading(true)
        try {
            let fetchedLogs: LogEntry[] = [];
            let total = 0;

            if (filterSource === 'all') {
                // Fetch both in parallel
                const { data: { session } } = await supabase.auth.getSession();
                const headers: HeadersInit = session ? { 'Authorization': `Bearer ${session.access_token}` } : {};

                const [resWeb, resGame] = await Promise.all([
                    fetch(`${API_URL}/logs?limit=${limit}&page=${page}&source=web&search=${searchTerm}`, { headers }),
                    fetch(`${API_URL}/logs/commands?limit=${limit}&page=${page}&search=${searchTerm}`, { headers })
                ]);

                const dataWeb = resWeb.ok ? await resWeb.json() : { logs: [], total: 0 };
                const dataGame = resGame.ok ? await resGame.json() : { data: [], total: 0 };

                // Normalize Game Logs
                const gameLogs = (dataGame.data || []).map((log: any, index: number) => ({
                    id: `cp-${index}-${Date.now()}`,
                    created_at: log.time * 1000, 
                    username: log.user,
                    action: 'COMMAND',
                    details: log.message,
                    source: 'game'
                }));

                // Normalize Web Logs (ensure source is set)
                const webLogs = (dataWeb.logs || []).map((l: any) => ({ ...l, source: 'web' }));

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
                const headers: HeadersInit = session ? { 'Authorization': `Bearer ${session.access_token}` } : {};

                const res = await fetch(`${API_URL}/logs/commands?limit=${limit}&page=${page}&search=${searchTerm}`, { headers });
                if (!res.ok) throw new Error("Error fetching game logs");
                const data = await res.json();
                
                fetchedLogs = (data.data || []).map((log: any, index: number) => ({
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
                const headers: HeadersInit = session ? { 'Authorization': `Bearer ${session.access_token}` } : {};

                const res = await fetch(`${API_URL}/logs?limit=${limit}&page=${page}&source=${filterSource}&search=${searchTerm}`, { headers });
                if (!res.ok) throw new Error("Error fetching web logs");
                const data = await res.json();
                fetchedLogs = (data.logs || []).map((l: any) => ({ ...l, source: 'web' }));
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
    }, [filterSource, page, limit, searchTerm])

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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
            
            {/* CONTROLS HEADER (Search & Filters) */}
            <div className="admin-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 300px' }}>
                    <input 
                        type="text" 
                        placeholder={t('admin.logs.search_placeholder', 'Buscar usuario, comando...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="admin-input"
                        style={{ 
                            width: '100%',
                            padding: '0.6rem 1rem', // Bigger touch target
                            fontSize: '0.9rem', 
                            borderRadius: '8px',
                            border: '1px solid #444',
                            background: '#222'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: '#aaa', fontSize: '0.85rem', fontWeight: 'bold', marginRight: '5px' }}>{t('admin.logs.filter_source', 'FUENTE:')}</span>
                    
                    <button 
                        onClick={() => setFilterSource('all')}
                        style={{
                            padding: '0.5rem 1rem', 
                            borderRadius: '6px',
                            border: filterSource === 'all' ? '1px solid #fff' : '1px solid #444',
                            background: filterSource === 'all' ? '#fff' : '#222',
                            color: filterSource === 'all' ? '#000' : '#888',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {t('admin.logs.filter_all', 'TODOS')}
                    </button>

                    <button 
                        onClick={() => setFilterSource('web')}
                        style={{
                            padding: '0.5rem 1rem', 
                            borderRadius: '6px',
                            border: filterSource === 'web' ? '1px solid #3b82f6' : '1px solid #444',
                            background: filterSource === 'web' ? '#3b82f6' : '#222',
                            color: filterSource === 'web' ? '#fff' : '#888',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FaGlobe /> {t('admin.logs.filter_web', 'WEB')}
                    </button>

                    <button 
                        onClick={() => setFilterSource('game')}
                        style={{
                            padding: '0.5rem 1rem', 
                            borderRadius: '6px',
                            border: filterSource === 'game' ? '1px solid #22c55e' : '1px solid #444',
                            background: filterSource === 'game' ? '#22c55e' : '#222',
                            color: filterSource === 'game' ? '#000' : '#888',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FaGamepad /> {t('admin.logs.filter_game', 'JUEGO')}
                    </button>
                </div>
            </div>
            
            {/* TABLE CONTAINER (FLEX GROW TO FILL) */}
            <div className="admin-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', border: 'none', height: 'calc(100vh - 200px)' }}>
                {loading ? (
                    <Loader 
                        text="Cargando registros..."
                        style={{ height: 'auto', minHeight: '200px', flex: 1 }} 
                    />
                ) : logs.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666' }}>
                        <p>No hay registros encontrados.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                            <table className="admin-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#111', zIndex: 10, borderBottom: '1px solid #333' }}>
                                    <tr>
                                        <th className="th-mobile-hide" style={{width: '140px', padding: '1rem', color: '#888', fontSize:'0.85rem', textAlign: 'left'}}>FECHA</th>
                                        <th style={{padding: '1rem', color: '#888', fontSize:'0.85rem', textAlign: 'left'}}>USUARIO</th>
                                        <th style={{padding: '1rem', color: '#888', fontSize:'0.85rem', textAlign: 'left'}}>ACCIÓN</th>
                                        <th className="th-mobile-hide" style={{padding: '1rem', color: '#888', fontSize:'0.85rem', textAlign: 'left'}}>DETALLES</th>
                                        <th style={{width: '50px', padding: '1rem', textAlign: 'center'}}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, index) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                            <td className="th-mobile-hide" style={{ color: '#888', fontSize: '0.85rem', padding: '0.8rem 1rem' }}>
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaUser size={10} color="#666" />
                                                    <span style={{color: log.username === 'Staff' ? 'var(--accent)' : '#ccc', fontWeight: log.username === 'Staff' ? 'bold' : 'normal', wordBreak: 'break-word'}}>
                                                        {log.username || 'System'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                <span className="audit-badge" style={{
                                                    background: getActionColor(log.action),
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    color: '#000',
                                                    display: 'inline-block',
                                                    width: '100%', // Full width in cell
                                                    maxWidth: '120px',
                                                    textAlign: 'center',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="th-mobile-hide" style={{ color: '#bbb', fontSize: '0.9rem', padding: '0.8rem 1rem' }}>
                                                {log.details}
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '0.8rem 1rem' }}>
                                                {log.source === 'web' ? <FaGlobe color="#3b82f6" title="Web Panel" /> : <FaGamepad color="#22c55e" title="Minecraft Server" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION FOOTER */}
                        <div style={{ 
                            padding: '0.8rem 1rem', 
                            background: '#1a1a1a', 
                            borderTop: '1px solid #333',
                            display: 'flex',
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexShrink: 0,
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                             <span style={{ fontSize: '0.9rem', color: '#888' }}>
                                Página <strong style={{color:'#fff'}}>{page}</strong> de <strong style={{color:'#fff'}}>{totalPages}</strong>
                            </span>

                            {totalPages >= 1 && (
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <button 
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        style={{ 
                                            padding: '0.4rem 0.8rem', 
                                            cursor: 'pointer', 
                                            background: '#333', 
                                            border:'1px solid #444', 
                                            borderRadius:'20px', 
                                            color:'#fff', 
                                            opacity: page===1 ? 0.5:1,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        &lt;
                                    </button>
                                    
                                    {getPageNumbers().map((p, idx) => (
                                        typeof p === 'number' ? (
                                            <button
                                                key={idx}
                                                onClick={() => setPage(p)}
                                                style={{
                                                    background: page === p ? 'var(--accent)' : '#333',
                                                    color: page === p ? '#000' : '#eee',
                                                    border: page === p ? 'none' : '1px solid #444',
                                                    minWidth: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {p}
                                            </button>
                                        ) : (
                                            <span key={idx} style={{ color: '#888', lineHeight: '32px', padding: '0 5px' }}>...</span>
                                        )
                                    ))}

                                    <button 
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        style={{ 
                                            padding: '0.4rem 0.8rem', 
                                            cursor: 'pointer', 
                                            background: '#333', 
                                            border:'1px solid #444', 
                                            borderRadius:'20px', 
                                            color:'#fff', 
                                            opacity: page===totalPages?0.5:1,
                                            fontWeight: 'bold'
                                        }}
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
