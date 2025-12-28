import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTwitter, FaDiscord, FaYoutube, FaBriefcase, FaUsers } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Section from '../Layout/Section';
import Loader from '../UI/Loader';

interface StaffMember {
    id: string | number;
    name: string;
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
    };
}

const API_URL = '/api'; // import.meta.env.VITE_API_URL;

const RANK_BADGES: Record<string, string> = {
    'Neroferno': '/ranks/rank-neroferno.png',
    'Killuwu': '/ranks/rank-killu.png',
    'Developer': '/ranks/developer.png',
    'Admin': '/ranks/admin.png',
    'Moderator': '/ranks/moderator.png',
    'Helper': '/ranks/helper.png',
    'Usuario': '/ranks/user.png'
};

export default function StaffShowcase() {
    const { t, i18n } = useTranslation();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    
    // Helper to get badge
    const getBadge = (role: string) => {
        if (!role) return null;
        const key = Object.keys(RANK_BADGES).find(k => k.toLowerCase() === role.toLowerCase());
        return key ? RANK_BADGES[key] : null;
    };
    const [recruitment, setRecruitment] = useState<{ status: string; link: string }>({ status: 'false', link: '' });
    const [loading, setLoading] = useState(true);
    const [onlineStaff, setOnlineStaff] = useState<string[]>([]);

    useEffect(() => {
        // Fetch Settings (Staff Cards & Recruitment)
        fetch(`${API_URL}/settings?t=${new Date().getTime()}`)
            .then(res => {
                if(!res.ok) throw new Error("Fetch failed");
                return res.json();
            })
            .then(data => {
                if(data.staff_cards) {
                    try {
                        const parsed = typeof data.staff_cards === 'string' ? JSON.parse(data.staff_cards) : data.staff_cards;
                        setStaff(Array.isArray(parsed) ? parsed : []);
                    } catch { setStaff([]); }
                }
                setRecruitment({
                    status: data.recruitment_status || 'false',
                    link: data.recruitment_link || ''
                });
            })
            .catch(console.warn)
            .finally(() => setLoading(false));

        // Fetch Online Staff
        fetch(`${API_URL}/server/staff`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if(Array.isArray(data)) {
                    setOnlineStaff(data.map((u: { username: string }) => u.username.toLowerCase()));
                }
            })
            .catch(() => {});
    }, []);

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

    return (
        <Section title={<span><FaUsers style={{ color: 'var(--accent)', marginRight: '0.5rem', verticalAlign: 'middle' }} /> {t('staff.title', 'Nuestro Equipo')}</span>}>
            
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
                {staff.map((member) => (
                    <motion.div 
                        key={member.id} 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="staff-card-home"
                        style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            borderRadius: '20px', 
                            padding: '2rem',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                        }}
                    >
                        {/* Accent Top Border */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: member.color }}></div>

                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <div style={{ 
                                width: '100px', 
                                height: '100px', 
                                borderRadius: '50%', 
                                padding: '4px',
                                background: `linear-gradient(135deg, ${member.color}, rgba(255,255,255,0.1))`,
                                boxShadow: `0 10px 25px ${member.color}20`
                            }}>
                                <img 
                                    src={member.image?.startsWith('http') ? member.image : `https://mc-heads.net/avatar/${member.image || member.name}/100`} 
                                    alt={member.name} 
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#000' }} 
                                />
                            </div>
                            {onlineStaff.includes(member.name.toLowerCase()) && (
                                <div 
                                    title="Online"
                                    style={{ 
                                        position: 'absolute', bottom: 5, right: 5, 
                                        width: '14px', height: '14px', 
                                        background: '#22c55e', borderRadius: '50%', 
                                        border: '2px solid #18181b',
                                        boxShadow: '0 0 5px #22c55e'
                                    }} 
                                />
                            )}
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

                        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', opacity: 0.8 }}>
                            {member.socials?.twitter && <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', transition: 'color 0.2s' }}><FaTwitter size={18} /></a>}
                            {member.socials?.discord && <div title={member.socials.discord} style={{ color: '#fff', cursor: 'help' }}><FaDiscord size={18} /></div>}
                            {member.socials?.youtube && <a href={member.socials.youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', transition: 'color 0.2s' }}><FaYoutube size={18} /></a>}
                        </div>
                    </motion.div>
                ))}
                <style>{`
                    .staff-card-home:hover {
                        transform: translateY(-10px);
                        background: rgba(255,255,255,0.05) !important;
                        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
                    }
                    .btn-hiring:hover {
                        background: rgba(16, 185, 129, 0.2) !important;
                        transform: scale(1.05);
                    }
                `}</style>
            </div>
        </Section>
    );
}
