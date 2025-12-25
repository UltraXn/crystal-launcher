import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTwitter, FaDiscord, FaYoutube, FaBriefcase } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Loader from '../components/UI/Loader';

interface StaffMember {
    id: string | number;
    name: string;
    role: string;
    image: string;
    color: string;
    description: string;
    socials?: {
        twitter?: string;
        discord?: string;
        youtube?: string;
    };
}

const API_URL = import.meta.env.VITE_API_URL;

export default function Staff() {
    const { t } = useTranslation();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [recruitment, setRecruitment] = useState<{ status: string; link: string }>({ status: 'false', link: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/settings`)
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
    }, []);

    if (loading) return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display:'flex', 
            flexDirection: 'column',
            alignItems:'center', 
            justifyContent: 'flex-start',
            paddingTop: '20vh',
            background: '#080808'
        }}>
            <Loader text={t('staff.loading')} style={{ height: 'auto', minHeight: 'auto' }} />
        </div>
    );

    return (
        <div style={{ paddingTop: '8rem', minHeight: '100vh', paddingBottom: '6rem', background: '#080808', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            {/* Background elements */}
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(109, 165, 192, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', zIndex: 0 }}></div>

            <div className="section" style={{ position: 'relative', zIndex: 1 }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: 'center', marginBottom: '5rem' }}
                >
                    <h1 style={{ 
                        fontSize: 'clamp(3rem, 8vw, 4.5rem)', 
                        fontWeight: 900,
                        marginBottom: '1.5rem', 
                        background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)', 
                        WebkitBackgroundClip: 'text', 
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-2px'
                    }}>
                        {t('staff.title')}
                    </h1>
                    <p style={{ color: '#aaa', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                        {t('staff.subtitle')}
                    </p>
                    
                    {/* Recruitment Banner */}
                    <AnimatePresence>
                        {recruitment.status === 'true' && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                style={{ marginTop: '3rem', display: 'inline-block' }}
                            >
                                <a 
                                    href={recruitment.link || '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn-hiring"
                                    style={{ 
                                        background: 'rgba(16, 185, 129, 0.1)', 
                                        border: '1px solid rgba(16, 185, 129, 0.3)', 
                                        padding: '1rem 2.5rem', 
                                        borderRadius: '100px',
                                        fontSize: '1.1rem',
                                        color: '#10b981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <FaBriefcase /> {t('staff.hiring_title')} {t('staff.hiring_action')}
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <div 
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                        gap: '2.5rem',
                        maxWidth: '1300px',
                        margin: '0 auto',
                        padding: '0 1.5rem'
                    }}
                >
                    {staff.map((member, idx) => (
                        <motion.div 
                            key={member.id} 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            className="staff-card-premium"
                            style={{ 
                                background: 'rgba(255,255,255,0.02)', 
                                backdropFilter: 'blur(10px)',
                                borderRadius: '24px', 
                                padding: '3rem 2rem',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                        >
                            {/* Accent line */}
                            <div style={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '6px', 
                                background: member.color,
                                filter: 'blur(2px)',
                                opacity: 0.8
                            }}></div>

                            <div style={{ 
                                width: '140px', 
                                height: '140px', 
                                marginBottom: '2rem', 
                                borderRadius: '40px', 
                                padding: '6px',
                                background: `linear-gradient(135deg, ${member.color}, rgba(255,255,255,0.1))`,
                                boxShadow: `0 20px 40px ${member.color}30`,
                                position: 'relative',
                                transform: 'rotate(-3deg)'
                            }}>
                                <div style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    borderRadius: '34px', 
                                    overflow: 'hidden', 
                                    background: '#0a0a0a' 
                                }}>
                                    <img 
                                        src={member.image?.startsWith('http') ? member.image : `https://mc-heads.net/avatar/${member.image || member.name}/140`} 
                                        alt={member.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.75rem 0', letterSpacing: '-0.5px' }}>{member.name}</h3>
                            <span style={{ 
                                display: 'inline-block',
                                padding: '6px 16px',
                                borderRadius: '12px',
                                background: `${member.color}15`,
                                color: member.color,
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                marginBottom: '1.5rem',
                                letterSpacing: '1px',
                                border: `1px solid ${member.color}30`
                            }}>
                                {member.role}
                            </span>

                            <p style={{ color: '#888', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2rem', flex: 1 }}>
                                {member.description}
                            </p>

                            <div style={{ display: 'flex', gap: '1.2rem', marginTop: 'auto' }}>
                                {member.socials?.twitter && (
                                    <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="staff-social-link">
                                        <FaTwitter />
                                    </a>
                                )}
                                {member.socials?.discord && (
                                    <div title={member.socials.discord} className="staff-social-link" style={{ cursor: 'help' }}>
                                        <FaDiscord />
                                    </div>
                                )}
                                {member.socials?.youtube && (
                                    <a href={member.socials.youtube} target="_blank" rel="noopener noreferrer" className="staff-social-link">
                                        <FaYoutube />
                                    </a>
                                )}
                            </div>

                            <style>{`
                                .staff-card-premium:hover {
                                    transform: translateY(-15px) scale(1.02);
                                    background: rgba(255,255,255,0.04);
                                    border-color: rgba(255,255,255,0.15);
                                    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                                }
                                .staff-social-link {
                                    color: #fff; 
                                    font-size: 1.4rem; 
                                    opacity: 0.5; 
                                    transition: all 0.2s;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                }
                                .staff-social-link:hover {
                                    opacity: 1;
                                    transform: scale(1.2);
                                }
                                .btn-hiring:hover {
                                    background: rgba(16, 185, 129, 0.2) !important;
                                    border-color: rgba(16, 185, 129, 0.5) !important;
                                    transform: translateY(-3px);
                                }
                            `}</style>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
