import { useState, useEffect } from 'react'
import { FaTree, FaGhost, FaWater, FaSnowflake, FaSave, FaCheck, FaExclamationTriangle, FaBullhorn } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL

export default function SiteConfig() {
    const { user } = useAuth()
    const [settings, setSettings] = useState({
        theme: 'default',
        maintenance_mode: 'false',
        announcement: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(null) // key being saved

    // Fetch initial settings
    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => {
                setSettings(data)
                setLoading(false)
            })
            .catch(err => {
                console.error("Error loading settings:", err)
                setLoading(false)
            })
    }, [])

    const handleUpdate = async (key, value) => {
        setSaving(key)
        try {
            const username = user?.user_metadata?.full_name || user?.email || 'Admin';
            
            const res = await fetch(`${API_URL}/settings/${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    value: String(value),
                    username, 
                    userId: user?.id 
                })
            })

            if(res.ok) {
                setSettings(prev => ({ ...prev, [key]: String(value) }))
            } else {
                alert("Error al guardar configuración")
            }
        } catch(err) {
            console.error(err)
        } finally {
            setSaving(null)
        }
    }

    if (loading) return <div>Cargando configuración...</div>

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 1. SELECCIÓN DE TEMA (MODO NAVIDAD / HALLOWEEN) */}
            <div className="admin-card">
                <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaWater /> Tema Global del Sitio
                </h3>
                <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                    Personaliza la apariencia de CrystalTides para celebrar ocasiones especiales.
                    ¡Esto afectará a todos los visitantes!
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    {/* DEFAULT */}
                    <ThemeCard 
                        active={settings.theme === 'default'} 
                        onClick={() => handleUpdate('theme', 'default')}
                        icon={<FaWater size={40} color="#00bcd4" />}
                        title="Cristal Original"
                        color="#00bcd4"
                        loading={saving === 'theme'}
                    />

                    {/* HALLOWEEN */}
                    <ThemeCard 
                        active={settings.theme === 'halloween'} 
                        onClick={() => handleUpdate('theme', 'halloween')}
                        icon={<FaGhost size={40} color="#ff7518" />}
                        title="Modo Halloween"
                        color="#ff7518"
                        loading={saving === 'theme'}
                    />

                    {/* NAVIDAD */}
                    <ThemeCard 
                        active={settings.theme === 'christmas'} 
                        onClick={() => handleUpdate('theme', 'christmas')}
                        icon={<FaTree size={40} color="#ef4444" />}
                        title="Modo Navidad"
                        color="#ef4444"
                        loading={saving === 'theme'}
                    />
                </div>
            </div>

            {/* 2. ANUNCIOS GLOBALES */}
            <div className="admin-card">
                <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaBullhorn /> Anuncio Global (Annobar)
                </h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                        className="admin-input" 
                        placeholder="Ej: Mantenimiento programado hoy a las 20:00 GMT-3" 
                        value={settings.announcement || ''}
                        onChange={(e) => setSettings(prev => ({...prev, announcement: e.target.value}))}
                    />
                    <button 
                        className="btn-primary" 
                        onClick={() => handleUpdate('announcement', settings.announcement)}
                        disabled={saving === 'announcement'}
                    >
                        {saving === 'announcement' ? '...' : <FaSave />} Guardar
                    </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                    Deja este campo vacío para desactivar la barra de anuncios.
                </p>
            </div>

            {/* 3. ZONA DE PELIGRO / MANTENIMIENTO */}
            <div className="admin-card" style={{ border: '1px solid #ef4444' }}>
                <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem', color: '#ef4444' }}>
                    <FaExclamationTriangle /> Zona de Peligro
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                    <div>
                        <h4 style={{ margin: 0, color: '#fff' }}>Modo Mantenimiento</h4>
                        <p style={{ margin: '0.5rem 0 0', color: '#aaa', fontSize: '0.9rem' }}>
                            Si activas esto, solo los administradores podrán acceder al sitio.
                            Los usuarios verán una pantalla de "En construcción".
                        </p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={settings.maintenance_mode === 'true'} 
                            onChange={(e) => handleUpdate('maintenance_mode', e.target.checked ? 'true' : 'false')}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

        </div>
    )
}

function ThemeCard({ active, onClick, icon, title, color, loading }) {
    return (
        <div 
            onClick={onClick}
            style={{ 
                background: active ? `linear-gradient(135deg, ${color}22, transparent)` : 'rgba(255,255,255,0.03)', 
                border: active ? `2px solid ${color}` : '1px solid #333',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading && !active ? 0.5 : 1,
                position: 'relative',
                overflow: 'hidden'
            }}
            className="theme-card"
        >
            {active && <div style={{ position: 'absolute', top: 10, right: 10, color: color }}><FaCheck /></div>}
            <div style={{ marginBottom: '1rem', transform: active ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s' }}>
                {icon}
            </div>
            <h4 style={{ color: active ? '#fff' : '#888', margin: 0 }}>{title}</h4>
        </div>
    )
}
