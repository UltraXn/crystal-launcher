import { useState, useEffect } from 'react'
import { FaWater, FaGhost, FaTree, FaCheck, FaUsers, FaSave, FaChevronDown, FaChevronUp, FaCogs, FaBullhorn, FaImage, FaGavel, FaDonate, FaTerminal, FaShieldAlt } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import ConfirmationModal from '../UI/ConfirmationModal'
import { useTranslation } from 'react-i18next'
import Loader from "../UI/Loader"
import { supabase } from '../../services/supabaseClient'
import BroadcastManager from './Config/BroadcastManager'
import HeroBannerManager from './Config/HeroBannerManager'
import RulesEditor from './Config/RulesEditor'
import SecureConsole from './Config/SecureConsole'
import DonationsManager from './DonationsManager'
import DonorsManager from './DonorsManager'
import PoliciesManager from './Config/PoliciesManager'

const API_URL = import.meta.env.VITE_API_URL

// Define the settings interface to cover all known keys
interface SiteSettings {
    theme: string;
    maintenance_mode: string;
    broadcast_config: string;
    hero_slides: string;
    recruitment_status?: string;
    recruitment_link?: string;
    server_rules?: string | any[];
    [key: string]: any;
}

interface User {
    id: string;
    email?: string;
    user_metadata?: {
        full_name?: string;
    };
}

export default function SiteConfig() {
    const { t } = useTranslation()
    const { user } = useAuth() as { user: User | null }
    const [settings, setSettings] = useState<SiteSettings>({
        theme: 'default',
        maintenance_mode: 'false',
        broadcast_config: '',
        hero_slides: '',
        recruitment_status: 'false',
        recruitment_link: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
    const [maintenanceTarget, setMaintenanceTarget] = useState(false)

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

    const handleUpdate = async (key: string, value: string | boolean) => {
        setSaving(key)
        try {
            const username = user?.user_metadata?.full_name || user?.email || 'Admin';
            
            const { data: { session } } = await supabase.auth.getSession();
            const headers: Record<string, string> = { 
                'Content-Type': 'application/json' 
            };
            if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

            const res = await fetch(`${API_URL}/settings/${key}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ 
                    value: String(value),
                    username, 
                    userId: user?.id 
                })
            })

            if(res.ok) {
                const newValue = String(value)
                setSettings(prev => ({ ...prev, [key]: newValue }))
                
                // Dispatch event for App.jsx to react immediately
                if(key === 'theme') {
                    window.dispatchEvent(new CustomEvent('themeChanged', { detail: newValue }));
                }
                if(key === 'broadcast_config') {
                    window.dispatchEvent(new CustomEvent('broadcastChanged', { detail: newValue }));
                }
                if(key === 'maintenance_mode') {
                    window.dispatchEvent(new CustomEvent('maintenanceChanged', { detail: newValue }));
                }
            } else {
                alert(t('admin.settings.error_save'))
            }
        } catch(err) {
            console.error(err)
        } finally {
            setSaving(null)
        }
    }

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}>
            <Loader text="" style={{ height: 'auto', minHeight: '120px' }} />
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '3rem' }}>
            
            {/* 1. SECCIÓN GENERAL (Tema, Mantenimiento, Reclutamiento) */}
            <ConfigSection title={t('admin.settings.sections.general')} icon={<FaCogs />} defaultOpen={true}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                    {/* TEMA + MANTENIMIENTO */}
                    <div className="admin-card" style={{ margin: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: '1 1 200px' }}>
                                <h3 style={{ marginBottom: '0.4rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                                    <FaWater /> {t('admin.settings.theme.title')}
                                </h3>
                                <p style={{ color: '#888', margin: 0, fontSize: '0.85rem' }}>
                                    {t('admin.settings.theme.desc')}
                                </p>
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.8rem', 
                                background: settings.maintenance_mode === 'true' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                                padding: '0.5rem 0.8rem', 
                                borderRadius: '4px', 
                                border: settings.maintenance_mode === 'true' ? '1px solid #ef4444' : '1px solid #444'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: settings.maintenance_mode === 'true' ? '#ef4444' : '#fff' }}>
                                        {t('admin.settings.maintenance_label')}
                                    </span>
                                </div>
                                <label className="switch" style={{ transform: 'scale(0.8)', margin: 0 }}>
                                    <input 
                                        type="checkbox" 
                                        checked={settings.maintenance_mode === 'true'} 
                                        onChange={() => {}} 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const nextState = !(settings.maintenance_mode === 'true');
                                            setMaintenanceTarget(nextState);
                                            setShowMaintenanceModal(true);
                                        }}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                            <ThemeCard 
                                active={settings.theme === 'default'} 
                                onClick={() => handleUpdate('theme', 'default')}
                                icon={<FaWater size={32} color="#00bcd4" />}
                                title={t('admin.settings.theme.default')}
                                color="#00bcd4"
                                loading={saving === 'theme'}
                            />
                            <ThemeCard 
                                active={settings.theme === 'halloween'} 
                                onClick={() => handleUpdate('theme', 'halloween')}
                                icon={<FaGhost size={32} color="#ff7518" />}
                                title={t('admin.settings.theme.halloween')}
                                color="#ff7518"
                                loading={saving === 'theme'}
                            />
                            <ThemeCard 
                                active={settings.theme === 'christmas'} 
                                onClick={() => handleUpdate('theme', 'christmas')}
                                icon={<FaTree size={32} color="#ef4444" />}
                                title={t('admin.settings.theme.christmas')}
                                color="#ef4444"
                                loading={saving === 'theme'}
                            />
                        </div>
                    </div>

                    {/* RECLUTAMIENTO */}
                    <div className="admin-card" style={{ margin: 0 }}>
                        <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                            <FaUsers /> {t('admin.settings.recruitment.title')}
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                                <div>
                                    <span style={{ display: 'block', fontWeight: 'bold', color: settings.recruitment_status === 'true' ? '#4CAF50' : '#ef4444' }}>
                                        {settings.recruitment_status === 'true' ? t('admin.settings.recruitment.status_open') : t('admin.settings.recruitment.status_closed')}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{t('admin.settings.recruitment.status_label')}</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.recruitment_status === 'true'} 
                                        onChange={(e) => handleUpdate('recruitment_status', String(e.target.checked))} 
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div>
                                <label style={{ display:'block', marginBottom:'5px', fontSize:'0.9rem', color:'#aaa' }}>{t('admin.settings.recruitment.link_label')}</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input 
                                        className="admin-input" 
                                        value={settings.recruitment_link || ''} 
                                        onChange={(e) => setSettings({...settings, recruitment_link: e.target.value})}
                                        placeholder={t('admin.settings.recruitment.link_ph')} 
                                    />
                                    <button 
                                        className="btn-primary" 
                                        disabled={saving === 'recruitment_link'}
                                        onClick={() => handleUpdate('recruitment_link', settings.recruitment_link || '')}
                                    >
                                        <FaSave />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ConfigSection>

            {/* 2. BROADCAST (Alertas) */}
            <ConfigSection title={t('admin.settings.sections.broadcast')} icon={<FaBullhorn />}>
                <BroadcastManager 
                    settings={settings} 
                    onUpdate={handleUpdate} 
                    saving={saving}
                />
            </ConfigSection>

            {/* 3. HERO BANNER */}
            <ConfigSection title={t('admin.settings.sections.hero')} icon={<FaImage />}>
                <HeroBannerManager 
                    settings={settings} 
                    onUpdate={handleUpdate} 
                    saving={saving}
                />
            </ConfigSection>

            {/* 4. REGLAS */}
            <ConfigSection title={t('admin.settings.sections.rules')} icon={<FaGavel />}>
                <RulesEditor
                    settings={settings}
                    onUpdate={handleUpdate}
                    saving={saving}
                />
            </ConfigSection>

            {/* 5. DONADORES */}
            <ConfigSection title={t('admin.settings.sections.donors')} icon={<FaUsers />}>
                <DonorsManager />
            </ConfigSection>

            {/* 6. HISTORIAL DE DONACIONES */}
            <ConfigSection title={t('admin.settings.sections.donations')} icon={<FaDonate />}>
                <DonationsManager />
            </ConfigSection>

            {/* 8. POLÍTICAS LEGALES */}
            <ConfigSection title={t('admin.settings.sections.policies', 'Políticas del Sitio')} icon={<FaShieldAlt />}>
                <PoliciesManager />
            </ConfigSection>

            {/* 7. CONSOLA */}
            <ConfigSection title={t('admin.settings.sections.console')} icon={<FaTerminal />}>
                <SecureConsole />
            </ConfigSection>

            <ConfirmationModal 
                isOpen={showMaintenanceModal}
                onClose={() => setShowMaintenanceModal(false)}
                onConfirm={() => {
                    handleUpdate('maintenance_mode', String(maintenanceTarget));
                    setShowMaintenanceModal(false);
                }}
                title={maintenanceTarget ? t('admin.settings.maintenance_modal.title_on') : t('admin.settings.maintenance_modal.title_off')}
                message={maintenanceTarget 
                    ? t('admin.settings.maintenance_modal.msg_on') 
                    : t('admin.settings.maintenance_modal.msg_off')}
                confirmText={maintenanceTarget ? t('admin.settings.maintenance_modal.confirm_on') : t('admin.settings.maintenance_modal.confirm_off')}
                cancelText={t('admin.settings.maintenance_modal.cancel')}
                isDanger={maintenanceTarget}
            />
        </div>
    )
}

interface ConfigSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function ConfigSection({ title, icon, children, defaultOpen = false }: ConfigSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div style={{ 
            border: '1px solid #333', 
            borderRadius: '8px', 
            background: isOpen ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.02)',
            overflow: 'hidden'
        }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '1.2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: isOpen ? 'var(--accent)' : '#fff',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    borderBottom: isOpen ? '1px solid #333' : 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>{icon}</span>
                    {title}
                </div>
                {isOpen ? <FaChevronUp /> : <FaChevronDown style={{ opacity: 0.5 }} />}
            </button>
            
            {isOpen && (
                <div style={{ padding: '1.5rem', animation: 'fadeIn 0.3s' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

interface ThemeCardProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    color: string;
    loading: boolean;
}

function ThemeCard({ active, onClick, icon, title, color, loading }: ThemeCardProps) {
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
