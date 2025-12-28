import { useState, useEffect } from 'react'
import { FaTrash, FaInbox, FaFilter, FaGavel, FaCheck, FaTimes, FaThumbtack, FaBug, FaLightbulb, FaCube, FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import Loader from "../UI/Loader"

const API_URL = import.meta.env.VITE_API_URL || '/api'

interface Suggestion {
    id: number;
    type: string;
    nickname: string;
    message: string;
    created_at: string;
    status?: 'pending' | 'approved' | 'rejected' | 'implemented'; // Placeholder for future backend support
    votes?: number; // Placeholder
}

const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'bug': return <FaBug />;
        case 'feature': return <FaLightbulb />;
        case 'mod': return <FaCube />;
        default: return <FaQuestionCircle />;
    }
}

const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
        case 'bug': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.4)' };
        case 'feature': return { bg: 'rgba(234, 179, 8, 0.2)', text: '#fde047', border: 'rgba(234, 179, 8, 0.4)' };
        case 'mod': return { bg: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.4)' };
        default: return { bg: 'rgba(107, 114, 128, 0.2)', text: '#d1d5db', border: 'rgba(107, 114, 128, 0.4)' };
    }
}

export default function SuggestionsManager() {
    const { t } = useTranslation()
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedCard, setExpandedCard] = useState<number | null>(null)

    const [filterType, setFilterType] = useState('All')

    const fetchSuggestions = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/suggestions`)
            if(res.ok) {
                const data = await res.json()
                // Ensure data is array needed?
                setSuggestions(data)
            }
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSuggestions()
    }, [])

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedId, setSelectedId] = useState<number | null>(null)

    const handleDelete = (id: number) => {
        setSelectedId(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (selectedId === null) return
        try {
            await fetch(`${API_URL}/suggestions/${selectedId}`, { method: 'DELETE' })
            fetchSuggestions()
            setShowDeleteModal(false)
            setSelectedId(null)
        } catch(err) { console.error(err) }
    }

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const res = await fetch(`${API_URL}/suggestions/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                // Update local state to reflect change immediately
                setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: status as any } : s));
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    }

    const filteredSuggestions = suggestions.filter(s => 
        filterType === 'All' ? true : s.type.toLowerCase() === filterType.toLowerCase()
    )

    const FilterButton = ({ type, icon, label }: { type: string, icon?: React.ReactNode, label: string }) => {
        const isActive = filterType === type;
        const colors = type === 'All' ? { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' } : getTypeColor(type);
        
        return (
            <button 
                onClick={() => setFilterType(type)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '50px',
                    border: `1px solid ${isActive ? colors.border : 'transparent'}`,
                    background: isActive ? colors.bg : 'rgba(0,0,0,0.2)',
                    color: isActive ? '#fff' : '#aaa',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 400
                }}
            >
                {icon}
                {label}
            </button>
        )
    }

    return (
        <div className="admin-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* Header Area */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ margin: 0, display:'flex', alignItems:'center', gap:'12px', fontSize: '1.8rem', background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            <FaInbox style={{ color: 'var(--accent)' }} /> 
                            {t('admin.suggestions.title')}
                        </h2>
                        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                            {t('admin.suggestions.subtitle', 'Gestione el feedback de la comunidad')}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ 
                    display: 'flex', gap: '10px', flexWrap: 'wrap', 
                    background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', color: '#666' }}><FaFilter /></div>
                    <FilterButton type="All" label={t('admin.suggestions.filter_all')} />
                    <FilterButton type="Bug" icon={<FaBug />} label={t('admin.suggestions.filter_bug')} />
                    <FilterButton type="Feature" icon={<FaLightbulb />} label={t('admin.suggestions.filter_feature')} />
                    <FilterButton type="Mod" icon={<FaCube />} label={t('admin.suggestions.filter_mod')} />
                    <FilterButton type="Other" icon={<FaQuestionCircle />} label={t('admin.suggestions.filter_other')} />
                </div>
            </div>
            
            {loading ? (
                <div style={{ padding: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Loader text="" style={{ height: 'auto', minHeight: '100px' }} />
                </div>
            ) : (
                <>
                    {/* Grid Layout */}
                    {filteredSuggestions.length > 0 ? (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', // Wider cards
                            gap: '1.5rem',
                            alignItems: 'start'
                        }}>
                            {filteredSuggestions.map(s => {
                                const typeStyle = getTypeColor(s.type);
                                const isExpanded = expandedCard === s.id;
                                
                                return (
                                    <div key={s.id} className="admin-card-hover" style={{ 
                                        background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.95))', // Improved gradient
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        display: 'flex', flexDirection: 'column',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)' // Deeper shadow
                                    }}>
                                        {/* Colored Top Border Glow */}
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: typeStyle.text, boxShadow: `0 0 10px ${typeStyle.text}` }}></div>

                                        {/* Card Header */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <img 
                                                        src={`https://mc-heads.net/avatar/${s.nickname}/64`} 
                                                        alt={s.nickname}
                                                        style={{ width: '48px', height: '48px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.1)', background: '#1a1a1a' }}
                                                    />
                                                    {/* Online/Status indicator dot could go here */}
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>{s.nickname}</h4>
                                                    <span style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <FaQuestionCircle size={10} /> 
                                                        {new Date(s.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div style={{ 
                                                padding: '6px 12px', borderRadius: '20px', 
                                                background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}`,
                                                fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                boxShadow: `0 2px 10px ${typeStyle.bg}`
                                            }}>
                                                {getTypeIcon(s.type)} {s.type}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div style={{ flex: 1, marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding:'1rem', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.02)' }}>
                                            <div style={{ 
                                                color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6',
                                                fontFamily: '"Inter", sans-serif',
                                                maxHeight: isExpanded ? 'none' : '100px', // Slightly taller default
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'max-height 0.3s ease'
                                            }}>
                                                {s.message}
                                                {!isExpanded && s.message.length > 120 && (
                                                     <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
                                                     </div>
                                                )}
                                            </div>
                                            
                                            {s.message.length > 120 && (
                                                <button 
                                                    onClick={() => setExpandedCard(isExpanded ? null : s.id)}
                                                    style={{ 
                                                        background: 'transparent', border: 'none', color: 'var(--accent)', 
                                                        fontSize: '0.8rem', cursor: 'pointer', marginTop: '10px', width: '100%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                                                        padding: '4px', borderRadius: '4px',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {isExpanded ? <><FaChevronUp /> {t('admin.suggestions.show_less', 'Ver menos')}</> : <><FaChevronDown /> {t('admin.suggestions.read_more', 'Leer más')}</>}
                                                </button>
                                            )}
                                        </div>

                                        {/* Card Footer Actions */}
                                        <div style={{ 
                                            display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', 
                                            marginTop: 'auto'
                                        }}>
                                            {s.status !== 'approved' && (
                                                <button 
                                                    className="btn-icon-text" 
                                                    title="Aprobar" 
                                                    onClick={() => handleUpdateStatus(s.id, 'approved')}
                                                    style={{ background: 'rgba(74, 222, 128, 0.08)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)' }}
                                                >
                                                    <FaCheck /> <span className="btn-label">{t('admin.actions.approve', 'Aprobar')}</span>
                                                </button>
                                            )}
                                            {s.status !== 'rejected' && (
                                                <button 
                                                    className="btn-icon-text" 
                                                    title="Rechazar" 
                                                    onClick={() => handleUpdateStatus(s.id, 'rejected')}
                                                    style={{ background: 'rgba(248, 113, 113, 0.08)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)' }}
                                                >
                                                    <FaTimes /> <span className="btn-label">{t('admin.actions.reject', 'Rechazar')}</span>
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(s.id)} className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', width: '40px' }}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div style={{ 
                            background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '4rem', 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            border: '2px dashed rgba(255,255,255,0.05)'
                        }}>
                            <FaInbox size={48} style={{ marginBottom: '1rem', color: '#444' }} />
                            <h3 style={{ margin: 0, color: '#888' }}>{t('admin.suggestions.empty')}</h3>
                            <p style={{ color: '#555', fontSize: '0.9rem' }}>{t('admin.suggestions.empty_desc', 'No hay sugerencias que coincidan con los filtros actuales.')}</p>
                        </div>
                    )}
                </>
            )}

            {/* Modal Styles Injection */}
            <style>{`
                .admin-card-hover:hover {
                    background: rgba(30, 30, 30, 0.8) !important;
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    border-color: rgba(255,255,255,0.1) !important;
                }
                .btn-icon-text {
                    border: none;
                    border-radius: 8px;
                    padding: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.2s;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .btn-icon-text:hover {
                    filter: brightness(1.2);
                }
                @media (max-width: 600px) {
                    .btn-label { display: none; }
                }
            `}</style>
            
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="admin-card modal-content" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', padding: '2rem' }}>
                        <div style={{ width: '60px', height: '60px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '1.5rem' }}>
                            <FaTrash />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>{t('admin.suggestions.delete_modal.title')}</h3>
                        <p style={{ marginBottom: '2rem', color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5' }}>{t('admin.suggestions.delete_modal.desc')}</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setShowDeleteModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                                {t('admin.suggestions.delete_modal.cancel')}
                            </button>
                            <button onClick={confirmDelete} className="btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444', flex: 1 }}>
                                {t('admin.suggestions.delete_modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
