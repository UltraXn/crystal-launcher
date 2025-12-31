import { useState, useEffect } from 'react'
import { FaTrash, FaInbox, FaCube, FaCheck, FaTimes, FaBug, FaLightbulb, FaQuestionCircle, FaExclamationTriangle, FaPoll } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import Loader from "../UI/Loader"
import { supabase } from "../../services/supabaseClient"
import { getAuthHeaders } from "../../services/adminAuth"

const API_URL = import.meta.env.VITE_API_URL || '/api'

interface Suggestion {
    id: number;
    type: string;
    nickname: string;
    message: string;
    created_at: string;
    status?: 'pending' | 'approved' | 'rejected' | 'implemented';
    votes?: number;
}

const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('bug')) return <FaBug />;
    if (t.includes('mod')) return <FaCube />;
    if (t.includes('complaint') || t.includes('queja')) return <FaExclamationTriangle />;
    if (t.includes('poll') || t.includes('encuesta')) return <FaPoll />;
    if (t.includes('general')) return <FaLightbulb />;
    return <FaQuestionCircle />;
}

const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('bug')) return { bg: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.4)' };
    if (t.includes('mod')) return { bg: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.4)' };
    if (t.includes('complaint') || t.includes('queja')) return { bg: 'rgba(249, 115, 22, 0.2)', text: '#fdba74', border: 'rgba(249, 115, 22, 0.4)' }; // Orange
    if (t.includes('poll') || t.includes('encuesta')) return { bg: 'rgba(168, 85, 247, 0.2)', text: '#d8b4fe', border: 'rgba(168, 85, 247, 0.4)' }; // Purple
    if (t.includes('general')) return { bg: 'rgba(14, 165, 233, 0.2)', text: '#7dd3fc', border: 'rgba(14, 165, 233, 0.4)' }; // Sky Blue
    return { bg: 'rgba(107, 114, 128, 0.2)', text: '#d1d5db', border: 'rgba(107, 114, 128, 0.4)' };
}

export default function SuggestionsManager() {
    const { t } = useTranslation()
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedCard, setExpandedCard] = useState<number | null>(null)

    const [filterType, setFilterType] = useState('All')
    const [filterStatus, setFilterStatus] = useState('All')

    const fetchSuggestions = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/suggestions`)
            if(res.ok) {
                const data = await res.json()
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

        // Real-time subscription for suggestions
        const channel = supabase.channel('public:suggestions')
            .on('postgres_changes', { event: '*', table: 'suggestions', schema: 'public' }, () => {
                fetchSuggestions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
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
            const { data: { session } } = await supabase.auth.getSession()
            await fetch(`${API_URL}/suggestions/${selectedId}`, { 
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
            })
            fetchSuggestions()
            setShowDeleteModal(false)
            setSelectedId(null)
        } catch(err) { console.error(err) }
    }

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(`${API_URL}/suggestions/${id}/status`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: status as Suggestion['status'] } : s));
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    }

    const filteredSuggestions = suggestions.filter(s => {
        const typeMatch = filterType === 'All' ? true : s.type.toLowerCase() === filterType.toLowerCase();
        const statusMatch = filterStatus === 'All' ? true : s.status?.toLowerCase() === filterStatus.toLowerCase();
        return typeMatch && statusMatch;
    })

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'approved': return { bg: 'rgba(34, 197, 94, 0.2)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.4)' };
            case 'rejected': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
            case 'implemented': return { bg: 'rgba(168, 85, 247, 0.2)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.4)' };
            default: return { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)' }; // Pending
        }
    }

    const FilterButton = ({ type, icon, label, isActive, onClick }: { type: string, icon?: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => {
        const colors = type === 'All' ? { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' } : getTypeColor(type);
        
        return (
            <button 
                onClick={onClick}
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

    const StatusFilterButton = ({ status, label }: { status: string, label: string }) => {
        const isActive = filterStatus === status;
        const colors = status === 'All' 
            ? { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)', text: '#aaa' } 
            : getStatusColor(status.toLowerCase());

        return (
            <button 
                onClick={() => setFilterStatus(status)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${isActive ? colors.border : 'transparent'}`,
                    background: isActive ? colors.bg : 'rgba(0,0,0,0.2)',
                    color: isActive ? colors.text : '#888',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 400
                }}
            >
                {label}
            </button>
        )
    }

    return (
        <div className="admin-container suggestions-wrapper" style={{ maxWidth: '1600px', margin: '0 auto' }}>
            
            {/* Left Sidebar: Header & Filters */}
            <div className="suggestions-sidebar" style={{ width: '320px', flexShrink: 0, position: 'sticky', top: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, display:'flex', alignItems:'center', gap:'12px', fontSize: '1.8rem', background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        <FaInbox style={{ color: 'var(--accent)' }} /> 
                        {t('admin.suggestions.title')}
                    </h2>
                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                        {t('admin.suggestions.subtitle', 'Gestione el feedback de la comunidad')}
                    </p>
                </div>

                {/* Filters Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Type Filters */}
                    <div style={{ 
                        display: 'flex', flexDirection: 'column', gap: '8px',
                        background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ color: '#888', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                            {t('admin.suggestions.filter_by_type', 'Tipo:')}
                        </div>
                        <FilterButton type="All" label={t('admin.suggestions.filter_all')} isActive={filterType === 'All'} onClick={() => setFilterType('All')} />
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
                        <FilterButton type="General" icon={<FaLightbulb />} label={t('admin.suggestions.types.general')} isActive={filterType === 'General'} onClick={() => setFilterType('General')} />
                        <FilterButton type="Bug" icon={<FaBug />} label={t('admin.suggestions.types.bug')} isActive={filterType === 'Bug'} onClick={() => setFilterType('Bug')} />
                        <FilterButton type="Mod" icon={<FaCube />} label={t('admin.suggestions.types.mod')} isActive={filterType === 'Mod'} onClick={() => setFilterType('Mod')} />
                        <FilterButton type="Complaint" icon={<FaExclamationTriangle />} label={t('admin.suggestions.types.complaint')} isActive={filterType === 'Complaint'} onClick={() => setFilterType('Complaint')} />
                        <FilterButton type="Poll" icon={<FaPoll />} label={t('admin.suggestions.types.poll')} isActive={filterType === 'Poll'} onClick={() => setFilterType('Poll')} />
                    </div>

                    {/* Status Filters */}
                    <div style={{ 
                        display: 'flex', flexDirection: 'column', gap: '8px',
                        background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.03)'
                    }}>
                        <div style={{ color: '#888', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                            {t('admin.suggestions.filter_by_status', 'Estado:')}
                        </div>
                        <StatusFilterButton status="All" label={t('admin.suggestions.status.all')} />
                        <StatusFilterButton status="pending" label={t('admin.suggestions.status.pending')} />
                        <StatusFilterButton status="approved" label={t('admin.suggestions.status.approved')} />
                        <StatusFilterButton status="rejected" label={t('admin.suggestions.status.rejected')} />
                    </div>
                </div>
            </div>
            
            {/* Right Column: Content */}
            <div style={{ flex: 1 }}>
                {loading ? (
                    <div style={{ padding: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Loader text="" style={{ height: 'auto', minHeight: '100px' }} />
                    </div>
                ) : (
                <>
                    {/* Grid Layout */}
                    {filteredSuggestions.length > 0 ? (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '12px'
                        }}>
                            {filteredSuggestions.map(s => {
                                const typeStyle = getTypeColor(s.type);
                                const statusStyle = getStatusColor(s.status || 'pending');
                                const isExpanded = expandedCard === s.id;
                                
                                return (
                                    <div key={s.id} className="admin-card-hover suggestion-card" style={{ 
                                        background: 'linear-gradient(90deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.95))',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.05)', // Neutral border
                                        borderLeft: `4px solid ${statusStyle.text}`, // Left accent border
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        display: 'flex', 
                                        alignItems: 'center', // Align items vertically center
                                        gap: '20px',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                                    }}>
                                        
                                        {/* 1. User Info Section */}
                                        <div className="suggestion-user" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                                            <img 
                                                src={`https://mc-heads.net/avatar/${s.nickname}/64`} 
                                                alt={s.nickname}
                                                style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a' }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}>{s.nickname}</h4>
                                                <span style={{ fontSize: '0.75rem', color: '#888' }}>
                                                    {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 2. Type Badge */}
                                        {/* 2. Type Badge */}
                                       <div className="suggestion-type" style={{ width: '140px', display: 'flex', justifyContent: 'center' }}>
                                            <div style={{ 
                                                padding: '4px 10px', borderRadius: '20px', 
                                                background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}`,
                                                fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {getTypeIcon(s.type)} {t(`admin.suggestions.types.${s.type.toLowerCase()}`, s.type)}
                                            </div>
                                       </div>

                                        {/* 3. Message Content (Flexible) */}
                                        <div className="suggestion-content" style={{ flex: 1, padding: '0 1rem', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ 
                                                color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.5',
                                                fontFamily: '"Inter", sans-serif',
                                                maxHeight: isExpanded ? 'none' : '42px', // Approx 2 lines
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: isExpanded ? undefined : 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}>
                                                {s.message}
                                            </div>
                                            {s.message.length > 100 && (
                                                <div 
                                                    onClick={() => setExpandedCard(isExpanded ? null : s.id)}
                                                    style={{ 
                                                        color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '4px', 
                                                        fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                    }}
                                                >
                                                    {isExpanded ? t('admin.suggestions.show_less', 'Ver menos') : t('admin.suggestions.read_more', 'Leer más')}
                                                </div>
                                            )}
                                        </div>
                                         
                                        {/* 4. Status Badge */}
                                         <div className="suggestion-status" style={{ width: '100px', display: 'flex', justifyContent: 'center' }}>
                                            <span style={{ 
                                                fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', 
                                                background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`,
                                                fontWeight: 'bold', textTransform: 'uppercase'
                                            }}>
                                                {t(`admin.suggestions.status.${s.status || 'pending'}`)}
                                            </span>
                                        </div>

                                        {/* 5. Actions */}
                                        <div className="suggestion-actions" style={{ 
                                            display: 'flex', alignItems: 'center', gap: '6px', minWidth: '160px', justifyContent: 'flex-end'
                                        }}>
                                            {(s.status !== 'approved' && s.status !== 'implemented') && (
                                                <button 
                                                    className="btn-action-icon btn-approve" 
                                                    title={t('admin.actions.approve', 'Aprobar')}
                                                    onClick={() => handleUpdateStatus(s.id, 'approved')}
                                                    style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
                                                >
                                                    <FaCheck size={14} />
                                                </button>
                                            )}
                                            {(s.status !== 'rejected') && (
                                                <button 
                                                    className="btn-action-icon btn-reject" 
                                                    title={t('admin.actions.reject', 'Rechazar')}
                                                    onClick={() => handleUpdateStatus(s.id, 'rejected')}
                                                    style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
                                                >
                                                    <FaTimes size={14} />
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={() => handleDelete(s.id)} 
                                                className="btn-ghost-delete"
                                                title="Eliminar"
                                                style={{ width: '32px', height: '32px' }}
                                            >
                                                <FaTrash size={14} />
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
                /* Base Styles */
                .admin-card-hover:hover {
                    background: rgba(30, 30, 30, 0.95) !important;
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                    border-color: rgba(255,255,255,0.15) !important;
                }
                .btn-action {
                    border: none;
                    border-radius: 8px;
                    padding: 6px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                    font-size: 0.85rem;
                    font-weight: 600;
                    flex: 1;
                }
                .btn-approve {
                    background: rgba(34, 197, 94, 0.1);
                    color: #4ade80;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }
                .btn-approve:hover {
                    background: rgba(34, 197, 94, 0.2);
                    box-shadow: 0 0 10px rgba(34, 197, 94, 0.1);
                }
                .btn-reject {
                    background: rgba(248, 113, 113, 0.1);
                    color: #f87171;
                    border: 1px solid rgba(248, 113, 113, 0.2);
                }
                .btn-reject:hover {
                    background: rgba(248, 113, 113, 0.2);
                    box-shadow: 0 0 10px rgba(248, 113, 113, 0.1);
                }
                .btn-ghost-delete {
                    background: transparent;
                    border: none;
                    color: #666;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-ghost-delete:hover {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                /* Responsive Layout */
                .suggestions-wrapper {
                    display: flex;
                    gap: 2rem;
                    align-items: flex-start;
                }
                
                @media (max-width: 900px) {
                    .suggestions-wrapper {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .suggestions-sidebar {
                        width: 100% !important;
                        position: static !important;
                        margin-bottom: 1rem;
                    }
                    .suggestion-card {
                        flex-direction: column;
                        align-items: stretch !important;
                        gap: 16px !important;
                    }
                    .suggestion-user {
                        min-width: auto !important;
                        width: 100%;
                        justify-content: space-between;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                        padding-bottom: 12px;
                    }
                    .suggestion-type {
                        width: 100% !important;
                        justify-content: flex-start !important;
                    }
                    .suggestion-content {
                        border: none !important;
                        padding: 0 !important;
                        margin: 4px 0;
                    }
                    .suggestion-status {
                        width: 100% !important;
                        justify-content: flex-start !important;
                        margin-top: 4px;
                    }
                    .suggestion-actions {
                        min-width: auto !important;
                        justify-content: flex-end !important;
                        border-top: 1px solid rgba(255,255,255,0.05);
                        padding-top: 12px;
                    }
                    .btn-action span { display: none; }
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
        </div>
    )
}
