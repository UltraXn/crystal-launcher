import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaUsers, FaCheckCircle, FaCopy, FaMicrochip } from "react-icons/fa"
import Confetti from "canvas-confetti"
import Loader from "../components/UI/Loader"
import { useTranslation } from 'react-i18next'

const API_URL = import.meta.env.VITE_API_URL

interface ServerStatusData {
    online: boolean;
    motd: string;
    version: string;
    players: {
        online: number;
        max: number;
        sample: { name: string, id: string }[]
    };
    icon: string;
    latency?: number;
    error?: string;
}

export default function Status() {
    const [status, setStatus] = useState<ServerStatusData | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const { t } = useTranslation()

    const SERVER_IP = "mc.crystaltidesSMP.net" // Display IP

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/server/status/live`)
            const data = await res.json()
            setStatus(data)
        } catch (error) {
            console.error("Error fetching status:", error)
            setStatus(null) // Acts as offline/error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(() => fetchStatus(), 15000) // Refresh every 15s
        return () => clearInterval(interval)
    }, [])

    const handleCopy = () => {
        navigator.clipboard.writeText(SERVER_IP)
        setCopied(true)
        Confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#4ade80', '#ffffff']
        });
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader />
            </div>
        )
    }

    const isOnline = status?.online ?? false
    const playerCount = status?.players?.online || 0
    const maxPlayers = status?.players?.max || 0
    const percentage = maxPlayers > 0 ? (playerCount / maxPlayers) * 100 : 0
    
    // Clean MOTD (remove color codes if raw logic isn't perfect, though backend sends .clean)
    const cleanMotd = status?.motd || "Servidor Minecraft"

    return (
        <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '8rem 1rem 2rem' }}>
            
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >

                <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{t('status.title')}</h1>
                <p className="text-gray-400">{t('status.subtitle')}</p>
            </motion.div>

            {/* Main Status Log */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                    background: 'rgba(20, 20, 25, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Glow Effect based on status */}
                <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '60%', height: '5px',
                    background: isOnline ? 'var(--success)' : 'var(--error)',
                    boxShadow: isOnline ? '0 0 50px 20px rgba(74, 222, 128, 0.2)' : '0 0 50px 20px rgba(239, 68, 68, 0.2)',
                    opacity: 0.8
                }} />

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 z-10 relative w-full">
                    {/* Icon */}
                    <div className="relative">
                        <div style={{
                            width: '120px', height: '120px', borderRadius: '24px',
                            background: '#000', overflow: 'hidden',
                            border: isOnline ? '2px solid var(--success)' : '2px solid var(--error)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                             <img src="/images/server_icon.png" alt="Server Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left w-full">
                        <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 mb-4 w-full">
                            <div>
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3">
                                    {SERVER_IP}
                                    <button 
                                        onClick={handleCopy}
                                        style={{ 
                                            background: copied ? 'var(--success)' : 'rgba(255,255,255,0.1)', 
                                            color: '#fff',
                                            border: 'none',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {copied ? <FaCheckCircle /> : <FaCopy />}
                                        <span style={{ fontWeight: 'bold' }}>{copied ? t('common.copied') : t('common.copy')}</span>
                                    </button>
                                </h2>
                                <p className="text-gray-400 mt-1">{cleanMotd}</p>
                            </div>
                            <div className="flex flex-col items-center md:items-end">
                                <span style={{
                                    fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px',
                                    color: isOnline ? 'var(--success)' : 'var(--error)',
                                    background: isOnline ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    padding: '0.4rem 1rem', borderRadius: '8px', border: isOnline ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                                }}>
                                    {isOnline ? t('status.online') : t('status.offline')}
                                </span>
                            </div>
                        </div>

                        {/* Player Bar */}
                        <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden relative mb-2">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400"
                            />
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>{t('status.version')}: {status?.version || "1.21.1"}</span>
                            <span>{t('status.players')}: <strong className="text-white">{playerCount}</strong> / {maxPlayers}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Players Grid */}
            <AnimatePresence>
                {isOnline && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                         <div style={{
                            background: 'rgba(20, 20, 25, 0.4)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                         }}>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FaUsers className="text-accent" /> {t('status.online_players')}
                            </h3>
                            
                            {status?.players.sample && status.players.sample.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {status.players.sample.map((p, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                                            <img 
                                                src={`https://minotar.net/helm/${p.name}/24.png`} 
                                                alt={p.name}
                                                className="rounded-sm"
                                            />
                                            <span className="font-medium text-sm">{p.name}</span>
                                        </div>
                                    ))}
                                    {status.players.sample.length < playerCount && (
                                        <div className="px-3 py-2 text-gray-500 text-sm italic">
                                            + {playerCount - status.players.sample.length} {t('status.more')}...
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">
                                    {playerCount === 0 ? t('status.no_players') : t('status.list_unavailable')}
                                </p>
                            )}
                         </div>

                         <div style={{
                            background: 'rgba(20, 20, 25, 0.4)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                             display: 'flex', flexDirection: 'column', gap: '1rem'
                         }}>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FaMicrochip className="text-blue-400" /> {t('status.tech_info')}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between p-3 rounded-lg bg-black/20">
                                    <span className="text-gray-400">{t('status.latency')}</span>
                                    <span className={`font-mono ${
                                        status?.latency != null 
                                            ? status.latency <= 100 ? 'text-green-400' 
                                            : status.latency < 200 ? 'text-yellow-400' 
                                            : 'text-red-400'
                                            : 'text-gray-400'
                                    }`}>
                                        {status?.latency != null ? Math.round(status.latency) + 'ms' : '--'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-black/20 w-full">
                                    <span className="text-gray-400">{t('status.mode')}</span>
                                    <span className="font-medium text-white">Survival / SMP</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-black/20 w-full">
                                    <span className="text-gray-400">{t('status.platform')}</span>
                                    <span className="font-medium text-white">Java Edition</span>
                                </div>
                            </div>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {!isOnline && !loading && (
                 <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-xl mt-4"
                >
                     <h3 className="text-xl font-bold text-red-400 mb-2">{t('status.offline_title')}</h3>
                    <p className="text-gray-400">{t('status.offline_desc')}</p>
                 </motion.div>
            )}
        </div>
    )
}
