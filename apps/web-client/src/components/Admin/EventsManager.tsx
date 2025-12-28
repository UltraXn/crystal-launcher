import React, { useState, useEffect, useCallback } from "react"
import { FaPlus, FaEdit, FaTrash, FaHammer, FaDiceD20, FaMapMarkedAlt, FaRunning, FaCheckCircle, FaHourglassStart, FaFlagCheckered, FaExclamationTriangle, FaUsers, FaLanguage, FaSpinner } from "react-icons/fa"
import { useTranslation } from "react-i18next"
import Loader from "../UI/Loader"

interface Event {
    id?: number;
    title: string;
    title_en?: string;
    description: string;
    description_en?: string;
    type: string;
    status: string;
    image_url?: string;
    registrations?: Registration[];
}

interface Registration {
    id: number;
    created_at: string;
    profiles?: {
        avatar_url?: string;
        username?: string;
    }
}

export default function EventsManager() {
    const { t } = useTranslation()
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null) // ID of event to delete
    const [showRegistrationsModal, setShowRegistrationsModal] = useState<number | null>(null) // ID of event to show registrations

    // Icon mapping for display and selection
    const iconMap: {[key: string]: React.ReactNode} = {
        'hammer': <FaHammer />,
        'dice': <FaDiceD20 />,
        'map': <FaMapMarkedAlt />,
        'running': <FaRunning />
    }
    
    // Moved statusMap inside to use t() but we can also use dynamic access in render
    // However, statusMap is used for both label and color/icon.
    const statusMap: {[key: string]: { label: string, icon: React.ReactNode, color: string }} = {
        'active': { label: t('admin.events.form.statuses.active'), icon: <FaCheckCircle />, color: '#4ade80' },
        'soon': { label: t('admin.events.form.statuses.soon'), icon: <FaHourglassStart />, color: '#fbbf24' },
        'finished': { label: t('admin.events.form.statuses.finished'), icon: <FaFlagCheckered />, color: '#ef4444' }
    }

    const API_URL = import.meta.env.VITE_API_URL || '/api'

    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/events`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setEvents(data)
            }
        } catch (error) {
            console.error("Error cargando eventos:", error)
        } finally {
            setLoading(false)
        }
    }, [API_URL])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    const handleEdit = (event: Event) => {
        setCurrentEvent(event)
        setIsEditing(true)
    }

    const [translating, setTranslating] = useState<string | null>(null)

    // ... duplicate removed ...

    const handleNew = () => {
        setCurrentEvent({ title: "", title_en: "", description: "", description_en: "", type: "hammer", status: "soon", image_url: "" })
        setIsEditing(true)
    }

    const confirmDelete = (id: number) => {
        setDeleteConfirm(id)
    }

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await fetch(`${API_URL}/events/${deleteConfirm}`, { method: 'DELETE' })
            setEvents(events.filter(e => e.id !== deleteConfirm))
            setDeleteConfirm(null)
        } catch (error) {
            console.error("Error eliminando evento:", error)
            alert(t('admin.events.error_delete'))
        }
    }

    const handleTranslate = async (text: string, field: 'title' | 'description') => {
        if (!text) return
        setTranslating(field)
        try {
             const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, targetLang: 'en' })
            })
            if (res.ok) {
                const data = await res.json()
                const translated = data.translatedText || ''
                setCurrentEvent(prev => {
                    if (!prev) return null
                    return {
                        ...prev,
                        [field === 'title' ? 'title_en' : 'description_en']: translated
                    }
                })
            }
        } catch (e) { console.error(e) }
        finally { setTranslating(null) }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentEvent) return;
        try {
            let res
            const headers = { 'Content-Type': 'application/json' }

            if (currentEvent.id) {
                // UPDATE
                res = await fetch(`${API_URL}/events/${currentEvent.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(currentEvent)
                })
            } else {
                // CREATE
                res = await fetch(`${API_URL}/events`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(currentEvent)
                })
            }

            if (!res.ok) throw new Error('Error al guardar')

            await fetchEvents()
            setIsEditing(false)
        } catch (error) {
            console.error("Error guardando evento:", error)
            alert(t('admin.events.error_save'))
        }
    }

    if (loading) return (
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1.5rem' }}>
            <Loader text="" style={{ height: 'auto', minHeight: '120px' }} />
            <span style={{ color: '#666' }}>{t('admin.events.loading')}</span>
        </div>
    )

    if (isEditing && currentEvent) {
        return (
            <div className="admin-card">
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.2rem" }}>{currentEvent.id ? t('admin.events.edit_title') : t('admin.events.create_title')}</h3>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)}>{t('admin.events.cancel')}</button>
                </div>

                <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* TITLE */}
                    <div className="form-group">
                        <label className="form-label">{t('admin.events.form_extras.title_es')}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={currentEvent.title}
                            onChange={e => setCurrentEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <label className="form-label">{t('admin.events.form_extras.title_en')}</label>
                            <button type="button" className="btn-secondary" style={{fontSize:'0.8rem', padding:'0.2rem 0.5rem'}} onClick={() => handleTranslate(currentEvent.title, 'title')} disabled={translating === 'title'}>
                                {translating === 'title' ? <FaSpinner className="spin"/> : <><FaLanguage /> {t('admin.events.form_extras.translate_btn')}</>}
                            </button>
                        </div>
                        <input
                            type="text"
                            className="form-input"
                            value={currentEvent.title_en || ''}
                            onChange={e => setCurrentEvent(prev => prev ? { ...prev, title_en: e.target.value } : null)}
                            placeholder="Event Title"
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="form-group">
                        <label className="form-label">{t('admin.events.form_extras.desc_es')}</label>
                         <textarea
                            className="form-textarea"
                            rows={4}
                            value={currentEvent.description}
                            onChange={e => setCurrentEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <label className="form-label">{t('admin.events.form_extras.desc_en')}</label>
                            <button type="button" className="btn-secondary" style={{fontSize:'0.8rem', padding:'0.2rem 0.5rem'}} onClick={() => handleTranslate(currentEvent.description, 'description')} disabled={translating === 'description'}>
                                {translating === 'description' ? <FaSpinner className="spin"/> : <><FaLanguage /> {t('admin.events.form_extras.translate_btn')}</>}
                            </button>
                        </div>
                         <textarea
                            className="form-textarea"
                            rows={4}
                            value={currentEvent.description_en || ''}
                            onChange={e => setCurrentEvent(prev => prev ? { ...prev, description_en: e.target.value } : null)}
                            placeholder="Event Description"
                        ></textarea>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                         <div className="form-group">
                            <label className="form-label">{t('admin.events.form.type')}</label>
                            <select
                                className="form-input"
                                value={currentEvent.type}
                                onChange={e => setCurrentEvent(prev => prev ? { ...prev, type: e.target.value } : null)}
                            >
                                <option value="hammer">{t('admin.events.form.types.hammer')}</option>
                                <option value="dice">{t('admin.events.form.types.dice')}</option>
                                <option value="map">{t('admin.events.form.types.map')}</option>
                                <option value="running">{t('admin.events.form.types.running')}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('admin.events.form.status')}</label>
                            <select
                                className="form-input"
                                value={currentEvent.status}
                                onChange={e => setCurrentEvent(prev => prev ? { ...prev, status: e.target.value } : null)}
                            >
                                <option value="soon">{t('admin.events.form.statuses.soon')}</option>
                                <option value="active">{t('admin.events.form.statuses.active')}</option>
                                <option value="finished">{t('admin.events.form.statuses.finished')}</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                        <button type="submit" className="btn-primary">
                            {currentEvent.id ? t('admin.events.form.save') : t('admin.events.form.create')}
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className="admin-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3>{t('admin.events.title')}</h3>
                <button className="btn-primary" onClick={handleNew} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaPlus size={12} /> {t('admin.events.create_title')}
                </button>
            </div>

            <div className="admin-table-container" style={{ overflow: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('admin.events.table.icon')}</th>
                            <th>{t('admin.events.table.event')}</th>
                            <th>{t('admin.events.table.status')}</th>
                            <th style={{ textAlign: "right" }}>{t('admin.events.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                             <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "#666" }}>{t('admin.events.no_events')}</td></tr>
                        ) : events.map(event => (
                            <tr key={event.id}>
                                <td style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>
                                    {iconMap[event.type] || <FaHammer />}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 'bold' }}>{event.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{event.description?.substring(0, 50)}...</div>
                                </td>
                                <td>
                                     <span style={{
                                        color: statusMap[event.status]?.color || '#fff',
                                        background: `${statusMap[event.status]?.color}20`,
                                        padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem",
                                        display: 'inline-flex', alignItems: 'center', gap: '5px'
                                    }}>
                                        {statusMap[event.status]?.icon} {statusMap[event.status]?.label || event.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    <button
                                        onClick={() => event.id && setShowRegistrationsModal(event.id)}
                                        style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", marginRight: "1rem" }}
                                        title={t('admin.events.registrations.view_tooltip')}
                                    >
                                        <FaUsers />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(event)}
                                        style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", marginRight: "1rem" }}
                                        title={t('admin.events.edit_title')}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => event.id && confirmDelete(event.id)}
                                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                                        title={t('admin.events.delete_tooltip')}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0, 
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setDeleteConfirm(null)}>
                    <div style={{
                        background: '#1e1e24',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '1px solid #ef4444',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '50%', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '2rem'
                        }}>
                            <FaExclamationTriangle />
                        </div>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem' }}>{t('admin.events.delete_modal.title')}</h3>
                        <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                            {t('admin.events.delete_modal.desc')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                className="btn-secondary" 
                                onClick={() => setDeleteConfirm(null)}
                                style={{ flex: 1 }}
                            >
                                {t('admin.events.delete_modal.cancel')}
                            </button>
                            <button 
                                className="btn-primary" 
                                onClick={executeDelete}
                                style={{ 
                                    flex: 1, 
                                    background: '#ef4444', 
                                    borderColor: '#ef4444', 
                                    color: '#fff' 
                                }}
                            >
                                {t('admin.events.delete_modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Registrations Modal */}
            {showRegistrationsModal && (
                <RegistrationsModal 
                    eventId={showRegistrationsModal} 
                    onClose={() => setShowRegistrationsModal(null)} 
                    API_URL={API_URL}
                />
            )}
        </div>
    )
}

interface RegistrationsModalProps {
    eventId: number;
    onClose: () => void;
    API_URL: string;
}

function RegistrationsModal({ eventId, onClose, API_URL }: RegistrationsModalProps) {
    const { t } = useTranslation()
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        const fetchReg = async () => {
            try {
                const res = await fetch(`${API_URL}/events/${eventId}/registrations`)
                if (res.ok) {
                    const data = await res.json()
                    setRegistrations(data)
                }
            } catch (e) { console.error(e) } 
            finally { setLoading(false) }
        }
        fetchReg()
    }, [eventId, API_URL])

    return (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)' }} onClick={onClose}>
            <div className="admin-card modal-content" style={{ width: '500px', maxWidth: '90%', maxHeight: '80vh', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>{t('admin.events.registrations.title')} ({registrations.length})</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <Loader style={{ height: 'auto', minHeight: '60px' }} />
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>{t('admin.events.registrations.loading')}</span>
                        </div>
                    ) : (
                        registrations.length === 0 ? <div style={{textAlign:'center', padding:'2rem', color:'#666'}}>{t('admin.events.registrations.empty')}</div> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {registrations.map(reg => (
                                    <div key={reg.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#333', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                                            {reg.profiles?.avatar_url ? <img src={reg.profiles.avatar_url} style={{width:'100%', height:'100%'}}/> : <div style={{color:'#aaa', fontSize:'0.8rem'}}>?</div>}
                                        </div>
                                        <div style={{ fontWeight: 'bold' }}>{reg.profiles?.username || t('admin.events.registrations.unknown_user')}</div>
                                        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#666' }}>{new Date(reg.created_at).toLocaleDateString()}</div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
