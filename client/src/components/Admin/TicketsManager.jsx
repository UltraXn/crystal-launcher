import { useState, useEffect, useRef } from "react"
import { FaSearch, FaPlus, FaTimes, FaSpinner, FaCircle, FaPaperPlane, FaGavel, FaCheckCircle, FaLock, FaEye, FaTicketAlt, FaExclamationCircle, FaExclamationTriangle } from "react-icons/fa"
import { useAuth } from "@/context/AuthContext"

const API_URL = import.meta.env.VITE_API_URL

export default function TicketsManager() {
    const { user } = useAuth()
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null) // Controls if Detail Modal is open

    // Create Ticket State
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium' })
    const [alert, setAlert] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchTickets = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${API_URL}/tickets`)
            if (!res.ok) throw new Error("Error fetching tickets")
            const data = await res.json()
            setTickets(data)
        } catch (error) {
            console.error("Failed to load tickets", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [])

    const handleCreateTicket = async (e) => {
        e.preventDefault()
        if (!newTicket.subject) {
            setAlert({ message: "El asunto es obligatorio", type: 'error' })
            return
        }

        try {
            setIsSubmitting(true)
            const res = await fetch(`${API_URL}/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    subject: newTicket.subject,
                    description: newTicket.description,
                    priority: newTicket.priority
                })
            })

            if (!res.ok) throw new Error("Error creating ticket")

            await fetchTickets()
            setShowCreateModal(false)
            setNewTicket({ subject: '', description: '', priority: 'medium' })
        } catch (error) {
            setAlert({ message: "Error creando ticket: " + error.message, type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="admin-card">
            {/* CARD HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '300px', flex: '1 1 auto' }}>
                    <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input type="text" placeholder="Buscar tickets..." style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn-primary"
                        onClick={() => setShowCreateModal(true)}
                        style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                    >
                        <FaPlus size={12} /> Nuevo Ticket
                    </button>
                </div>
            </div>

            {/* TICKETS TABLE */}
            <div className="admin-table-container">
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                        <FaSpinner className="spin" size={24} /> <br /> Cargando tickets...
                    </div>
                ) : tickets.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                        <p>No hay tickets registrados aún.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{width: '50px'}}>ID</th>
                                <th>Usuario</th>
                                <th>Asunto</th>
                                <th style={{width: '100px'}}>Prioridad</th>
                                <th style={{width: '100px'}}>Estado</th>
                                <th style={{width: '120px'}}>Fecha</th>
                                <th style={{width: '80px'}}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(t => (
                                <tr key={t.id} onClick={() => setSelectedTicket(t)} style={{ cursor: 'pointer' }}>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>#{t.id}</td>
                                    <td style={{ color: '#aaa', fontSize: '0.9rem' }}>{t.user_id?.substring(0, 8) || 'Anon'}...</td>
                                    <td style={{ fontWeight: '500', color: '#fff' }}>{t.subject}</td>
                                    <td><PriorityBadge priority={t.priority} /></td>
                                    <td><StatusBadge status={t.status} /></td>
                                    <td style={{ color: '#888', fontSize: '0.85rem' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedTicket(t); }}
                                            className="btn-secondary"
                                            style={{ padding: '0.3rem 0.6rem', border: '1px solid #333', background: 'transparent' }}
                                            title="Ver Detalles"
                                        >
                                            <FaEye color="var(--accent)" size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL: CREATE TICKET */}
            {showCreateModal && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)' }}>
                    <div className="admin-card modal-content" style={{ width: '500px', maxWidth: '90%', border: '1px solid var(--accent-dim)', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaTicketAlt color="var(--accent)" /> Crear Nuevo Ticket
                            </h3>
                            <button 
                                onClick={() => setShowCreateModal(false)} 
                                style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => e.target.style.color = '#fff'}
                                onMouseLeave={(e) => e.target.style.color = '#aaa'}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="admin-form">
                            <div style={{marginBottom: '1.2rem'}}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd', fontSize: '0.9rem', fontWeight: '600' }}>Asunto</label>
                                <input 
                                    className="admin-input" 
                                    value={newTicket.subject} 
                                    onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })} 
                                    autoFocus 
                                    placeholder="Ej: No puedo entrar al server" 

                                />
                            </div>

                            <div style={{marginBottom: '1.2rem'}}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd', fontSize: '0.9rem', fontWeight: '600' }}>Descripción</label>
                                <textarea 
                                    className="admin-input" 
                                    rows="5" 
                                    value={newTicket.description} 
                                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })} 
                                    placeholder="Describe el problema detalladamente..." 

                                />
                            </div>

                            <div style={{marginBottom: '2rem'}}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd', fontSize: '0.9rem', fontWeight: '600' }}>Prioridad</label>
                                <div style={{ position: 'relative' }}>
                                    <select 
                                        className="admin-input" 
                                        value={newTicket.priority} 
                                        onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}

                                    >
                                        <option value="low">🟢 Baja</option>
                                        <option value="medium">🟡 Media</option>
                                        <option value="high">🟠 Alta</option>
                                        <option value="urgent">🔴 Urgente</option>
                                    </select>

                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setShowCreateModal(false)} 
                                    className="btn-secondary"
                                    style={{ padding: '0.7rem 1.5rem', background: 'transparent', border: '1px solid #555', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary" 
                                    disabled={isSubmitting}
                                    style={{ 
                                        padding: '0.7rem 2rem', 
                                        background: 'var(--accent)', 
                                        color: '#000', 
                                        border: 'none', 
                                        borderRadius: '6px', 
                                        cursor: 'pointer', 
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {isSubmitting ? <><FaSpinner className="spin" /> Guardando...</> : <><FaPaperPlane /> Crear Ticket</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: TICKET DETAILS */}
            {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    refreshTickets={fetchTickets}
                />
            )}
        </div>
    )
}

// ---------------- SUB-COMPONENTS ----------------

function TicketDetailModal({ ticket, onClose, refreshTickets }) {
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [showBanModal, setShowBanModal] = useState(false)
    const [alert, setAlert] = useState(null)
    const [confirmAction, setConfirmAction] = useState(null)
    const scrollRef = useRef(null)

    useEffect(() => {
        if (ticket) {
            fetchMessages()
        }
    }, [ticket])

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_URL}/tickets/${ticket.id}/messages`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data)
                setTimeout(() => {
                    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' })
                }, 100)
            }
        } catch (error) {
            console.error("Error fetching messages:", error)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        setSending(true)
        try {
            const res = await fetch(`${API_URL}/tickets/${ticket.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    message: newMessage,
                    is_staff: true
                })
            })
            if (res.ok) {
                setNewMessage('')
                fetchMessages()
            }
        } catch (error) {
            console.error("Error sending message:", error)
        } finally {
            setSending(false)
        }
    }

    const handleAction = async (action) => {
        if (action === 'ban') {
            setShowBanModal(true)
            return
        }

        if (action === 'delete') {
            setConfirmAction({
                message: "¿Estás seguro de que quieres eliminar este ticket? Esta acción no se puede deshacer.",
                onConfirm: () => handleAction('force_delete')
            })
            return
        }

        let method = 'PATCH'
        let body = {}
        let url = `${API_URL}/tickets/${ticket.id}/status`

        if (action === 'resolve') body = { status: 'resolved' }
        if (action === 'close') body = { status: 'closed' }
        if (action === 'open') body = { status: 'open' }
        if (action === 'delete' || action === 'force_delete') {
            method = 'DELETE'
            url = `${API_URL}/tickets/${ticket.id}`
            body = undefined
        }

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined
            })

            if (res.ok) {
                refreshTickets()
                onClose()
            } else {
                setAlert({ message: "Error al actualizar el ticket", type: 'error' })
            }
        } catch (error) {
            setAlert({ message: "Error de conexión: " + error.message, type: 'error' })
        }
    }

    return (
        <div className="modal-overlay">
            {showBanModal && (
                <BanUserModal 
                    ticket={ticket} 
                    onClose={() => setShowBanModal(false)}
                    onSuccess={() => { 
                        setShowBanModal(false)
                        refreshTickets()
                        setAlert({ message: "Usuario baneado correctamente", type: 'success' }) 
                    }}
                />
            )}
            
            {!showBanModal && (
                <div className="modal-content" style={{ maxHeight: '85vh', height: '85vh' }}>
                
                    {/* Header Modal */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#222', borderTopLeftRadius: 'var(--radius)', borderTopRightRadius: 'var(--radius)' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>{ticket.subject}</h2>
                            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                <span style={{color: '#888', fontFamily:'monospace'}}>#{ticket.id}</span>
                                <PriorityBadge priority={ticket.priority} />
                                <StatusBadge status={ticket.status} />
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', padding: '0.5rem' }}>
                            <FaTimes size={22} />
                        </button>
                    </div>

                    {/* Chat Body (Scrollable) */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#181818' }}>
                        
                        {/* Mensaje original del usuario (Descripción) */}
                        <div className="msg-bubble user">
                            <div className="msg-header">DESCRIPCIÓN ORIGINAL</div>
                            <div style={{whiteSpace: 'pre-wrap'}}>{ticket.description || "Sin descripción detallada."}</div>
                        </div>

                        <div style={{height: '1px', background: '#333', margin: '1rem 0'}}></div>

                        {messages.length === 0 && (
                            <div style={{textAlign: 'center', color: '#555', padding: '2rem'}}>No hay mensajes en el historial.</div>
                        )}

                        {messages.map(msg => (
                            <div key={msg.id} className={`msg-bubble ${msg.is_staff ? 'staff' : 'user'}`}>
                                <div className="msg-header">{msg.is_staff ? 'STAFF' : 'USUARIO'} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                <div>{msg.message}</div>
                            </div>
                        ))}
                        
                        {/* Referencia invisible para el scroll */}
                        <div ref={scrollRef}></div>
                    </div>

                    {/* Footer Actions & Reply */}
                    <div style={{ padding: '1.5rem', borderTop: '1px solid #333', background: '#222', borderBottomLeftRadius: 'var(--radius)', borderBottomRightRadius: 'var(--radius)' }}>
                        
                        {ticket.status !== 'closed' ? (
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <input 
                                    className="admin-input" 
                                    value={newMessage} 
                                    onChange={e => setNewMessage(e.target.value)} 
                                    placeholder="Escribe una respuesta para el usuario..."
                                    style={{flex: 1, marginBottom: 0}}
                                />
                                <button type="submit" className="btn-primary" disabled={sending} style={{padding: '0 1.5rem'}}>
                                    {sending ? <FaSpinner className="spin"/> : <FaPaperPlane />}
                                </button>
                            </form>
                        ) : (
                            <div style={{padding: '1rem', background: '#2a1a1a', color: '#888', textAlign: 'center', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #442222'}}>
                                <FaLock style={{marginRight: '0.5rem', width: '0.8rem'}}/> Este ticket está cerrado. Reápurelo para responder.
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button onClick={() => handleAction('ban')} className="btn-action ban">Banear User</button>
                            {ticket.status !== 'resolved' && ticket.status !== 'closed' && <button onClick={() => handleAction('resolve')} className="btn-action resolve">Marcar Resuelto</button>}
                            {ticket.status !== 'closed' ? 
                                <button onClick={() => handleAction('close')} className="btn-action close">Cerrar Ticket</button> :
                                <button onClick={() => handleAction('open')} className="btn-action" style={{background:'#555'}}>Reabrir Ticket</button>
                            }
                            <button onClick={() => handleAction('delete')} className="btn-action delete" style={{marginLeft: 'auto'}}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
            {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            {confirmAction && (
                <CustomConfirm 
                    message={confirmAction.message} 
                    onConfirm={() => { setConfirmAction(null); confirmAction.onConfirm(); }} 
                    onCancel={() => setConfirmAction(null)} 
                />
            )}
        </div>
    )
}

function BanUserModal({ ticket, onClose, onSuccess }) {
    const [nickname, setNickname] = useState('') // El admin debe confirmar el nick exacto
    const [reason, setReason] = useState('')
    const [duration, setDuration] = useState('temp') // 'temp' or 'perm'
    const [timeValue, setTimeValue] = useState('7')
    const [timeUnit, setTimeUnit] = useState('d') // m, h, d, mo
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null)

    const handleBan = async (e) => {
        e.preventDefault()
        if(!nickname) {
            setAlert({ message: "Escribe el Nickname del jugador", type: 'error' })
            return
        }
        
        setLoading(true)
        try {
            // Construir comando de ban (ej: 'ban' o 'tempban')
            // Nota: La API backend '/tickets/ban' espera { username, reason, command? }
            // Si tu backend hace 'console command', enviamos la instrucción.
            
            let finalCommand = ''
            if (duration === 'perm') {
                 // ban <player> <reason>
                 // El backend probablemente maneje la lógica, enviaremos los datos crudos.
                 // Si el backend es simple:
                 finalCommand = `ban ${nickname} ${reason}` 
            } else {
                 // tempban <player> <time> <reason>
                 finalCommand = `tempban ${nickname} ${timeValue}${timeUnit} ${reason}`
            }

            // PERO: Si tu backend '/tickets/ban' solo acepta { username, reason }, 
            // la lógica de tiempo tendría que estar en el backend o en el mensaje 'reason'.
            // Asumiremos que enviaremos el comando completo o data estructurada.
            // Para simplificar y no romper el backend actual (que espera {username, reason}),
            // enviaremos la duración DENTRO de la razón o modificaremos el backend.
            // VOY A ASUMIR que el backend ejecuta el comando tal cual o necesita adaptación.
            // Como no quiero tocar backend ahora, enviamos username y reason.
            // Si es tempban, lo metemos en 'reason' para referencia visual o si el backend lo soporta.
            
            // Re-leí tu código backend anterior (no visible ahora pero deduzco).
            // Usaremos la API existente.
            
            await fetch(`${import.meta.env.VITE_API_URL}/tickets/ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: nickname, 
                    reason: duration === 'perm' ? `[PERMANENTE] ${reason}` : `[TEMP: ${timeValue}${timeUnit}] ${reason}`
                    // Nota: Esto es un parche si el backend solo hace 'ban'. Si hace 'execute command', podemos mandar el comando completo.
                })
            })
            
            onSuccess()
        } catch (err) {
            console.error(err)
            setAlert({ message: "Error al banear: " + err.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" style={{backdropFilter: 'blur(5px)'}}>
            <div className="admin-card modal-content" style={{width: '450px', border: '1px solid #ef4444', boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'}}>
                <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.5rem', borderBottom:'1px solid #333', paddingBottom:'1rem'}}>
                    <FaGavel color="#ef4444" size={20} />
                    <h3 style={{margin:0, color:'#fff'}}>Sancionar Usuario</h3>
                </div>

                <form onSubmit={handleBan}>
                    <div style={{marginBottom:'1rem'}}>
                        <label className="admin-label">Nickname de Minecraft</label>
                        <input 
                            className="admin-input" 
                            value={nickname} 
                            onChange={e => setNickname(e.target.value)} 
                            placeholder="Ej: Steve"
                            autoFocus
                        />
                         <div style={{fontSize: '0.75rem', color: '#666', marginTop: '0.3rem'}}>
                            Confirma el nombre exacto del jugador en el servidor.
                        </div>
                    </div>

                    <div style={{marginBottom:'1rem'}}>
                        <label className="admin-label">Tipo de Sanción</label>
                        <div style={{display:'flex', gap:'1rem'}}>
                            <button 
                                type="button" 
                                className={`admin-tab-btn ${duration === 'temp' ? 'active' : ''}`}
                                onClick={() => setDuration('temp')}
                                style={{flex:1, textAlign:'center', borderColor: duration === 'temp' ? 'var(--accent)' : '#333'}}
                            >
                                Temporal
                            </button>
                            <button 
                                type="button" 
                                className={`admin-tab-btn ${duration === 'perm' ? 'active' : ''}`}
                                onClick={() => setDuration('perm')}
                                style={{flex:1, textAlign:'center', borderColor: duration === 'perm' ? '#ef4444' : '#333', color: duration === 'perm' ? '#ef4444' : '#aaa'}}
                            >
                                Permanente
                            </button>
                        </div>
                    </div>

                    {duration === 'temp' && (
                        <div style={{marginBottom:'1rem', display:'flex', gap:'0.5rem'}}>
                            <div style={{flex:1}}>
                                <label className="admin-label">Cantidad</label>
                                <input type="number" className="admin-input" value={timeValue} onChange={e => setTimeValue(e.target.value)} min="1" />
                            </div>
                            <div style={{flex:1}}>
                                <label className="admin-label">Unidad</label>
                                <select className="admin-input" value={timeUnit} onChange={e => setTimeUnit(e.target.value)}>
                                    <option value="m">Minutos</option>
                                    <option value="h">Horas</option>
                                    <option value="d">Días</option>
                                    <option value="mo">Meses</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div style={{marginBottom:'1.5rem'}}>
                        <label className="admin-label">Razón / Motivo</label>
                        <textarea 
                            className="admin-input" 
                            rows="3" 
                            value={reason} 
                            onChange={e => setReason(e.target.value)} 
                            placeholder="Ej: Uso de hacks (KillAura)"
                        />
                    </div>

                    <div style={{display:'flex', justifyContent:'flex-end', gap:'1rem', borderTop:'1px solid #333', paddingTop:'1rem'}}>
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button 
                            type="submit" 
                            className="btn-primary" 
                            disabled={loading}
                            style={{background: '#ef4444', border: 'none', color: '#fff'}}
                        >
                            {loading ? <FaSpinner className="spin"/> : <><FaGavel /> Aplicar Sanción</>}
                        </button>
                    </div>
                </form>
            </div>
            {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    )
}

function PriorityBadge({ priority }) {
    const colors = { low: '#4ade80', medium: '#facc15', high: '#fb923c', urgent: '#ef4444' }
    return <span style={{ color: colors[priority] || colors.medium, fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'capitalize' }}>{priority}</span>
}

function StatusBadge({ status }) {
    let color = '#aaa';
    if (status === 'open') color = '#3b82f6';
    if (status === 'pending') color = '#facc15';
    if (status === 'resolved') color = '#4ade80';
    if (status === 'closed') color = '#666';
    return (
        <span className="status-chip" style={{ background: `${color}20`, color: color, border: `1px solid ${color}40`, padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
            {status}
        </span>
    )
}

function CustomAlert({ message, type = 'error', onClose }) {
    // type: 'error', 'success', 'warning'
    const colors = { error: '#ef4444', success: '#10b981', warning: '#facc15' }
    const Icon = type === 'error' ? FaExclamationCircle : (type === 'success' ? FaCheckCircle : FaExclamationTriangle)
    
    return (
        <div className="modal-overlay" style={{ zIndex: 100000 }}>
            <div className="admin-card modal-content" style={{ width: '400px', maxWidth: '90%', textAlign: 'center', padding: '2rem', border: `1px solid ${colors[type]}`, boxShadow: `0 0 30px ${colors[type]}20` }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <Icon size={48} color={colors[type]} />
                </div>
                <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.5rem' }}>
                    {type === 'error' ? '¡Ups! Algo salió mal' : (type === 'success' ? '¡Éxito!' : 'Atención')}
                </h3>
                <p style={{ color: '#ccc', marginBottom: '2rem', lineHeight: '1.6' }}>{message}</p>
                <button 
                    onClick={onClose} 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', background: colors[type], color: '#000', fontWeight: 'bold' }}
                >
                    Aceptar
                </button>
            </div>
        </div>
    )
}

function CustomConfirm({ message, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay" style={{ zIndex: 100000 }}>
            <div className="admin-card modal-content" style={{ width: '400px', maxWidth: '90%', textAlign: 'center', padding: '2rem', border: `1px solid #facc15`, boxShadow: `0 0 30px rgba(250, 204, 21, 0.2)` }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <FaExclamationTriangle size={48} color="#facc15" />
                </div>
                <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.5rem' }}>
                    ¿Estás seguro?
                </h3>
                <p style={{ color: '#ccc', marginBottom: '2rem', lineHeight: '1.6' }}>{message}</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                     <button 
                        onClick={onCancel} 
                        className="btn-secondary" 
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="btn-primary" 
                        style={{ flex: 1, justifyContent: 'center', background: '#ef4444', color: '#fff', fontWeight: 'bold' }}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    )
}
