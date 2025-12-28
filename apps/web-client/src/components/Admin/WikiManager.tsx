import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaBook, FaSearch, FaTag, FaGlobe } from "react-icons/fa"
import { getWikiArticles, createWikiArticle, updateWikiArticle, deleteWikiArticle, WikiArticle } from "../../services/wikiService"
import Loader from "../UI/Loader"

export default function WikiManager() {
    const { t } = useTranslation()
    const [articles, setArticles] = useState<WikiArticle[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    // Form State
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Partial<WikiArticle>>({
        title: "",
        slug: "",
        content: "",
        category: "General"
    })
    const [editingId, setEditingId] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchArticles()
    }, [])

    const fetchArticles = async () => {
        setLoading(true)
        try {
            const data = await getWikiArticles()
            setArticles(data)
        } catch (error) {
            console.error("Error loading wiki articles:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.slug || !formData.content) return

        setSaving(true)
        try {
            if (editingId) {
                await updateWikiArticle(editingId, formData)
            } else {
                await createWikiArticle(formData)
            }
            setIsEditing(false)
            fetchArticles()
        } catch (error) {
            console.error("Error saving article:", error)
            alert("No se pudo guardar el artículo. Revisa el slug (debe ser único).")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm(t('common.confirm_delete', '¿Estás seguro de que quieres eliminar este artículo?'))) return
        try {
            await deleteWikiArticle(id)
            fetchArticles()
        } catch (error) {
            console.error("Error deleting article:", error)
        }
    }

    const startEdit = (article: WikiArticle) => {
        setFormData(article)
        setEditingId(article.id)
        setIsEditing(true)
    }

    const startNew = () => {
        setFormData({ title: "", slug: "", content: "", category: "General" })
        setEditingId(null)
        setIsEditing(true)
    }

    const filteredArticles = articles.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="wiki-manager">
            <style>{`
                .wiki-manager {
                    color: #fff;
                }
                .manager-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .article-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                }
                .article-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 1.5rem;
                    transition: all 0.2s;
                }
                .article-card:hover {
                    border-color: var(--accent);
                    background: rgba(255, 255, 255, 0.05);
                }
                .form-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(5px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }
                .form-container {
                    background: #111;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 1000px;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 2.5rem;
                }
                .input-group {
                    margin-bottom: 1.5rem;
                }
                .input-group label {
                    display: block;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #555;
                    margin-bottom: 0.5rem;
                    letter-spacing: 1px;
                }
                .input-group input, .input-group select, .input-group textarea {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 0.8rem 1rem;
                    color: #fff;
                    outline: none;
                }
                .input-group input:focus {
                    border-color: var(--accent);
                }
            `}</style>

            <div className="manager-header">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="search-box">
                        <FaSearch className="text-white/20" />
                        <input 
                            type="text" 
                            placeholder={t('admin.tickets.wiki.search_placeholder', 'Buscar artículos...')} 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ background: 'none', border: 'none', color: '#fff', outline: 'none' }}
                        />
                    </div>
                </div>
                <button className="btn-primary" onClick={startNew}>
                    <FaPlus /> {t('admin.tickets.wiki.create_btn', 'Crear Artículo')}
                </button>
            </div>

            {loading ? (
                <Loader text={t('admin.tickets.wiki.loading', 'Cargando biblioteca...')} />
            ) : filteredArticles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.3 }}>
                    <FaBook size={48} style={{ marginBottom: '1rem' }} />
                    <p>{t('admin.tickets.wiki.no_articles', 'No se encontraron artículos.')}</p>
                </div>
            ) : (
                <div className="article-grid">
                    {filteredArticles.map(article => (
                        <div key={article.id} className="article-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--accent)', background: 'rgba(22, 140, 128, 0.1)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                    {article.category}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => startEdit(article)} className="p-2 hover:text-amber-400"><FaEdit size={14} /></button>
                                    <button onClick={() => handleDelete(article.id)} className="p-2 hover:text-red-400"><FaTrash size={14} /></button>
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{article.title}</h3>
                            <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '1rem' }}>/{article.slug}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#444' }}>
                                <span className="flex items-center gap-1"><FaGlobe /> {t('admin.tickets.wiki.public', 'Público')}</span>
                                <span className="flex items-center gap-1"><FaTag /> {article.content.length} {t('admin.tickets.wiki.char_count', 'caracteres')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="form-overlay"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="form-container"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2>{editingId ? t('admin.tickets.wiki.edit_title', 'Editar Artículo') : t('admin.tickets.wiki.new_title', 'Nuevo Artículo Wiki')}</h2>
                                <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#555' }}><FaTimes size={20} /></button>
                            </div>

                            <form onSubmit={handleSave}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="input-group">
                                        <label>{t('admin.tickets.wiki.title_label', 'Título del Artículo')}</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.title} 
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            placeholder={t('admin.tickets.wiki.title_placeholder', 'Ej: Guía de Encantamientos')}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>{t('admin.tickets.wiki.slug_label', 'URL Slug (Único)')}</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.slug} 
                                            onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                                            placeholder="guia-encantamientos"
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>{t('admin.tickets.wiki.category_label', 'Categoría')}</label>
                                    <select 
                                        value={formData.category} 
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    >
                                        <option value="General">{t('admin.tickets.wiki.categories.general', 'General')}</option>
                                        <option value="Mecánicas">{t('admin.tickets.wiki.categories.mechanics', 'Mecánicas')}</option>
                                        <option value="Economía">{t('admin.tickets.wiki.categories.economy', 'Economía')}</option>
                                        <option value="Comandos">{t('admin.tickets.wiki.categories.commands', 'Comandos')}</option>
                                        <option value="Rangos">{t('admin.tickets.wiki.categories.ranks', 'Rangos')}</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>{t('admin.tickets.wiki.content_label', 'Contenido (Markdown)')}</label>
                                    <textarea 
                                        required
                                        rows={12}
                                        value={formData.content} 
                                        onChange={e => setFormData({...formData, content: e.target.value})}
                                        style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                                        placeholder="# Título Principal\n\nEscribe el contenido aquí..."
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '0.8rem 2rem', color: '#666' }}>{t('common.cancel', 'Cancelar')}</button>
                                    <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.8rem 3rem' }}>
                                        {saving ? <Loader size={16} /> : <>{editingId ? <><FaSave /> {t('admin.tickets.wiki.update_btn', 'Actualizar')}</> : <><FaSave /> {t('admin.tickets.wiki.publish_btn', 'Publicar')}</>}</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
