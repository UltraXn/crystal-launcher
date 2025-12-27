import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { 
    FaShieldAlt, FaChartPie, FaUsers, FaTicketAlt, FaLightbulb, 
    FaPoll, FaCalendarAlt, FaNewspaper, FaGamepad, FaIdCard, FaBars, FaTimes, 
    FaBriefcase, FaListUl, FaCog, FaArrowLeft, FaBook
} from "react-icons/fa"
import { useTranslation } from 'react-i18next'
import Loader from "../components/UI/Loader"

// Sub-componentes del Admin Panel
import DashboardOverview from "../components/Admin/DashboardOverview"
import UsersManager from "../components/Admin/UsersManager"
import TicketsManager from "../components/Admin/TicketsManager"
import AuditLog from "../components/Admin/AuditLog"
import AdminNews from "../components/Admin/AdminNews"
import SuggestionsManager from "../components/Admin/SuggestionsManager"
import PollsManager from "../components/Admin/PollsManager"
import EventsManager from "../components/Admin/EventsManager"
import StaffWorkspace from "../components/Admin/StaffHub/StaffWorkspace"
import SiteConfig from "../components/Admin/SiteConfig"

import GamificationManager from "../components/Admin/GamificationManager"
import StaffCardsManager from "../components/Admin/StaffCardsManager"
import AdminDocs from "../components/Admin/AdminDocs"
import WikiManager from "../components/Admin/WikiManager"

export default function AdminPanel() {
    const { t, i18n } = useTranslation()
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024
            setIsMobile(mobile)
            if (!mobile) setSidebarOpen(true)
            else if (mobile && window.innerWidth < 1024) setSidebarOpen(false) // Auto-close on resize to mobile
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Lock body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMobile, sidebarOpen])

    // Verificación Real de Permisos
    const allowedRoles = ['admin', 'neroferno', 'killu', 'helper', 'developer']
    const isAdmin = allowedRoles.includes(user?.user_metadata?.role?.toLowerCase())
    
    // Roles con acceso privilegiado (Configuración y Equipo)
    const superAdminRoles = ['neroferno', 'killu', 'developer'];
    const hasSecureAccess = superAdminRoles.some(role => user?.user_metadata?.role?.toLowerCase().includes(role));

    useEffect(() => {
        if (!loading && !user) navigate('/login')
    }, [user, loading, navigate])

    if (loading) return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display:'flex', 
            flexDirection: 'column',
            alignItems:'center', 
            justifyContent: 'center',
            background: '#080808',
            color: '#fff'
        }}>
            <Loader text={t('admin.loading_panel')} style={{ height: 'auto', minHeight: 'auto', transform: 'scale(1.2)' }} />
        </div>
    );
    
    if (!isAdmin) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a',
                color: '#ef4444',
                flexDirection: 'column',
                gap: '1rem',
                zIndex: 9999
            }}>
                <FaShieldAlt size={64} />
                <h1 style={{fontSize: '2rem'}}>{t('admin.access_denied.title')}</h1>
                <p style={{color: '#aaa'}}>{t('admin.access_denied.msg')}</p>
                <button onClick={() => navigate('/')} className="btn-primary" style={{marginTop: '1rem'}}>
                    {t('admin.access_denied.back_home')}
                </button>
            </div>
        )
    }

    return (
        <div className="admin-container" style={{ display: 'flex', minHeight: '100vh', background: '#080808', position: 'relative', overflowX: 'hidden' }}>
            
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 1900,
                        backdropFilter: 'blur(4px)',
                        transition: 'opacity 0.3s ease',
                        touchAction: 'none' // Prevent touch interactions on overlay
                    }}
                />
            )}

            {/* Sidebar Left - Responsive */}
            <aside className="admin-sidebar" style={{ 
                width: '260px', 
                position: 'fixed', 
                left: 0, 
                top: 0, 
                bottom: 0, 
                zIndex: 2000, 
                background: '#0a0a0a',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem 1rem',
                transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isMobile && sidebarOpen ? '5px 0 25px rgba(0,0,0,0.7)' : 'none'
            }}>
                <div style={{ marginBottom: '2rem', padding: '0 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ 
                            color: 'var(--accent)', 
                            textTransform: 'uppercase', 
                            margin: 0, 
                            letterSpacing: '2px', 
                            fontSize: '1.1rem',
                            fontWeight: '900'
                        }}>
                            Crystal Panel
                        </h3>
                        <div style={{ 
                            display: 'inline-block',
                            marginTop: '0.4rem',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.65rem', 
                            color: '#555', 
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            v1.2.0 Beta
                        </div>
                    </div>
                    {isMobile && (
                        <button onClick={() => setSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem' }}>
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="xp-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', marginTop: '1rem' }}>
                    {/* Botón Volver al Inicio */}
                    <button
                        className="xp-sidebar-btn"
                        onClick={() => navigate('/')}
                        style={{ 
                            marginBottom: '1rem', 
                            border: '1px solid rgba(239, 68, 68, 0.3)', 
                            color: '#ef4444',
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            padding: '12px 15px',
                            background: 'rgba(239, 68, 68, 0.05)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}
                    >
                        <span className="icon" style={{color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', marginRight: '12px'}}><FaArrowLeft /></span>
                        {t('admin.back_home', 'Volver al Inicio')}
                    </button>

                    <div className="xp-sidebar-header">{t('admin.sidebar.general')}</div>
                    <SidebarItem active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); if(isMobile) setSidebarOpen(false); }} icon={<FaChartPie />} label={t('admin.tabs.general')} />
                    {hasSecureAccess && (
                        <SidebarItem active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); if(isMobile) setSidebarOpen(false); }} icon={<FaCog />} label={t('admin.tabs.settings')} />
                    )}
                    <SidebarItem active={activeTab === 'logs'} onClick={() => { setActiveTab('logs'); if(isMobile) setSidebarOpen(false); }} icon={<FaListUl />} label={t('admin.tabs.logs')} />
                    <SidebarItem active={activeTab === 'docs'} onClick={() => { setActiveTab('docs'); if(isMobile) setSidebarOpen(false); }} icon={<FaBook />} label={t('admin.tabs.docs')} />

                    <div className="xp-sidebar-header">{t('admin.sidebar.community')}</div>
                    <SidebarItem active={activeTab === 'users'} onClick={() => { setActiveTab('users'); if(isMobile) setSidebarOpen(false); }} icon={<FaUsers />} label={t('admin.tabs.users')} />
                    <SidebarItem active={activeTab === 'news'} onClick={() => { setActiveTab('news'); if(isMobile) setSidebarOpen(false); }} icon={<FaNewspaper />} label={t('admin.tabs.news')} />
                    <SidebarItem active={activeTab === 'events'} onClick={() => { setActiveTab('events'); if(isMobile) setSidebarOpen(false); }} icon={<FaCalendarAlt />} label={t('admin.tabs.events')} />
                    <SidebarItem active={activeTab === 'gamification'} onClick={() => { setActiveTab('gamification'); if(isMobile) setSidebarOpen(false); }} icon={<FaGamepad />} label={t('admin.tabs.gamification')} />
                    <SidebarItem active={activeTab === 'suggestions'} onClick={() => { setActiveTab('suggestions'); if(isMobile) setSidebarOpen(false); }} icon={<FaLightbulb />} label={t('admin.tabs.suggestions')} />
                    <SidebarItem active={activeTab === 'polls'} onClick={() => { setActiveTab('polls'); if(isMobile) setSidebarOpen(false); }} icon={<FaPoll />} label={t('admin.tabs.polls')} />
                    <SidebarItem active={activeTab === 'wiki'} onClick={() => { setActiveTab('wiki'); if(isMobile) setSidebarOpen(false); }} icon={<FaBook />} label="Wiki / Gamepedia" />

                    <div className="xp-sidebar-header">{t('admin.sidebar.staff_management')}</div>
                    <SidebarItem active={activeTab === 'staff_hub'} onClick={() => { setActiveTab('staff_hub'); if(isMobile) setSidebarOpen(false); }} icon={<FaBriefcase />} label={t('admin.tabs.staff_hub')} />
                    {hasSecureAccess && (
                        <SidebarItem active={activeTab === 'team'} onClick={() => { setActiveTab('team'); if(isMobile) setSidebarOpen(false); }} icon={<FaIdCard />} label={t('admin.tabs.team')} />
                    )}
                    <SidebarItem active={activeTab === 'tickets'} onClick={() => { setActiveTab('tickets'); if(isMobile) setSidebarOpen(false); }} icon={<FaTicketAlt />} label={t('admin.tabs.tickets')} />


                </div>
            </aside>

            {/* Main Surface - Offset by Sidebar width */}
            <div className="admin-main" style={{ 
                flex: 1, 
                marginLeft: isMobile ? 0 : '260px', 
                display: 'flex', 
                flexDirection: 'column', 
                minWidth: 0,
                background: '#080808',
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100%'
            }}>
                <header className="admin-header" style={{
                    height: '70px',
                    padding: isMobile ? '0 1.5rem' : '0 2rem',
                    background: '#0d0d0d',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {isMobile && (
                            <button 
                                onClick={() => setSidebarOpen(true)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '1.4rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.5rem',
                                    marginLeft: '-0.5rem'
                                }}
                            >
                                <FaBars />
                            </button>
                        )}
                        <h2 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.1rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {t(`admin.headers.${activeTab}`, activeTab.replace('_', ' '))}
                        </h2>
                    </div>
                    

                    <div className="admin-user-profile" style={{ border: 'none', padding: 0, background: 'transparent', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        
                        {/* Language Toggle */}
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '6px' }}>
                            <button 
                                onClick={() => i18n.changeLanguage('es')} 
                                style={{ 
                                    background: i18n.language === 'es' ? 'var(--accent)' : 'transparent', 
                                    color: i18n.language === 'es' ? '#000' : '#888',
                                    border: 'none', borderRadius: '4px', padding: '0.2rem 0.6rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                ES
                            </button>
                            <button 
                                onClick={() => i18n.changeLanguage('en')} 
                                style={{ 
                                    background: i18n.language === 'en' ? 'var(--accent)' : 'transparent', 
                                    color: i18n.language === 'en' ? '#000' : '#888',
                                    border: 'none', borderRadius: '4px', padding: '0.2rem 0.6rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                EN
                            </button>
                        </div>

                         <div className="user-info" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ textAlign: 'right', display: isMobile ? 'none' : 'block' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{user?.user_metadata?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}</div>
                            </div>
                            <UserRoleDisplay role={user?.user_metadata?.role || 'user'} />
                        </div>
                    </div>
                </header>

                <main className="admin-content" style={{ padding: isMobile ? '1rem' : '2rem', flex: 1, overflowY: isMobile && sidebarOpen ? 'hidden' : 'auto' }}>
                    {activeTab === 'overview' && <DashboardOverview />}
                    {activeTab === 'tickets' && <TicketsManager />}
                    {activeTab === 'users' && <UsersManager />}
                    {activeTab === 'suggestions' && <SuggestionsManager />}
                    {activeTab === 'polls' && <PollsManager />}
                    {activeTab === 'events' && <EventsManager />}
                    {activeTab === 'news' && <AdminNews user={user} />}
                    {activeTab === 'gamification' && <GamificationManager />}
                    {activeTab === 'team' && hasSecureAccess && <StaffCardsManager />}
                    {activeTab === 'staff_hub' && <StaffWorkspace />}
                    {activeTab === 'wiki' && <WikiManager />}

                    {activeTab === 'logs' && <AuditLog />}
                    {activeTab === 'settings' && hasSecureAccess && <SiteConfig />}
                    {activeTab === 'docs' && <AdminDocs />}
                </main>
            </div>
        </div>
    )
}

interface SidebarItemProps {
    active: boolean;
    onClick: () => void;
    label: string;
    icon: React.ReactNode;
}

function SidebarItem({ active, onClick, label, icon }: SidebarItemProps) {
    return (
        <button
            className={`xp-sidebar-btn ${active ? 'active' : ''}`}
            onClick={onClick}
            style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '10px 15px',
                background: active ? 'rgba(22, 140, 128, 0.15)' : 'transparent',
                border: 'none',
                color: active ? 'var(--accent)' : '#9ca3af', // Gray-400 inactive
                fontWeight: active ? '600' : '500',
                transition: 'all 0.2s',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: '6px',
                fontSize: '0.9rem',
                position: 'relative',
                boxShadow: 'none',
                lineHeight: '1.5',
                textTransform: 'none'
            }}
        >
            {active && (
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '60%',
                    width: '3px',
                    background: 'var(--accent)',
                    borderRadius: '0 3px 3px 0'
                }} />
            )}
            <span className="icon" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                marginRight: '12px',
                opacity: active ? 1 : 0.7,
                fontSize: '1rem',
                color: active ? 'var(--accent)' : 'inherit'
            }}>{icon}</span>
            {label}
        </button>
    )
}

interface UserRoleDisplayProps {
    role: string;
}

function UserRoleDisplay({ role }: UserRoleDisplayProps) {
    const { t } = useTranslation()
    const roles: Record<string, { label: string; color?: string; img: string; icon?: string }> = {
        neroferno: { label: t('account.roles.neroferno'), color: '#8b5cf6', img: '/ranks/rank-neroferno.png' },
        killu: { label: t('account.roles.killu'), color: '#ec4899', img: '/ranks/rank-killu.png' },
        founder: { label: t('account.roles.founder'), color: '#a855f7', img: '/ranks/rank-fundador.png' },
        admin: { label: t('account.roles.admin'), color: '#f59e0b', img: '/ranks/admin.png' },
        developer: { label: t('account.roles.developer'), color: '#0ea5e9', img: '/ranks/developer.png' },
        helper: { label: t('account.roles.helper'), color: '#3b82f6', img: '/ranks/helper.png' },
        donor: { label: t('account.roles.donor'), color: '#22c55e', img: '/ranks/rank-donador.png' },
        user: { label: t('account.roles.user'), img: '/ranks/user.png' }
    }

    const current = roles[role] || roles.user

    if(current.img) {
        return <img src={current.img} alt={current.label} style={{ height: 'auto', maxHeight: '40px', width: 'auto', display: 'block' }} />
    }

    return (
        <span className="user-role" style={{ color: current.color, fontSize: '0.75rem', fontWeight: 'bold' }}>
             {current.label}
        </span>
    )
}
