import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FaImage, FaSpinner, FaExclamationTriangle, FaLanguage } from "react-icons/fa"
import { useTranslation } from "react-i18next"
import { supabase } from "../../services/supabaseClient"
import { newsSchema, NewsFormValues } from "../../schemas/news"

import { User } from "@supabase/supabase-js";

interface NewsFormProps {
    initialData?: NewsFormValues;
    onSave: (data: NewsFormValues) => Promise<void>;
    onCancel: () => void;
    user: User | null;
}

export default function NewsForm({ initialData, onSave, onCancel }: NewsFormProps) {
    const { t } = useTranslation()
    const contentFileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [translating, setTranslating] = useState(false)
    
    const API_URL = '/api'; 

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<NewsFormValues>({
        resolver: zodResolver(newsSchema),
        defaultValues: initialData || {
            title: "", 
            title_en: "", 
            category: "General", 
            content: "", 
            content_en: "", 
            status: "Draft",
            image: ""
        }
    })

    // Watch fields for translation buttons
    const title = watch("title");
    const title_en = watch("title_en");
    const content = watch("content");
    const content_en = watch("content_en");


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
            
            const webpBlob = await convertFileToWebP(file)
            const fileName = `news/${Date.now()}.webp`
            
            const { error: uploadError } = await supabase.storage
                .from('forum-uploads')
                .upload(fileName, webpBlob, {
                     contentType: 'image/webp'
                })

            if (uploadError) {
                if (uploadError.message.includes("Bucket not found")) {
                     throw new Error(t('admin.news.upload_error_bucket'))
                }
                throw uploadError
            }

            const { data } = supabase.storage.from('forum-uploads').getPublicUrl(fileName)
            return data.publicUrl
        } catch (error: unknown) {
            console.error('Error uploading image:', error)
            setUploadError((error as Error).message || t('admin.news.upload_error_unknown'))
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
            setValue("image", url, { shouldValidate: true })
        }
    }

    const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]
        const url = await uploadImage(file)
        if (url) {
            const currentContent = watch("content") || ""
            const imageMarkdown = `\n![Imagen](${url})\n`
            setValue("content", currentContent + imageMarkdown, { shouldValidate: true })
        }
        if (contentFileInputRef.current) contentFileInputRef.current.value = ''
    }

    const handleTranslate = async (text: string, toLang: 'es' | 'en', field: 'title' | 'content' | 'title_en' | 'content_en') => {
        if (!text) return
        setTranslating(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text, targetLang: toLang })
            })
            const data = await res.json()
            if (data.success) {
                setValue(field, data.translatedText, { shouldValidate: true })
            }
        } catch (error) {
            console.error("Translation fail", error)
        } finally {
            setTranslating(false)
        }
    }

    return (
        <div className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.2rem" }}>{initialData?.id ? t('admin.news.edit_title') : t('admin.news.create_title')}</h3>
                <button className="btn-secondary" onClick={onCancel}>{t('admin.news.cancel')}</button>
            </div>

            <form onSubmit={handleSubmit(onSave)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                    <label className="form-label">{t('admin.news.form.title')}</label>
                    <input
                        type="text"
                        className="form-input"
                        {...register("title")}
                    />
                    {errors.title && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.title.message}</span>}
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                            type="button"
                            className="btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={() => handleTranslate(title, 'en', 'title_en')}
                            disabled={translating || !title}
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
                        {...register("title_en")}
                        placeholder={t('admin.news.english_placeholder')}
                    />
                    {errors.title_en && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.title_en.message}</span>}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                            type="button"
                            className="btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={() => handleTranslate(title_en || '', 'es', 'title')}
                            disabled={translating || !title_en}
                        >
                            {translating ? <FaSpinner className="spin" /> : <FaLanguage />} {t('admin.news.translate_to_es_title')}
                        </button>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group">
                        <label className="form-label">{t('admin.news.form.category')}</label>
                        <select className="form-input" {...register("category")}>
                            <option value="General">General</option>
                            <option value="Evento">Evento</option>
                            <option value="Update">Update</option>
                            <option value="Sistema">Sistema</option>
                            <option value="Comunidad">Comunidad</option>
                        </select>
                        {errors.category && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.category.message}</span>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('admin.news.form.status')}</label>
                        <select className="form-input" {...register("status")}>
                            <option value="Draft">{t('admin.news.form.draft')}</option>
                            <option value="Published">{t('admin.news.form.published')}</option>
                        </select>
                        {errors.status && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.status.message}</span>}
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
                                {...register("image")}
                            />
                        </div>
                        {errors.image && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.image.message}</span>}
                        
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
                        {...register("content")}
                    ></textarea>
                    {errors.content && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.content.message}</span>}
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                            type="button"
                            className="btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={() => handleTranslate(content, 'en', 'content_en')}
                            disabled={translating || !content}
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
                        {...register("content_en")}
                    ></textarea>
                    {errors.content_en && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.content_en.message}</span>}
                    
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                            type="button"
                            className="btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={() => handleTranslate(content_en || '', 'es', 'content')}
                            disabled={translating || !content_en}
                        >
                            {translating ? <FaSpinner className="spin" /> : <FaLanguage />} {t('admin.news.translate_to_es_content')}
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? <FaSpinner className="spin" /> : (initialData?.id ? t('admin.news.form.save') : t('admin.news.form.publish'))}
                    </button>
                </div>
            </form>
        </div>
    )
}
