import { useState, useEffect, useCallback } from 'react'
import { FaPoll, FaPlus, FaTimes, FaCheck, FaCheckCircle, FaSpinner, FaStopCircle, FaHistory, FaLanguage, FaEdit } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import Loader from "../UI/Loader"

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

export default function PollsManager() {
    const { t } = useTranslation()
    const [activePoll, setActivePoll] = useState<Poll | null>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('active') // 'active', 'history'

    // History State
    const [historyPolls, setHistoryPolls] = useState<Poll[]>([])
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
    
    const [translating, setTranslating] = useState<string | null>(null)

    // Fetch Active
    const fetchActive = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/polls/active`)
            if(res.ok) {
                const data = await res.json()
                setActivePoll(data.success ? data.data : data) 
            }
        } catch(err) { console.error(err) }
        finally { setLoading(false) }
    }, [])

    // Fetch History
    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true)
        try {
            const res = await fetch(`${API_URL}/polls?page=${page}&limit=10`)
            if(res.ok) {
                const data = await res.json()
                const payload = data.success ? data.data : data
                // pollService returns { data: polls, totalPages, ... }
                // so we look for payload.data
                setHistoryPolls(Array.isArray(payload.data) ? payload.data : [])
                setTotalPages(payload.totalPages || 1)
            }
        } catch (err) { console.error(err) }
        finally { setHistoryLoading(false) }
    }, [page])

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

            // Prepare Payload
            const payloadOptions = validOptions.map(o => ({
                label: o.label,
                label_en: o.labelEn
            }))

            const endpoint = editingId ? `${API_URL}/polls/update/${editingId}` : `${API_URL}/polls/create`
            const method = editingId ? 'PUT' : 'POST'

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
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
    const handleClose = async () => {
        if(!activePoll) return;
        if(!window.confirm(t('admin.polls.confirm_close'))) return
        
        try {
            await fetch(`${API_URL}/polls/close/${activePoll.id}`, { method: 'POST' })
            fetchActive()
            if(tab === 'history') fetchHistory()
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
        
        // Mark translating
        if (targetField === 'options') {
             setTranslating(`option-${index}`)
        } else {
             setTranslating(targetField)
        }

        try {
            const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        <div style={{ position: 'relative' }}>
            
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => setTab('active')}
                        className={`admin-tab-btn ${tab === 'active' ? 'active' : ''}`}
                    >
                        <FaPoll /> {t('admin.polls.tabs.active')}
                    </button>
                    <button 
                        onClick={() => setTab('history')}
                        className={`admin-tab-btn ${tab === 'history' ? 'active' : ''}`}
                    >
                        <FaHistory /> {t('admin.polls.tabs.history')}
                    </button>
                </div>

                <button 
                    onClick={() => setShowModal(true)} 
                    className="btn-primary" 
                    style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <FaPlus /> {t('admin.polls.new_btn')}
                </button>
            </div>

            {/* CONTENT */}
            {tab === 'active' ? (
                <div className="admin-card">
                     <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <FaPoll /> {t('admin.polls.active_title')}
                    </h3>

                    {loading ? (
                        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
                            <Loader style={{ height: 'auto', minHeight: '100px' }} />
                        </div>
                    ) : (
                        activePoll ? (
                            <div style={{ 
                                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                padding: '2rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Decorative Glow */}
                                <div style={{
                                    position: 'absolute', top: -50, right: -50, width: 200, height: 200,
                                    background: 'var(--accent)', opacity: 0.1, filter: 'blur(80px)', borderRadius: '50%'
                                }}></div>

                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
                                    <h4 style={{ margin:0, color:'#fff', fontSize: '2rem', fontWeight: '800', lineHeight: 1.2 }}>
                                        {activePoll.title}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                        <span className="badge" style={{
                                             background:'rgba(34, 197, 94, 0.2)', 
                                             color:'#22c55e', 
                                             border: '1px solid rgba(34, 197, 94, 0.3)',
                                             padding: '4px 10px',
                                             borderRadius: '20px',
                                             fontSize: '0.75rem',
                                             fontWeight: '800',
                                             letterSpacing: '0.5px'
                                        }}>
                                            {t('admin.polls.active_title').toUpperCase()}
                                        </span>
                                        <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                                            <button 
                                                onClick={() => handleEdit(activePoll)}
                                                className="btn-icon"
                                                style={{
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '6px',
                                                    padding: '4px 8px',
                                                    cursor: 'pointer',
                                                    color: '#fff',
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    fontSize: '0.8rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                title={t('admin.polls.edit_btn')}
                                            >
                                                <FaEdit /> {t('admin.polls.edit_btn')}
                                            </button>
                                            <span style={{fontSize:'0.8rem', color:'#aaa', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                <FaHistory size={10} /> {t('admin.polls.ends_in')} <span style={{color: '#fff', fontWeight: 'bold'}}>{activePoll.closesIn}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <p style={{ marginBottom:'2.5rem', fontSize:'1.1rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '80%' }}>
                                    {activePoll.question}
                                </p>

                                <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem', marginBottom:'2.5rem' }}>
                                    {activePoll.options && Array.isArray(activePoll.options) && activePoll.options.map((opt, idx) => (
                                        <div key={opt.id || idx} style={{ position: 'relative' }}>
                                            {/* Bar Background */}
                                            <div style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: '8px',
                                                height: '48px',
                                                width: '100%',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                {/* Progress Fill */}
                                                <div style={{
                                                    position: 'absolute', top: 0, left: 0, bottom: 0,
                                                    width: `${opt.percent || 0}%`,
                                                    background: opt.percent && opt.percent > 0 ? 'var(--accent)' : 'transparent',
                                                    opacity: 0.15,
                                                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}></div>

                                                 {/* Progress Line */}
                                                 <div style={{
                                                    position: 'absolute', bottom: 0, left: 0,
                                                    width: `${opt.percent || 0}%`,
                                                    height: '2px',
                                                    background: 'var(--accent)',
                                                    boxShadow: '0 0 10px var(--accent)',
                                                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}></div>

                                                {/* Content */}
                                                <div style={{
                                                    position: 'absolute', inset: 0,
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '0 1.2rem'
                                                }}>
                                                    <span style={{ fontSize: '1rem', fontWeight: '500', color: '#fff', zIndex: 2 }}>{opt.label}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{opt.votes} {t('admin.polls.votes')}</span>
                                                        <span style={{ fontWeight:'bold', color: 'var(--accent)', fontSize: '1.1rem', minWidth: '45px', textAlign: 'right' }}>{opt.percent}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ marginTop:'0.5rem', textAlign:'right', color:'#64748b', fontSize:'0.9rem', fontWeight: '500' }}>
                                        {t('admin.polls.total_votes', {count: activePoll.totalVotes})}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <button 
                                        onClick={handleClose} 
                                        className="btn-secondary" 
                                        style={{
                                            borderColor:'rgba(239, 68, 68, 0.5)', 
                                            color:'#ef4444', 
                                            padding: '0.8rem 2rem',
                                            background: 'rgba(239, 68, 68, 0.05)',
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                                            e.currentTarget.style.borderColor = '#ef4444'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'
                                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
                                        }}
                                    >
                                        <FaStopCircle /> {t('admin.polls.close_btn')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{textAlign:'center', padding:'5rem 2rem', color:'#666', border:'2px dashed #333', borderRadius:'8px'}}>
                                <FaPoll size={48} style={{marginBottom:'1rem', opacity: 0.5}}/>
                                <p style={{ fontSize: '1.2rem' }}>{t('admin.polls.no_active')}</p>
                                <button onClick={() => setShowModal(true)} className="btn-primary" style={{ marginTop: '1rem' }}>
                                    {t('admin.polls.create_now_btn')}
                                </button>
                            </div>
                        )
                    )}
                </div>
            ) : (
                <div className="admin-card">
                    <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <FaHistory /> {t('admin.polls.history_title')}
                    </h3>
                    
                    {historyLoading ? (
                        <Loader 
                            text={t('admin.polls.loading_history')}
                            style={{ height: 'auto', minHeight: '150px' }} 
                        />
                    ) : (
                        <div className="admin-table-container" style={{ overflow: 'auto' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>{t('admin.polls.table.title')}</th>
                                        <th>{t('admin.polls.table.date')}</th>
                                        <th>{t('admin.polls.table.votes')}</th>
                                        <th>{t('admin.polls.table.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(historyPolls) && historyPolls.map(poll => (
                                        <tr key={poll.id}>
                                            <td style={{fontWeight: '500'}}>{poll.title}</td>
                                            <td style={{color:'#888'}}>{poll.created_at ? new Date(poll.created_at).toLocaleDateString() : '-'}</td>
                                            <td>{poll.totalVotes}</td>
                                            <td>
                                                <span className={`status-chip ${poll.is_active ? 'active' : 'inactive'}`} style={{
                                                    background: poll.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                                    color: poll.is_active ? '#22c55e' : '#aaa',
                                                    padding: '2px 8px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold'
                                                }}>
                                                    {poll.is_active ? t('admin.polls.status_chip.active') : t('admin.polls.status_chip.closed')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {historyPolls.length === 0 && (
                                        <tr><td colSpan={4} style={{textAlign:'center', padding:'2rem'}}>{t('admin.polls.no_history')}</td></tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', padding: '1rem 0' }}>
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="admin-tab-btn">&lt;</button>
                                    <span style={{ display: 'flex', alignItems: 'center', color: '#888' }}>{t('admin.polls.pagination', { page, total: totalPages })}</span>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="admin-tab-btn">&gt;</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL: CREATE NEW */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="admin-card modal-content" style={{ maxWidth: '600px', width: '90%' }}>
                        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                                <FaCheckCircle /> {t('admin.polls.create_title')}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem', display: 'flex' }}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                            <form onSubmit={(e) => { handleCreate(e); }}>
                                {/* TITLE */}
                                <div className="form-group">
                                    <label className="admin-label">{t('admin.polls.form_extras.title_es')}</label>
                                    <input className="admin-input" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('admin.polls.form.title_ph')} required />
                                </div>
                                <div className="form-group">
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                         <label className="admin-label">{t('admin.polls.form_extras.title_en')}</label>
                                         <button type="button" onClick={() => handleTranslate(title, 'title')} className="btn-secondary" style={{fontSize:'0.8rem', padding:'0.2rem 0.6rem', marginBottom:'0.5rem'}} disabled={translating === 'title'}>
                                             {translating === 'title' ? <FaSpinner className="spin"/> : <><FaLanguage /> {t('admin.polls.form_extras.translate')}</>}
                                         </button>
                                    </div>
                                    <input className="admin-input" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Poll Title" />
                                </div>
                                
                                {/* QUESTION */}
                                <div className="form-group">
                                    <label className="admin-label">{t('admin.polls.form_extras.question_es')}</label>
                                    <textarea className="admin-input" value={question} onChange={e => setQuestion(e.target.value)} placeholder={t('admin.polls.form.question_ph')} required rows={3} style={{resize:'vertical'}}></textarea>
                                </div>
                                <div className="form-group">
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                         <label className="admin-label">{t('admin.polls.form_extras.question_en')}</label>
                                         <button type="button" onClick={() => handleTranslate(question, 'question')} className="btn-secondary" style={{fontSize:'0.8rem', padding:'0.2rem 0.6rem', marginBottom:'0.5rem'}} disabled={translating === 'question'}>
                                             {translating === 'question' ? <FaSpinner className="spin"/> : <><FaLanguage /> {t('admin.polls.form_extras.translate')}</>}
                                         </button>
                                    </div>
                                    <textarea className="admin-input" value={questionEn} onChange={e => setQuestionEn(e.target.value)} placeholder="Poll Question" rows={3} style={{resize:'vertical'}}></textarea>
                                </div>

                                {/* OPTIONS */}
                                <div className="form-group">
                                    <label className="admin-label">{t('admin.polls.form.options')}</label>
                                    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                                        {options.map((opt, idx) => (
                                            <div key={idx} style={{background:'rgba(255,255,255,0.03)', padding:'0.8rem', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.05)'}}>
                                                <div style={{display:'flex', gap:'0.5rem', alignItems: 'flex-start'}}>
                                                    <div style={{
                                                        background: 'rgba(255,255,255,0.05)', 
                                                        height: '42px', 
                                                        width: '42px', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        borderRadius: '4px',
                                                        color: '#888',
                                                        fontWeight: 'bold',
                                                        flexShrink: 0
                                                    }}>
                                                        {idx + 1}
                                                    </div>
                                                    
                                                    <div style={{flex:1, display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                                                        <input 
                                                            className="admin-input" 
                                                            value={opt.label} 
                                                            onChange={e => updateOption(idx, 'label', e.target.value)} 
                                                            placeholder={t('admin.polls.form_extras.option_es')}
                                                            required
                                                        />
                                                        <div style={{display:'flex', gap:'0.5rem'}}>
                                                             <input 
                                                                 className="admin-input" 
                                                                 value={opt.labelEn} 
                                                                 onChange={e => updateOption(idx, 'labelEn', e.target.value)} 
                                                                 placeholder={t('admin.polls.form_extras.option_en')}
                                                             />
                                                             <button type="button" onClick={() => handleTranslate(opt.label, 'options', idx)} className="btn-secondary" style={{padding:'0 0.8rem'}} disabled={translating === `option-${idx}`}>
                                                                 {translating === `option-${idx}` ? <FaSpinner className="spin"/> : <FaLanguage />}
                                                             </button>
                                                        </div>
                                                    </div>

                                                    {options.length > 2 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeOption(idx)} 
                                                            className="btn-icon delete" 
                                                            style={{
                                                                height:'42px', 
                                                                width:'42px', 
                                                                display: 'flex', 
                                                                justifyContent: 'center', 
                                                                alignItems: 'center',
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                color: '#ef4444',
                                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                flexShrink: 0
                                                            }}
                                                            title={t('admin.polls.form_extras.delete_option')}
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => setOptions([...options, {label: '', labelEn: ''}])} className="btn-secondary" style={{marginTop:'0.5rem', width:'100%'}}>
                                        <FaPlus /> {t('admin.polls.form.add_option')}
                                    </button>
                                </div>

                                <div className="form-group">
                                    <label className="admin-label">{t('admin.polls.form.duration')}</label>
                                    <input className="admin-input" type="number" min="1" max="30" value={daysDuration} onChange={e => setDaysDuration(parseInt(e.target.value))} />
                                </div>

                                <div style={{marginTop:'2rem', paddingTop:'1rem', borderTop:'1px solid #333'}}>
                                    {activePoll && <p style={{color:'#facc15', fontSize:'0.9rem', marginBottom:'1rem'}}>{t('admin.polls.form.warning_active')}</p>}
                                    
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                            {t('admin.polls.form_extras.cancel')}
                                        </button>
                                        <button type="submit" className="btn-primary" style={{ background: buttonSuccess ? '#22c55e' : '', borderColor: buttonSuccess ? '#22c55e' : ''}} disabled={creating || buttonSuccess}>
                                            {creating ? <FaSpinner className="spin" /> : buttonSuccess ? (
                                                <><FaCheck /> {t('admin.polls.form.success')}</>
                                            ) : t('admin.polls.form.submit')}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
