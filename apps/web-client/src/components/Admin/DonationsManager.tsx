import { useState, useEffect, useCallback } from "react"
import { FaSearch, FaSpinner, FaDonate, FaBoxOpen, FaUser, FaClock, FaEdit, FaTrash, FaPlus, FaSave, FaDiscord } from "react-icons/fa"
import Loader from "../UI/Loader"
import { useTranslation } from "react-i18next"
import ConfirmationModal from "../UI/ConfirmationModal"
import { supabase } from "../../services/supabaseClient"
import { simulateDonation } from "../../services/donationService"

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

export default function DonationsManager() {
    const { t } = useTranslation() 
    const [donations, setDonations] = useState<Donation[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    
    // CRUD State
    const [showModal, setShowModal] = useState(false)
    const [currentDonation, setCurrentDonation] = useState<Donation | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchDonations = useCallback(async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(`${API_URL}/donations?page=${page}&limit=20&search=${search}`, {
                headers: session ? { 'Authorization': `Bearer ${session.access_token}` } : undefined
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

    // Handlers
    const handleNew = () => {
        setCurrentDonation({ 
            id: 0, // Placeholder
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

    const handleDelete = (id: number) => {
        setDeleteConfirm(id)
    }

    const executeDelete = async () => {
        if (!deleteConfirm) return
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(`${API_URL}/donations/${deleteConfirm}`, { 
                method: 'DELETE',
                headers: session ? { 'Authorization': `Bearer ${session.access_token}` } : undefined
            })
            if (res.ok) {
                setDonations(donations.filter(d => d.id !== deleteConfirm))
                setDeleteConfirm(null)
            } else {
                alert('Error al eliminar')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleSimulate = async () => {
        if(!confirm("¿Enviar alerta de prueba a Discord?")) return;
        setIsSubmitting(true)
        try {
            // Randomize data for fun
            const names = ["Killua", "Gon", "Kurapika", "Leorio", "Hisoka", "Chrollo"];
            const randomName = names[Math.floor(Math.random() * names.length)];
            const randomAmount = Math.floor(Math.random() * 100) + 5;
            
            await simulateDonation(randomName, randomAmount, 'USD');
            alert("¡Alerta enviada a Discord!");
        } catch (error) {
            console.error(error);
            alert("Error al enviar alerta");
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        if (!currentDonation) return;

        const method = currentDonation.id ? 'PUT' : 'POST'
        const url = currentDonation.id 
            ? `${API_URL}/donations/${currentDonation.id}` 
            : `${API_URL}/donations`

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (session) headers['Authorization'] = `Bearer ${session.access_token}`

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(currentDonation)
            })

            if (res.ok) {
                setShowModal(false)
                fetchDonations()
            } else {
                alert('Error al guardar')
            }
        } catch (error) {
            console.error(error)
            alert('Error de conexión')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="admin-card" style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <FaDonate color="var(--accent)" /> {t('admin.donations.title')}
                </h3>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder={t('admin.donations.search_ph')} 
                            className="admin-input" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem', width: '100%', maxWidth: '250px', marginBottom: 0 }}
                        />
                        <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    </div>
                    <button className="btn-secondary" onClick={() => handleSimulate()} disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(88, 101, 242, 0.2)', color: '#5865F2', border: '1px solid rgba(88, 101, 242, 0.5)' }}>
                        <FaDiscord size={14} /> {t('admin.donations.simulate', 'Test Alerta')}
                    </button>
                    <button className="btn-primary" onClick={handleNew} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaPlus size={12} /> {t('admin.donations.new_btn')}
                    </button>
                </div>
            </div>

            {loading && donations.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Loader style={{ height: 'auto', minHeight: '120px' }} />
                </div>
            ) : (
                <>
                    <div className="admin-table-container" style={{ flex: 1, overflow: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Mensaje</th>
                                    <th>Monto</th>
                                    <th>Fecha</th>
                                    <th>Visibilidad</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                            {t('admin.donations.empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    Array.isArray(donations) && donations.map(donation => (
                                        <tr key={donation.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <FaUser size={12} color="#aaa" />
                                                    </div>
                                                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{donation.from_name || t('admin.donations.anonymous')}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    <FaBoxOpen size={12} /> {donation.message || t('admin.donations.no_msg')}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1rem' }}>
                                                    {donation.currency} {parseFloat(donation.amount.toString()).toFixed(2)}
                                                </span>
                                            </td>
                                            <td style={{ color: '#888', fontSize: '0.9rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaClock size={12} /> {donation.created_at ? new Date(donation.created_at).toLocaleString() : '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="audit-badge" style={{ 
                                                    background: donation.is_public ? '#4ade80' : '#64748b',
                                                    color: '#000' 
                                                }}>
                                                    {donation.is_public ? t('admin.donations.public') : t('admin.donations.private')}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                                                    <button
                                                        onClick={() => handleEdit(donation)}
                                                        style={{ 
                                                            border: 'none', 
                                                            background: 'rgba(59, 130, 246, 0.1)', 
                                                            color: '#3b82f6',
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        title={t('admin.staff.edit_btn')}
                                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                                    >
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => donation.id && handleDelete(donation.id)}
                                                        style={{ 
                                                            border: 'none', 
                                                            background: 'rgba(239, 68, 68, 0.1)', 
                                                            color: '#ef4444',
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        title={t('admin.donations.delete_confirm.btn')}
                                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                         <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', padding: '1rem 0' }}>
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="admin-tab-btn"
                            >
                                &lt;
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', color: '#888' }}>
                                Pág. {page} de {totalPages}
                            </span>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="admin-tab-btn"
                            >
                                &gt;
                            </button>
                         </div>
                    )}
                </>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)', zIndex: 1000 }}>
                    <div className="admin-card modal-content" style={{ width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>{currentDonation?.id ? t('admin.donations.edit_title') : t('admin.donations.new_btn')}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">{t('admin.donations.form.donor_name')}</label>
                                <input 
                                    className="form-input" 
                                    value={currentDonation?.from_name || ''} 
                                    onChange={e => setCurrentDonation(prev => prev ? {...prev, from_name: e.target.value} : null)}
                                    placeholder={t('admin.donations.form.name_ph')}
                                />
                            </div>

                             <div className="form-group">
                                <label className="form-label">{t('admin.donations.form.email_label')}</label>
                                <input 
                                    className="form-input" 
                                    value={currentDonation?.buyer_email || ''} 
                                    onChange={e => setCurrentDonation(prev => prev ? {...prev, buyer_email: e.target.value}: null)}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">{t('admin.donations.form.amount')}</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        className="form-input" 
                                        value={currentDonation?.amount || ''} 
                                        onChange={e => setCurrentDonation(prev => prev ? {...prev, amount: parseFloat(e.target.value) || 0}: null)}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">{t('admin.donations.form.currency')}</label>
                                    <select 
                                        className="form-input" 
                                        value={currentDonation?.currency || 'USD'} 
                                        onChange={e => setCurrentDonation(prev => prev ? {...prev, currency: e.target.value}: null)}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="MXN">MXN</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('admin.donations.form.message')}</label>
                                <textarea 
                                    className="form-textarea" 
                                    rows={3}
                                    value={currentDonation?.message || ''} 
                                    onChange={e => setCurrentDonation(prev => prev ? {...prev, message: e.target.value}: null)}
                                />
                            </div>

                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="isPublic"
                                    checked={currentDonation?.is_public || false}
                                    onChange={e => setCurrentDonation(prev => prev ? {...prev, is_public: e.target.checked} : null)}
                                    style={{ width: 'auto' }}
                                />
                                <label htmlFor="isPublic" style={{ cursor: 'pointer', userSelect: 'none' }}>{t('admin.donations.form.is_public')}</label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">{t('admin.donations.form.cancel')}</button>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? <FaSpinner className="spin" /> : <><FaSave /> {t('admin.donations.form.save')}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal 
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={executeDelete}
                title={t('admin.donations.delete_confirm.title')}
                message={t('admin.donations.delete_confirm.msg')}
                confirmText={t('admin.donations.delete_confirm.btn')}
                isDanger={true}
            />
        </div>
    )
}
