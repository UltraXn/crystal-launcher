import { useState, useEffect } from 'react'
import { FaSave, FaExclamationTriangle, FaShieldAlt, FaFileContract, FaSync, FaCheck } from 'react-icons/fa'
import { getPolicies, getPolicy, updatePolicy, Policy } from '../../../services/policyService'
import { useTranslation } from 'react-i18next'
import Loader from '../../UI/Loader'

export default function PoliciesManager() {
    const { t } = useTranslation()
    const [policies, setPolicies] = useState<Policy[]>([])
    const [selectedSlug, setSelectedSlug] = useState<string>('privacy')
    const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    // Form state
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    useEffect(() => {
        fetchPolicies()
    }, [])

    useEffect(() => {
        if (selectedSlug) {
            fetchPolicyDetail(selectedSlug)
        }
    }, [selectedSlug])

    const fetchPolicies = async () => {
        try {
            setLoading(true)
            const data = await getPolicies()
            setPolicies(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchPolicyDetail = async (slug: string) => {
        try {
            setLoading(true)
            const data = await getPolicy(slug)
            setCurrentPolicy(data)
            setTitle(data.title)
            setContent(data.content)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!selectedSlug) return
        try {
            setSaving(true)
            setMessage(null)
            await updatePolicy(selectedSlug, title, content)
            setMessage({ text: t('admin.settings.policies.save_success', 'Política actualizada con éxito'), type: 'success' })
            fetchPolicies() // Refresh list
        } catch (err) {
            console.error(err)
            setMessage({ text: t('admin.settings.policies.save_error', 'Error al guardar la política'), type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    if (loading && policies.length === 0) return <Loader />

    return (
        <div className="policies-manager">
            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                
                {/* Sidebar Selector */}
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                        {t('admin.settings.policies.select_title', 'Documentos Legales')}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {policies.map(p => (
                            <button
                                key={p.slug}
                                onClick={() => setSelectedSlug(p.slug)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '0.8rem 1rem',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: selectedSlug === p.slug ? 'var(--accent)' : 'transparent',
                                    color: selectedSlug === p.slug ? '#000' : '#fff',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontWeight: selectedSlug === p.slug ? 'bold' : 'normal',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {p.slug === 'privacy' ? <FaShieldAlt /> : <FaFileContract />}
                                <span>{p.slug.toUpperCase()}</span>
                            </button>
                        ))}
                    </div>
                    
                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,165,0,0.05)', borderRadius: '8px', border: '1px solid rgba(255,165,0,0.2)' }}>
                        <div style={{ display: 'flex', gap: '10px', color: '#ffa500', marginBottom: '0.5rem' }}>
                            <FaExclamationTriangle />
                            <strong style={{ fontSize: '0.85rem' }}>Draft Mode</strong>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>
                            {t('admin.settings.policies.warning', 'Los cambios se reflejan inmediatamente en la web pública.')}
                        </p>
                    </div>
                </div>

                {/* Editor Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {currentPolicy ? (
                        <>
                            <div className="admin-card" style={{ margin: 0, padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                                        {t('admin.settings.policies.field_title', 'Título del Documento')}
                                    </label>
                                    <input
                                        className="admin-input"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        style={{ width: '100%', fontSize: '1.2rem', fontWeight: 'bold' }}
                                    />
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                                            {t('admin.settings.policies.field_content', 'Contenido (Markdown)')}
                                        </label>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--accent)', opacity: 0.7 }}>Markdown Soportado</span>
                                    </div>
                                    <textarea
                                        className="admin-textarea"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={20}
                                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: '1.6', background: 'rgba(0,0,0,0.3)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {message && (
                                    <div style={{ 
                                        color: message.type === 'success' ? '#4CAF50' : '#ef4444', 
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <FaCheck /> {message.text}
                                    </div>
                                )}
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
                                    <button 
                                        className="btn-secondary" 
                                        onClick={() => fetchPolicyDetail(selectedSlug)}
                                        disabled={loading || saving}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <FaSync className={loading ? 'infinite-rotate' : ''} /> {t('admin.common.reset', 'Restablecer')}
                                    </button>
                                    <button 
                                        className="btn-primary" 
                                        onClick={handleSave}
                                        disabled={saving || loading || !title.trim() || !content.trim()}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px', justifyContent: 'center' }}
                                    >
                                        {saving ? <Loader style={{ height: '20px' }} /> : <><FaSave /> {t('admin.common.save', 'Guardar Cambios')}</>}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed #333' }}>
                            <Loader />
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
