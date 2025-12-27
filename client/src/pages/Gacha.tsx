import { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FaCoins, FaBoxOpen, FaStar, FaGem, FaGift, FaClock, FaHistory, FaCheck } from 'react-icons/fa';
// @ts-ignore
import confetti from 'canvas-confetti';
import { IconType } from 'react-icons';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/UI/Loader';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabaseClient';

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

const API_URL = import.meta.env.VITE_API_URL;

export default function Gacha() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    // Status
    const [isOpening, setIsOpening] = useState(false);
    const [reward, setReward] = useState<Reward | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
         if (user) fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/gacha/history/${user?.id}`, {
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
    }

    const handleOpen = async () => {
        if (!user || isOpening || cooldown) return;

        setIsOpening(true);
        setReward(null);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            // Animation Delay Simulation (3s)
            const animationPromise = new Promise(resolve => setTimeout(resolve, 3000));
            
            // API Call
            const apiPromise = fetch(`${API_URL}/gacha/roll`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ userId: user.id })
            });

            const [_, res] = await Promise.all([animationPromise, apiPromise]);
            const response = await res.json();

            if (response.success && response.data) {
                const wonReward: Reward = {
                    ...response.data,
                    color: RARITY_COLORS[response.data.rarity] || '#fff'
                };
                
                setReward(wonReward);
                setCooldown(true);
                fetchHistory(); // Update history

                // Trigger Confetti
                if (wonReward.rarity === 'legendary' || wonReward.rarity === 'epic') {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: [wonReward.color, '#ffffff']
                    });
                } else {
                    confetti({
                        particleCount: 50,
                        spread: 50,
                        origin: { y: 0.6 }
                    });
                }

            } else {            
                if (response.error?.code === 'COOLDOWN') {
                     setCooldown(true);
                     setError("¡Ya jugaste hoy! Vuelve mañana.");
                } else {
                     setError(response.error?.message || "Error al tirar");
                }
            }

        } catch (e) {
            console.error(e);
            setError(t('gacha.conn_error'));
        } finally {
            setIsOpening(false);
        }
    };

    if (authLoading) return <div style={{ paddingTop: '100px', display:'flex', justifyContent:'center'}}><Loader text={t('gacha.loading')} /></div>;

    const RewardIcon = reward ? (RARITY_ICONS[reward.rarity] || FaBoxOpen) : FaBoxOpen;

    return (
        <div className="gacha-container fade-in">
            <style>{`
                .gacha-container {
                    padding-top: 6rem;
                    min-height: 100vh;
                    background: radial-gradient(circle at center, #1a1a2e 0%, #000000 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: white;
                    overflow: hidden;
                    font-family: 'Outfit', sans-serif;
                }
                .crate-area {
                    position: relative;
                    width: 300px;
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 3rem 0;
                    perspective: 1000px;
                }
                .crate {
                    font-size: 10rem;
                    color: var(--accent);
                    filter: drop-shadow(0 0 20px rgba(51, 193, 255, 0.4));
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .crate:hover {
                    transform: scale(1.05);
                }
                .action-btn {
                    background: linear-gradient(45deg, #FFD700, #FFA500);
                    border: none;
                    padding: 1rem 3rem;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #000;
                    border-radius: 50px;
                    cursor: pointer;
                    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .action-btn:disabled {
                    background: #333;
                    color: #666;
                    box-shadow: none;
                    cursor: not-allowed;
                }
                .action-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(255, 215, 0, 0.6);
                }
                .reward-card {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    padding: 2rem;
                    border-radius: 20px;
                    text-align: center;
                    border: 2px solid;
                    min-width: 300px;
                }
                .glow-bg {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, var(--accent) 0%, transparent 60%);
                    opacity: 0.1;
                    z-index: 0;
                    animation: pulse 4s infinite alternate;
                }
                @keyframes pulse { from { opacity: 0.05; transform: scale(0.8); } to { opacity: 0.2; transform: scale(1.1); } }
                
                .history-panel {
                    position: absolute;
                    right: 20px;
                    top: 100px;
                    width: 300px;
                    background: rgba(0,0,0,0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 1rem;
                    max-height: 400px;
                    overflow-y: auto;
                    z-index: 10;
                }
            `}</style>
            
            <div className="glow-bg" />

            {/* Header */}
            <div style={{ zIndex: 1, textAlign: 'center', padding: '0 1rem' }}>
                <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900 }}>{t('gacha.title')}</h1>
                <p style={{ color: '#aaa', maxWidth: '500px' }}>{t('gacha.subtitle')}</p>
            </div>

            <button 
                onClick={() => setShowHistory(!showHistory)}
                style={{ position: 'absolute', right: 20, top: 100, background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem 1rem', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 20 }}
            >
                <FaHistory /> <span className="mobile-hide">{t('gacha.history_btn')}</span>
            </button>

            {showHistory && (
                <div className="history-panel fade-in">
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{t('gacha.last_rewards')}</h3>
                    {history.length === 0 ? <p style={{color:'#666', fontSize:'0.9rem'}}>{t('gacha.no_history')}</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {history.slice(0, 10).map((h, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ccc' }}>
                                    <span style={{ color: RARITY_COLORS[h.rarity] || '#fff' }}>[{h.rarity || 'common'}] {h.reward_name}</span>
                                    <span style={{ color: '#666' }}>{new Date(h.created_at).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Main Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1, width: '100%' }}>
                
                <AnimatePresence mode="wait">
                    {reward ? (
                        <Motion.div 
                            key="reward"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="reward-card"
                            style={{ borderColor: reward.color, boxShadow: `0 0 30px ${reward.color}40` }}
                        >
                            <div style={{ fontSize: '4rem', color: reward.color, marginBottom: '1rem' }}>
                                <RewardIcon />
                            </div>
                            <h2 style={{ color: reward.color, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{reward.rarity}</h2>
                            <h3 style={{ fontSize: '2rem' }}>{reward.name}</h3>
                            <p style={{ color: '#aaa', margin: '1rem 0' }}>{t('gacha.claim_success')}</p>
                            <button 
                                className="nav-btn primary" 
                                style={{ marginTop: '1rem', width: '100%', padding: '0.8rem' }}
                                onClick={() => setReward(null)}
                            >
                                <FaCheck /> {t('gacha.understood')}
                            </button>
                        </Motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Motion.div 
                                className="crate-area"
                                animate={isOpening ? { 
                                    scale: [1, 1.1, 0.9, 1.1, 1],
                                    rotate: [0, -5, 5, -5, 0],
                                    filter: ['brightness(1)', 'brightness(2)', 'brightness(1)']
                                } : { y: [0, -20, 0] }}
                                transition={isOpening ? { duration: 0.5, repeat: 5 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <FaBoxOpen className="crate" />
                            </Motion.div>
                            
                            {!isOpening && (
                                <>
                                    <button 
                                        className="action-btn" 
                                        onClick={handleOpen} 
                                        disabled={cooldown}
                                        title={cooldown ? t('gacha.vuelve_mañana') : "Tirar Ruleta"}
                                    >
                                        {cooldown ? <><FaClock /> {t('gacha.cooldown_btn')}</> : <><FaGift /> {t('gacha.claim_btn')}</>}
                                    </button>
                                    {cooldown && <p style={{ marginTop: '1rem', color: '#ff4444' }}>{t('gacha.already_claimed')}</p>}
                                    {error && !cooldown && <p style={{ marginTop: '1rem', color: '#ff4444' }}>{error}</p>}
                                </>
                            )}
                            
                             {isOpening && (
                                <h2 style={{ marginTop: '2rem', animation: 'blink 1s infinite' }}>{t('gacha.opening')}</h2>
                            )}
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}
