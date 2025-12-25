import { useState, useEffect, useCallback } from "react"
import { FaPlus, FaEdit, FaTrash, FaImage, FaSearch, FaExclamationTriangle, FaLanguage, FaSpinner } from "react-icons/fa"
import { useTranslation } from "react-i18next"
import Loader from "../UI/Loader"
import { supabase } from "../../services/supabaseClient"
import { useRef } from "react"

interface NewsPost {
    id?: number;
    title: string;
    category: string;
    content: string;
    status: string;
    image?: string;
    created_at?: string;
    author_id?: string;
    username?: string;
    user_id?: string;
    title_en?: string;
    content_en?: string;
}

interface AdminNewsProps {
    user: any;
}

export default function AdminNews({ user }: AdminNewsProps) {
    const { t } = useTranslation()
    const [news, setNews] = useState<NewsPost[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentPost, setCurrentPost] = useState<NewsPost | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null) // ID of news to delete
    const [searchTerm, setSearchTerm] = useState('')
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const contentFileInputRef = useRef<HTMLInputElement>(null)

    const API_URL = '/api'; // import.meta.env.VITE_API_URL as string

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

    const convertFileToWebP = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Image()
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d')
                    if (!ctx) {
                        reject(new Error('No canvas context'))
                        return
                    }
                    ctx.drawImage(img, 0, 0)
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob)
                        else reject(new Error('Conversion failed'))
                    }, 'image/webp', 0.8)
                }
                img.onerror = reject
                img.src = e.target?.result as string
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            setUploading(true)
            setUploadError(null)
            
            // Convert to WebP
            const webpBlob = await convertFileToWebP(file)
            const fileName = `news/${Date.now()}.webp`
            
            const { error: uploadError } = await supabase.storage
                .from('forum-uploads')
                .upload(fileName, webpBlob, {
                     contentType: 'image/webp'
                })

            if (uploadError) {
                console.error("Supabase Upload Error:", uploadError)
                if (uploadError.message.includes("Bucket not found")) {
                     throw new Error(t('admin.news.upload_error_bucket'))
                }
                throw uploadError
            }

            const { data } = supabase.storage.from('forum-uploads').getPublicUrl(fileName)
            return data.publicUrl
        } catch (error: any) {
            console.error('Error uploading image:', error)
            setUploadError(error.message || t('admin.news.upload_error_unknown'))
            return null
        } finally {
            setUploading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]
        const url = await uploadImage(file)
        if (url) {
            setCurrentPost(prev => prev ? { ...prev, image: url } : null)
        }
    }

    const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]
        const url = await uploadImage(file)
        if (url && currentPost) {
            const imageMarkdown = `\n![Imagen](${url})\n`
            setCurrentPost(prev => prev ? { ...prev, content: prev.content + imageMarkdown } : null)
        }
        // Reset input
        if (contentFileInputRef.current) contentFileInputRef.current.value = ''
    }

    const handleEdit = (post: NewsPost) => {
        setCurrentPost(post)
        setIsEditing(true)
    }

    const [translating, setTranslating] = useState(false)
    const handleTranslate = async (text: string, toLang: 'es' | 'en', field: 'title' | 'content' | 'title_en' | 'content_en') => {
        if (!text) return
        setTranslating(true)
        try {
            const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, targetLang: toLang })
            })
            const data = await res.json()
            if (data.success) {
                setCurrentPost(prev => prev ? { ...prev, [field]: data.translatedText } : null)
            }
        } catch (error) {
            console.error("Translation fail", error)
        } finally {
            setTranslating(false)
        }
    }

    const handleNew = () => {
        setCurrentPost({ title: "", title_en: "", category: "General", content: "", content_en: "", status: "Draft" })
        setIsEditing(true)
    }

    const confirmDelete = (id: number) => {
        setDeleteConfirm(id)
    }

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        try {
            const username = user?.user_metadata?.full_name || user?.email || 'Admin';
            await fetch(`${API_URL}/news/${deleteConfirm}?userId=${user?.id}&username=${encodeURIComponent(username)}`, { method: 'DELETE' })
            setNews(news.filter(n => n.id !== deleteConfirm))
            setDeleteConfirm(null)
        } catch (error) {
            console.error("Error eliminando noticia:", error)
            alert(t('admin.news.error_delete'))
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            let res
            const headers = { 'Content-Type': 'application/json' }
            const username = user?.user_metadata?.full_name || user?.email || 'Admin';

            if (currentPost?.id) {
                // UPDATE
                res = await fetch(`${API_URL}/news/${currentPost.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({ ...currentPost, username, user_id: user?.id })
                })
            } else {
                // CREATE
                const postData = {
                    ...currentPost,
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
            <div className="admin-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.2rem" }}>{currentPost.id ? t('admin.news.edit_title') : t('admin.news.create_title')}</h3>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)}>{t('admin.news.cancel')}</button>
                </div>

                <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="form-group">
                        <label className="form-label">{t('admin.news.form.title')}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={currentPost.title}
                            onChange={e => setCurrentPost(prev => prev ? { ...prev, title: e.target.value } : null)}
                            required
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                             <button
                                type="button"
                                className="btn-secondary"
                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                onClick={() => handleTranslate(currentPost.title, 'en', 'title_en')}
                                disabled={translating || !currentPost.title}
                            >
                                {translating ? <FaSpinner className="spin" /> : <FaLanguage />} {t('admin.news.translate_to_en_title')}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('admin.news.form.title')} {t('admin.news.english_suffix')}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={currentPost.title_en || ''}
                            onChange={e => setCurrentPost(prev => prev ? { ...prev, title_en: e.target.value } : null)}
                            placeholder={t('admin.news.english_placeholder')}
                        />
                         <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                             <button
                                type="button"
                                className="btn-secondary"
                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                onClick={() => handleTranslate(currentPost.title_en || '', 'es', 'title')}
                                disabled={translating || !currentPost.title_en}
                            >
                                {translating ? <FaSpinner className="spin" /> : <FaLanguage />} {t('admin.news.translate_to_es_title')}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label className="form-label">{t('admin.news.form.category')}</label>
                            <select
                                className="form-input"
                                value={currentPost.category}
                                onChange={e => setCurrentPost(prev => prev ? { ...prev, category: e.target.value } : null)}
                            >
                                <option value="General">General</option>
                                <option value="Evento">Evento</option>
                                <option value="Update">Update</option>
                                <option value="Sistema">Sistema</option>
                                <option value="Comunidad">Comunidad</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('admin.news.form.status')}</label>
                            <select
                                className="form-input"
                                value={currentPost.status}
                                onChange={e => setCurrentPost(prev => prev ? { ...prev, status: e.target.value } : null)}
                            >
                                <option value="Draft">{t('admin.news.form.draft')}</option>
                                <option value="Published">{t('admin.news.form.published')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('admin.news.form.image')}</label>
                        <div style={{ display: "flex", gap: "0.5rem", flexDirection: 'column' }}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <div style={{ background: "#333", width: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
                                    <FaImage color="#888" />
                                </div>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="https://..."
                                    value={currentPost.image || ""}
                                    onChange={e => setCurrentPost(prev => prev ? { ...prev, image: e.target.value } : null)}
                                />
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                                style={{color: '#aaa', fontSize: '0.9rem'}}
                                disabled={uploading}
                            />
                            {uploading && <span style={{fontSize: '0.8rem', color: 'var(--accent)'}}>{t('admin.news.uploading')}</span>}
                            {uploadError && (
                                <div style={{ 
                                    background: 'rgba(239, 68, 68, 0.1)', 
                                    color: '#ef4444', 
                                    padding: '0.5rem', 
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    marginTop: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <FaExclamationTriangle /> {uploadError}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <label className="form-label">{t('admin.news.form.content')}</label>
                            <button 
                                type="button" 
                                onClick={() => contentFileInputRef.current?.click()} 
                                className="btn-secondary" 
                                style={{fontSize: '0.8rem', padding: '0.2rem 0.5rem'}}
                                disabled={uploading}
                            >
                                <FaImage style={{marginRight: '5px'}}/> {t('admin.news.insert_image')}
                            </button>
                            <input 
                                type="file" 
                                ref={contentFileInputRef} 
                                style={{display: 'none'}} 
                                accept="image/*" 
                                onChange={handleContentImageUpload}
                            />
                        </div>
                        <textarea
                            className="form-textarea"
                            rows={10}
                            value={currentPost.content}
                            onChange={e => setCurrentPost(prev => prev ? { ...prev, content: e.target.value } : null)}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                             <button
                                type="button"
                                className="btn-secondary"
                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                onClick={() => handleTranslate(currentPost.content, 'en', 'content_en')}
                                disabled={translating || !currentPost.content}
                            >
                                {translating ? <FaSpinner className="spin" /> : <FaLanguage />} {t('admin.news.translate_to_en_content')}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('admin.news.form.content')} {t('admin.news.english_suffix')}</label>
                        <textarea
                            className="form-textarea"
                            rows={10}
                            value={currentPost.content_en || ''}
                            onChange={e => setCurrentPost(prev => prev ? { ...prev, content_en: e.target.value } : null)}
                        ></textarea>
                         <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                             <button
                                type="button"
                                className="btn-secondary"
                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                onClick={() => handleTranslate(currentPost.content_en || '', 'es', 'content')}
                                disabled={translating || !currentPost.content_en}
                            >
                                {translating ? <FaSpinner className="spin" /> : <FaLanguage />} {t('admin.news.translate_to_es_content')}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                        <button type="submit" className="btn-primary">
                            {currentPost.id ? t('admin.news.form.save') : t('admin.news.form.publish')}
                        </button>
                    </div>
                </form>
            </div>
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
