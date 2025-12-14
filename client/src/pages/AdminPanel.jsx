import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { FaUsers, FaChartLine, FaShieldAlt, FaCogs, FaTicketAlt, FaHistory, FaNewspaper } from "react-icons/fa"

// Sub-componentes del Admin Panel
import DashboardOverview from "@/components/Admin/DashboardOverview"
import UsersManager from "@/components/Admin/UsersManager"
import TicketsManager from "@/components/Admin/TicketsManager"
import AuditLog from "@/components/Admin/AuditLog"
import AdminNews from "@/components/Admin/AdminNews"
import SuggestionsManager from "@/components/Admin/SuggestionsManager"
import PollsManager from "@/components/Admin/PollsManager"

export default function AdminPanel() {
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')

    // Verificación Real de Permisos
    const allowedRoles = ['admin', 'neroferno', 'killu', 'helper']
    const isAdmin = allowedRoles.includes(user?.user_metadata?.role)

    useEffect(() => {
        if (!loading && !user) navigate('/login')
    }, [user, loading, navigate])

    if (loading) return <div className="admin-layout-full"><div className="section" style={{textAlign:'center', marginTop:'4rem'}}>Cargando panel...</div></div>
    
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
                <h1 style={{fontSize: '2rem'}}>ACCESO DENEGADO 🛑</h1>
                <p style={{color: '#aaa'}}>No tienes los permisos necesarios para estar aquí.</p>
                <button onClick={() => navigate('/')} className="btn-primary" style={{marginTop: '1rem'}}>
                    Volver al Inicio
                </button>
            </div>
        )
    }

    return (
        <div className="admin-layout-full">
            <div className="admin-top-bar">
                <div className="admin-brand-top">
                    <h3 style={{ color: 'var(--accent)', textTransform: 'uppercase', margin: 0, letterSpacing: '2px' }}>Crystal Panel</h3>
                    <span className="version-badge">v1.1.0 Beta</span>
                </div>

                <div className="admin-user-profile">
                     <div className="user-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="user-name" style={{ fontSize: '1.2rem', marginBottom: '0.2rem', fontWeight: 'bold' }}>{user?.email?.split('@')[0] || 'Admin'}</span>
                        <UserRoleDisplay role={user?.user_metadata?.role || 'user'} />
                    </div>
                </div>
            </div>

            <div className="admin-nav-tabs">
                <AdminTab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="General" />
                <AdminTab active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} label="Tickets" />
                <AdminTab active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Usuarios" />
                <AdminTab active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} label="Sugerencias" />
                <AdminTab active={activeTab === 'polls'} onClick={() => setActiveTab('polls')} label="Encuestas" />
                <AdminTab active={activeTab === 'news'} onClick={() => setActiveTab('news')} label="Noticias" />
                <AdminTab active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} label="Logs" />
                <AdminTab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Config" />
            </div>

            {/* Main Content */}
            <main className="admin-content-full">
                 <div className="section-header">
                    <h2>
                        {activeTab === 'overview' && 'Dashboard General'}
                        {activeTab === 'tickets' && 'Centro de Tickets'}
                        {activeTab === 'users' && 'Gestión de Usuarios'}
                        {activeTab === 'suggestions' && 'Buzón de Sugerencias'}
                        {activeTab === 'polls' && 'Gestor de Encuestas'}
                        {activeTab === 'news' && 'Editor de Noticias'}
                        {activeTab === 'logs' && 'Registro de Auditoría'}
                        {activeTab === 'settings' && 'Configuración del Sitio'}
                    </h2>
                     <p className="section-subtitle">Panel de control administrativo</p>
                </div>

                {activeTab === 'overview' && <DashboardOverview />}
                {activeTab === 'tickets' && <TicketsManager />}
                {activeTab === 'users' && <UsersManager />}
                {activeTab === 'suggestions' && <SuggestionsManager />}
                {activeTab === 'polls' && <PollsManager />}
                {activeTab === 'news' && <AdminNews user={user} />}
                {activeTab === 'logs' && <AuditLog />}
                {activeTab === 'settings' && <div className="admin-card">Configuraciones globales del sitio (Mantenimiento, Textos, etc) - Próximamente</div>}
            </main>
        </div>
    )
}

function AdminTab({ active, onClick, label }) {
    return (
        <button
            className={`admin-tab-btn ${active ? 'active' : ''}`}
            onClick={onClick}
        >
            {label}
        </button>
    )
}

function UserRoleDisplay({ role }) {
    const roles = {
        neroferno: { label: 'Neroferno', color: '#8b5cf6', img: '/ranks/rank-neroferno.png' },
        killu: { label: 'Killu', color: '#ec4899', img: '/ranks/rank-killu.png' },
        founder: { label: 'Fundador', color: '#a855f7', img: '/ranks/rank-fundador.png' },
        admin: { label: 'Admin', color: '#f59e0b', img: '/ranks/admin.png' },
        helper: { label: 'Helper', color: '#3b82f6', img: '/ranks/helper.png' },
        donor: { label: 'Donador', color: '#22c55e', img: '/ranks/rank-donador.png' },
        user: { label: 'Usuario', img: '/ranks/user.png' }
    }

    const current = roles[role] || roles.user

    if(current.img) {
        // Display only image at original size (natural size)
        return <img src={current.img} alt={current.label} />
    }

    return (
        <span className="user-role" style={{ color: current.color, display:'flex', alignItems:'center', gap:'0.5rem', justifyContent:'flex-end' }}>
             <span style={{ fontSize: '1.2rem' }}>{current.icon}</span>
             <span style={{ fontWeight: 'bold' }}>{current.label}</span>
        </span>
    )
}
