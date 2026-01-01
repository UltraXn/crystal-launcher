import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { FaCopy, FaCheck } from "react-icons/fa"
import { SiKofi } from "react-icons/si"
import HeroBackgroundCarousel from "./Carousel"
import HeroParticles from "./Particles"
import { gsap } from "gsap"
import { useTranslation } from 'react-i18next'

interface Slide {
    image: string;
    title?: string;
    text?: string;
    buttonText?: string;
    link?: string;
}

interface HeroProps {
    mockSlides?: Slide[];
    mockPlayerCount?: number;
    mockIsOnline?: boolean;
}

export default function Hero({ mockSlides, mockPlayerCount, mockIsOnline }: HeroProps = {}) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)
    const ip = "MC.CrystaltidesSMP.net"

    // Refs for animation
    const welcomeRef = useRef<HTMLElement>(null)
    const descRef = useRef<HTMLParagraphElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const countRef = useRef<HTMLSpanElement>(null)
    const actionGroupRef = useRef<HTMLDivElement>(null)

    // State for player count
    const [playerCount, setPlayerCount] = useState(0)
    const [isOnline, setIsOnline] = useState<boolean | null>(null) // null = loading
    
    const [slides, setSlides] = useState<Slide[]>([])
    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        if (mockSlides) {
            setSlides(mockSlides);
            return;
        }

        // Fetch hero slides
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => {
                if(data.hero_slides) {
                    try {
                        const parsed = typeof data.hero_slides === 'string' 
                            ? JSON.parse(data.hero_slides) 
                            : data.hero_slides;
                        setSlides((parsed || []) as Slide[]);
                    } catch (e) {
                         console.error("Error parsing hero slides", e);
                    }
                }
            })
            .catch(err => console.error("Error fetching settings for hero", err));
    }, [API_URL, mockSlides]);

    useEffect(() => {
        // GSAP Timeline for organized premium animation
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: "power4.out", duration: 1.2 }
            });

            // Initial state for brand chars to avoid flicker
            gsap.set('.hero-brand-char', { opacity: 0, y: 50, filter: 'blur(10px)', scale: 0.8 });

            tl.fromTo(welcomeRef.current, 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1 }
            )
            .to('.hero-brand-char', {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                scale: 1,
                stagger: 0.03,
                duration: 1.5,
                ease: "elastic.out(1, 0.75)"
            }, "-=0.7")
            .fromTo([descRef.current, containerRef.current],
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, stagger: 0.2, duration: 1 },
                "-=1"
            );

            // Magnetic Button Effect Logic
            const buttons = actionGroupRef.current?.querySelectorAll('.action-btn');
            buttons?.forEach(btnElement => {
                const btn = btnElement as HTMLElement;
                btn.addEventListener('mousemove', (e: MouseEvent) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    gsap.to(btn, {
                        x: x * 0.3,
                        y: y * 0.3,
                        duration: 0.4,
                        ease: "power2.out"
                    });
                });

                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, {
                        x: 0,
                        y: 0,
                        duration: 0.6,
                        ease: "elastic.out(1, 0.3)"
                    });
                });
            });
        });

        // Player Count Animation Logic
        const fetchPlayerCount = async () => {
            if (mockIsOnline !== undefined && mockPlayerCount !== undefined) {
                 setIsOnline(mockIsOnline);
                 const counter = { val: 0 };
                 gsap.to(counter, {
                    val: mockPlayerCount,
                    roundProps: "val",
                    duration: 2.5,
                    delay: 0.5,
                    ease: "power2.out",
                    onUpdate: () => setPlayerCount(Math.floor(counter.val))
                });
                return;
            }

            try {
                const res = await fetch(`${API_URL}/minecraft/status`)
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json()

                if (data && data.online) {
                    setIsOnline(true)
                    const counter = { val: 0 };
                    gsap.to(counter, {
                        val: data.players.online,
                        roundProps: "val",
                        duration: 2.5,
                        delay: 0.5,
                        ease: "power2.out",
                        onUpdate: () => setPlayerCount(Math.floor(counter.val))
                    });
                } else {
                    setIsOnline(false)
                }
            } catch (err) {
                console.warn("Hero: Failed to fetch server status", err instanceof Error ? err.message : err)
                setIsOnline(false)
            }
        };

        fetchPlayerCount();

        return () => ctx.revert(); // Cleanup GSAP context

    }, [API_URL, mockIsOnline, mockPlayerCount])

    const handleCopy = () => {
        navigator.clipboard.writeText(ip)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Helper to render split text
    const renderBrandText = () => {
        return "CrystalTides SMP".split('').map((char, index) => (
            <span
                key={index}
                className="hero-brand-char"
                style={{
                    display: 'inline-block',
                    opacity: 0,
                    minWidth: char === ' ' ? '12px' : 'auto'
                }}
            >
                {char}
            </span>
        ));
    };

    return (
        <section className="hero">
            <HeroBackgroundCarousel slides={slides} />
            <HeroParticles />
            <div className="hero-content">
                {slides.length === 0 && (
                    <>
                        <h1>
                            <span
                                ref={welcomeRef}
                                style={{ display: 'inline-block', color: 'var(--text)' }}
                            >
                                {t('hero.welcome')}
                            </span>
                            {" "}
                            <span className="brand-wrapper" style={{ display: 'inline-block', maxWidth: '100%', wordBreak: 'break-word' }}>
                                {renderBrandText()}
                            </span>
                        </h1>

                        <p ref={descRef}>
                            {t('hero.description')}
                        </p>
                    </>
                )}

                <div
                    className="server-connect-container"
                    ref={containerRef}
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        marginTop:  '2rem',
                        marginBottom: '2rem'
                    }}
                >
                    <Link to="/status" className="server-status-pill" style={{ textDecoration: 'none' }}>
                        {isOnline === false ? (
                            <>
                                <span className="status-dot" style={{ background: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></span>
                                {t('status.offline')}
                            </>
                        ) : (
                            <>
                                <span className="status-dot"></span>
                                <span ref={countRef}>{playerCount}</span> {t('hero.players_online')}
                            </>
                        )}
                    </Link>

                    <div className="ip-container">
                        <div className="ip-content-wrapper">
                            <span className="edition-label">
                                {t('hero.java_edition')}
                            </span>
                            <span className="ip-text">{ip}</span>
                        </div>
                        <button onClick={handleCopy} className="copy-btn">
                            {copied ? <FaCheck /> : <FaCopy />}
                            {copied ? t('hero.copied') : t('hero.copy_ip')}
                        </button>
                    </div>

                    <div className="hero-action-group" ref={actionGroupRef}>
                        <a href="https://ko-fi.com/G2G03Y8FL" target="_blank" rel="noreferrer" className="action-btn kofi-btn">
                            <SiKofi size={20} color="#000" />
                            <span>{t('hero.kofi_btn', 'Ko-Fi')}</span>
                        </a>
                        <Link to="/#donors" className="action-btn donors-btn">
                            <span>{t('navbar.donors')}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
