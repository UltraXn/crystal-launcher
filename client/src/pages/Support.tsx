import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { FaPlus, FaTicketAlt, FaDiscord, FaChevronRight, FaClock, FaExclamationCircle } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import SectionDivider from '../components/Layout/SectionDivider'
import TicketForm from '../components/Support/TicketForm'
import { CreateTicketFormValues } from '../schemas/ticket'

interface Ticket {
    id: string;
    user_id: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    created_at: string;
}

export default function Support() {
    const { user } = useAuth()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)



    const fetchTickets = useCallback(async () => {
        if (!user) return
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            
            if (error) throw error
            setTickets(data || [])
        } catch (error) {
            console.error('Error loading tickets:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) fetchTickets()
        else setLoading(false)
    }, [user, fetchTickets])

    const handleCreateTicket = async (data: CreateTicketFormValues) => {
        if (!user) return
        
        try {
            // 1. Create Ticket
            const { data: ticketData, error: ticketError } = await supabase
                .from('tickets')
                .insert([{
                    user_id: user.id,
                    subject: data.title,
                    category: data.category,
                    priority: data.priority,
                    status: 'open',
                    description: data.description
                }])
                .select()
                .single()

            if (ticketError) throw ticketError
            
            // 2. Create Initial Message
            const { error: msgError } = await supabase
                .from('ticket_messages')
                .insert([{
                    ticket_id: ticketData.id,
                    user_id: user.id,
                    message: data.description,
                    is_staff: false
                }])
            
            if (msgError) throw msgError

            setShowCreateModal(false)
            fetchTickets()
            
        } catch (error) {
            console.error('Error creating ticket:', error)
            alert(t('support.error_create', 'Error creating ticket. Please try again.'))
        }
    }

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'open': return '#2ecc71';
            case 'closed': return '#95a5a6';
            case 'answered': return '#f39c12';
            default: return '#3498db';
        }
    }

    const getStatusLabel = (status: string) => {
        return t(`admin.tickets.status.${status}`, status.toUpperCase())
    }

    if (loading) return (
        <div className="support-page loading" style={{ paddingTop: '8rem', textAlign: 'center' }}>
            <div className="loader"></div>
            <p>{t('common.loading')}</p>
        </div>
    )

    return (
        <div className="support-page" style={{ marginBottom: '4rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* HERO SECTION */}
            <section className="hero-mini" style={{ 
                padding: '10rem 0 6rem', 
                background: 'radial-gradient(circle at center, rgba(12, 112, 117, 0.1) 0%, rgba(2, 1, 3, 0) 70%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="gradient-text" 
                        style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', marginBottom: '1.5rem', fontWeight: 900, letterSpacing: '-2px' }}
                    >
                        {t('support.title')}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ color: 'var(--muted)', fontSize: '1.2rem', maxWidth: '650px', margin: '0 0 3rem', lineHeight: 1.6 }}
                    >
                        {t('support.subtitle')}
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}
                    >
                        <button 
                            className="nav-btn primary" 
                            onClick={() => user ? setShowCreateModal(true) : navigate('/login')}
                            style={{ 
                                padding: '1rem 2.5rem', 
                                fontSize: '1.1rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.8rem', 
                                borderRadius: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                color: '#000', /* Enforce black text */
                                background: 'var(--accent, #89d9d1)', /* Fallback to hex if var fails */
                                border: 'none'
                             }}
                        >
                            <FaPlus /> {t('support.create_ticket')}
                        </button>
                        <a 
                            href="https://discord.com/invite/TDmwYNnvyT" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="nav-btn"
                            style={{ 
                                padding: '1rem 2.5rem', 
                                fontSize: '1.1rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.8rem', 
                                background: 'rgba(88, 101, 242, 0.2)', /* Slightly more visible bg */
                                border: '1px solid rgba(88, 101, 242, 0.5)', 
                                color: '#fff', /* White text for better contrast */
                                borderRadius: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold'
                            }}
                        >
                            <FaDiscord style={{ color: '#5865F2' }} /> {t('support.discord_btn')}
                        </a>
                    </motion.div>
                </div>
            </section>

            <SectionDivider />

            <div className="container">
                {/* BREADCRUMBS */}
                <div className="breadcrumbs" style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>{t('navbar.home')}</Link>
                    <FaChevronRight size={10} />
                    <span style={{ color: 'var(--accent)' }}>{t('navbar.support')}</span>
                </div>

                {!user && (
                    <div className="login-prompt" style={{
                        background: 'rgba(231, 76, 60, 0.1)',
                        border: '1px solid rgba(231, 76, 60, 0.2)',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <FaExclamationCircle style={{ color: '#e74c3c', fontSize: '1.5rem' }} />
                        <div>
                            <h4 style={{ margin: 0 }}>{t('support.login_required')}</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>{t('support.login_hint')}</p>
                        </div>
                        <Link to="/login" className="nav-btn primary" style={{ marginLeft: 'auto' }}>{t('login.submit')}</Link>
                    </div>
                )}

                {user && (
                    <div className="tickets-section" style={{ padding: '2rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
                                <div style={{ width: '3rem', height: '3rem', background: 'var(--accent-soft)', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FaTicketAlt style={{ color: 'var(--accent)', fontSize: '1.2rem' }} />
                                </div>
                                {t('support.your_tickets')}
                            </h2>
                            <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', fontSize: '0.9rem', color: 'var(--muted)' }}>
                                {tickets.length} {t('support.total')}
                            </div>
                        </div>

                        {tickets.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="empty-state" 
                                style={{
                                    textAlign: 'center', 
                                    padding: '6rem 2rem', 
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
                                    borderRadius: '2rem',
                                    border: '1px dashed rgba(255,255,255,0.1)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                                }}
                            >
                                <div style={{ 
                                    width: '100px', height: '100px', background: 'var(--accent-soft)', 
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', 
                                    justifyContent: 'center', margin: '0 auto 2rem' 
                                }}>
                                    <FaTicketAlt style={{ fontSize: '3rem', color: 'var(--accent)', opacity: 0.5 }} />
                                </div>
                                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{t('support.no_tickets')}</h3>
                                <p style={{ color: 'var(--muted)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>{t('support.create_first')}</p>
                                <button className="nav-btn primary" onClick={() => user ? setShowCreateModal(true) : navigate('/login')} style={{ padding: '1rem 3rem', borderRadius: '12px', fontSize: '1.1rem' }}>
                                    {t('support.create_first_btn')}
                                </button>
                            </motion.div>
                        ) : (
                            <div className="tickets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))', gap: '1.5rem' }}>
                                {tickets.map((ticket, index) => (
                                    <motion.div 
                                        key={ticket.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="ticket-card-premium"
                                        style={{
                                            background: 'rgba(255,255,255,0.02)', 
                                            padding: '2rem', 
                                            borderRadius: '1.5rem',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                        }}
                                        onClick={() => navigate(`/support/${ticket.id}`)}
                                        whileHover={{ y: -5, background: 'rgba(255,255,255,0.04)', borderColor: 'var(--accent)', boxShadow: '0 20px 30px rgba(0,0,0,0.2)' }}
                                    >
                                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                            <div style={{
                                                width: '4.5rem', height: '4.5rem', 
                                                borderRadius: '1.2rem', 
                                                background: `${getStatusColor(ticket.status)}15`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: `1px solid ${getStatusColor(ticket.status)}30`
                                            }}>
                                                <FaTicketAlt style={{ color: getStatusColor(ticket.status), fontSize: '1.8rem' }} />
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                                                    <h3 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, color: '#fff' }}>{ticket.subject}</h3>
                                                    <span style={{ 
                                                        fontSize: '0.7rem', 
                                                        padding: '0.3rem 0.8rem', 
                                                        borderRadius: '50px', 
                                                        background: getStatusColor(ticket.status),
                                                        color: '#000',
                                                        fontWeight: 900,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px'
                                                    }}>
                                                        {getStatusLabel(ticket.status)}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.95rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <FaClock size={14} style={{ opacity: 0.5 }} /> {new Date(ticket.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                                                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                                        {t(`support.categories.${(ticket.category || 'general').toLowerCase().replace(' ', '_')}`, 
                                                            (ticket.category || 'General').charAt(0).toUpperCase() + (ticket.category || 'General').slice(1)
                                                        )}
                                                    </span>
                                                    <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                                                    <span style={{ fontFamily: 'monospace', opacity: 0.4 }}>#{String(ticket.id).slice(0, 8).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                            <div className="arrow-icon" style={{ 
                                                width: '3rem', height: '3rem', 
                                                borderRadius: '50%', 
                                                background: 'rgba(255,255,255,0.05)', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--muted)',
                                                transition: 'all 0.3s ease'
                                            }}>
                                                <FaChevronRight />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay" 
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1.5rem'
                        }}
                        onClick={() => setShowCreateModal(false)}
                    >
                        <TicketForm 
                            onClose={() => setShowCreateModal(false)} 
                            onSubmit={handleCreateTicket} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
