import { useNavigate, Link } from 'react-router-dom'
import { FaUser, FaSignOutAlt, FaGamepad, FaClock, FaCoins, FaTrophy, FaServer, FaCamera, FaPen, FaThumbtack, FaComment, FaShieldAlt, FaMedal, FaLink, FaDiscord, FaTwitch } from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState, useRef, lazy, Suspense } from 'react'
import { supabase } from '@/services/supabaseClient'
import { compressImage } from '@/utils/imageOptimizer'
import { useTranslation } from 'react-i18next'
import '@/dashboard.css'
import Loader from "@/components/UI/Loader"
import RoleBadge from "@/components/User/RoleBadge"
import ConfirmationModal from "@/components/UI/ConfirmationModal"

const SkinViewer = lazy(() => import('@/components/Widgets/AccountSkinViewer'))

export default function Account() {
    const { t } = useTranslation()
    const { user, logout, loading, updateUser } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [uploading, setUploading] = useState(false)
    const [userThreads, setUserThreads] = useState([])
    const [loadingThreads, setLoadingThreads] = useState(false)
    const [isEditingName, setIsEditingName] = useState(false)
    const [newName, setNewName] = useState("")
    const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false)
    const [identityToUnlink, setIdentityToUnlink] = useState(null)
    const [skinUrl, setSkinUrl] = useState(null)
    const fileInputRef = useRef(null)

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login')
        }
    }, [user, loading, navigate])

    useEffect(() => {
        if (activeTab === 'posts' && user) {
            setLoadingThreads(true)
            fetch(`${API_URL}/forum/user/${user.id}/threads`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setUserThreads(data)
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingThreads(false))
        }
    }, [activeTab, user, API_URL])

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const handleAvatarClick = () => {
        fileInputRef.current.click()
    }

    const handleAvatarUpload = async (event) => {
        try {
            setUploading(true)
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error(t('account.avatar.error_select'))
            }

            const file = event.target.files[0]
            const compressedBlob = await compressImage(file)
            const fileExt = 'webp'
            const fileName = `${user.id}/${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, compressedBlob, {
                    contentType: 'image/webp',
                    upsert: true
                })

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            await updateUser({ avatar_url: data.publicUrl })

            // alert('¡Avatar actualizado!') // Optional: replace with toast
        } catch (error) {
            alert(t('account.avatar.error_update') + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleNameUpdate = async () => {
        if (!newName.trim()) return setIsEditingName(false)
        try {
            await updateUser({ full_name: newName.trim() })
            setIsEditingName(false)
        } catch (error) {
            alert(t('account.name.error_update'))
        }
    }

    const handleLinkProvider = async (provider) => {
        try {
            const { data, error } = await supabase.auth.linkIdentity({
                provider: provider,
                options: {
                    redirectTo: window.location.href,
                }
            })
            if (error) throw error
            // linkIdentity usually forces a redirect for OAuth providers, so execution stops here mostly.
            // If it returns data.url, we might need to follow it if not handled automatically (Supabase v2 handles it usually)
            if (data?.url) window.location.href = data.url
        } catch (error) {
            console.error("Error linking provider:", error)
            alert("Error linking account: " + error.message)
        }
    }

    const handleUnlinkProvider = (identityId) => {
        setIdentityToUnlink(identityId)
        setIsUnlinkModalOpen(true)
    }

    const confirmUnlink = async () => {
        if (!identityToUnlink) return

        try {
            const { error } = await supabase.auth.unlinkIdentity(identityToUnlink)
            if (error) throw error
            
            // Close modal
            setIsUnlinkModalOpen(false)
            setIdentityToUnlink(null)
            
            // Refresh logic - reloading is the simplest way to refresh auth state from Supabase
            // Alternatively, updated user object would be better but requires AuthContext support
            location.reload()
        } catch (error) {
            console.error("Error unlinking provider:", error)
            alert("Error unlinking account: " + error.message)
            setIsUnlinkModalOpen(false)
        }
    }

    if (loading || !user) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}><Loader /></div>

    const userStats = {
        playtime: "0h",
        coins: 0,
        rank: user.user_metadata?.role === 'admin' ? t('account.roles.admin') : t('account.roles.user'),
        joined: new Date(user.created_at).toLocaleDateString()
    }

    const mcUsername = user.user_metadata?.username || t('account.minecraft.not_linked')
    const isAdmin = user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'owner'
    
    useEffect(() => {
        const fetchSkin = async () => {
            if (mcUsername && mcUsername !== t('account.minecraft.not_linked')) {
                try {
                    const res = await fetch(`${API_URL}/minecraft/skin/${mcUsername}`);
                    const data = await res.json();
                    if (data.url) {
                        setSkinUrl(data.url);
                    } else {
                         setSkinUrl(`https://minotar.net/skin/${mcUsername}`);
                    }
                } catch (e) {
                    console.error("Failed to fetch skin", e);
                    setSkinUrl(`https://minotar.net/skin/${mcUsername}`);
                }
            } else {
                setSkinUrl(`https://minotar.net/skin/Steve`);
            }
        }
        fetchSkin()
    }, [mcUsername, API_URL, t])
    
    // Check connected providers
    const identities = user.identities || []
    const discordIdentity = identities.find(id => id.provider === 'discord')
    const twitchIdentity = identities.find(id => id.provider === 'twitch')

    return (
        <div className="account-page" style={{ paddingTop: '6rem', minHeight: '100vh', paddingBottom: '4rem', background: '#080808' }}>
            <div className="dashboard-container animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', padding: '0 2rem' }}>

                {/* Sidebar */}
                <aside className="dashboard-sidebar" style={{ background: 'rgba(30,30,35,0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' }}>
                    <div className="user-snippet" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div className="user-avatar-large" onClick={handleAvatarClick} title={t('account.avatar.change_photo')} style={{ width: '100px', height: '100px', margin: '0 auto 1rem', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '3px solid var(--accent)' }}>
                            {uploading ? (
                                <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#333' }}>...</div>
                            ) : (
                                <img src={user.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=" + (user.user_metadata?.full_name || "User")} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.6)', fontSize: '0.7rem', padding: '2px 0' }}><FaCamera /></div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: 'none' }} accept="image/*" />
                        
                        {isEditingName ? (
                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                <input 
                                    autoFocus 
                                    value={newName} 
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder={user.user_metadata?.full_name}
                                    style={{ background: '#222', border: '1px solid #444', color: '#fff', padding: '4px', borderRadius: '4px', width: '140px' }}
                                />
                                <button onClick={handleNameUpdate} style={{ background: 'var(--accent)', border: 'none', borderRadius: '4px', cursor:'pointer' }}>💾</button>
                            </div>
                        ) : (
                            <h3 className="user-name" style={{ color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {user.user_metadata?.full_name || mcUsername}
                                <FaPen size={12} style={{ cursor: 'pointer', color: 'var(--muted)' }} onClick={() => { setNewName(user.user_metadata?.full_name || ""); setIsEditingName(true); }} />
                            </h3>
                        )}
                        <span className="user-email" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{user.email}</span>
                        {isAdmin && <Link to="/admin" className="btn-small" style={{ marginTop: '1rem', display: 'inline-block', background: '#e74c3c', padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px' }}><FaShieldAlt /> {t('account.admin_panel')}</Link>}
                    </div>


                    <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<FaServer />} label={t('account.nav.overview')} />
                        <NavButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={<FaComment />} label={t('account.nav.posts')} />
                        <NavButton active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} icon={<FaTrophy />} label={t('account.nav.achievements')} />
                        <NavButton active={activeTab === 'minecraft'} onClick={() => setActiveTab('minecraft')} icon={<FaGamepad />} label={t('account.nav.minecraft')} />
                        <NavButton active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} icon={<FaLink />} label={t('account.nav.connections')} />
                        
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>
                        
                        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', padding: '0.8rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaSignOutAlt /> {t('account.nav.logout')}
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="dashboard-content">
                    {activeTab === 'overview' && (
                        <div className="fade-in">
                            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.overview.stats_title')}</h2>
                            <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <StatBox icon={<FaMedal color="#f1c40f" />} value={<RoleBadge role={user.user_metadata?.role} username={user.user_metadata?.username} />} label={t('account.overview.rank')} />
                                <StatBox icon={<FaCoins color="#f1c40f" />} value={userStats.coins} label={t('account.overview.coins')} />
                                <StatBox icon={<FaClock color="#3498db" />} value={userStats.playtime} label={t('account.overview.playtime')} />
                            </div>

                            <div className="dashboard-card" style={{ background: 'rgba(30,30,35,0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ marginBottom: '1rem', color: '#fff' }}>{t('account.overview.news_title')}</h3>
                                <p style={{ color: 'var(--muted)' }}>{t('account.overview.no_news')}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'posts' && (
                        <div className="fade-in">
                            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.posts.title')}</h2>
                            {loadingThreads ? <Loader text={t('account.posts.loading')} /> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {userThreads.length === 0 ? (
                                        <p style={{ color: 'var(--muted)' }}>{t('account.posts.empty')}</p>
                                    ) : (
                                        userThreads.map(thread => (
                                            <Link to={`/forum/thread/topic/${thread.id}`} key={thread.id} style={{ textDecoration: 'none' }}>
                                                <div className="thread-card-mini" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h4 style={{ color: '#fff', margin: '0 0 0.3rem 0' }}>{thread.title}</h4>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{new Date(thread.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                                                        <span>{thread.views} {t('account.posts.views')}</span>
                                                        <span>{thread.reply_count} {t('account.posts.replies')}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div className="fade-in">
                            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.achievements.title')}</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                                <AchievementBadge title={t('account.achievements.items.welcome')} icon="👋" unlocked={true} />
                                <AchievementBadge title={t('account.achievements.items.first_post')} icon="📝" unlocked={userThreads.length > 0} />
                                <AchievementBadge title={t('account.achievements.items.veteran')} icon="⚔️" unlocked={false} />
                                <AchievementBadge title={t('account.achievements.items.donor')} icon="💎" unlocked={false} />
                                <AchievementBadge title={t('account.achievements.items.hunter')} icon="🏹" unlocked={false} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'minecraft' && (
                        <div className="fade-in">
                            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.minecraft.title')}</h2>
                            <div className="dashboard-card" style={{ 
                                background: 'rgba(20, 20, 25, 0.8)', 
                                borderRadius: '16px', 
                                border: '1px solid rgba(255,255,255,0.05)', 
                                overflow: 'hidden',
                                maxWidth: '500px',
                                margin: '0 auto',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                            }}>
                                <div style={{ 
                                    padding: '1rem', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    background: 'radial-gradient(circle at center, rgba(109, 165, 192, 0.2) 0%, transparent 70%)',
                                    minHeight: '300px',
                                    position: 'relative'
                                }}>
                                    <Suspense fallback={<div style={{height: 350, display:'flex', alignItems:'center', justifyContent:'center'}}>Cargando skin...</div>}>
                                        <SkinViewer 
                                            skinUrl={skinUrl || `https://minotar.net/skin/Steve`} 
                                            width={300} 
                                            height={350} 
                                        />
                                    </Suspense>
                                </div>
                                
                                <div style={{ 
                                    padding: '1.5rem', 
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))',
                                    textAlign: 'center',
                                    position: 'relative',
                                    zIndex: 3
                                }}>
                                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('account.minecraft.current_user')}</p>
                                    <h3 style={{ color: '#fff', fontSize: '1.8rem', margin: '0 0 1rem 0', fontWeight: 'bold' }}>
                                        {mcUsername}
                                    </h3>
                                    
                                    <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'inline-block' }}>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>
                                            {t('account.minecraft.instruction_1')} <code style={{ color: '#58a6ff', background: 'rgba(88, 166, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>/link {user.email}</code> {t('account.minecraft.instruction_2')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'connections' && (
                        <div className="fade-in">
                            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.connections.title')}</h2>
                            <div className="dashboard-card" style={{ display: 'grid', gap: '1rem' }}>
                                
                                {/* Discord Connection */}
                                <div style={{ 
                                    background: 'rgba(30,30,35,0.6)', 
                                    padding: '1.5rem', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(255,255,255,0.05)', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center' 
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ background: '#5865F2', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                                            <FaDiscord size={24} color="white" />
                                        </div>
                                        <div>
                                            <h3 style={{ color: '#fff', margin: 0 }}>Discord</h3>
                                            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                                                {discordIdentity ? `${t('account.connections.linked')}` : t('account.connections.not_linked')}
                                            </p>
                                        </div>
                                    </div>
                                    {discordIdentity ? (
                                        <button 
                                            onClick={() => handleUnlinkProvider(discordIdentity.id)} 
                                            className="btn-text" 
                                            style={{ color: '#ff6b6b', background: 'transparent', border:'none', cursor:'pointer' }}
                                        >
                                            {t('account.connections.disconnect')}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleLinkProvider('discord')} 
                                            className="btn-primary" 
                                            style={{ background: '#5865F2', border:'none', padding:'0.5rem 1rem', borderRadius:'6px', color:'#fff', cursor:'pointer' }}
                                        >
                                            {t('account.connections.connect')}
                                        </button>
                                    )}
                                </div>

                                {/* Twitch Connection */}
                                <div style={{ 
                                    background: 'rgba(30,30,35,0.6)', 
                                    padding: '1.5rem', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(255,255,255,0.05)', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center' 
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ background: '#9146FF', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                                            <FaTwitch size={24} color="white" />
                                        </div>
                                        <div>
                                            <h3 style={{ color: '#fff', margin: 0 }}>Twitch</h3>
                                            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                                                {twitchIdentity ? `${t('account.connections.linked')}` : t('account.connections.not_linked')}
                                            </p>
                                        </div>
                                    </div>
                                    {twitchIdentity ? (
                                        <button 
                                            onClick={() => handleUnlinkProvider(twitchIdentity.id)} 
                                            className="btn-text" 
                                            style={{ color: '#ff6b6b', background: 'transparent', border:'none', cursor:'pointer' }}
                                        >
                                            {t('account.connections.disconnect')}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleLinkProvider('twitch')} 
                                            className="btn-primary" 
                                            style={{ background: '#9146FF', border:'none', padding:'0.5rem 1rem', borderRadius:'6px', color:'#fff', cursor:'pointer' }}
                                        >
                                            {t('account.connections.connect')}
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}



                    <ConfirmationModal 
                        isOpen={isUnlinkModalOpen}
                        onClose={() => setIsUnlinkModalOpen(false)}
                        onConfirm={confirmUnlink}
                        title={t('account.connections.unlink_confirm_title')}
                        message={t('account.connections.unlink_confirm_message')}
                        confirmText={t('account.connections.confirm_unlink')}
                        cancelText={t('account.connections.cancel')}
                        isDanger={true}
                    />

                </main>
            </div>
        </div>
    )
}

// Subcomponents for cleaner code
function NavButton({ active, onClick, icon, label }) {
    return (
        <button 
            onClick={onClick}
            style={{
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#000' : 'var(--muted)',
                border: 'none',
                padding: '0.8rem 1rem',
                textAlign: 'left',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: active ? 'bold' : 'normal',
                transition: 'all 0.2s'
            }}
        >
            {icon} {label}
        </button>
    )
}

function StatBox({ icon, value, label }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>{icon}</div>
            <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{value}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{label}</div>
            </div>
        </div>
    )
}

function AchievementBadge({ title, icon, unlocked }) {
    return (
        <div style={{ 
            aspectRatio: '1/1', 
            background: unlocked ? 'rgba(46, 204, 113, 0.1)' : 'rgba(0,0,0,0.3)', 
            border: unlocked ? '1px solid #2ecc71' : '1px solid #333',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: unlocked ? 1 : 0.5,
            padding: '1rem'
        }}>
            <span style={{ fontSize: '2rem', marginBottom: '0.5rem', filter: unlocked ? 'none' : 'grayscale(100%)' }}>{icon}</span>
            <span style={{ fontSize: '0.8rem', color: unlocked ? '#fff' : '#666', textAlign: 'center' }}>{title}</span>
        </div>
    )
}
