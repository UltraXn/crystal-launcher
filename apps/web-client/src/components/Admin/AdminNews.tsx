import { useState, useEffect, useCallback } from "react"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle } from "react-icons/fa"
import { useTranslation } from "react-i18next"
import Loader from "../UI/Loader"
import { supabase } from "../../services/supabaseClient"
import NewsForm from "./NewsForm"
import { NewsFormValues } from "../../schemas/news"

interface NewsPost extends NewsFormValues {
    id?: number;
    created_at?: string;
}

import { User } from "@supabase/supabase-js";

interface AdminNewsProps {
    user: User | null;
}

export default function AdminNews({ user }: AdminNewsProps) {
    const { t } = useTranslation()
    const [news, setNews] = useState<NewsPost[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentPost, setCurrentPost] = useState<NewsPost | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null) // ID of news to delete
    const [searchTerm, setSearchTerm] = useState('')
    
    const API_URL = '/api'; 

    const fetchNews = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/news`)
            const data = await res.json()
            setNews(data)
        } catch (error) {
            console.error("Error cargando noticias:", error)
        } finally {
            setLoading(false)
        }
    }, [API_URL])

    // Cargar noticias al montar
    useEffect(() => {
        fetchNews()
    }, [fetchNews])

    const handleEdit = (post: NewsPost) => {
        setCurrentPost(post)
        setIsEditing(true)
    }

    const handleNew = () => {
        setCurrentPost({ 
            title: "", 
            title_en: "", 
            category: "General", 
            content: "", 
            content_en: "", 
            status: "Draft",
            image: "" 
        })
        setIsEditing(true)
    }

    const confirmDelete = (id: number) => {
        setDeleteConfirm(id)
    }

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        try {
            const username = user?.user_metadata?.full_name || user?.email || 'Admin';
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            await fetch(`${API_URL}/news/${deleteConfirm}?userId=${user?.id}&username=${encodeURIComponent(username)}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setNews(news.filter(n => n.id !== deleteConfirm))
            setDeleteConfirm(null)
        } catch (error) {
            console.error("Error eliminando noticia:", error)
            alert(t('admin.news.error_delete'))
        }
    }

    const handleSave = async (data: NewsFormValues) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            const headers: Record<string, string> = { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
            
            let res
            const username = user?.user_metadata?.full_name || user?.email || 'Admin';

            if (data.id) {
                // UPDATE
                res = await fetch(`${API_URL}/news/${data.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({ ...data, username, user_id: user?.id })
                })
            } else {
                // CREATE
                const postData = {
                    ...data,
                    author_id: user?.id,
                    username // Send username for logs
                }
                res = await fetch(`${API_URL}/news`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(postData)
                })
            }

            if (!res.ok) throw new Error('Error al guardar')

            await fetchNews() // Recargar lista
            setIsEditing(false)
            setCurrentPost(null)
        } catch (error) {
            console.error("Error guardando noticia:", error)
            alert(t('admin.news.error_save'))
        }
    }

    const filteredNews = news.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1.5rem' }}>
            <Loader style={{ height: 'auto', minHeight: '120px' }} />
            <p style={{ color: '#aaa' }}>{t('admin.news.loading')}</p>
        </div>
    )

    if (isEditing && currentPost) {
        return (
            <NewsForm 
                initialData={currentPost}
                onSave={handleSave}
                onCancel={() => {
                    setIsEditing(false)
                    setCurrentPost(null)
                }}
                user={user}
            />
        )
    }

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                    <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input 
                        type="text" 
                        placeholder={t('admin.news.search_ph')} 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} 
                    />
                </div>
                <button className="btn-primary" onClick={handleNew} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaPlus size={12} /> {t('admin.news.write_btn')}
                </button>
            </div>

            <div className="admin-table-container" style={{ overflow: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('admin.news.table.title')}</th>
                            <th>{t('admin.news.table.category')}</th>
                            <th>{t('admin.news.table.status')}</th>
                            <th>{t('admin.news.table.date')}</th>
                            <th style={{ textAlign: "right" }}>{t('admin.news.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNews.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#666" }}>{t('admin.news.no_news')}</td></tr>
                        ) : filteredNews.map(post => (
                            <tr key={post.id}>
                                <td style={{ fontWeight: "500", color: "#fff" }}>{post.title}</td>
                                <td><span className="badge">{post.category}</span></td>
                                <td>
                                    <span style={{
                                        color: post.status === "Published" ? "#4ade80" : "#fbbf24",
                                        background: post.status === "Published" ? "rgba(74, 222, 128, 0.1)" : "rgba(251, 191, 36, 0.1)",
                                        padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem"
                                    }}>
                                        {post.status === "Published" ? t('admin.news.form.published') : t('admin.news.form.draft')}
                                    </span>
                                </td>
                                <td style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : '-'}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    <button
                                        onClick={() => handleEdit(post)}
                                        style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", marginRight: "1rem" }}
                                        title={t('admin.news.edit_title')}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => post.id && confirmDelete(post.id)}
                                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                                        title={t('admin.news.delete_tooltip')}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0, 
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setDeleteConfirm(null)}>
                    <div style={{
                        background: '#1e1e24',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '1px solid #ef4444',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '50%', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '2rem'
                        }}>
                            <FaExclamationTriangle />
                        </div>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem' }}>{t('admin.news.delete_modal.title')}</h3>
                        <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                            {t('admin.news.delete_modal.desc')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                className="btn-secondary" 
                                onClick={() => setDeleteConfirm(null)}
                                style={{ flex: 1 }}
                            >
                                {t('admin.news.delete_modal.cancel')}
                            </button>
                            <button 
                                className="btn-primary" 
                                onClick={executeDelete}
                                style={{ 
                                    flex: 1, 
                                    background: '#ef4444', 
                                    borderColor: '#ef4444', 
                                    color: '#fff' 
                                }}
                            >
                                {t('admin.news.delete_modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
