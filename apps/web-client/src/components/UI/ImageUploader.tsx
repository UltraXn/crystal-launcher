import React, { useState, useRef } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useTranslation } from 'react-i18next';

interface ImageUploaderProps {
    onImageUploaded: (url: string) => void;
    currentImage?: string;
    bucketName?: string;
    folderPath?: string;
    className?: string;
}

export default function ImageUploader({ 
    onImageUploaded, 
    currentImage, 
    bucketName = 'content', 
    folderPath = 'uploads',
    className = ''
}: ImageUploaderProps) {
    const { t } = useTranslation();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Max dimensions
                const MAX_WIDTH = 512;
                const MAX_HEIGHT = 512;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context failed'));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Conversion failed'));
                }, 'image/webp', 0.85); // Convert to WebP, 85% quality
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const webpBlob = await processImage(file);
            const fileName = `${folderPath}/${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
            
            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(fileName, webpBlob, {
                    contentType: 'image/webp',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);
            onImageUploaded(publicUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Error al subir imagen. Verifica permisos o consola.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`image-uploader ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div 
                className="uploader-preview" 
                style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '12px', 
                    background: 'rgba(0,0,0,0.3)', 
                    border: '1px dashed rgba(255,255,255,0.2)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative'
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                {uploading ? (
                    <Loader2 className="animate-spin text-white/50" size={20} />
                ) : currentImage ? (
                    <img src={currentImage} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <Upload size={20} className="text-white/30" />
                )}
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
            />
            <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-white/50 hover:text-white underline text-left"
            >
                {currentImage ? 'Cambiar Imagen' : 'Subir Imagen (WebP)'}
            </button>
        </div>
    );
}
