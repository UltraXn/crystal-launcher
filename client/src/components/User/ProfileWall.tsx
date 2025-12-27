import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { FaTrash, FaPaperPlane, FaCommentDots, FaUserCircle } from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"
import { getProfileComments, postProfileComment, deleteProfileComment, ProfileComment } from "../../services/profileCommentService"
import Loader from "../UI/Loader"

interface ProfileWallProps {
    profileId: string; // The UUID of the profile owner
    isAdmin?: boolean;
}

export default function ProfileWall({ profileId, isAdmin }: ProfileWallProps) {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [comments, setComments] = useState<ProfileComment[]>([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const data = await getProfileComments(profileId)
                setComments(data)
            } catch (error) {
                console.error("Error loading wall comments:", error)
            } finally {
                setLoading(false)
            }
        }
        if (profileId) fetchComments()
    }, [profileId])

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !newComment.trim() || sending) return

        setSending(true)
        try {
            const comment = await postProfileComment(profileId, newComment)
            setComments(prev => [comment, ...prev])
            setNewComment("")
        } catch (error) {
            console.error("Error posting comment:", error)
        } finally {
            setSending(false)
        }
    }

    const handleDeleteComment = async (id: number) => {
        if (!window.confirm(t('common.confirm_delete', '¿Estás seguro de que quieres eliminar este comentario?'))) return

        try {
            await deleteProfileComment(id)
            setComments(prev => prev.filter(c => c.id !== id))
        } catch (error) {
            console.error("Error deleting comment:", error)
        }
    }

    return (
        <div className="admin-card" style={{ marginTop: '2rem' }}>
            <h3 style={{ 
                marginBottom: '1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.8rem', 
                borderBottom: '1px solid rgba(255,255,255,0.1)', 
                paddingBottom: '1rem' 
            }}>
                <FaCommentDots style={{ color: 'var(--accent)' }} /> {t('profile.wall.title', 'Muro de Comentarios')}
            </h3>

            {/* Input Form */}
            {user ? (
                <form onSubmit={handlePostComment} style={{ marginBottom: '2rem', position: 'relative' }}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t('profile.wall.placeholder', 'Escribe algo en este muro...')}
                        maxLength={500}
                        style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '1rem',
                            color: '#fff',
                            minHeight: '100px',
                            resize: 'vertical',
                            fontSize: '0.95rem',
                            marginBottom: '0.5rem'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#555' }}>{newComment.length}/500</span>
                        <button 
                            type="submit" 
                            disabled={!newComment.trim() || sending}
                            className="btn-primary"
                            style={{ 
                                padding: '0.6rem 1.5rem', 
                                fontSize: '0.9rem', 
                                display: 'flex', 
                                gap: '0.5rem', 
                                alignItems: 'center' 
                            }}
                        >
                            {sending ? <Loader size={14} /> : <><FaPaperPlane size={12} /> {t('profile.wall.post', 'Publicar')}</>}
                        </button>
                    </div>
                </form>
            ) : (
                <div style={{ 
                    padding: '1.5rem', 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: '12px', 
                    textAlign: 'center', 
                    color: '#666', 
                    marginBottom: '2rem',
                    border: '1px dashed rgba(255,255,255,0.05)'
                }}>
                    {t('profile.wall.login_required', 'Inicia sesión para dejar un comentario.')}
                </div>
            )}

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loading ? (
                    <Loader text={t('common.loading')} />
                ) : comments.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#444', padding: '2rem', fontStyle: 'italic' }}>
                        {t('profile.wall.empty', 'Aún no hay mensajes. ¡Sé el primero!')}
                    </div>
                ) : (
                    <AnimatePresence>
                        {comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.03)',
                                    position: 'relative'
                                }}
                            >
                                {/* Author Avatar */}
                                <div style={{ flexShrink: 0 }}>
                                    {comment.profiles?.avatar_url ? (
                                        <img 
                                            src={comment.profiles.avatar_url} 
                                            alt={comment.profiles.username} 
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}
                                        />
                                    ) : (
                                        <FaUserCircle size={40} style={{ color: '#333' }} />
                                    )}
                                </div>

                                {/* Comment Content */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent)' }}>
                                            {comment.profiles?.username || 'Anon'}
                                            {comment.profiles?.role && (
                                                <span style={{ 
                                                    fontSize: '0.65rem', 
                                                    marginLeft: '0.5rem', 
                                                    background: 'rgba(255,255,255,0.05)', 
                                                    padding: '2px 6px', 
                                                    borderRadius: '4px',
                                                    color: '#888',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {comment.profiles.role}
                                                </span>
                                            )}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: '#555' }}>
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {comment.content}
                                    </p>
                                </div>

                                {/* Actions */}
                                {(isAdmin || user?.id === comment.author_id || user?.id === profileId) && (
                                    <button 
                                        onClick={() => handleDeleteComment(comment.id)}
                                        style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            background: 'none',
                                            border: 'none',
                                            color: '#444',
                                            cursor: 'pointer',
                                            padding: '0.3rem',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#444'}
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}
