import { useState, useEffect } from 'react'
import { FaTrash, FaInbox, FaFilter, FaGavel } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import Loader from "../UI/Loader"

const API_URL = import.meta.env.VITE_API_URL || '/api'

interface Suggestion {
    id: number;
    type: string;
    nickname: string;
    message: string;
    created_at: string;
}

export default function SuggestionsManager() {
    const { t } = useTranslation()
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(true)

    const [filterType, setFilterType] = useState('All')

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

    const filteredSuggestions = suggestions.filter(s => 
        filterType === 'All' ? true : s.type.toLowerCase() === filterType.toLowerCase()
    )

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaInbox /> {t('admin.suggestions.title')}
                </h3>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <FaFilter color="#666" />
                    <select 
                        value={filterType} 
                        onChange={e => setFilterType(e.target.value)}
                        className="admin-input" 
                        style={{ width: '150px', marginBottom: 0 }}
                    >
                        <option value="All">{t('admin.suggestions.filter_all')}</option>
                        <option value="Bug">{t('admin.suggestions.filter_bug')}</option>
                        <option value="Feature">{t('admin.suggestions.filter_feature')}</option>
                        <option value="Mod">{t('admin.suggestions.filter_mod')}</option>
                        <option value="Other">{t('admin.suggestions.filter_other')}</option>
                    </select>
                </div>
            </div>
            
            {loading ? (
                <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Loader text="" style={{ height: 'auto', minHeight: '100px' }} />
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>{t('admin.suggestions.loading')}</span>
                </div>
            ) : (
                <div className="admin-table-container" style={{ overflow: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{width:'120px'}}>{t('admin.suggestions.table.date')}</th>
                                <th style={{width:'100px'}}>{t('admin.suggestions.table.type')}</th>
                                <th style={{width:'150px'}}>{t('admin.suggestions.table.user')}</th>
                                <th>{t('admin.suggestions.table.message')}</th>
                                <th style={{width:'120px'}}>{t('admin.suggestions.table.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuggestions.map(s => (
                                <tr key={s.id}>
                                    <td style={{fontSize:'0.85rem', color:'#aaa'}}>{new Date(s.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold',
                                            background: s.type === 'Bug' ? '#ef4444' : s.type === 'Mod' ? '#3b82f6' : '#22c55e',
                                            color: '#000',
                                            whiteSpace: 'nowrap',
                                            display: 'inline-block'
                                        }}>
                                            {s.type}
                                        </span>
                                    </td>
                                    <td style={{fontWeight:'bold', color: s.nickname==='Anónimo'?'#666':'#fff'}}>{s.nickname}</td>
                                    <td style={{maxWidth:'300px', whiteSpace:'pre-wrap'}}>{s.message}</td>
                                    <td>
                                        <div style={{display:'flex', gap:'0.5rem'}}>
                                            <button 
                                                className="btn-icon" 
                                                title={t('admin.suggestions.actions_disciplinaries')}
                                                onClick={() => alert('Funcionalidad en desarrollo: Acciones Disciplinarias')}
                                                style={{color: '#f59e0b'}}
                                            >
                                                <FaGavel />
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} className="btn-icon delete" title={t('admin.suggestions.delete_tooltip')}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {suggestions.length === 0 && <p style={{textAlign:'center', padding:'2rem', color:'#666'}}>{t('admin.suggestions.empty')}</p>}
                </div>
            )}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="admin-card modal-content" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#fff' }}>{t('admin.suggestions.delete_modal.title')}</h3>
                        <p style={{ marginBottom: '2rem', color: '#ccc' }}>{t('admin.suggestions.delete_modal.desc')}</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setShowDeleteModal(false)} className="btn-secondary" style={{ minWidth: '100px' }}>
                                {t('admin.suggestions.delete_modal.cancel')}
                            </button>
                            <button onClick={confirmDelete} className="btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444', minWidth: '100px' }}>
                                {t('admin.suggestions.delete_modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
