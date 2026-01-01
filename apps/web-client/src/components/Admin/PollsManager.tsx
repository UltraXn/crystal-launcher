import { useState, useEffect, useCallback } from 'react'
import { FaPoll, FaPlus, FaTimes, FaCheck, FaSpinner, FaStopCircle, FaHistory, FaLanguage, FaEdit, FaTrash, FaChartBar } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import Loader from "../UI/Loader"
import { supabase } from "../../services/supabaseClient"
import { getAuthHeaders } from "../../services/adminAuth"

const API_URL = import.meta.env.VITE_API_URL || '/api'

interface PollOption {
    id?: number;
    label: string;
    label_en?: string;
    votes?: number;
    percent?: number;
}

interface Poll {
    id: number;
    title: string;
    title_en?: string;
    question: string;
    question_en?: string;
    options: PollOption[];
    closesIn?: string;
    totalVotes?: number;
    created_at?: string;
    is_active?: boolean;
    closes_at?: string;
}

interface PollsManagerProps {
    mockActivePoll?: Poll | null;
    mockHistoryPolls?: Poll[];
}

export default function PollsManager({ mockActivePoll, mockHistoryPolls }: PollsManagerProps = {}) {
    const { t } = useTranslation()
    const [activePoll, setActivePoll] = useState<Poll | null>(mockActivePoll !== undefined ? mockActivePoll : null)
    const [loading, setLoading] = useState(mockActivePoll === undefined) // Only load if no mock provided
    const [tab, setTab] = useState('active') // 'active', 'history'

    // History State
    const [historyPolls, setHistoryPolls] = useState<Poll[]>(mockHistoryPolls || [])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Form
    const [title, setTitle] = useState('')
    const [titleEn, setTitleEn] = useState('')
    const [question, setQuestion] = useState('')
    const [questionEn, setQuestionEn] = useState('')
    const [options, setOptions] = useState<{label: string, labelEn: string}[]>([{label: '', labelEn: ''}, {label: '', labelEn: ''}])
    const [creating, setCreating] = useState(false)
    const [daysDuration, setDaysDuration] = useState(7)
    const [buttonSuccess, setButtonSuccess] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    
    // Delete State
    const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null)
    
    const [translating, setTranslating] = useState<string | null>(null)

    // Fetch Active
    const fetchActive = useCallback(async () => {
        if (mockActivePoll !== undefined) return;
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/polls/active`)
            if(res.ok) {
                const data = await res.json()
                setActivePoll(data.success ? data.data : data) 
            }
        } catch(err) { console.error(err) }
        finally { setLoading(false) }
    }, [mockActivePoll])

    // Fetch History
    const fetchHistory = useCallback(async () => {
        if (mockHistoryPolls) return;
        setHistoryLoading(true)
        try {
            const res = await fetch(`${API_URL}/polls?page=${page}&limit=10`)
            if(res.ok) {
                const data = await res.json()
                const payload = data.success ? data.data : data
                setHistoryPolls(Array.isArray(payload.data) ? payload.data : [])
                setTotalPages(payload.totalPages || 1)
            }
        } catch (err) { console.error(err) }
        finally { setHistoryLoading(false) }
    }, [page, mockHistoryPolls])

    useEffect(() => { 
        if(tab === 'active') fetchActive()
        if(tab === 'history') fetchHistory()
    }, [tab, page, fetchActive, fetchHistory])

    // Edit Handler
    const handleEdit = (poll: Poll) => {
        setTitle(poll.title)
        setTitleEn(poll.title_en || '')
        setQuestion(poll.question)
        setQuestionEn(poll.question_en || '')
        
        const mappedOptions = poll.options.map(o => ({
            label: o.label,
            labelEn: o.label_en || ''
        }))
        
        // Ensure at least 2 options
        while(mappedOptions.length < 2) {
             mappedOptions.push({label: '', labelEn: ''})
        }

        setOptions(mappedOptions)
        setEditingId(poll.id)
        setShowModal(true)
    }

    // Reset Form
    const resetForm = () => {
         setTitle('')
         setTitleEn('')
         setQuestion('')
         setQuestionEn('')
         setOptions([{label: '', labelEn: ''}, {label: '', labelEn: ''}])
         setEditingId(null)
    }

    // Create/Edit Handler
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        try {
            const validOptions = options.filter(o => o.label.trim() !== '')
            if (validOptions.length < 2) {
                alert(t('admin.polls.form.error_options'))
                setCreating(false)
                return
            }

            const closesAt = new Date(Date.now() + daysDuration * 24 * 60 * 60 * 1000).toISOString()
            const payloadOptions = validOptions.map(o => ({
                label: o.label,
                label_en: o.labelEn
            }))

            const endpoint = editingId ? `${API_URL}/polls/update/${editingId}` : `${API_URL}/polls/create`
            const method = editingId ? 'PUT' : 'POST'

            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session) {
                alert("No active session. Please log in again.");
                setCreating(false);
                return;
            }

            const res = await fetch(endpoint, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session.access_token)
                },
                body: JSON.stringify({ 
                    title, 
                    title_en: titleEn, 
                    question, 
                    question_en: questionEn,
                    options: payloadOptions,
                    closes_at: closesAt
                })
            })
            
            if(res.ok) {
                resetForm()
                fetchActive()
                if (tab === 'history') fetchHistory()
                setButtonSuccess(true)
                setTimeout(() => {
                    setButtonSuccess(false)
                    setShowModal(false)
                }, 1500)
            } else {
                alert(t('admin.polls.form.error_create'))
            }
        } catch(err) { console.error(err) }
        finally { setCreating(false) }
    }

    // Close Handler
    const handleClose = async (id: number) => {
        if(!window.confirm(t('admin.polls.confirm_close'))) return
        
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await fetch(`${API_URL}/polls/close/${id}`, { 
                method: 'POST',
                headers: getAuthHeaders(session?.access_token || null)
            })
            fetchActive()
            if(tab === 'history') fetchHistory()
        } catch(err) { console.error(err) }
    }

    // Delete Handler
    const handleDelete = async (id: number) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                alert("No active session. Please log in.");
                return;
            }

            const res = await fetch(`${API_URL}/polls/${id}`, { 
                method: 'DELETE',
                headers: getAuthHeaders(session.access_token)
            })
            
            if (res.ok) {
                if (activePoll?.id === id) setActivePoll(null)
                fetchHistory()
                setShowDeleteModal(null)
            } else if (res.status === 404) {
                 alert("Error: Delete endpoint not found. Backend does not support deletion yet.")
            } else {
                alert("Error al eliminar encuesta")
            }
        } catch(err) { console.error(err) }
    }

    const updateOption = (idx: number, field: 'label' | 'labelEn', val: string) => {
        const newOpts = [...options]
        newOpts[idx] = { ...newOpts[idx], [field]: val }
        setOptions(newOpts)
    }

    const removeOption = (idx: number) => {
        const newOpts = options.filter((_, i) => i !== idx)
        setOptions(newOpts)
    }

    // Translation Handler
    const handleTranslate = async (sourceText: string, targetField: string, index?: number) => {
        if (!sourceText) return
        
        if (targetField === 'options') {
             setTranslating(`option-${index}`)
        } else {
             setTranslating(targetField)
        }

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ text: sourceText, targetLang: 'en' })
            })
            
            if (res.ok) {
                const data = await res.json()
                const translated = data.translatedText || ''
                
                if (targetField === 'title') setTitleEn(translated)
                else if (targetField === 'question') setQuestionEn(translated)
                else if (targetField === 'options' && index !== undefined) {
                    updateOption(index, 'labelEn', translated)
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setTranslating(null)
        }
    }

    return (
        <div className="poll-manager-container">
            
            {/* HEADER */}
            <div className="poll-header">
                <div className="poll-tabs-wrapper">
                    <button 
                        onClick={() => setTab('active')}
                        className={`poll-tab-btn ${tab === 'active' ? 'active' : ''}`}
                    >
                        <FaPoll /> {t('admin.polls.tabs.active')}
                    </button>
                    <button 
                        onClick={() => setTab('history')}
                        className={`poll-tab-btn ${tab === 'history' ? 'active' : ''}`}
                    >
                        <FaHistory /> {t('admin.polls.tabs.history')}
                    </button>
                </div>

                <button 
                    onClick={() => { resetForm(); setShowModal(true); }} 
                    className="btn-primary poll-new-btn" 
                >
                    <FaPlus /> {t('admin.polls.new_btn')}
                </button>
            </div>

            {/* CONTENT */}
            {tab === 'active' ? (
                <>
                    {loading ? (
                        <div style={{ padding: '6rem', display: 'flex', justifyContent: 'center' }}>
                            <Loader style={{ height: 'auto', minHeight: '100px' }} />
                        </div>
                    ) : (
                        activePoll ? (
                            <div className="poll-active-card">
                                <div className="poll-card-accent"></div>
                                {/* Decorative elements */}
                                <div className="deco-blob-1"></div>
                                <div className="deco-blob-2"></div>

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2.5rem' }}>
                                        <div>
                                            <div className="poll-active-badge">
                                                <div className="status-dot-pulse"></div>
                                                {t('admin.polls.active_title')}
                                            </div>
                                            <h2 className="poll-h2">
                                                {activePoll.title}
                                            </h2>
                                            <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800', letterSpacing: '0.5px' }}>
                                                {t('admin.polls.ends_in', 'Finaliza en')}: <span style={{ color: 'var(--accent)' }}>{activePoll.closesIn}</span>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button 
                                                onClick={() => handleEdit(activePoll)}
                                                className="poll-btn-action"
                                                title={t('admin.polls.edit_btn')}
                                            >
                                                <FaEdit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => setShowDeleteModal(activePoll.id)}
                                                className="poll-btn-action delete"
                                                title={t('admin.polls.delete_tooltip')}
                                            >
                                                <FaTrash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <p className="poll-question">
                                        {activePoll.question}
                                    </p>

                                    <div style={{ display:'flex', flexDirection:'column', gap:'1.75rem', marginBottom:'3.5rem' }}>
                                        {activePoll.options && Array.isArray(activePoll.options) && activePoll.options.map((opt, idx) => (
                                            <div key={opt.id || idx} className="poll-option-bar">
                                                {/* Progress Fill */}
                                                <div className="poll-option-fill" style={{ width: `${opt.percent || 0}%` }}></div>

                                                {/* Progress Line */}
                                                <div className="poll-option-line" style={{ width: `${opt.percent || 0}%` }}></div>

                                                {/* Content */}
                                                <div className="poll-option-content">
                                                    <span className="poll-option-label">{opt.label}</span>
                                                    <div className="poll-option-stats">
                                                        <span className="poll-votes-count">{opt.votes} {t('admin.polls.votes')}</span>
                                                        <span className="poll-percent">{opt.percent}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="poll-active-footer">
                                        <div className="poll-total-votes">
                                            <FaChartBar size={20} />
                                            {t('admin.polls.total_votes', {count: activePoll.totalVotes})}
                                        </div>
                                        <button 
                                            onClick={() => handleClose(activePoll.id)} 
                                            className="poll-btn-close" 
                                        >
                                            <FaStopCircle size={20} /> {t('admin.polls.close_btn')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="poll-empty-state">
                                <div className="poll-empty-icon-wrapper">
                                    <FaPoll size={48} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>{t('admin.polls.no_active')}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
                                        {t('admin.polls.no_active_desc', 'No hay encuestas activas en este momento. ¡Crea una para interactuar con la comunidad!')}
                                    </p>
                                    <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
                                        <FaPlus style={{ marginRight: '10px' }} /> {t('admin.polls.create_now_btn')}
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </>
            ) : (
                <div className="poll-history-container">
                    <div className="poll-table-header">
                        <FaHistory size={24} style={{ color: 'var(--accent)' }} />
                        <h3>{t('admin.polls.history_title')}</h3>
                    </div>
                    
                    {historyLoading ? (
                        <div style={{ padding: '4rem 0' }}>
                            <Loader 
                                text={t('admin.polls.loading_history')}
                                style={{ height: 'auto', minHeight: '150px' }} 
                            />
                        </div>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>{t('admin.polls.table.title')}</th>
                                        <th>{t('admin.polls.table.date')}</th>
                                        <th>{t('admin.polls.table.votes')}</th>
                                        <th>{t('admin.polls.table.status')}</th>
                                        <th style={{ textAlign: 'right' }}>{t('admin.polls.table.actions', 'Acciones')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(historyPolls) && historyPolls.map(poll => (
                                        <tr key={poll.id}>
                                            <td style={{ fontWeight: '800', color: '#fff', fontSize: '1.05rem' }}>{poll.title}</td>
                                            <td style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                                                {poll.created_at ? new Date(poll.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: '900', color: 'var(--accent)' }}>{poll.totalVotes}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginLeft: '6px', textTransform: 'uppercase' }}>{t('admin.polls.votes')}</span>
                                            </td>
                                            <td>
                                                <span className={`status-chip ${poll.is_active ? 'active' : 'inactive'}`} style={{
                                                    background: poll.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                                    color: poll.is_active ? '#4ade80' : 'rgba(255,255,255,0.3)',
                                                    border: `1px solid ${poll.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                                                }}>
                                                    {poll.is_active ? t('admin.polls.status_chip.active') : t('admin.polls.status_chip.closed')}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                    {poll.is_active && (
                                                        <button 
                                                            onClick={() => handleClose(poll.id)}
                                                            title={t('admin.polls.close_btn')}
                                                            className="poll-btn-action"
                                                        >
                                                            <FaStopCircle />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => setShowDeleteModal(poll.id)}
                                                        title={t('admin.polls.delete_tooltip')}
                                                        className="poll-btn-action delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {historyPolls.length === 0 && (
                                        <tr><td colSpan={5} style={{textAlign:'center', padding:'6rem', color: 'rgba(255,255,255,0.2)', fontWeight: '700'}}>{t('admin.polls.no_history')}</td></tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="poll-tab-btn" style={{ padding: '0.5rem 1rem' }}>&lt;</button>
                                    <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>{t('admin.polls.pagination', { page, total: totalPages })}</span>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="poll-tab-btn" style={{ padding: '0.5rem 1rem' }}>&gt;</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL: CREATE / EDIT */}
            {showModal && (
                <div className="sync-modal-overlay">
                    <div className="sync-modal-content poll-modal-content" style={{ maxWidth: '750px' }}>
                        <div className="modal-accent-line"></div>
                        
                        <div className="poll-form-header">
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '1.5rem', fontWeight: '900' }}>
                                <FaPoll style={{ color: 'var(--accent)' }} />
                                {editingId ? t('admin.polls.edit_title', 'Editar Encuesta') : t('admin.polls.create_title')}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="btn-close-mini">
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="poll-form-body" style={{ overflowY: 'auto', maxHeight: '75vh' }}>
                            <form onSubmit={(e) => { handleCreate(e); }} className="poll-form-container">
                                
                                <div className="poll-form-row">
                                    <div className="form-group">
                                        <label className="admin-label-premium">{t('admin.polls.form_extras.title_es')}</label>
                                        <input className="admin-input-premium" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('admin.polls.form.title_ph')} required />
                                    </div>
                                    <div className="form-group">
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                             <label className="admin-label-premium">{t('admin.polls.form_extras.title_en')}</label>
                                             <button type="button" onClick={() => handleTranslate(title, 'title')} className="btn-secondary" style={{fontSize:'0.7rem', padding:'0.2rem 0.6rem', marginBottom:'0.5rem'}} disabled={translating === 'title'}>
                                                 {translating === 'title' ? <FaSpinner className="spin"/> : <><FaLanguage /> {t('admin.polls.form_extras.translate')}</>}
                                             </button>
                                        </div>
                                        <input className="admin-input-premium" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Poll Title" />
                                    </div>
                                </div>
                                
                                <div className="poll-form-row">
                                    <div className="form-group">
                                        <label className="admin-label-premium">{t('admin.polls.form_extras.question_es')}</label>
                                        <textarea className="admin-textarea-premium" value={question} onChange={e => setQuestion(e.target.value)} placeholder={t('admin.polls.form.question_ph')} required rows={3}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                             <label className="admin-label-premium">{t('admin.polls.form_extras.question_en')}</label>
                                             <button type="button" onClick={() => handleTranslate(question, 'question')} className="btn-secondary" style={{fontSize:'0.7rem', padding:'0.2rem 0.6rem', marginBottom:'0.5rem'}} disabled={translating === 'question'}>
                                                 {translating === 'question' ? <FaSpinner className="spin"/> : <><FaLanguage /> {t('admin.polls.form_extras.translate')}</>}
                                             </button>
                                        </div>
                                        <textarea className="admin-textarea-premium" value={questionEn} onChange={e => setQuestionEn(e.target.value)} placeholder="Poll Question" rows={3}></textarea>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="admin-label-premium">{t('admin.polls.form.options')}</label>
                                    <div className="poll-options-grid">
                                        {options.map((opt, idx) => (
                                            <div key={idx} className="poll-option-edit-card">
                                                <div className="poll-option-index">{idx + 1}</div>
                                                
                                                <div className="poll-option-inputs">
                                                    <input 
                                                        className="admin-input-premium" 
                                                        value={opt.label} 
                                                        onChange={e => updateOption(idx, 'label', e.target.value)} 
                                                        placeholder={t('admin.polls.form_extras.option_es')}
                                                        required
                                                    />
                                                    <div style={{display:'flex', gap:'10px'}}>
                                                         <input 
                                                             className="admin-input-premium" 
                                                             value={opt.labelEn} 
                                                             onChange={e => updateOption(idx, 'labelEn', e.target.value)} 
                                                             placeholder={t('admin.polls.form_extras.option_en')}
                                                         />
                                                         <button type="button" onClick={() => handleTranslate(opt.label, 'options', idx)} className="btn-secondary" style={{padding:'0 1rem', borderRadius: '12px'}} disabled={translating === `option-${idx}`}>
                                                             {translating === `option-${idx}` ? <FaSpinner className="spin"/> : <FaLanguage size={18} />}
                                                         </button>
                                                    </div>
                                                </div>

                                                {options.length > 2 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeOption(idx)} 
                                                        className="poll-btn-action delete"
                                                        style={{ height: '42px' }}
                                                        title={t('admin.polls.form_extras.delete_option')}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => setOptions([...options, {label: '', labelEn: ''}])} className="btn-secondary" style={{marginTop:'1.5rem', width:'100%', height: '50px', borderRadius: '16px', fontWeight: '800'}}>
                                        <FaPlus style={{ marginRight: '10px' }} /> {t('admin.polls.form.add_option')}
                                    </button>
                                </div>

                                <div className="poll-form-row">
                                    <div className="form-group">
                                        <label className="admin-label-premium">{t('admin.polls.form.duration')} ({t('admin.polls.form.days', 'días')})</label>
                                        <input className="admin-input-premium" type="number" min="1" max="30" value={daysDuration} onChange={e => setDaysDuration(parseInt(e.target.value))} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                         {activePoll && !editingId && (
                                            <div style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(250, 204, 21, 0.2)', fontSize: '0.85rem', fontWeight: '700', lineHeight: '1.4' }}>
                                                {t('admin.polls.form.warning_active')}
                                            </div>
                                         )}
                                    </div>
                                </div>

                                <div className="poll-form-footer">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ height: '50px', padding: '0 2rem' }}>
                                        {t('admin.polls.form_extras.cancel')}
                                    </button>
                                    <button type="submit" className="modal-btn-primary" style={{ height: '50px', padding: '0 2.5rem', background: buttonSuccess ? '#22c55e' : ''}} disabled={creating || buttonSuccess}>
                                        {creating ? <FaSpinner className="spin" /> : buttonSuccess ? (
                                            <><FaCheck /> {t('admin.polls.form.success')}</>
                                        ) : (
                                            <><FaCheck /> {editingId ? t('admin.polls.form.update', 'Actualizar') : t('admin.polls.form.submit')}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: DELETE CONFIRMATION */}
            {showDeleteModal && (
                <div className="sync-modal-overlay">
                    <div className="sync-modal-content" style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem' }}>
                        <div className="modal-accent-line" style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }}></div>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', fontSize: '2rem' }}>
                            <FaTrash />
                        </div>
                        <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.75rem', fontWeight: '900' }}>
                           {t('admin.polls.delete_confirm_title', '¿Eliminar Encuesta?')}
                        </h3>
                        <p style={{ marginBottom: '2.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: '1.6', fontWeight: '500' }}>
                            {t('admin.polls.delete_confirm_desc', 'Esta acción no se puede deshacer y todos los votos acumulados se perderán permanentemente.')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setShowDeleteModal(null)} className="modal-btn-secondary" style={{ flex: 1 }}>
                                {t('admin.polls.form_extras.cancel')}
                            </button>
                            <button onClick={() => handleDelete(showDeleteModal)} className="modal-btn-primary" style={{ background: '#ef4444', color: '#fff', flex: 1, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)' }}>
                                {t('admin.polls.delete_btn', 'Eliminar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
