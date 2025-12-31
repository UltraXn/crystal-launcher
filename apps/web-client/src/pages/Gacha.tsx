import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FaCoins, FaBoxOpen, FaStar, FaGem, FaGift, FaClock, FaHistory, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { IconType } from 'react-icons';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/UI/Loader';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabaseClient';
import gsap from 'gsap';

interface Reward {
    id: string;
    name: string;
    rarity: string;
    color: string;
    type?: string;
}

const RARITY_COLORS: Record<string, string> = {
    common: '#b0c3d9',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000'
};

const RARITY_ICONS: Record<string, IconType> = {
    common: FaStar,
    rare: FaCoins,
    epic: FaGem,
    legendary: FaGift
};

interface GachaHistoryItem {
    id: string;
    reward_name: string;
    rarity: string;
    created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const VISUAL_REWARDS = [
    { id: '1', name: '100 XP', rarity: 'common', color: RARITY_COLORS.common },
    { id: '2', name: '50 KilluCoins', rarity: 'common', color: RARITY_COLORS.common },
    { id: '3', name: '500 KilluCoins', rarity: 'rare', color: RARITY_COLORS.rare },
    { id: '4', name: 'x5 Diamantes', rarity: 'rare', color: RARITY_COLORS.rare },
    { id: '5', name: 'VIP (3 Días)', rarity: 'epic', color: RARITY_COLORS.epic },
    { id: '6', name: 'MVP (1 Día)', rarity: 'legendary', color: RARITY_COLORS.legendary },
];

export default function Gacha() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Restricted Access Check (Admins/Staff only for now)
    const allowedRoles = ['admin', 'neroferno', 'killu', 'helper', 'developer'];
    const isAdmin = allowedRoles.includes(user?.user_metadata?.role?.toLowerCase());

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
        }
    }, [authLoading, isAdmin, navigate]);
    
    // Status
    const [isOpening, setIsOpening] = useState(false);
    const [reward, setReward] = useState<Reward | null>(null);
    const [showRoulette, setShowRoulette] = useState(false);
    const [history, setHistory] = useState<GachaHistoryItem[]>([]);
    const [cooldown, setCooldown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Refs for animations
    const containerRef = useRef<HTMLDivElement>(null);
    const rouletteRef = useRef<HTMLDivElement>(null);
    const rewardCardRef = useRef<HTMLDivElement>(null);
    const crateRef = useRef<HTMLDivElement>(null);

    // Derivar link status de user_metadata
    const isLinked = useMemo(() => !!user?.user_metadata?.minecraft_nick, [user]);

    const fetchHistory = useCallback(async () => {
        if (!user) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/gacha/history/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                    setHistory(data.data);
                    const lastRoll = data.data[0];
                    if (lastRoll) {
                        const lastDate = new Date(lastRoll.created_at);
                        const diff = Date.now() - lastDate.getTime();
                        if (diff < 24 * 60 * 60 * 1000) {
                            setCooldown(true);
                        }
                    }
                }
            }
        } catch (e) { console.error(e); }
    }, [user]);

    useEffect(() => {
        if (isAdmin) {
            fetchHistory();
        }
    }, [fetchHistory, isAdmin]);

    // Entrance Animation
    useEffect(() => {
        if (!authLoading && containerRef.current && isAdmin) {
            gsap.fromTo('.gacha-header > *', 
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, stagger: 0.2, duration: 1, ease: 'power3.out' }
            );
            gsap.fromTo('.crate-container', 
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.7)', delay: 0.5 }
            );
        }
    }, [authLoading, isAdmin]);

    // Generate items for roulette
    const rouletteItems = useMemo(() => {
        const items = [];
        for (let i = 0; i < 60; i++) {
            items.push(VISUAL_REWARDS[i % VISUAL_REWARDS.length]);
        }
        return items;
    }, []);

    const handleOpen = async () => {
        if (!user || isOpening || cooldown || !isLinked) return;

        setIsOpening(true);
        setReward(null);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            // Shake crate before API call
            gsap.to(crateRef.current, {
                x: "random(-5, 5)",
                y: "random(-5, 5)",
                rotation: "random(-5, 5)",
                duration: 0.1,
                repeat: 10,
                yoyo: true,
                onComplete: () => {
                    gsap.to(crateRef.current, { x: 0, y: 0, rotation: 0, duration: 0.2 });
                }
            });

            const res = await fetch(`${API_URL}/gacha/roll`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ userId: user.id })
            });

            const data = await res.json();

            if (!data.success) {
                if (data.code === 'COOLDOWN') setCooldown(true);
                throw new Error(data.message || 'Error al abrir');
            }

            // Start Roulette
            setShowRoulette(true);
            
            // Roulette Animation
            const itemWidth = 160;
            const stopIndex = 50; // Alrededor del final
            const offset = (stopIndex * itemWidth) - (window.innerWidth / 2) + (itemWidth / 2);
            
            gsap.to(rouletteRef.current, {
                x: -offset,
                duration: 5,
                ease: "power4.inOut",
                onComplete: () => {
                    setReward(data.data);
                    triggerConfetti(data.data.rarity);
                    fetchHistory();
                    
                    // Reward Card Pop-up
                    setTimeout(() => {
                        setShowRoulette(false);
                        gsap.set(rewardCardRef.current, { display: 'flex' });
                        gsap.fromTo(rewardCardRef.current, 
                            { scale: 0, rotationY: 180, opacity: 0 },
                            { scale: 1, rotationY: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }
                        );
                    }, 500);
                }
            });

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setError(errorMsg);
            setIsOpening(false);
        }
    };

    const triggerConfetti = (rarity: string) => {
        const defaults = { origin: { y: 0.7 }, zIndex: 10000 };
        if (rarity === 'legendary') {
            confetti({ ...defaults, particleCount: 150, spread: 100, colors: ['#ff8000', '#ffffff', '#ffd700'] });
        } else if (rarity === 'epic') {
            confetti({ ...defaults, particleCount: 80, spread: 70, colors: ['#a335ee', '#ffffff'] });
        } else {
            confetti({ ...defaults, particleCount: 40, spread: 50 });
        }
    };

    if (authLoading) return <div className="gacha-page"><Loader /></div>;
    if (!isAdmin) return null; // Logic handled by useEffect redirect

    return (
        <div className="gacha-page" ref={containerRef}>
            <div className="gacha-background">
                <div className="gradient-sphere sphere-1"></div>
                <div className="gradient-sphere sphere-2"></div>
            </div>

            <div className="gacha-container">
                <header className="gacha-header">
                    <span className="gacha-badge"><FaStar /> CRYSTAL REWARDS</span>
                    <h1>{t('gacha.hero_title', 'Cofre del Destino')}</h1>
                    <p>{t('gacha.hero_subtitle', 'Reclama tu recompensa diaria y desbloquea tesoros exclusivos.')}</p>
                </header>

                <div className="gacha-main">
                    {!isLinked ? (
                        <div className="link-warning">
                            <FaExclamationTriangle size={40} />
                            <h3>{t('gacha.account_not_linked', 'Cuenta no vinculada')}</h3>
                            <p>{t('gacha.link_instruction', 'Debes vincular tu cuenta de Minecraft en los ajustes para poder recibir premios en el servidor.')}</p>
                            <Link to="/account?tab=connections" className="btn-link-minecraft">
                                {t('gacha.link_button', 'Vincular ahora')}
                            </Link>
                        </div>
                    ) : (
                        <div className={`crate-section ${isOpening ? 'opening' : ''}`}>
                            <div className="crate-container" ref={crateRef}>
                                <div className="crate-glow"></div>
                                <img src="/images/ui/crate_closed.png" alt="Crate" className="crate-img" />
                                {cooldown && !isOpening && (
                                    <div className="cooldown-overlay">
                                        <FaClock />
                                        <span>24h COOLDOWN</span>
                                    </div>
                                )}
                            </div>

                            <button 
                                className={`roll-btn ${isOpening || cooldown ? 'disabled' : ''}`}
                                onClick={handleOpen}
                                disabled={isOpening || cooldown}
                            >
                                {isOpening ? (
                                    <span className="loading-dots">Abriendo<span>.</span><span>.</span><span>.</span></span>
                                ) : cooldown ? (
                                    t('gacha.btn_cooldown', 'Vuelve mañana')
                                ) : (
                                    <><FaBoxOpen /> {t('gacha.btn_roll', 'Abrir Cofre')}</>
                                )}
                            </button>
                        </div>
                    )}

                    {error && <div className="gacha-error"><FaExclamationTriangle /> {error}</div>}
                </div>

                {/* Roulette View */}
                {showRoulette && (
                    <div className="roulette-overlay">
                        <div className="roulette-track-container">
                            <div className="roulette-selector"></div>
                            <div className="roulette-track" ref={rouletteRef}>
                                {rouletteItems.map((item, i) => (
                                    <div key={i} className={`roulette-item rarity-${item.rarity}`}>
                                        <div className="item-icon-wrapper" style={{ color: item.color }}>
                                            {(() => {
                                                const Icon = RARITY_ICONS[item.rarity] || FaStar;
                                                return <Icon />;
                                            })()}
                                        </div>
                                        <span className="item-name">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Winner Card */}
                {reward && (
                    <div className="reward-overlay" ref={rewardCardRef} style={{ display: 'none' }}>
                        <div className={`reward-card rarity-${reward.rarity}`}>
                            <div className="reward-shine"></div>
                            <div className="reward-rarity">{reward.rarity.toUpperCase()}</div>
                            <div className="reward-icon">
                                {(() => {
                                    const Icon = RARITY_ICONS[reward.rarity] || FaStar;
                                    return <Icon />;
                                })()}
                            </div>
                            <h3>{reward.name}</h3>
                            <p>{t('gacha.reward_delivered', '¡Enviado a tu cuenta de Minecraft!')}</p>
                            <button className="reward-close-btn" onClick={() => { setReward(null); setIsOpening(false); }}>
                                {t('gacha.btn_claim', 'Recoger')} <FaCheck />
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Rewards Grid View */}
                <div className="reward-list">
                    <h3>{t('gacha.possible_rewards', 'Posibles Recompensas')}</h3>
                    <div className="rewards-grid">
                        {VISUAL_REWARDS.map(r => (
                             <div key={r.id} className={`reward-grid-item rarity-${r.rarity}`}>
                                <div className="r-icon">
                                    {(() => {
                                        const Icon = RARITY_ICONS[r.rarity] || FaStar;
                                        return <Icon />;
                                    })()}
                                </div>
                                <span>{r.name}</span>
                             </div>
                        ))}
                    </div>
                </div>

                {/* History Drawer */}
                <div className={`history-drawer ${isHistoryOpen ? 'open' : ''}`}>
                    <button className="history-toggle" onClick={() => setIsHistoryOpen(!isHistoryOpen)}>
                        <FaHistory /> {t('gacha.history', 'Historial')}
                    </button>
                    <div className="history-content">
                        {history.length > 0 ? (
                            history.map(item => (
                                <div key={item.id} className="history-item">
                                    <div className={`rarity-dot rarity-${item.rarity}`}></div>
                                    <div className="h-info">
                                        <div className="h-name">{item.reward_name}</div>
                                        <div className="h-date">{new Date(item.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-history">{t('gacha.no_history', 'Aún no has ganado nada.')}</p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .gacha-page {
                    min-height: 100vh;
                    position: relative;
                    padding: 80px 20px;
                    display: flex;
                    justify-content: center;
                    color: #fff;
                    overflow: hidden;
                    font-family: 'Outfit', sans-serif;
                }
                .gacha-background {
                    position: fixed;
                    inset: 0;
                    background: #050508;
                    z-index: -1;
                }
                .gradient-sphere {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0.15;
                }
                .sphere-1 { top: -100px; right: -100px; background: #8b5cf6; }
                .sphere-2 { bottom: -100px; left: -100px; background: #0ea5e9; }

                .gacha-container {
                    width: 100%;
                    max-width: 1000px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 1;
                }

                .gacha-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }
                .gacha-badge {
                    background: rgba(139, 92, 246, 0.1);
                    color: #a78bfa;
                    padding: 6px 16px;
                    border-radius: 100px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 1.5rem;
                }
                .gacha-header h1 {
                    font-size: 3.5rem;
                    font-weight: 900;
                    margin: 0;
                    background: linear-gradient(to bottom, #fff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -1px;
                }
                .gacha-header p {
                    color: #94a3b8;
                    font-size: 1.2rem;
                    margin-top: 1rem;
                    max-width: 600px;
                }

                .crate-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3rem;
                }
                .crate-container {
                    position: relative;
                    width: 280px;
                    height: 280px;
                    cursor: pointer;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .crate-container:hover {
                    transform: scale(1.05);
                }
                .crate-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.5));
                }
                .crate-glow {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .crate-container:hover .crate-glow {
                    opacity: 1;
                }

                .roll-btn {
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 1rem 3rem;
                    font-size: 1.2rem;
                    font-weight: 800;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 10px 30px rgba(255,255,255,0.1);
                }
                .roll-btn:hover:not(:disabled) {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(255,255,255,0.2);
                }
                .roll-btn.disabled {
                    background: #1e293b;
                    color: #64748b;
                    cursor: not-allowed;
                }

                .reward-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.9);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .reward-card {
                    background: #0f172a;
                    width: 380px;
                    padding: 3rem;
                    border-radius: 32px;
                    text-align: center;
                    border: 1px solid rgba(255,255,255,0.1);
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
                }
                .reward-rarity {
                    font-size: 0.8rem;
                    font-weight: 800;
                    letter-spacing: 3px;
                    margin-bottom: 2rem;
                }
                .reward-icon {
                    font-size: 5rem;
                    margin-bottom: 2rem;
                    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
                }
                .reward-card h3 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0 0 1rem 0;
                }
                .reward-card p {
                    color: #94a3b8;
                    margin-bottom: 2.5rem;
                }
                .reward-close-btn {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 1rem;
                    border-radius: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .reward-close-btn:hover {
                    background: #fff;
                    color: #000;
                }

                /* Rarity Colors */
                .rarity-common .reward-icon, .rarity-common .reward-rarity { color: #b0c3d9; }
                .rarity-rare .reward-icon, .rarity-rare .reward-rarity { color: #0070dd; }
                .rarity-epic .reward-icon, .rarity-epic .reward-rarity { color: #a335ee; }
                .rarity-legendary .reward-icon, .rarity-legendary .reward-rarity { color: #ff8000; }
                .rarity-legendary .reward-card { border-color: rgba(255, 128, 0, 0.3); }

                .history-drawer {
                    position: fixed;
                    right: -320px;
                    top: 0;
                    bottom: 0;
                    width: 320px;
                    background: #0a0a0f;
                    border-left: 1px solid rgba(255,255,255,0.05);
                    transition: right 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    z-index: 500;
                    padding: 120px 2rem 2rem;
                }
                .history-drawer.open { right: 0; }
                .history-toggle {
                    position: absolute;
                    left: -130px;
                    top: 150px;
                    background: #0a0a0f;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-right: none;
                    color: #fff;
                    padding: 10px 20px;
                    border-radius: 12px 0 0 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                }

                .history-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 12px;
                    margin-bottom: 0.8rem;
                }
                .rarity-dot { width: 8px; height: 8px; border-radius: 50%; }
                .h-name { font-size: 0.9rem; font-weight: 600; }
                .h-date { font-size: 0.75rem; color: #555; }

                /* Roulette Styling */
                .roulette-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1500;
                    backdrop-filter: blur(20px);
                }
                .roulette-track-container {
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                    padding: 40px 0;
                }
                .roulette-track {
                    display: flex;
                    gap: 10px;
                    padding: 0 20px;
                }
                .roulette-item {
                    min-width: 150px;
                    height: 180px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .roulette-selector {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 50%;
                    width: 4px;
                    background: var(--accent);
                    z-index: 10;
                    transform: translateX(-50%);
                    box-shadow: 0 0 30px var(--accent-light);
                }
                .item-icon-wrapper { font-size: 2.5rem; }
                .item-name { font-size: 0.8rem; font-weight: 700; color: #94a3b8; }

                .reward-list { width: 100%; margin-top: 6rem; }
                .reward-list h3 { text-align: center; color: #64748b; font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 2rem; }
                .rewards-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
                    gap: 1rem;
                    padding: 0 1rem;
                }
                .reward-grid-item {
                    background: rgba(255,255,255,0.02);
                    padding: 1.5rem;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    border: 1px solid rgba(255,255,255,0.03);
                    filter: grayscale(0.5);
                    transition: all 0.3s;
                }
                .reward-grid-item:hover { filter: grayscale(0); background: rgba(255,255,255,0.05); }
                .reward-grid-item .r-icon { font-size: 1.5rem; }
                .reward-grid-item span { font-size: 0.8rem; font-weight: 600; color: #94a3b8; }

                .link-warning {
                    background: rgba(245, 158, 11, 0.05);
                    border: 1px solid rgba(245, 158, 11, 0.2);
                    padding: 3rem;
                    border-radius: 24px;
                    text-align: center;
                    max-width: 500px;
                    color: #f59e0b;
                }
                .link-warning h3 { font-size: 1.5rem; margin: 1rem 0; }
                .link-warning p { color: #d97706; margin-bottom: 2rem; line-height: 1.6; }
                .btn-link-minecraft {
                    display: inline-block;
                    background: #f59e0b;
                    color: #000;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-weight: 800;
                    text-decoration: none;
                    transition: transform 0.2s;
                }
                .btn-link-minecraft:hover { transform: translateY(-3px); }

                @media (max-width: 768px) {
                    .gacha-header h1 { font-size: 2.5rem; }
                    .history-drawer { width: 100%; right: -100%; }
                    .history-toggle { left: auto; right: 20px; top: 20px; border-radius: 12px; }
                }
            `}</style>
        </div>
    );
}
