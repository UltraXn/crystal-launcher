import { useState, useEffect } from "react"
import { FaGlobe, FaGamepad, FaFilter, FaSpinner, FaUser, FaClock, FaServer } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL

export default function AuditLog() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterSource, setFilterSource] = useState('all') // 'all', 'web', 'game'
    const [limit] = useState(50)
    
    // CoreProtect placeholder info
    const isGameLogsConnected = false; 

    const fetchLogs = async () => {
        setLoading(true)
        try {
            let url = `${API_URL}/logs?limit=${limit}`
            if (filterSource !== 'all') url += `&source=${filterSource}`
            
            const res = await fetch(url)
            if (!res.ok) throw new Error("Error fetching logs")
            
            const data = await res.json()
            // Backend returns { logs: [], total } or directly array if I messed up controller.
            // Controller: res.json(data); Service: returns { logs, total }
            // So data.logs is correct.
            setLogs(data.logs || [])
        } catch (err) {
            console.error("Failed to load logs", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
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
                    {filterSource === 'game' && !isGameLogsConnected ? (
                        <>
                            <FaGamepad size={32} style={{marginBottom: '1rem', opacity: 0.5}}/>
                            <p>Conexión con CoreProtect (Logs del Juego) pendiente.</p>
                            <span style={{fontSize: '0.8rem', color: '#555'}}>Próximamente verás aquí comandos y bloques rotos.</span>
                        </>
                    ) : (
                        <p>No hay registros encontrados.</p>
                    )}
                </div>
            ) : (
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
    return '#ccc'; // Gray
}
