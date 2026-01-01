import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTwitter, FaDiscord, FaYoutube, FaBriefcase, FaUsers, FaTwitch, FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Section from '../Layout/Section';
import Loader from '../UI/Loader';
import MinecraftAvatar from '../UI/MinecraftAvatar';

// Pixel Art Bubble SVG Data URI
const BUBBLE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath d='M2 0h4v1H2zM1 1h1v1H1zM6 1h1v1H6zM0 2h1v4H0zM7 2h1v4H7zM1 6h1v1H1zM6 6h1v1H6zM2 7h4v1H2z'/%3E%3C/svg%3E";
const HIGHLIGHT_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath d='M2 2h2v1H2zM2 3h1v1H2z'/%3E%3C/svg%3E";

const CardBubbles = ({ color }: { color: string }) => {
    // Generate random bubbles with stable IDs
    const [bubbles] = useState(() => Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        size: Math.random() * 10 + 10, // 10-20px
        left: Math.random() * 80 + 10, // 10-90%
        delay: Math.random() * 5,
        duration: Math.random() * 5 + 8 // 8-13s
    })));

    return (
        <div style={{ 
            position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '20px', 
            pointerEvents: 'none', zIndex: 0 
        }}>
            {bubbles.map(b => (
                <div key={b.id} style={{
                    position: 'absolute',
                    left: `${b.left}%`,
                    bottom: '-20%',
                    width: `${b.size}px`,
                    height: `${b.size}px`,
                    animation: `card-float ${b.duration}s linear infinite`,
                    animationDelay: `${b.delay}s`,
                    opacity: 0
                }}>
                    {/* Colored Body */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: color,
                        maskImage: `url("${BUBBLE_SVG}")`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskImage: `url("${BUBBLE_SVG}")`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        opacity: 0.2
                    }} />
                    {/* White Highlight */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: 'white',
                        maskImage: `url("${HIGHLIGHT_SVG}")`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskImage: `url("${HIGHLIGHT_SVG}")`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        opacity: 0.4
                    }} />
                </div>
            ))}
        </div>
    );
};

interface StaffMember {
    id: string | number;
    name: string;
    mc_nickname?: string; // Added field
    role: string;
    role_en?: string;
    image: string;
    color: string;
    description: string;
    description_en?: string;
    socials?: {
        twitter?: string;
        discord?: string;
        youtube?: string;
        twitch?: string;
    };
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

const RANK_BADGES: Record<string, string> = {
    'Neroferno': '/ranks/rank-neroferno.png',
    'Killuwu': '/ranks/rank-killu.png',
    'Developer': '/ranks/developer.png',
    'Admin': '/ranks/admin.png',
    'Moderator': '/ranks/moderator.png',
    'Helper': '/ranks/helper.png',
    'Usuario': '/ranks/user.png',
    'Staff': '/ranks/staff.png'
};

interface StaffShowcaseProps {
    mockStaff?: StaffMember[];
    mockOnlineStatus?: Record<string, { mc: string, discord: string }>;
    mockRecruitment?: { status: string; link: string };
}

export default function StaffShowcase({ mockStaff, mockOnlineStatus, mockRecruitment }: StaffShowcaseProps) {
    const { t, i18n } = useTranslation();
    const [staff, setStaff] = useState<StaffMember[]>(mockStaff || []);
    
    // Helper to get badge
    const getBadge = (role: string) => {
        if (!role) return null;
        const key = Object.keys(RANK_BADGES).find(k => k.toLowerCase() === role.toLowerCase());
        return key ? RANK_BADGES[key] : null;
    };
    const [recruitment, setRecruitment] = useState<{ status: string; link: string }>(mockRecruitment || { status: 'false', link: '' });
    const [loading, setLoading] = useState(!mockStaff);
    // Store separated statuses
    const [onlineStaff, setOnlineStaff] = useState<Record<string, { mc: string, discord: string }>>(mockOnlineStatus || {});
    const [hoveredDiscord, setHoveredDiscord] = useState<string | null>(null);

    const resolveUrl = (url: string, platform: 'twitter' | 'youtube' | 'twitch') => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        if (platform === 'twitter') return `https://x.com/${url.replace('@', '')}`;
        if (platform === 'youtube') return `https://youtube.com/@${url}`;
        if (platform === 'twitch') return `https://twitch.tv/${url}`;
        return url;
    };

    useEffect(() => {
        if (mockStaff) return;

        // Fetch Settings (Staff Cards & Recruitment)
        fetch(`${API_URL}/settings?t=${new Date().getTime()}`)
            .then(res => {
                if(!res.ok) throw new Error(`Fetch settings failed with status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if(data && data.staff_cards) {
                    try {
                        const parsed = typeof data.staff_cards === 'string' ? JSON.parse(data.staff_cards) : data.staff_cards;
                        setStaff(Array.isArray(parsed) ? parsed : []);
                    } catch { setStaff([]); }
                }
                if (data) {
                    setRecruitment({
                        status: data.recruitment_status || 'false',
                        link: data.recruitment_link || ''
                    });
                }
            })
            .catch(err => {
                console.warn("StaffShowcase: Settings fetch error:", err.message);
                setStaff([]);
            })
            .finally(() => setLoading(false));

        // Fetch Online Staff
        const fetchStatus = () => {
            fetch(`${API_URL}/server/staff`)
                .then(res => res.ok ? res.json() : [])
                .then(data => {
                    if(Array.isArray(data)) {
                        const statusMap: Record<string, { mc: string, discord: string }> = {};
                        data.forEach((u: { username: string; mc_status?: string; discord_status?: string }) => {
                             statusMap[u.username.toLowerCase()] = {
                                 mc: u.mc_status || 'offline',
                                 discord: u.discord_status || 'offline'
                             };
                        });
                        setOnlineStaff(statusMap);
                    }
                })
                .catch(() => {});
        };

        if (!mockStaff) fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [mockStaff]);

    if (loading) return (
        <Section><div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader /></div></Section>
    );

    if (staff.length === 0) return (
        <Section title="Debug Staff">
            <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>
                {t('staff.no_data', 'No staff data found. Please check settings or save again from the panel.')}
            </div>
        </Section>
    );

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'online': return '#22c55e'; // Green
            case 'dnd': return '#ef4444';    // Red
            case 'idle': return '#eab308';   // Yellow
            default: return '#52525b';       // Gray
        }
    };

    return (
        <Section title={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><FaUsers style={{ color: 'var(--accent)', fontSize: '1.2em' }} /> {t('staff.title', 'Nuestro Equipo')}</div>}>
            
            {/* Recruitment Banner */}
            <AnimatePresence>
                {recruitment.status === 'true' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '3rem' }}
                    >
                        <a 
                            href={recruitment.link || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-hiring"
                            style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'rgba(16, 185, 129, 0.1)', 
                                border: '1px solid rgba(16, 185, 129, 0.3)', 
                                padding: '0.8rem 2rem', 
                                borderRadius: '100px',
                                color: '#10b981',
                                textDecoration: 'none',
                                fontWeight: 600,
                                transition: 'all 0.3s'
                            }}
                        >
                            <FaBriefcase /> {t('staff.hiring_title', '¿Quieres unirte?')} - {t('staff.hiring_action', '¡Estamos buscando staff!')}
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>

            <div 
                style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                    gap: '2rem',
                    padding: '0 1rem'
                }}
            >
                {staff.map((member) => {
                    const status = onlineStaff[(member.mc_nickname || member.name).toLowerCase()] || { mc: 'offline', discord: 'offline' };
                    const discordColor = getStatusColor(status.discord);
                    
                    return (
                    <motion.div 
                        key={member.id} 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="staff-card-home"
                        style={{ 
                            '--staff-color': member.color,
                            borderRadius: '20px', 
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            position: 'relative',
                            // overflow: 'hidden', // Removed to allow tooltips
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                        } as React.CSSProperties}
                    >
                        {/* Accent Top Border removed (now part of background) */}
                        
                        {/* Internal Bubbles */}
                        <CardBubbles color={member.color} />

                        <div style={{ position: 'relative', marginBottom: '1.5rem', zIndex: 2 }}>
                            <div style={{ 
                                width: '100px', 
                                height: '100px', 
                                borderRadius: '50%', 
                                overflow: 'hidden',
                                border: `3px solid ${member.color}`,
                                boxShadow: `0 0 15px ${member.color}30`
                            }}>
                                <MinecraftAvatar 
                                    src={member.image || member.mc_nickname || member.name} 
                                    alt={member.name} 
                                    size={120} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>

                             {/* Status Stack - Bottom Right */}
                             <div style={{ 
                                 position: 'absolute', 
                                 bottom: '4px', 
                                 right: '4px', 
                                 display: 'flex', 
                                 flexDirection: 'column-reverse', 
                                 gap: '6px',
                                 zIndex: 10
                             }}>
                                {status.mc === 'online' && (
                                    <div 
                                        title="Jugando en Minecraft"
                                        style={{ 
                                            width: '24px', height: '24px', 
                                            borderRadius: '50%',
                                            background: '#18181b', 
                                            border: '3px solid #22c55e',
                                            boxShadow: '0 0 10px #22c55e',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }} 
                                    >
                                        <img src="/images/ui/minecraft_logo_icon_168974.png" alt="MC" style={{ width: '14px', height: '14px' }} />
                                    </div>
                                 )}

                                <div 
                                    title={`Discord: ${status.discord.toUpperCase()}`}
                                    style={{
                                        width: '24px', height: '24px',
                                        borderRadius: '50%',
                                        background: '#5865F2',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: `3px solid ${discordColor}`, // Status as Border
                                        boxShadow: `0 0 10px ${discordColor}`,
                                    }}
                                >
                                    <FaDiscord style={{ color: '#fff', fontSize: '12px' }} /> 
                                </div>
                             </div>
                            
                            {/* Fallback Dot (if no Discord but we want to show something? No, user asked for split status) 
                                Use generic dot only if MC is online and no discord? 
                                User asked for: "uno con icono minecraft y otro con icono discord".
                                Implementation above does exactly that.
                            */}
                        </div>

                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#fff' }}>{member.name}</h3>
                        
                        {getBadge(member.role) ? (
                            <img src={getBadge(member.role)!} alt={member.role} style={{ height: 'auto', marginBottom: '1.2rem', maxWidth: '100%' }} />
                        ) : (
                            <span style={{ 
                                fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px',
                                color: member.color, background: `${member.color}15`, padding: '4px 12px', borderRadius: '10px',
                                marginBottom: '1rem', border: `1px solid ${member.color}20`
                            }}>
                                {i18n.language === 'en' && member.role_en ? member.role_en : member.role}
                            </span>
                        )}

                        <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                            {(() => {
                                const desc = i18n.language === 'en' && member.description_en ? member.description_en : member.description;
                                // Protection for "ultroso" inside joke
                                return desc.replace(/outrageous(ness|ly)?/gi, 'ultroso');
                            })()}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', opacity: 0.8, position: 'relative' }}>
                            {member.socials?.twitter && <a href={resolveUrl(member.socials.twitter, 'twitter')} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', transition: 'color 0.2s' }}><FaTwitter size={18} /></a>}
                            
                            {member.socials?.discord && (
                                <div 
                                    style={{ position: 'relative', display: 'flex', alignItems: 'center', zIndex: 20 }}
                                    onMouseEnter={() => setHoveredDiscord(String(member.id))}
                                    onMouseLeave={() => setHoveredDiscord(null)}
                                >
                                    <div style={{ color: '#fff', cursor: 'help', position: 'relative' }}>
                                        <FaDiscord size={18} />
                                        {status.discord !== 'offline' && (
                                            <FaCheckCircle 
                                                size={10} 
                                                style={{ 
                                                    position: 'absolute', 
                                                    bottom: -3, 
                                                    right: -3, 
                                                    color: discordColor, 
                                                    background: '#18181b', 
                                                    borderRadius: '50%',
                                                    border: '1px solid #18181b'
                                                }} 
                                            />
                                        )}
                                    </div>
                                    <AnimatePresence>
                                        {hoveredDiscord === String(member.id) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.9, x: '-50%' }}
                                                animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                                                exit={{ opacity: 0, y: 10, scale: 0.9, x: '-50%' }}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '100%',
                                                    left: '50%',
                                                    marginBottom: '10px',
                                                    background: '#18181b',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    whiteSpace: 'nowrap',
                                                    zIndex: 100, // Boost z-index for tooltips
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    color: '#fff',
                                                    pointerEvents: 'none'
                                                }}
                                            >
                                                {member.socials.discord.split(',')[0].trim()}
                                                <div style={{ 
                                                    position: 'absolute', bottom: '-4px', left: '50%', 
                                                    width: '8px', height: '8px', background: '#18181b', 
                                                    borderRight: '1px solid rgba(255,255,255,0.1)', 
                                                    borderBottom: '1px solid rgba(255,255,255,0.1)', 
                                                    transform: 'translateX(-50%) rotate(45deg)' 
                                                }}></div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {member.socials?.twitch && (
                                <a href={resolveUrl(member.socials.twitch, 'twitch')} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', transition: 'color 0.2s', position: 'relative' }}>
                                    <FaTwitch size={18} />
                                    {onlineStaff[member.name.toLowerCase()]?.mc === 'online' && (
                                        <FaCheckCircle 
                                            size={10} 
                                            style={{ 
                                                position: 'absolute', 
                                                bottom: -3, 
                                                right: -3, 
                                                color: '#22c55e', 
                                                background: '#18181b', 
                                                borderRadius: '50%',
                                                border: '1px solid #18181b'
                                            }} 
                                        />
                                    )}
                                </a>
                            )}
                            
                            {member.socials?.youtube && <a href={resolveUrl(member.socials.youtube, 'youtube')} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', transition: 'color 0.2s' }}><FaYoutube size={18} /></a>}
                        </div>
                    </motion.div>
                    );
                })}
                <style>{`
                    .staff-card-home {
                        background: linear-gradient(to bottom, var(--staff-color) 4px, transparent 4px), rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                    }
                    .staff-card-home:hover {
                        transform: translateY(-10px);
                         background: linear-gradient(to bottom, var(--staff-color) 4px, transparent 4px), rgba(255, 255, 255, 0.08) !important;
                        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
                    }
                    .btn-hiring:hover {
                        background: rgba(16, 185, 129, 0.2) !important;
                        transform: scale(1.05);
                    }
                    @keyframes card-float {
                        0% { transform: translateY(0) translateX(0); opacity: 0; }
                        20% { opacity: 1; }
                        50% { transform: translateY(-150px) translateX(10px); }
                        100% { transform: translateY(-300px) translateX(-10px); opacity: 0; }
                    }
                `}</style>
            </div>
        </Section>
    );
}
