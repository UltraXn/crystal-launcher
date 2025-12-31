import React, { useState, useEffect, useCallback } from "react"
import { FaPlus, FaEdit, FaTrash, FaHammer, FaDiceD20, FaMapMarkedAlt, FaRunning, FaCheckCircle, FaHourglassStart, FaFlagCheckered, FaExclamationTriangle, FaUsers, FaLanguage, FaSpinner, FaTimes } from "react-icons/fa"
import { useTranslation } from "react-i18next"
import Loader from "../UI/Loader"
import { supabase } from "../../services/supabaseClient"
import { getAuthHeaders } from "../../services/adminAuth"

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
            const { data: { session } } = await supabase.auth.getSession()
            await fetch(`${API_URL}/events/${deleteConfirm}`, { 
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
            })
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
            const { data: { session } } = await supabase.auth.getSession()
             const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
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
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session) {
                alert("No active session. Please log in.");
                return;
            }

            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session.access_token)
            }

            let res
            
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



    if (isEditing && currentEvent) {
        return (
            <div className="event-form-container">
                 <div className="event-header">
                    <h3>{currentEvent.id ? t('admin.events.edit_title') : t('admin.events.create_title')}</h3>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ borderRadius: '12px', height: '42px' }}>
                        {t('admin.events.cancel')}
                    </button>
                </div>

                <div className="poll-active-card" style={{ marginTop: '2rem', padding: '3rem' }}>
                    <div className="modal-accent-line"></div>
                    <form onSubmit={handleSave} className="event-form-grid">
                        
                        <div className="event-form-section">
                            <h4><FaDiceD20 /> {t('admin.events.form_extras.info_basic', 'Información Básica')}</h4>
                            
                            <div className="form-group">
                                <label className="admin-label-premium">{t('admin.events.form_extras.title_es')}</label>
                                <input
                                    type="text"
                                    className="admin-input-premium"
                                    value={currentEvent.title}
                                    onChange={e => setCurrentEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap: 'wrap', gap: '0.5rem'}}>
                                    <label className="admin-label-premium">{t('admin.events.form_extras.title_en')}</label>
                                    <button type="button" className="btn-secondary" style={{fontSize:'0.7rem', padding:'0.3rem 0.8rem', height: 'auto'}} onClick={() => handleTranslate(currentEvent.title, 'title')} disabled={translating === 'title'}>
                                        {translating === 'title' ? <FaSpinner className="spin"/> : <><FaLanguage /> {t('admin.events.form_extras.translate_btn')}</>}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    className="admin-input-premium"
                                    value={currentEvent.title_en || ''}
                                    onChange={e => setCurrentEvent(prev => prev ? { ...prev, title_en: e.target.value } : null)}
                                    placeholder="Event Title"
                                />
                            </div>

                            <div className="event-selectors-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                                <div className="form-group">
                                    <label className="admin-label-premium">{t('admin.events.form.type')}</label>
                                    <select
                                        className="admin-select-premium"
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
                                    <label className="admin-label-premium">{t('admin.events.form.status')}</label>
                                    <select
                                        className="admin-select-premium"
                                        value={currentEvent.status}
                                        onChange={e => setCurrentEvent(prev => prev ? { ...prev, status: e.target.value } : null)}
                                    >
                                        <option value="soon">{t('admin.events.form.statuses.soon')}</option>
                                        <option value="active">{t('admin.events.form.statuses.active')}</option>
                                        <option value="finished">{t('admin.events.form.statuses.finished')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="event-form-section">
                            <h4><FaEdit /> {t('admin.events.form_extras.description', 'Descripción Detallada')}</h4>
                            
                            <div className="form-group">
                                <label className="admin-label-premium">{t('admin.events.form_extras.desc_es')}</label>
                                 <textarea
                                    className="admin-textarea-premium"
                                    rows={4}
                                    value={currentEvent.description}
                                    onChange={e => setCurrentEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                                    required
                                ></textarea>
                            </div>
                            
                            <div className="form-group">
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap: 'wrap', gap: '0.5rem'}}>
                                    <label className="admin-label-premium">{t('admin.events.form_extras.desc_en')}</label>
                                    <button type="button" className="btn-secondary" style={{fontSize:'0.7rem', padding:'0.3rem 0.8rem', height: 'auto'}} onClick={() => handleTranslate(currentEvent.description, 'description')} disabled={translating === 'description'}>
                                        {translating === 'description' ? <FaSpinner className="spin"/> : <><FaLanguage /> {t('admin.events.form_extras.translate_btn')}</>}
                                    </button>
                                </div>
                                <textarea
                                    className="admin-textarea-premium"
                                    rows={4}
                                    value={currentEvent.description_en || ''}
                                    onChange={e => setCurrentEvent(prev => prev ? { ...prev, description_en: e.target.value } : null)}
                                    placeholder="Event Description"
                                ></textarea>
                            </div>
                        </div>

                        <div className="event-form-footer" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button type="button" onClick={() => setIsEditing(false)} className="modal-btn-secondary" style={{ flex: '1 1 auto', minWidth: '140px', height: '54px', padding: '0 2rem' }}>
                                {t('admin.events.cancel')}
                            </button>
                            <button type="submit" className="modal-btn-primary" style={{ flex: '1 1 auto', minWidth: '140px', height: '54px', padding: '0 2rem' }}>
                                <FaCheckCircle size={18} /> {currentEvent.id ? t('admin.events.form.save') : t('admin.events.form.create')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="event-manager-container">
            <div className="event-header">
                <h3>{t('admin.events.title')}</h3>
                <button className="btn-primary poll-new-btn" onClick={handleNew}>
                    <FaPlus size={14} /> {t('admin.events.create_title')}
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '6rem', display: 'flex', justifyContent: 'center' }}>
                    <Loader style={{ height: 'auto', minHeight: '100px' }} />
                </div>
            ) : events.length === 0 ? (
                <div className="poll-empty-state">
                    <div className="poll-empty-icon-wrapper">
                        <FaDiceD20 size={48} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>{t('admin.events.no_events')}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
                           Todavía no has programado ningún evento. ¡Empieza creando uno nuevo!
                        </p>
                        <button className="btn-primary" onClick={handleNew} style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
                            <FaPlus style={{ marginRight: '10px' }} /> {t('admin.events.create_title')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="event-cards-grid">
                    {events.map(event => (
                        <div key={event.id} className="event-card-premium">
                            <div className="event-card-top">
                                <div className="event-type-badge">
                                    {iconMap[event.type] || <FaHammer />}
                                </div>
                                <span className="event-status-badge" style={{
                                    color: statusMap[event.status]?.color || '#fff',
                                    background: `${statusMap[event.status]?.color}20`,
                                    border: `1px solid ${statusMap[event.status]?.color}40`
                                }}>
                                    {statusMap[event.status]?.icon}
                                    {statusMap[event.status]?.label || event.status}
                                </span>
                            </div>

                            <div className="event-card-body">
                                <h4>{event.title}</h4>
                                <p className="event-description">
                                    {event.description}
                                </p>
                            </div>

                            <div className="event-card-footer">
                                <div className="event-stats">
                                    <FaUsers size={18} style={{ color: 'var(--accent)' }} />
                                    <span>{event.registrations?.length || 0} Registrados</span>
                                </div>
                                <div className="event-actions">
                                    <button
                                        onClick={() => event.id && setShowRegistrationsModal(event.id)}
                                        className="event-btn-action"
                                        title={t('admin.events.registrations.view_tooltip')}
                                    >
                                        <FaUsers />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="event-btn-action"
                                        title={t('admin.events.edit_title')}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => event.id && confirmDelete(event.id)}
                                        className="event-btn-action delete"
                                        title={t('admin.events.delete_tooltip')}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="sync-modal-overlay">
                    <div className="sync-modal-content" style={{ maxWidth: '450px', textAlign: 'center', padding: '3.5rem' }}>
                        <div className="modal-accent-line" style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }}></div>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 2rem',
                            fontSize: '2.5rem'
                        }}>
                            <FaExclamationTriangle />
                        </div>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.75rem', fontWeight: '900', color: '#fff' }}>{t('admin.events.delete_modal.title')}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1rem' }}>
                            {t('admin.events.delete_modal.desc')}
                        </p>
                        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
                            <button 
                                className="modal-btn-secondary" 
                                onClick={() => setDeleteConfirm(null)}
                                style={{ flex: 1, height: '54px' }}
                            >
                                {t('admin.events.delete_modal.cancel')}
                            </button>
                            <button 
                                className="modal-btn-primary" 
                                onClick={executeDelete}
                                style={{ 
                                    flex: 1, 
                                    background: '#ef4444', 
                                    color: '#fff',
                                    height: '54px',
                                    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
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
                const { data: { session } } = await supabase.auth.getSession()
                const res = await fetch(`${API_URL}/events/${eventId}/registrations`, {
                    headers: getAuthHeaders(session?.access_token || null)
                })
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
        <div className="sync-modal-overlay" onClick={onClose}>
            <div className="sync-modal-content poll-modal-content" style={{ maxWidth: '550px', maxHeight: '85vh', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
                <div className="modal-accent-line"></div>
                
                <div className="poll-form-header" style={{ padding: '2rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>
                        <FaUsers style={{ color: 'var(--accent)' }} />
                        {t('admin.events.registrations.title')} ({registrations.length})
                    </h3>
                    <button onClick={onClose} className="btn-close-mini">
                        <FaTimes />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
                    {loading ? (
                        <div style={{ padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                            <Loader style={{ height: 'auto', minHeight: '60px' }} />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('admin.events.registrations.loading')}</span>
                        </div>
                    ) : (
                        registrations.length === 0 ? (
                            <div className="poll-empty-state" style={{ padding: '3rem 1rem', marginTop: 0 }}>
                                <FaUsers size={40} style={{ color: 'rgba(255,255,255,0.05)' }} />
                                <p style={{ color: 'rgba(255,255,255,0.2)', fontWeight: '800' }}>{t('admin.events.registrations.empty')}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {registrations.map(reg => (
                                    <div key={reg.id} className="registration-item">
                                        <div className="reg-avatar-ring">
                                            <div className="reg-avatar-content">
                                                {reg.profiles?.avatar_url ? (
                                                    <img src={reg.profiles.avatar_url} style={{width:'100%', height:'100%', objectFit: 'cover'}} alt="avatar"/>
                                                ) : (
                                                    <div style={{color:'rgba(255,255,255,0.2)', fontSize:'1rem', fontWeight: '900'}}>CT</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="reg-info">
                                            <div className="reg-name">{reg.profiles?.username || t('admin.events.registrations.unknown_user')}</div>
                                            <div className="reg-date">{new Date(reg.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}></div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} className="modal-btn-primary" style={{ height: '44px', padding: '0 2rem' }}>
                        {t('admin.events.close_btn', 'Cerrar')}
                    </button>
                </div>
            </div>
        </div>
    )
}
