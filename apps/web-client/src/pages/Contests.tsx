import { useState, useEffect } from "react"
import Section from "../components/Layout/Section"
import { FaHammer, FaDiceD20, FaMapMarkedAlt, FaRunning, FaCheckCircle, FaHourglassStart, FaFlagCheckered, FaSignInAlt } from "react-icons/fa"
import { gsap } from "gsap"
import { useTranslation } from 'react-i18next'
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

import confetti from "canvas-confetti"

interface ContestEvent {
    id: string | number;
    title: string;
    title_en?: string;
    description: string;
    description_en?: string;
    type: 'hammer' | 'dice' | 'map' | 'running';
    status: 'active' | 'soon' | 'finished';
}

interface ContestCardProps {
    event: ContestEvent;
    onRegister: (eventId: string | number) => void;
    registering: boolean;
    isRegistered: boolean;
}

const iconMap: Record<string, React.ReactElement> = {
    'hammer': <FaHammer />,
    'dice': <FaDiceD20 />,
    'map': <FaMapMarkedAlt />,
    'running': <FaRunning />
}

const ContestCard = ({ event, onRegister, registering, isRegistered }: ContestCardProps) => {
    const { t, i18n } = useTranslation()
    const { id, title, title_en, description, description_en, type, status } = event
    
    // Fallback status text
    const statusText = status === 'active' ? t('contests.status.active') :
                       status === 'soon' ? t('contests.status.soon') :
                       t('contests.status.finished');

    const displayTitle = (i18n.language === 'en' && title_en) ? title_en : title;
    const displayDescription = (i18n.language === 'en' && description_en) ? description_en : description;

    return (
        <div className="contest-card">
            <div className="contest-bg-icon">{iconMap[type] || <FaHammer />}</div>
            
            <div className="contest-card-header">
                <div className={`contest-status-badge ${status}`}>
                    {status === 'active' && <FaCheckCircle size={12} />}
                    {status === 'soon' && <FaHourglassStart size={12} />}
                    {status === 'finished' && <FaFlagCheckered size={12} />}
                    <span>{statusText}</span>
                </div>
            </div>

            <div className="contest-card-body">
                <div className="contest-main-icon">
                    {iconMap[type] || <FaHammer />}
                </div>
                <h3 className="contest-title">{displayTitle}</h3>
                <p className="contest-desc">{displayDescription}</p>
            </div>
            
            <div className="contest-card-footer">
                {status === 'active' || status === 'soon' ? (
                     <button 
                        className={`contest-action-btn ${registering || isRegistered ? 'disabled' : ''} ${isRegistered ? 'registered' : ''}`} 
                        onClick={() => !isRegistered && onRegister(id)}
                        disabled={registering || isRegistered}
                    >
                        {registering ? t('common.processing') : isRegistered ? (
                            <>
                                <FaCheckCircle /> {t('contests.registered_btn')}
                            </>
                        ) : (
                            <>
                                <FaSignInAlt /> {t('contests.register_btn')}
                            </>
                        )}
                    </button>
                ) : (
                    <button className="contest-action-btn disabled" disabled>
                        {t('contests.status.finished')}
                    </button>
                )}
            </div>
        </div>
    )
}

import ConfirmationModal from "../components/UI/ConfirmationModal"

export default function Contests() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [events, setEvents] = useState<ContestEvent[]>([])
    const [myRegistrations, setMyRegistrations] = useState<(string | number)[]>([])
    const [loading, setLoading] = useState(true)
    const [registering, setRegistering] = useState<string | number | null>(null)
    const [showLoginModal, setShowLoginModal] = useState(false)

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        if (!API_URL) return

        const fetchData = async () => {
             try {
                // 1. Fetch Events (Public)
                const eventsRes = await fetch(`${API_URL}/events`)
                const eventsData = await eventsRes.json()
                if (Array.isArray(eventsData)) {
                    setEvents(eventsData)
                }

                // 2. Fetch User Registrations (if logged in)
                if (user) {
                     // Get Token
                     const { data: { session } } = await supabase.auth.getSession();
                     const token = session?.access_token;

                     if (token) {
                        const regRes = await fetch(`${API_URL}/events/my-registrations?userId=${user.id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })
                        if (regRes.ok) {
                            const regData = await regRes.json()
                            if (Array.isArray(regData)) {
                                setMyRegistrations(regData)
                            }
                        }
                     }
                }

             } catch (error) {
                 console.error("Error fetching data:", error)
             } finally {
                 setLoading(false)
                 setTimeout(() => {
                    const targets = document.querySelectorAll('.contest-card');
                    if (targets.length > 0) {
                        gsap.fromTo('.contest-card', 
                            { opacity: 0, y: 30, scale: 0.9 },
                            {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                stagger: 0.1,
                                duration: 1.2,
                                ease: "elastic.out(1, 0.75)",
                                delay: 0.2
                            }
                        );
                    }
                }, 100)
             }
        }

        fetchData()
    }, [user, API_URL]) 

    const handleRegister = async (eventId: string | number) => {
        if (!user) {
            setShowLoginModal(true)
            return
        }

        setRegistering(eventId)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("No hay sesión activa");

            const res = await fetch(`${API_URL}/events/${eventId}/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: user.id })
            })
            
            const data = await res.json()

            if (!res.ok) {
                if (data.error && data.error.includes("Ya estás inscrito")) {
                    alert(t('contests.already_registered'))
                } else {
                    throw new Error(data.error || t('contests.registration_error'))
                }
            } else {
                // Success!
                triggerConfetti()
                setMyRegistrations(prev => [...prev, eventId])
            }
        } catch (error: unknown) {
            console.error("Registration error:", error)
            const msg = error instanceof Error ? error.message : String(error);
            alert(msg)
        } finally {
            setRegistering(null)
        }
    }

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = function(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    return (
        <Section title={t('contests.title')}>
            <Section>
                <div className="crystal-card">
                    <p>{t('contests.intro')}</p>
                </div>
            </Section>

            <div className="contests-grid">
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>{t('common.loading')}</div>
                ) : events.length > 0 ? (
                    events.map(event => (
                        <ContestCard 
                            key={event.id} 
                            event={event} 
                            onRegister={handleRegister} 
                            registering={registering === event.id}
                            isRegistered={myRegistrations.includes(event.id)}
                        />
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666', border: '1px dashed #333', padding: '2rem', borderRadius: '8px' }}>
                        {t('contests.no_events')}
                    </div>
                )}
            </div>

            <ConfirmationModal 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onConfirm={() => {
                    setShowLoginModal(false)
                    navigate('/login')
                }}
                title={t('login.title')}
                message={t('contests.login_required')}
                confirmText={t('login.sign_in_verb')}
                cancelText="Cancelar"
            />
        </Section>
    )
}
