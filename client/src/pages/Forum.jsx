import { FaComments, FaBullhorn, FaTools, FaCoffee, FaUser, FaClock, FaFire, FaPoll } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useState, useEffect } from "react"
import { useTranslation } from 'react-i18next'

const initialCategories = [
    {
        id: 1,
        translationKey: "announcements",
        icon: <FaBullhorn />,
        topics: 0,
        posts: 0,
        lastPost: { user: "Staff", date: "-" }
    },
    {
        id: 2,
        translationKey: "general",
        icon: <FaComments />,
        topics: 0,
        posts: 0,
        lastPost: { user: "-", date: "-" }
    },
    {
        id: 3,
        translationKey: "support",
        icon: <FaTools />,
        topics: 0,
        posts: 0,
        lastPost: { user: "-", date: "-" }
    },
    {
        id: 4,
        translationKey: "offtopic",
        icon: <FaCoffee />,
        topics: 0,
        posts: 0,
        lastPost: { user: "-", date: "-" }
    }
]

export default function Forum() {
    const { t } = useTranslation()
    const [categories, setCategories] = useState(initialCategories)
    const [activePoll, setActivePoll] = useState(null)
    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        if (!API_URL) return

        // 1. Fetch Real Active Poll
        fetch(`${API_URL}/polls/active`)
            .then(res => res.json())
            .then(data => {
                if (data && !data.message) { // API returns message if no poll
                    setActivePoll(data)
                }
            })
            .catch(err => console.error("Error loading poll:", err))

        // 2. Fetch Forum Stats
        fetch(`${API_URL}/forum/stats`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(prev => prev.map(cat => {
                        const stat = data.find(s => s.id === cat.id)
                        if (stat) {
                            return {
                                ...cat,
                                topics: stat.topics,
                                posts: stat.posts, // Can be improved later in backend
                                lastPost: stat.lastPost
                            }
                        }
                        return cat
                    }))
                }
            })
            .catch(err => console.error("Error loading forum stats:", err))
    }, [])

    return (
        <div className="section" style={{ minHeight: '80vh', paddingTop: '8rem' }}>
            <h2>{t('forum_page.title')}</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                {t('forum_page.subtitle')}
            </p>

            {/* Featured Active Poll */}
            {activePoll ? (
                <div className="forum-featured-poll" style={{ maxWidth: '900px', margin: '0 auto 3rem auto' }}>
                    <div className="section-subtitle" style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <FaFire color="#ff4500" /> <span style={{ color: 'var(--text)' }}>{t('forum_page.hot_topic')}</span> <span className="status-badge-active">{t('forum_page.active')}</span>
                    </div>

                    <div className="poll-card" style={{ border: '1px solid var(--accent)', boxShadow: '0 0 15px rgba(109,165,192,0.1)' }}>
                        <div style={{ marginBottom: '1rem', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                            <span><FaPoll style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('forum_page.official_poll')}</span>
                            <span style={{ color: '#ff4500', display: 'flex', alignItems: 'center', gap: '5px' }}><FaFire /> {t('forum_page.hot_label')}</span>
                        </div>
                        <h3 className="poll-question" style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: '#fff' }}>
                            {activePoll.question}
                        </h3>

                        <div className="poll-options">
                            {activePoll.options.map((opt) => (
                                <div key={opt.id} className="poll-option" style={{ marginBottom: '0.8rem', cursor: 'pointer' }}>
                                    <div className="poll-bar-track" style={{ height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                                        <div className="poll-bar-fill" style={{ width: `${opt.percent}%`, height: '100%', background: 'var(--accent)', opacity: 0.3, position: 'absolute', top: 0, left: 0 }}></div>
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
                                            <span className="poll-label" style={{ fontWeight: 500, color: '#fff', zIndex: 1 }}>{opt.label}</span>
                                            <span className="poll-percent" style={{ fontWeight: 'bold', color: 'var(--accent)', zIndex: 1 }}>{opt.percent}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                            <span>{t('suggestions.total_votes')}: <strong>{activePoll.totalVotes}</strong></span>
                            <span>{t('suggestions.closes_in')}: <strong style={{ color: '#ff9900' }}>{activePoll.closesIn}</strong></span>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ maxWidth: '900px', margin: '0 auto 3rem', padding: '2rem', textAlign: 'center', border: '1px dashed #444', borderRadius: '8px', color: '#888' }}>
                    <p>No hay Encuesta Oficial activa en este momento.</p>
                </div>
            )}

            <div className="forum-categories">
                {categories.map((cat) => (
                    <Link to={`/forum/${cat.id}`} key={cat.id} className="forum-category-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="cat-icon-wrapper">
                            {cat.icon}
                        </div>
                        <div className="cat-info">
                            <h3>{t(`forum_page.categories.${cat.translationKey}.title`)}</h3>
                            <p>{t(`forum_page.categories.${cat.translationKey}.desc`)}</p>
                        </div>
                        <div className="cat-stats">
                            <div className="stat-item">
                                <span>{cat.topics}</span>
                                <small>{t('forum_page.stats.topics')}</small>
                            </div>
                            <div className="stat-item">
                                <span>{cat.posts}</span>
                                <small>{t('forum_page.stats.posts')}</small>
                            </div>
                        </div>
                        <div className="cat-last-post">
                            <div className="last-post-user">
                                <FaUser size={12} style={{ marginRight: '5px' }} /> {cat.lastPost.user}
                            </div>
                            <div className="last-post-date">
                                <FaClock size={12} style={{ marginRight: '5px' }} /> {cat.lastPost.date}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
