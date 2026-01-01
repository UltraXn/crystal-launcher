import { useState, useEffect, useCallback, useMemo } from "react"
import { 
    FaSearch, FaSpinner, FaDonate, FaUser, FaClock, 
    FaEdit, FaTrash, FaPlus, FaCheckCircle, FaTimes, 
    FaChartBar, FaCalendarAlt, FaDollarSign, FaEnvelope, FaGlobe, FaChevronLeft, FaChevronRight, FaFilter
} from "react-icons/fa"
import Loader from "../UI/Loader"
import { useTranslation } from "react-i18next"
import { supabase } from "../../services/supabaseClient"
import { getAuthHeaders } from "../../services/adminAuth"

const API_URL = import.meta.env.VITE_API_URL || '/api'

export interface Donation {
    id: number;
    amount: number;
    currency: string;
    from_name: string;
    message: string;
    is_public: boolean;
    buyer_email?: string;
    created_at: string;
}

interface DonationsManagerProps {
    mockDonations?: Donation[];
}

export default function DonationsManager({ mockDonations }: DonationsManagerProps = {}) {
    const { t } = useTranslation() 
    const [donations, setDonations] = useState<Donation[]>(mockDonations || [])
    const [loading, setLoading] = useState(!mockDonations) // If mock provided, start as loaded
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    
    // CRUD State
    const [showModal, setShowModal] = useState(false)
    const [currentDonation, setCurrentDonation] = useState<Donation | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    const fetchDonations = useCallback(async () => {
        if (mockDonations) return;
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(`${API_URL}/donations?page=${page}&limit=20&search=${search}`, {
                headers: getAuthHeaders(session?.access_token || null)
            })
            if(res.ok) {
                const rawData = await res.json()
                const payload = rawData.success ? rawData.data : rawData
                setDonations(payload.data || [])
                setTotalPages(payload.totalPages || 1)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [page, search])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDonations()
        }, 500)
        return () => clearTimeout(timer)
    }, [fetchDonations])

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('public:donations')
            .on(
                'postgres_changes',
                { event: '*', table: 'donations', schema: 'public' },
                () => {
                    fetchDonations()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchDonations])

    // Stats calculation
    const stats = useMemo(() => {
        if (!donations.length) return { total: 0, count: 0, avg: 0 };
        const total = donations.reduce((acc, curr) => acc + (parseFloat(curr.amount.toString()) || 0), 0);
        return {
            total: total.toFixed(2),
            count: donations.length,
            avg: (total / donations.length).toFixed(2)
        };
    }, [donations]);

    const handleNew = () => {
        setCurrentDonation({ 
            id: 0,
            amount: 0, 
            currency: 'USD', 
            from_name: '', 
            message: '', 
            is_public: true,
            buyer_email: '',
            created_at: new Date().toISOString()
        })
        setShowModal(true)
    }

    const handleEdit = (donation: Donation) => {
        setCurrentDonation({ ...donation })
        setShowModal(true)
    }

    const executeDelete = async () => {
        if (!deleteConfirm) return
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(`${API_URL}/donations/${deleteConfirm}`, { 
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
            })
            if (res.ok) {
                setDonations(donations.filter(d => d.id !== deleteConfirm))
                setDeleteConfirm(null)
                setAlert({ message: t('admin.donations.success_delete', 'Donación eliminada'), type: 'success' })
            } else {
                setAlert({ message: t('admin.donations.error_delete'), type: 'error' })
            }
        } catch (error) {
            console.error(error)
            setAlert({ message: t('admin.donations.error_conn'), type: 'error' })
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentDonation) return;
        setIsSubmitting(true)

        const method = currentDonation.id ? 'PUT' : 'POST'
        const url = currentDonation.id 
            ? `${API_URL}/donations/${currentDonation.id}` 
            : `${API_URL}/donations`

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(currentDonation)
            })

            if (res.ok) {
                setShowModal(false)
                fetchDonations()
                setAlert({ message: t('admin.donations.success_save', 'Cambios guardados correctamente'), type: 'success' })
            } else {
                setAlert({ message: t('admin.donations.error_save'), type: 'error' })
            }
        } catch (error) {
            console.error(error)
            setAlert({ message: t('admin.donations.error_conn'), type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => setAlert(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [alert])

    return (
        <div className="donations-manager-container">
            {/* Header / Actions Bar */}
            <div className="donations-header" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                     <div style={{ padding: '12px', background: 'rgba(var(--accent-rgb), 0.1)', borderRadius: '16px', color: 'var(--accent)', fontSize: '1.2rem', display: 'flex', flexShrink: 0 }}>
                        <FaDonate />
                    </div>
                    <div style={{ flex: '1', minWidth: '0' }}>
                        <p className="donations-subtitle" style={{ margin: 0, fontSize: 'clamp(0.7rem, 2vw, 0.8rem)', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>
                            {t('admin.donations.title')}
                        </p>
                        <span style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', wordBreak: 'break-word' }}>
                            {t('admin.donations.manager_desc')}
                        </span>
                    </div>
                </div>
                
                <div className="donations-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
                    <div className="poll-search-wrapper" style={{ flex: '1 1 100%', minWidth: '200px', maxWidth: '100%' }}>
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder={t('admin.donations.search_ph')}
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="poll-search-input"
                        />
                    </div>
                    <button className="btn-primary poll-new-btn" onClick={handleNew} style={{ flex: '1 1 auto', minWidth: '160px', height: '52px', padding: '0 2rem', borderRadius: '18px', boxShadow: '0 10px 20px rgba(var(--accent-rgb), 0.2)' }}>
                        <FaPlus /> {t('admin.donations.new_btn')}
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="donations-stats-grid">
                <div className="donation-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <FaDollarSign />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">${stats.total}</span>
                        <span className="stat-label">{t('admin.donations.stats.total')}</span>
                    </div>
                </div>
                <div className="donation-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <FaChartBar />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.count}</span>
                        <span className="stat-label">{t('admin.donations.stats.count')}</span>
                    </div>
                </div>
                <div className="donation-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15' }}>
                        <FaFilter />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">${stats.avg}</span>
                        <span className="stat-label">{t('admin.donations.stats.avg')}</span>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="donations-table-wrapper">
                {loading && donations.length === 0 ? (
                    <div className="empty-donations">
                         <Loader />
                    </div>
                ) : donations.length === 0 ? (
                    <div className="empty-donations">
                        <div className="empty-icon-pulse">
                            <FaDonate />
                        </div>
                        <h4 style={{ color: '#fff', margin: 0 }}>{t('admin.donations.empty')}</h4>
                        <p style={{ color: 'rgba(255,255,255,0.3)', maxWidth: '300px', margin: 0 }}>
                            No hay registros de donaciones que coincidan con tu búsqueda.
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ flex: 1, overflowX: 'auto' }}>
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>{t('admin.tickets.table.user')}</th>
                                        <th>{t('admin.donations.form.message')}</th>
                                        <th>{t('admin.donations.form.amount')}</th>
                                        <th>{t('admin.tickets.table.date')}</th>
                                        <th>{t('admin.tickets.table.status')}</th>
                                        <th style={{ textAlign: 'right' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donations.map(donation => (
                                        <tr key={donation.id}>
                                            <td>
                                                <div className="donor-cell">
                                                    <div className="donor-mini-avatar">
                                                        {donation.from_name ? donation.from_name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div className="donor-name-link">
                                                        <span className="donor-name-text">{donation.from_name || t('admin.donations.anonymous')}</span>
                                                        <span className="donor-email-text">{donation.buyer_email || '---'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={`message-cell ${!donation.message ? 'empty' : ''}`}>
                                                    {donation.message || t('admin.donations.no_msg')}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={`donation-amount-badge ${donation.amount >= 50 ? 'high' : ''}`}>
                                                    {donation.currency} {parseFloat(donation.amount.toString()).toFixed(2)}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    <FaCalendarAlt size={12} />
                                                    {donation.created_at ? new Date(donation.created_at).toLocaleDateString() : '---'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`visibility-badge ${donation.is_public ? 'public' : 'private'}`}>
                                                    {donation.is_public ? <FaGlobe size={10} /> : <FaTimes size={10} />}
                                                    {donation.is_public ? t('admin.donations.public') : t('admin.donations.private')}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                                                    <button onClick={() => handleEdit(donation)} className="donor-btn-action edit" title={t('admin.polls.edit_btn')}>
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(donation.id)} className="donor-btn-action delete" title={t('admin.donors.delete_btn')}>
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="premium-pagination">
                                <button 
                                    className="page-btn" 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <FaChevronLeft size={12} />
                                </button>
                                <div className="page-info">
                                    PAGINA <span>{page}</span> DE <span>{totalPages}</span>
                                </div>
                                <button 
                                    className="page-btn" 
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <FaChevronRight size={12} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MODAL: EDIT / CREATE */}
            {showModal && currentDonation && (
                <div className="sync-modal-overlay">
                    <div className="sync-modal-content" style={{ maxWidth: '700px' }}>
                        <div className="modal-accent-line"></div>
                        
                        <div className="poll-form-header">
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '1.5rem', fontWeight: '900' }}>
                                <FaDonate style={{ color: 'var(--accent)' }} />
                                {currentDonation.id ? t('admin.donations.edit_title') : t('admin.donations.new_btn')}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="btn-close-mini">
                                <FaTimes />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="poll-form-body">
                            <div className="donation-form-grid">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="admin-label-premium">
                                            <FaUser size={12} /> {t('admin.donations.form.donor_name')}
                                        </label>
                                        <input 
                                            className="admin-input-premium" 
                                            value={currentDonation.from_name} 
                                            onChange={e => setCurrentDonation({...currentDonation, from_name: e.target.value})}
                                            placeholder={t('admin.donations.form.name_ph')}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="admin-label-premium">
                                            <FaEnvelope size={12} /> {t('admin.donations.form.email_label')}
                                        </label>
                                        <input 
                                            className="admin-input-premium" 
                                            value={currentDonation.buyer_email || ''} 
                                            onChange={e => setCurrentDonation({...currentDonation, buyer_email: e.target.value})}
                                            placeholder="email@ejemplo.com"
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="admin-label-premium">{t('admin.donations.form.amount')}</label>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                className="admin-input-premium" 
                                                value={currentDonation.amount} 
                                                onChange={e => setCurrentDonation({...currentDonation, amount: parseFloat(e.target.value) || 0})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="admin-label-premium">{t('admin.donations.form.currency')}</label>
                                            <select 
                                                className="admin-select-premium" 
                                                value={currentDonation.currency} 
                                                onChange={e => setCurrentDonation({...currentDonation, currency: e.target.value})}
                                            >
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="MXN">MXN</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="admin-label-premium">{t('admin.donations.form.message')}</label>
                                        <textarea 
                                            className="admin-textarea-premium" 
                                            rows={4}
                                            value={currentDonation.message} 
                                            onChange={e => setCurrentDonation({...currentDonation, message: e.target.value})}
                                            placeholder="Escribe un mensaje..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <div 
                                            className={`custom-checkbox-premium ${currentDonation.is_public ? 'checked' : ''}`}
                                            onClick={() => setCurrentDonation({...currentDonation, is_public: !currentDonation.is_public})}
                                        >
                                            <div className="checkbox-visual">
                                                {currentDonation.is_public && <FaCheckCircle />}
                                            </div>
                                            <label className="checkbox-label-text">
                                                {t('admin.donations.form.is_public')}
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="admin-label-premium">
                                            <FaClock size={12} /> {t('admin.tickets.table.date')}
                                        </label>
                                        <input 
                                            type="datetime-local"
                                            className="admin-input-premium" 
                                            value={currentDonation.created_at ? new Date(currentDonation.created_at).toISOString().slice(0, 16) : ''} 
                                            onChange={e => setCurrentDonation({...currentDonation, created_at: new Date(e.target.value).toISOString()})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="poll-form-footer">
                                <button type="button" className="modal-btn-secondary" onClick={() => setShowModal(false)}>{t('admin.donations.form.cancel')}</button>
                                <button type="submit" className="modal-btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? <FaSpinner className="spin" /> : <><FaCheckCircle /> {t('admin.donations.form.save')}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: DELETE CONFIRMATION */}
            {deleteConfirm && (
                <div className="sync-modal-overlay">
                    <div className="sync-modal-content" style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem' }}>
                        <div className="modal-accent-line" style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }}></div>
                        <div style={{ 
                            width: '80px', height: '80px', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', fontSize: '2rem' 
                        }}>
                            <FaTrash />
                        </div>
                        <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.75rem', fontWeight: '900' }}>
                           {t('admin.donations.delete_confirm.title')}
                        </h3>
                        <p style={{ marginBottom: '2.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: '1.6', fontWeight: '500' }}>
                            {t('admin.donations.delete_confirm.msg')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setDeleteConfirm(null)} className="modal-btn-secondary" style={{ flex: 1 }}>
                                {t('common.cancel')}
                            </button>
                            <button 
                                onClick={executeDelete} 
                                className="modal-btn-primary" 
                                style={{ 
                                    background: '#ef4444', 
                                    color: '#fff', flex: 1, 
                                    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)' 
                                }}
                            >
                                {t('admin.donations.delete_confirm.btn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ALERT TOAST */}
            {alert && (
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000000, animation: 'slideUp 0.3s ease-out' }}>
                   <div style={{ 
                       background: 'rgba(0,0,0,0.8)', 
                       backdropFilter: 'blur(20px)', 
                       border: `1px solid ${alert.type === 'error' ? '#ef4444' : '#10b981'}`,
                       padding: '1rem 1.5rem',
                       borderRadius: '16px',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '12px',
                       boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                   }}>
                       {alert.type === 'error' ? <FaCheckCircle color="#ef4444" style={{ transform: 'rotate(45deg)' }} /> : <FaCheckCircle color="#10b981" />}
                       <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{alert.message}</span>
                       <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px' }}>
                           <FaTimes />
                       </button>
                   </div>
                </div>
            )}
        </div>
    )
}
