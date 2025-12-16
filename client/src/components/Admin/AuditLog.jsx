import { useState, useEffect, useCallback } from "react"
import { FaGlobe, FaGamepad, FaFilter, FaSpinner, FaUser, FaClock, FaServer } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL

export default function AuditLog() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterSource, setFilterSource] = useState('all') // 'all', 'web', 'game'
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    
    // CoreProtect placeholder info


    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            let fetchedLogs = [];
            let total = 0;

            if (filterSource === 'all') {
                // Fetch both in parallel
                const [resWeb, resGame] = await Promise.all([
                    fetch(`${API_URL}/logs?limit=${limit}&page=${page}&source=web`),
                    fetch(`${API_URL}/logs/commands?limit=${limit}&page=${page}`)
                ]);

                const dataWeb = resWeb.ok ? await resWeb.json() : { logs: [], total: 0 };
                const dataGame = resGame.ok ? await resGame.json() : { data: [], total: 0 };

                // Normalize Game Logs
                const gameLogs = (dataGame.data || []).map((log, index) => ({
                    id: `cp-${index}-${Date.now()}`,
                    created_at: log.time * 1000, 
                    username: log.user,
                    action: 'COMMAND',
                    details: log.message,
                    source: 'game'
                }));

                // Normalize Web Logs (ensure source is set)
                const webLogs = (dataWeb.logs || []).map(l => ({ ...l, source: 'web' }));

                // Merge and Sort by Date DESC
                fetchedLogs = [...webLogs, ...gameLogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                
                // Pagination Strategy: approximate by taking the larger total
                // (Since we are fetching page 1 of both, we show the top N recent combined)
                total = Math.max(dataWeb.total || 0, dataGame.total || 0); 

            } else if (filterSource === 'game') {
                const res = await fetch(`${API_URL}/logs/commands?limit=${limit}&page=${page}`);
                if (!res.ok) throw new Error("Error fetching game logs");
                const data = await res.json();
                
                fetchedLogs = (data.data || []).map((log, index) => ({
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
                const res = await fetch(`${API_URL}/logs?limit=${limit}&page=${page}&source=${filterSource}`);
                if (!res.ok) throw new Error("Error fetching web logs");
                const data = await res.json();
                fetchedLogs = (data.logs || []).map(l => ({ ...l, source: 'web' }));
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
    }, [filterSource, page, limit])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    // Reset to page 1 when filter changes
    useEffect(() => {
        setPage(1)
    }, [filterSource])

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <FaServer /> Registro de Auditoría
                </h3>
                
                <div style={{ display: 'flex', gap: '0.5rem', background: '#222', padding: '0.3rem', borderRadius: '8px' }}>
                    <button 
                         onClick={() => setFilterSource('all')}
                         className={`admin-tab-btn ${filterSource === 'all' ? 'active' : ''}`} 
                         style={{fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: 'none'}}
                    >
                        Todos
                    </button>
                    <button 
                         onClick={() => setFilterSource('web')}
                         className={`admin-tab-btn ${filterSource === 'web' ? 'active' : ''}`} 
                         style={{fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: 'none', display:'flex', alignItems:'center', gap:'4px'}}
                    >
                        <FaGlobe /> Web
                    </button>
                    <button 
                         onClick={() => setFilterSource('game')}
                         className={`admin-tab-btn ${filterSource === 'game' ? 'active' : ''}`} 
                         style={{fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: 'none', display:'flex', alignItems:'center', gap:'4px'}}
                    >
                        <FaGamepad /> Juego
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                    <FaSpinner className="spin" size={24} /> <br /> Cargando registros...
                </div>
            ) : logs.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#666', border: '1px dashed #333', borderRadius: '8px' }}>
                    <p>No hay registros encontrados.</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{width: '140px'}}>Fecha</th>
                                    <th style={{width: '120px'}}>Usuario / Staff</th>
                                    <th style={{width: '150px'}}>Acción</th>
                                    <th>Detalles</th>
                                    <th style={{width: '80px', textAlign:'center'}}>Fuente</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td style={{ color: '#888', fontSize: '0.85rem' }}>
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FaUser size={10} color="#666" />
                                                <span style={{color: log.username === 'Staff' ? 'var(--accent)' : '#ccc', fontWeight: log.username === 'Staff' ? 'bold' : 'normal'}}>
                                                    {log.username || 'System'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="audit-badge" style={{
                                                background: getActionColor(log.action),
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                color: '#000'
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ color: '#aaa', fontSize: '0.9rem' }}>
                                            {log.details}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {log.source === 'web' ? <FaGlobe color="#3b82f6" title="Web Panel" /> : <FaGamepad color="#22c55e" title="Minecraft Server" />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button 
                                className="btn-secondary" 
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', opacity: page === 1 ? 0.5 : 1 }}
                            >
                                Anterior
                            </button>
                            
                            <div style={{ display: 'flex', gap: '0.2rem' }}>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        style={{
                                            background: page === p ? 'var(--accent)' : '#333',
                                            color: page === p ? '#000' : '#fff',
                                            border: 'none',
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <button 
                                className="btn-secondary" 
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', opacity: page === totalPages ? 0.5 : 1 }}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

function getActionColor(action) {
    if (action.includes('BAN')) return '#ef4444'; // Red
    if (action.includes('DELETE')) return '#f87171'; // Light Red
    if (action.includes('CREATE')) return '#4ade80'; // Green
    if (action.includes('UPDATE')) return '#facc15'; // Yellow
    if (action.includes('RESOLVE')) return '#60a5fa'; // Blue
    if (action === 'COMMAND') return '#d946ef'; // Magenta for game commands
    return '#ccc'; // Gray
}
