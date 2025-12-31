import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash, FaTrophy } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Loader from "../UI/Loader";
import { MEDAL_ICONS } from '../../utils/MedalIcons';

const API_URL = import.meta.env.VITE_API_URL;

interface Medal {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
}

interface GamificationSettings {
    medal_definitions?: string | Medal[];
    [key: string]: unknown;
}

export default function GamificationManager() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<GamificationSettings>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [medals, setMedals] = useState<Medal[]>([]);
    const [prevMedalsStr, setPrevMedalsStr] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch settings on mount
    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const onUpdate = async (key: string, newValue: string) => {
        setSaving(key);
        try {
            await fetch(`${API_URL}/settings/${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: newValue })
            });
            setSettings((prev: GamificationSettings) => ({ ...prev, [key]: newValue }));
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(null);
        }
    };

    // Derived state pattern
    const medalsStr = settings?.medal_definitions ? (typeof settings.medal_definitions === 'string' ? settings.medal_definitions : JSON.stringify(settings.medal_definitions)) : null;

    if (medalsStr !== prevMedalsStr) {
        setPrevMedalsStr(medalsStr);
        if (medalsStr) {
            try {
                const parsed = JSON.parse(medalsStr);
                setMedals(Array.isArray(parsed) ? parsed : []);
            } catch { setMedals([]); }
        } else {
            setMedals([]);
        }
    }

    const handleAdd = () => {
        setMedals([...medals, { 
            id: Date.now(), 
            name: t('admin.gamification.medals.new_medal_default'), 
            description: t('admin.gamification.medals.desc_default'), 
            icon: 'FaMedal', 
            color: '#fbbf24' 
        }]);
    };

    const handleDelete = (id: number) => {
        if(!confirm(t('admin.gamification.medals.delete_confirm'))) return;
        setMedals(medals.filter(m => m.id !== id));
    };

    const handleChange = (id: number, field: keyof Medal, value: string) => {
        setMedals(medals.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleSave = () => {
        onUpdate('medal_definitions', JSON.stringify(medals));
    };

    // Helper to render icon component dynamically
    const renderIcon = (iconName: string) => {
        const Icon = MEDAL_ICONS[iconName as keyof typeof MEDAL_ICONS] || MEDAL_ICONS.FaMedal;
        return <Icon />;
    };

    if (loading) {
        return (
            <div style={{ padding: '8rem', display: 'flex', justifyContent: 'center' }}>
                <Loader />
            </div>
        );
    }

    return (
        <div className="gamification-manager-container">
            <div className="gamification-header">
                <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'1rem', fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                    <div style={{ padding: '8px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', display: 'flex' }}>
                        <FaTrophy style={{ color: '#fbbf24' }} />
                    </div>
                    {t('admin.gamification.medals.title')}
                </h3>
                <button onClick={handleSave} className="poll-new-btn btn-primary" disabled={saving === 'medal_definitions'} style={{ height: '48px', padding: '0 2rem' }}>
                    {saving === 'medal_definitions' ? <FaSave className="spin" /> : <FaSave />}
                    {saving === 'medal_definitions' ? t('admin.gamification.medals.saving') : t('admin.gamification.medals.save')}
                </button>
            </div>

            <div className="gamification-grid">
                {medals.map((medal) => (
                    <div key={medal.id} className="medal-card-premium">
                        <div className="medal-card-accent" style={{ background: medal.color }}></div>
                        
                        <button 
                            onClick={() => handleDelete(medal.id)}
                            className="medal-delete-btn"
                            title={t('common.delete', 'Eliminar')}
                        >
                            <FaTrash size={14} />
                        </button>

                        <div className="medal-visual-section">
                            <div className="medal-icon-preview-wrapper" style={{ color: medal.color, boxShadow: `0 10px 30px ${medal.color}20` }}>
                                {renderIcon(medal.icon)}
                                <div className="medal-color-picker-wrapper" style={{ background: medal.color }}>
                                    <input 
                                        type="color" 
                                        value={medal.color} 
                                        onChange={(e) => handleChange(medal.id, 'color', e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="medal-info-section">
                                <input 
                                    className="admin-input-premium" 
                                    value={medal.name} 
                                    onChange={(e) => handleChange(medal.id, 'name', e.target.value)}
                                    placeholder={t('admin.gamification.medals.name_placeholder')}
                                    style={{ padding: '0.6rem 1rem', fontSize: '1rem', fontWeight: 800 }}
                                />
                                <textarea 
                                    className="admin-textarea-premium" 
                                    value={medal.description} 
                                    onChange={(e) => handleChange(medal.id, 'description', e.target.value)}
                                    placeholder={t('admin.gamification.medals.desc_placeholder')}
                                    rows={2}
                                    style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', minHeight: '60px' }}
                                />
                            </div>
                        </div>

                        {/* Icon Selector Grid */}
                        <div className="medal-icon-selector">
                            {Object.keys(MEDAL_ICONS).map(iconKey => (
                                <button 
                                    key={iconKey}
                                    onClick={() => handleChange(medal.id, 'icon', iconKey)}
                                    className={`icon-select-btn ${medal.icon === iconKey ? 'active' : ''}`}
                                    title={iconKey}
                                >
                                    {renderIcon(iconKey)}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Add Button Premium Card */}
                <div className="medal-add-card" onClick={handleAdd}>
                    <div className="medal-add-icon-wrapper">
                        <FaPlus />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {t('admin.gamification.medals.create_btn')}
                    </span>
                </div>
            </div>
        </div>
    );
}
