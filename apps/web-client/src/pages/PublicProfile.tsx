import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { FaUser, FaMedal, FaGamepad, FaTrophy, FaSkull, FaClock, FaHammer, FaTwitter, FaDiscord, FaTwitch, FaYoutube, FaHome, FaHeart } from "react-icons/fa"
import RoleBadge from "../components/User/RoleBadge"
import Loader from "../components/UI/Loader"
import { MEDAL_ICONS } from "../utils/MedalIcons"
import MarkdownRenderer from "../components/UI/MarkdownRenderer"
import ProfileWall from "../components/User/ProfileWall"
import SkinViewer from "../components/User/SkinViewer"
import { useAuth } from "../context/AuthContext"
import { isAdmin as checkIsAdmin } from "../utils/roleUtils"
import { FaPlus } from "react-icons/fa6"
import { supabase } from "../services/supabaseClient"
import Toast, { ToastType } from "../components/UI/Toast"

const API_URL = import.meta.env.VITE_API_URL

interface MedalDefinition {
    id: string | number;
    name: string;
    description: string;
    icon: string;
    color: string;
}

interface Profile {
    id: string;
    username: string;
    avatar_url?: string;
    profile_banner_url?: string;
    role: string;
    created_at: string;
    medals?: (string | number)[];
    public_stats: boolean;
    bio?: string;
    social_discord?: string;
    social_twitter?: string;
    social_twitch?: string;
    social_youtube?: string;
    minecraft_uuid?: string;
    avatar_preference?: 'minecraft' | 'social';
    reputation?: number;
}

interface PlayerStats {
    playtime: string;
    kills: number;
    mob_kills: number;
    deaths: number;
    money: string;
    blocks_mined: string;
    blocks_placed: string;
}

// LinkDiscordForm was here, removed as it belongs more to Account settings.

export default function PublicProfile() {
    const { username } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { user: currentUser } = useAuth()
    
    
    const isAdmin = checkIsAdmin(currentUser)

    
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [medalDefinitions, setMedalDefinitions] = useState<MedalDefinition[]>([])
    const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null)
    const [statsLoading, setStatsLoading] = useState(false)
    const [givingKarma, setGivingKarma] = useState(false)
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
        visible: false,
        message: '',
        type: 'info'
    })

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ visible: true, message, type })
    }

    const handleGiveKarma = async () => {
        if (!currentUser || !profile) return;
        if (currentUser.id === profile.id) return;
        
        setGivingKarma(true);
        try {
            const res = await fetch(`${API_URL}/users/${profile.id}/karma`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                }
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setProfile(prev => prev ? ({ ...prev, reputation: data.newReputation }) : null);
                showToast("¡Karma entregado!", "success");
            } else {
                showToast(data.error || "Error al dar karma", "error");
            }
        } catch (e) { 
            console.error(e); 
            showToast("Error de conexión", "error");
        }
        finally { setGivingKarma(false); }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                // 1. Fetch Profile
                const resUser = await fetch(`${API_URL}/users/profile/${username}`)
                if (!resUser.ok) {
                    if(resUser.status === 404) throw new Error(t('profile.not_found', 'Usuario no encontrado'))
                    throw new Error("Error loading profile")
                }
                const response = await resUser.json()
                if (!response.success || !response.data) throw new Error("Invalid response format")
                const userData = response.data
                setProfile(userData)

                // 2. Fetch Medals Definitions (if user has medals)
                if (userData.medals && userData.medals.length > 0) {
                    const resSettings = await fetch(`${API_URL}/settings`)
                    if (resSettings.ok) {
                        const settings = await resSettings.json()
                        if (settings.medal_definitions) {
                            try {
                                const parsed = typeof settings.medal_definitions === 'string' 
                                    ? JSON.parse(settings.medal_definitions) 
                                    : settings.medal_definitions
                                setMedalDefinitions(Array.isArray(parsed) ? parsed : [])
                            } catch (e) {
                                console.warn("Failed to parse medals", e)
                            }
                        }
                    }
                }

                if (userData.public_stats) {
                    setStatsLoading(true)
                    try {
                        const resStats = await fetch(`${API_URL}/player-stats/${username}`)
                        if (resStats.ok) {
                            const response = await resStats.json()
                            if (response.success && response.data) {
                                setPlayerStats(response.data)
                            } else {
                                setPlayerStats(response)
                            }
                        }
                    } catch (e) { console.warn("Failed to fetch stats", e) }
                    finally { setStatsLoading(false) }
                }
            } catch (err) {
                console.error(err)
                setError(err instanceof Error ? err.message : "Unknown error")
            } finally {
                setLoading(false)
            }
        }

        if (username) fetchData()
    }, [username, t])

    if (loading) return <div className="layout-center"><Loader /></div>
    
    if (error) return (
        <div style={{ 
            display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem', 
            minHeight: '80vh',
            textAlign: 'center',
            padding: '2rem',
            width: '100%'
        }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    width: '120px',
                    height: '120px',
                    background: 'rgba(255, 68, 68, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 68, 68, 0.2)',
                    marginBottom: '1rem',
                    boxShadow: '0 0 40px rgba(255, 68, 68, 0.1)'
                }}
            >
                <FaUser size={50} style={{ color: '#ff4444', opacity: 0.8 }} />
            </motion.div>
            
            <div style={{ maxWidth: '450px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to bottom, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('profile.not_found_title', '¿A dónde se fue?')}
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                    {t('profile.not_found_desc', 'No hemos podido encontrar a ningún usuario con ese nombre. Quizás se ha perdido en el mar o nunca existió.')}
                </p>
                
                <button 
                    className="nav-btn primary" 
                    onClick={() => navigate('/')}
                    style={{ 
                        padding: '1rem 2.5rem', 
                        fontSize: '1rem', 
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.8rem'
                    }}
                >
                    <FaHome /> {t('common.back_home', 'Volver al Inicio')}
                </button>
            </div>
        </div>
    )

    if (!profile) return null

    return (
        <div className="public-profile-container fade-in">
            <style>{`
                .public-profile-container {
                    padding-bottom: 4rem;
                    min-height: 100vh;
                    background: #050505;
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                /* Premium Header & Banner */
                .profile-header-premium {
                    width: 100%;
                    height: 350px;
                    position: relative;
                    overflow: visible;
                    background: #0a0a0a;
                    margin-bottom: 4rem;
                }
                .profile-banner {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0));
                    opacity: 0.6;
                }
                .profile-banner-placeholder {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(45deg, #111 25%, #1a1a1a 50%, #111 75%);
                    background-size: 200% 200%;
                    animation: gradient-shift 10s ease infinite;
                    mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0));
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50% }
                    50% { background-position: 100% 50% }
                    100% { background-position: 0% 50% }
                }

                /* Floating Avatar Info */
                .profile-header-content {
                    position: absolute;
                    bottom: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                    max-width: 1200px;
                    padding: 0 2rem;
                    display: flex;
                    align-items: flex-end;
                    gap: 2rem;
                }
                .profile-avatar-wrapper {
                    position: relative;
                    flex-shrink: 0;
                }
                .profile-avatar-premium {
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    border: 6px solid #050505;
                    background: #111;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
                    object-fit: cover;
                }
                .profile-info-floating {
                    padding-bottom: 20px;
                }
                .profile-info-floating h1 {
                    font-size: 3rem;
                    font-weight: 900;
                    margin: 0;
                    letter-spacing: -1px;
                    text-shadow: 0 4px 20px rgba(0,0,0,0.8);
                }

                /* Layout */
                .profile-content {
                    width: 100%;
                    max-width: 1200px;
                    padding: 0 1.5rem;
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 2rem;
                }
                .profile-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                /* Glassmorphism Cards */
                .premium-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 24px;
                    padding: 2rem;
                    position: relative;
                    transition: all 0.3s ease;
                }
                .premium-card:hover {
                    border-color: rgba(255, 255, 255, 0.12);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                }
                .premium-card h3 {
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: rgba(255,255,255,0.4);
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }

                .skin-preview-premium {
                    width: 100%;
                    aspect-ratio: 3/4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .stat-grid-premium {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }
                .stat-item-premium {
                    background: rgba(255,255,255,0.02);
                    padding: 1.2rem;
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.04);
                    transition: transform 0.2s;
                }
                .stat-item-premium:hover {
                    background: rgba(255,255,255,0.04);
                    transform: translateY(-4px);
                }
                .stat-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0.8rem;
                    font-size: 0.9rem;
                }

                @media (max-width: 900px) {
                    .profile-header-content {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        bottom: -150px;
                    }
                    .profile-header-premium {
                        margin-bottom: 11rem;
                    }
                    .profile-content {
                        grid-template-columns: 1fr;
                    }
                    .profile-info-floating h1 {
                        font-size: 2.2rem;
                    }
                }
            `}</style>

            
            {/* Premium Header */}
            <div className="profile-header-premium">
                {profile.profile_banner_url ? (
                    <img src={profile.profile_banner_url} alt="Banner" className="profile-banner" />
                ) : (
                    <div className="profile-banner-placeholder" />
                )}
                
                <div className="profile-header-content">
                    <div className="profile-avatar-wrapper">
                        <img 
                            src={
                                (profile.avatar_preference === 'social' && profile.avatar_url) 
                                    ? profile.avatar_url 
                                    : `https://mc-heads.net/avatar/${profile.username}/180`
                            } 
                            alt={profile.username}
                            className="profile-avatar-premium"
                        />
                    </div>
                    <div className="profile-info-floating">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <RoleBadge role={profile.role} username={profile.username} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <h1>{profile.username}</h1>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem', 
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <FaHeart style={{ color: '#ff4444' }} />
                                    <span style={{ fontWeight: 800 }}>{profile.reputation || 0}</span>
                                    {currentUser && currentUser.id !== profile.id && (
                                        <button 
                                            onClick={handleGiveKarma}
                                            disabled={givingKarma}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                color: '#ff4444', 
                                                cursor: 'pointer',
                                                padding: '0.2rem',
                                                display: 'flex',
                                                opacity: givingKarma ? 0.5 : 1
                                            }}
                                            title="Dar Karma"
                                        >
                                            <FaPlus />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            
            <div className="profile-content">
                {/* Left Column: Stats & Skin */}
                <div className="profile-sidebar">
                     {/* Skin Showcase */}
                     <div className="premium-card">
                        <h3><FaGamepad /> {t('profile.skin', 'Avatar 3D')}</h3>
                        <div className="skin-preview-premium">
                            <SkinViewer username={profile.username} height={380} width={280} />
                        </div>
                    </div>

                    {/* Stats Showcase */}
                    <div className="premium-card">
                        <h3><FaTrophy /> {t('profile.stats', 'Estadísticas')}</h3>
                        {(profile.public_stats || isAdmin) ? (
                            <div className="stat-grid-premium">
                                {statsLoading ? (
                                    <Loader text="..." />
                                ) : playerStats ? (
                                    <>
                                        <div className="stat-item-premium">
                                            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><FaClock /></div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{playerStats?.playtime || '0h'}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('profile.time', 'Tiempo Jugado')}</div>
                                        </div>
                                        <div className="stat-item-premium">
                                            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><FaSkull /></div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{playerStats?.deaths || 0}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('profile.deaths', 'Muertes')}</div>
                                        </div>
                                        <div className="stat-item-premium" style={{ position: 'relative', overflow: 'hidden' }}>
                                            <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                                                <img src="/images/killucoin.webp" alt="K" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                            </div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{playerStats?.money || 0}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('profile.killucoins', 'Killucoins')}</div>
                                        </div>
                                        <div className="stat-item-premium">
                                            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><FaHammer /></div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{playerStats?.blocks_mined || 0}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('profile.mined', 'Bloques Minados')}</div>
                                        </div>
                                    </>
                                ) : <p>Error</p>}
                            </div>
                        ) : <p>{t('profile.private_stats')}</p>}
                    </div>
                </div>

                {/* Right Column: Bio, Medals & Wall */}
                <div className="profile-main">
                    {/* Bio & Social */}
                    <div className="premium-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h3><FaUser /> {t('profile.about_me')}</h3>
                                <div style={{ color: '#aaa', lineHeight: 1.8 }}>
                                    {profile.bio ? <MarkdownRenderer content={profile.bio} /> : <p style={{ fontStyle: 'italic' }}>{t('profile.no_bio', 'Este usuario prefiere mantener el misterio.')}</p>}
                                </div>
                            </div>
                            
                            <div style={{ width: '200px' }}>
                                <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#444', letterSpacing: '1px', marginBottom: '1rem' }}>Social</h4>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    {profile.social_discord && <FaDiscord size={20} style={{ color: '#5865F2' }} title={profile.social_discord} />}
                                    {profile.social_twitter && <FaTwitter size={20} style={{ color: '#1d9bf0' }} />}
                                    {profile.social_twitch && <FaTwitch size={20} style={{ color: '#9146FF' }} />}
                                    {profile.social_youtube && <FaYoutube size={20} style={{ color: '#ff0000' }} />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medals Showcase */}
                    {profile.medals && profile.medals.length > 0 && (
                        <div className="premium-card">
                            <h3><FaMedal /> {t('profile.medals')}</h3>
                            <div className="medal-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                {profile.medals.map((medalId: string | number) => {
                                    const def = medalDefinitions.find((m: MedalDefinition) => m.id === medalId)
                                    if (!def) return null
                                    const Icon = MEDAL_ICONS[def.icon as keyof typeof MEDAL_ICONS] || FaMedal
                                    return (
                                        <motion.div 
                                            key={medalId}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            style={{ 
                                                padding: '0.8rem', 
                                                background: 'rgba(255,255,255,0.03)', 
                                                borderRadius: '12px',
                                                border: `1px solid ${def.color}33`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.8rem'
                                            }}
                                            title={def.description}
                                        >
                                            <Icon style={{ color: def.color, fontSize: '1.2rem' }} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{def.name}</span>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Profile Wall */}
                    <div className="premium-card" style={{ padding: 0, background: 'transparent', border: 'none', backdropFilter: 'none' }}>
                         <ProfileWall profileId={profile.id} isAdmin={isAdmin} />
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            <Toast 
                message={toast.message} 
                type={toast.type} 
                isVisible={toast.visible}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
            />
        </div>
    )
}
