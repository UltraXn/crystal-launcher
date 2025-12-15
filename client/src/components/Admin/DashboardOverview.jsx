import { useEffect, useState } from 'react'
import { FaUser, FaServer, FaTicketAlt, FaMoneyBillWave, FaMemory, FaMicrochip, FaUsers, FaUserPlus, FaGlobe, FaClock } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

export default function DashboardOverview() {
    const { t } = useTranslation()
    // Initial state with defaults
    const [serverStats, setServerStats] = useState({ 
        online: false, 
        status: 'offline', 
        memory: { current: 0, limit: 12000 }, 
        cpu: 0, 
        players: { online: 0, max: 100 },
        global: { total: 0, new: 0, playtime: 0 }
    })
    
    const API_URL = import.meta.env.VITE_API_URL

    const [ticketStats, setTicketStats] = useState({ open: 0, urgent: 0 })
    const [donationStats, setDonationStats] = useState({ currentMonth: "0.00", percentChange: 0 })

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Resources + Global Stats (Consolidated Endpoint)
                const resRes = await fetch(`${API_URL}/server/resources`);
                const dataRes = resRes.ok ? await resRes.json() : null;

                if (dataRes) {
                    setServerStats({
                        online: dataRes.status === 'running',
                        status: dataRes.status || 'offline',
                        memory: { 
                            current: dataRes.memory?.current || 0, 
                            limit: dataRes.memory?.limit || 24576 
                        },
                        cpu: dataRes.cpu || 0,
                        players: { 
                            online: dataRes.online || 0, 
                            max: 100 
                        },
                        global: {
                            total: dataRes.total_players || 0,
                            new: dataRes.new_players || 0,
                            playtime: dataRes.total_playtime_hours || 0
                        }
                    });
                } else {
                     setServerStats(prev => ({ ...prev, online: false, status: 'error' }));
                }

                // Fetch Ticket Stats
                const resTickets = await fetch(`${API_URL}/tickets/stats`)
                if(resTickets.ok) {
                    const dataTickets = await resTickets.json()
                    setTicketStats(dataTickets)
                }

                // Fetch Donation Stats
                const resDonations = await fetch(`${API_URL}/donations/stats`)
                if(resDonations.ok) {
                    const dataDonations = await resDonations.json()
                    setDonationStats(dataDonations)
                }

            } catch (error) {
                console.error("Error loading dashboard data", error)
            }
        }

        fetchData()
        const interval = setInterval(fetchData, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [API_URL])

    // Calculate RAM usage percentage
    const memoryPercent = serverStats.memory.limit > 0 
        ? Math.round((serverStats.memory.current / serverStats.memory.limit) * 100) 
        : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* KPI CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard
                    title={t('admin.dashboard.stats.server_status')}
                    value={serverStats.online ? "ONLINE" : (serverStats.status || "OFFLINE").toUpperCase()}
                    percent={serverStats.online ? t('admin.dashboard.stats.running_smooth') : t('admin.dashboard.stats.check_console')}
                    icon={<FaServer />}
                    color={serverStats.online ? "#4ade80" : "#ef4444"}
                />
                <StatCard
                    title={t('admin.dashboard.stats.players')}
                    value={serverStats.players.online}
                    percent={`${t('admin.dashboard.stats.capacity')}: ${serverStats.players.max}`}
                    icon={<FaUser />}
                    color="#3b82f6"
                />
                <StatCard
                    title={t('admin.dashboard.stats.pending_tickets')}
                    value={ticketStats.open}
                    percent={`${ticketStats.urgent} ${t('admin.dashboard.stats.high_priority')}`}
                    icon={<FaTicketAlt />}
                    color="#facc15"
                />
                <StatCard
                    title={t('admin.dashboard.stats.revenue')}
                    value={`$${donationStats.currentMonth}`}
                    percent={`${parseFloat(donationStats.percentChange) >= 0 ? '+' : ''}${donationStats.percentChange}% ${t('admin.dashboard.stats.vs_prev_month')}`}
                    icon={<FaMoneyBillWave />}
                    color="#c084fc"
                />
            </div>

            {/* ANALYTICS SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

                {/* Resource Usage (Real Data) */}
                <div className="admin-card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{t('admin.dashboard.resources.title')}</span>
                        <small style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{t('admin.dashboard.resources.updated_now')}</small>
                    </h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaMicrochip /> {t('admin.dashboard.resources.cpu')}</span>
                            <span style={{ fontWeight: 'bold' }}>{serverStats.cpu}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(serverStats.cpu, 100)}%`, height: '100%', background: '#f87171', transition: 'width 1s' }}></div>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaMemory /> {t('admin.dashboard.resources.ram')}</span>
                            <span style={{ fontWeight: 'bold' }}>{serverStats.memory.current} MB / {serverStats.memory.limit} MB</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${memoryPercent}%`, height: '100%', background: '#60a5fa', transition: 'width 1s' }}></div>
                        </div>
                    </div>
                </div>

                {/* Staff Activity (Mock removed for now, or just placeholder until Staff API is built) */}
                <div className="admin-card">
                    <h3 style={{ marginBottom: '1rem' }}>{t('admin.dashboard.staff.title')}</h3>
                    {serverStats.online ? (
                        <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                            {t('admin.dashboard.staff.coming_soon')}
                        </p>
                    ) : (
                        <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '2rem' }}>{t('admin.dashboard.staff.offline_msg')}</p>
                    )}
                </div>

            </div>
        </div>
    )
}

function StatCard({ title, value, percent, color = 'var(--accent)', icon }) {
    return (
        <div className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
                <h4 style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', lineHeight: 1 }}>{value}</span>
                    <span style={{ color: color, fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.9 }}>
                        {percent}
                    </span>
                </div>
            </div>
            <div style={{
                background: color,
                width: '45px', height: '45px',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#000', fontSize: '1.2rem',
                opacity: 0.8
            }}>
                {icon}
            </div>
        </div>
    )
}
