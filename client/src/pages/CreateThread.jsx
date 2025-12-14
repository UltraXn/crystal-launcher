import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPen, FaPoll, FaDiscord, FaTimes, FaPlus, FaCheckCircle } from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import Section from '@/components/Layout/Section'

const API_URL = import.meta.env.VITE_API_URL

export default function CreateThread() {
    const { user } = useAuth()
    const navigate = useNavigate()
    
    // Thread Data
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [categoryId, setCategoryId] = useState('2') // Default General
    
    // Poll Data
    const [showPoll, setShowPoll] = useState(false)
    const [pollQuestion, setPollQuestion] = useState('')
    const [pollOptions, setPollOptions] = useState(['Si', 'No'])
    const [discordLink, setDiscordLink] = useState('')
    const [isDiscordPoll, setIsDiscordPoll] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!user) return alert("Debes iniciar sesión")
        setSubmitting(true)
        
        const pollData = showPoll ? {
            enabled: true,
            question: isDiscordPoll ? "Encuesta de Discord" : pollQuestion,
            options: isDiscordPoll ? [] : pollOptions.filter(o => o.trim() !== ''),
            discord_link: isDiscordPoll ? discordLink : null,
            closes_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        } : null

        const body = {
            category_id: parseInt(categoryId),
            title,
            content,
            user_data: {
                id: user.id || 'anonymous', // Fallback if auth issue
                name: user?.user_metadata?.username || user?.email?.split('@')[0] || "Usuario",
                avatar: user?.user_metadata?.avatar_url,
                role: user?.user_metadata?.role || 'user'
            },
            poll_data: pollData
        }

        try {
            const res = await fetch(`${API_URL}/forum/threads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            if(res.ok) {
                const data = await res.json()
                // Redirect depending on ID
                // Wait, need to ensure route exists. 
                // For now, redirect to category page or thread page if logic supports it.
                // Standard forum structure /forum/thread/:id
                navigate(`/forum/thread/${data.id}`)
            } else {
                alert("Error creando tema")
            }
        } catch(err) { 
            console.error(err)
            alert("Error de conexión")
        } finally {
            setSubmitting(false)
        }
    }

    const addOption = () => setOptions([...pollOptions, ''])
    const updateOption = (idx, val) => {
        const newOpts = [...pollOptions]
        newOpts[idx] = val
        setPollOptions(newOpts)
    }

    return (
        <Section title="Crear Nuevo Tema">
            <Section>
                <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '12px' }}>
                    
                    {/* Category Select */}
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Categoría</label>
                        <select 
                            className="form-input" 
                            value={categoryId} 
                            onChange={e => setCategoryId(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444', borderRadius: '6px' }}
                        >
                            <option value="2">Discusión General</option>
                            <option value="3">Soporte y Ayuda</option>
                            <option value="4">Off-Topic</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Título</label>
                        <input 
                            className="form-input" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="Título de tu tema" 
                            required 
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444', borderRadius: '6px' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Contenido</label>
                        <textarea 
                            className="form-input" 
                            value={content} 
                            onChange={e => setContent(e.target.value)} 
                            placeholder="Escribe aquí..." 
                            required 
                            rows={8}
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444', borderRadius: '6px', resize: 'vertical' }}
                        />
                    </div>

                    {/* Poll Section Toggle */}
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: showPoll ? '1px solid var(--accent)' : '1px dashed #444' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowPoll(!showPoll)}>
                            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: showPoll ? 'var(--accent)' : '#aaa' }}>
                                <FaPoll /> Añadir Encuesta
                            </h4>
                            <div className={`checkbox ${showPoll ? 'active' : ''}`} style={{ width: '20px', height: '20px', border: '1px solid #666', borderRadius: '4px', background: showPoll ? 'var(--accent)' : 'transparent' }}>
                                {showPoll && <FaCheckCircle size={14} color="#000" style={{ margin: '2px' }} />}
                            </div>
                        </div>

                        {showPoll && (
                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #444', paddingTop: '1.5rem' }}>
                                
                                {/* Discord Option */}
                                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" checked={isDiscordPoll} onChange={e => setIsDiscordPoll(e.target.checked)} id="discordCheck" />
                                    <label htmlFor="discordCheck" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDiscordPoll ? '#5865F2' : '#ccc' }}>
                                        <FaDiscord /> Vincular encuesta de Discord existente
                                    </label>
                                </div>

                                {isDiscordPoll ? (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Enlace al Mensaje de Discord (Opción "Copiar Enlace del Mensaje")</label>
                                        <input 
                                            value={discordLink} 
                                            onChange={e => setDiscordLink(e.target.value)} 
                                            placeholder="https://discord.com/channels/..." 
                                            style={{ width: '100%', padding: '0.7rem', background: '#222', border: '1px solid #555', color: '#fff', borderRadius: '4px' }}
                                        />
                                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                                            Esto mostrará un botón para ir a votar a Discord directamente.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Pregunta de la Encuesta</label>
                                        <input 
                                            value={pollQuestion} 
                                            onChange={e => setPollQuestion(e.target.value)} 
                                            placeholder="¿Pregunta?" 
                                            style={{ width: '100%', padding: '0.7rem', background: '#222', border: '1px solid #555', color: '#fff', borderRadius: '4px', marginBottom: '1rem' }}
                                        />
                                        
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Opciones</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {pollOptions.map((opt, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input 
                                                        value={opt} 
                                                        onChange={e => updateOption(idx, e.target.value)} 
                                                        placeholder={`Opción ${idx + 1}`}
                                                        style={{ flexGrow: 1, padding: '0.6rem', background: '#222', border: '1px solid #555', color: '#fff', borderRadius: '4px' }}
                                                    />
                                                    {pollOptions.length > 2 && (
                                                        <button type="button" onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))} className="btn-icon delete" style={{ background: '#333', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 1rem' }}>
                                                            <FaTimes />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setPollOptions([...pollOptions, ''])} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem' }}>
                                                <FaPlus /> Añadir Opción
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} disabled={submitting}>
                        {submitting ? 'Publicando...' : 'Publicar Tema'}
                    </button>
                    
                </form>
            </Section>
        </Section>
    )
}
