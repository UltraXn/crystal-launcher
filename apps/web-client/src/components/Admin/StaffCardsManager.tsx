import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaPlus, FaTrash, FaTwitter, FaDiscord, FaYoutube, FaTwitch, FaSave, FaTimes, FaCheckCircle, FaSync, FaGripVertical, FaEdit } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Loader from "../UI/Loader";

const API_URL = import.meta.env.VITE_API_URL;

interface StaffCard {
    id: number | string;
    name: string;
    role: string;
    description: string;
    image: string;
    color: string;
    socials: { twitter: string; discord: string; youtube: string; twitch: string; };
}

interface ServerStaffUser {
    uuid?: string;
    web_id?: string | number;
    username: string;
    role: string;
    avatar_url?: string;
    discord?: { username: string };
    twitch?: { username: string };
}

const PRESET_ROLES = [
    { value: 'Neroferno', label: 'Neroferno', color: '#8b5cf6', badge: '/ranks/rank-neroferno.png' },
    { value: 'Killuwu', label: 'Killuwu', color: '#0ea5e9', badge: '/ranks/rank-killu.png' },
    { value: 'Developer', label: 'Developer', color: '#ec4899', badge: '/ranks/developer.png' },
    { value: 'Admin', label: 'Admin', color: '#ef4444', badge: '/ranks/admin.png' },
    { value: 'Moderator', label: 'Moderador', color: '#21cb20', badge: '/ranks/moderator.png' },
    { value: 'Helper', label: 'Ayudante', color: '#6bfa16', badge: '/ranks/helper.png' },
    { value: 'Usuario', label: 'Usuario', color: '#db7700', badge: '/ranks/user.png' },
    { value: 'Custom', label: 'Personalizado', color: '#ffffff', badge: null }
];

const DEFAULT_STAFF = [
    {
        id: 1715001,
        name: 'Neroferno',
        role: 'Neroferno',
        description: 'Creador y Owner de CrystalTides.',
        image: 'Neroferno',
        color: '#8b5cf6',
        socials: { twitter: 'https://twitter.com/neroferno', discord: 'neroferno', youtube: '', twitch: 'neroferno' }
    },
    {
        id: 1715002,
        name: 'Killuwu',
        role: 'Killuwu',
        description: 'Administradora y Co-Owner.',
        image: 'Killuwu',
        color: '#0ea5e9', // Cyber Cyan
        socials: { twitter: '', discord: 'killuwu', youtube: '', twitch: '' }
    },
    {
        id: 1715003,
        name: 'Churlito',
        role: 'Developer',
        description: 'Desarrollador Full Stack.',
        image: 'Churlito',
        color: '#ec4899', // Hot Pink
        socials: { twitter: '', discord: 'churlito', youtube: '', twitch: '' }
    }
];

export default function StaffCardsManager() {
    const { t } = useTranslation();
    const [cards, setCards] = useState<StaffCard[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    
    // Sync Modal State
    const [showSyncModal, setShowSyncModal] = useState(false);

    const [foundStaff, setFoundStaff] = useState<StaffCard[]>([]);

    // Online Status State
    const [onlineStaff, setOnlineStaff] = useState<string[]>([]);

    // Form State
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [formData, setFormData] = useState<StaffCard>({
        id: 0,
        name: '',
        role: 'Usuario',
        description: '',
        image: '',
        color: '#9ca3af',
        socials: { twitter: '', discord: '', youtube: '', twitch: '' }
    });

    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => {
                if(!res.ok) throw new Error("Fetch failed");
                return res.json();
            })
            .then(data => {
                const rawCards = data.staff_cards || (data.data?.staff_cards); 
                
                if(rawCards && rawCards !== "[]") {
                    try {
                        const parsed = typeof rawCards === 'string' ? JSON.parse(rawCards) : rawCards;
                        setCards(Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STAFF);
                    } catch { 
                        setCards(DEFAULT_STAFF); 
                    }
                } else {
                    setCards(DEFAULT_STAFF);
                }
            })
            .catch(() => setCards(DEFAULT_STAFF))
            .finally(() => setLoading(false));

        // Initial Online Check
        fetchOnlineStatus();
        
        // Poll every 60s
        const interval = setInterval(fetchOnlineStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchOnlineStatus = () => {
        fetch(`${API_URL}/server/staff`)
            .then(res => {
                if(res.ok) return res.json();
                return [];
            })
            .then(data => {
                if(Array.isArray(data)) {
                    setOnlineStaff(data.map((u: ServerStaffUser) => u.username.toLowerCase()));
                }
            })
            .catch(err => console.error("Error fetching online staff:", err));
    };

    const handleSave = async (newCards: StaffCard[]) => {
        setSaving(true);
        try {
            await fetch(`${API_URL}/settings/staff_cards`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: JSON.stringify(newCards) })
            });
            setCards(newCards);
        } catch (error) {
            console.error(error);
            alert("Error saving staff cards");
        } finally {
            setSaving(false);
        }
    };

    const startSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch(`${API_URL}/server/all-staff`);
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Error ${res.status}: ${errText.substring(0, 100)}`); // Show first 100 chars
            }
            const json = await res.json();
            const staffUsers = json.data || [];
            
            if (staffUsers.length === 0) {
                alert("No se encontraron usuarios con rango de Staff en sincronización.");
                setSyncing(false);
                return;
            }

            // Transform for Preview
            const mappedStaff = staffUsers.map((u: ServerStaffUser) => {
                const existing = cards.find(c => c.name.toLowerCase() === u.username.toLowerCase());
                const roleConfig = PRESET_ROLES.find(r => r.value.toLowerCase() === u.role.toLowerCase());
                
                // Use backend role directly but prioritize preset case
                const finalRole = roleConfig ? roleConfig.value : u.role;
                
                return {
                    id: u.uuid || u.web_id || Date.now(),
                    name: u.username,
                    role: finalRole,
                    description: existing?.description || `Miembro del Staff`,
                    image: u.avatar_url || (existing?.image?.startsWith('http') ? existing.image : u.username),
                    color: roleConfig?.color || '#fff',
                    socials: {
                        twitter: existing?.socials?.twitter || '',
                        discord: u.discord?.username || existing?.socials?.discord || '',
                        twitch: u.twitch?.username || existing?.socials?.twitch || '',
                        youtube: existing?.socials?.youtube || ''
                    },
                    isNew: !existing
                };
            });

            setFoundStaff(mappedStaff);
            setShowSyncModal(true);
        } catch (error) {
            console.error("Sync error:", error);
            const msg = error instanceof Error ? error.message : "Desconocido";
            alert(`Error al sincronizar: ${msg}`);
        } finally {
            setSyncing(false);
        }
    };

    const confirmSync = async () => {
        await handleSave(foundStaff);
        setShowSyncModal(false);
    };

    const handleAdd = () => {
        setEditingId('new');
        setFormData({
            id: Date.now(),
            name: '',
            role: 'Usuario',
            description: '',
            image: '',
            color: '#db7700',
            socials: { twitter: '', discord: '', youtube: '', twitch: '' }
        });
    };

    const handleEdit = (card: StaffCard) => {
        setEditingId(card.id);
        setFormData({ ...card });
    };

    const handleDelete = (id: number | string) => {
        if(!confirm("¿Eliminar este perfil?")) return;
        const newCards = cards.filter(c => c.id !== id);
        handleSave(newCards);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let newCards;
        if (editingId === 'new') {
            newCards = [...cards, { ...formData, id: Date.now() }];
        } else {
            newCards = cards.map(c => c.id === editingId ? formData : c);
        }
        handleSave(newCards);
        setEditingId(null);
    };

    const onRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRole = PRESET_ROLES.find(r => r.value === e.target.value);
        if (selectedRole) {
            setFormData(prev => ({
                ...prev,
                role: selectedRole.value === 'Custom' ? '' : selectedRole.value,
                color: selectedRole.value === 'Custom' ? prev.color : selectedRole.color
            }));
        } else {
             setFormData(prev => ({ ...prev, role: e.target.value }));
        }
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        
        const items = Array.from(cards);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        setCards(items);
        handleSave(items);
    };

    // Helper to get badge

    // Helper to get badge
    const getRoleBadge = (roleName: string) => {
        const role = PRESET_ROLES.find(r => r.value === roleName);
        return role?.badge;
    };

    if (loading) {
        return (
             <div className="admin-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
                <Loader style={{ height: 'auto', minHeight: '150px' }} />
            </div>
        );
    }

    return (
        <div className="admin-card">
            {/* Sync Modal GUI - Redesigned */}
            {showSyncModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(5, 5, 10, 0.85)', backdropFilter: 'blur(12px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: '#09090b', width: '550px', maxWidth: '95%', maxHeight: '85vh',
                        borderRadius: '24px', border: '1px solid rgba(139, 92, 246, 0.2)',
                        display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        {/* Decorative Top Line */}
                        <div style={{ height: '4px', width: '100%', background: 'linear-gradient(90deg, var(--bg-soft), var(--accent))', boxShadow: '0 0 10px var(--accent-soft)' }}></div>

                        <div style={{ padding: '2rem 2rem 1rem', textAlign: 'center' }}>
                            <div style={{ 
                                width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-soft)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
                                color: 'var(--accent)', fontSize: '1.5rem', border: '1px solid rgba(137, 217, 209, 0.2)',
                                boxShadow: '0 0 15px var(--accent-soft)'
                            }}>
                                <FaUsers />
                            </div>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em' }}>{t('admin.staff.confirm_modal.title')}</h3>
                            <p style={{ margin: '0.5rem 0 0', color: '#a1a1aa', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                <span dangerouslySetInnerHTML={{ __html: t('admin.staff.confirm_modal.detected_msg', { count: foundStaff.length, interpolation: { escapeValue: false } }) }}></span> <br/>
                                <span style={{ color: '#f43f5e', fontSize: '0.85rem' }}>{t('admin.staff.confirm_modal.warning')}</span>
                            </p>
                        </div>

                        <div style={{ 
                            flex: 1, overflowY: 'auto', padding: '0 2rem 1rem', 
                            display: 'flex', flexDirection: 'column', gap: '0.8rem',
                            scrollBehavior: 'smooth'
                        }}>
                             <style>{`
                                ::-webkit-scrollbar { width: 6px; }
                                ::-webkit-scrollbar-track { background: transparent; }
                                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 3px; }
                                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                            `}</style>
                            {foundStaff.map((s, i) => (
                                <div key={i} style={{ 
                                    display: 'flex', alignItems: 'center', gap: '1rem', 
                                    padding: '1rem', 
                                    background: '#18181b', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}>
                                    <div style={{ position: 'relative' }}>
                                        <img 
                                            src={s.image?.startsWith('http') ? s.image : `https://mc-heads.net/avatar/${s.name}/56`}
                                            onError={(e) => e.currentTarget.src = `https://mc-heads.net/avatar/MHF_Steve/56`}
                                            style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover', background: '#000' }}
                                        />
                                        {/* Status Dot */}
                                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', border: '2px solid #18181b' }}></div>
                                    </div>
                                    
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: '#fff', fontSize: '1rem', marginBottom: '2px' }}>{s.name}</div>
                                        <div style={{ 
                                            display: 'inline-flex', alignItems: 'center', 
                                            fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em',
                                            color: s.color, background: `${s.color}15`, padding: '2px 8px', borderRadius: '6px', border: `1px solid ${s.color}20` 
                                        }}>
                                            {s.role}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', opacity: 0.7 }}>
                                        {s.socials.discord && <div title={s.socials.discord} style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#5865F220', color: '#5865F2', display:'flex', alignItems:'center', justifyContent:'center' }}><FaDiscord size={14} /></div>} 
                                        {s.socials.twitch && <div title={s.socials.twitch} style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#9146FF20', color: '#9146FF', display:'flex', alignItems:'center', justifyContent:'center' }}><FaTwitch size={14} /></div>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#09090b', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button 
                                onClick={() => setShowSyncModal(false)} 
                                className="btn-secondary"
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa' }}
                            >
                                {t('admin.staff.confirm_modal.cancel')}
                            </button>
                            <button 
                                onClick={confirmSync} 
                                className="btn-primary" 
                                style={{ 
                                    border: 'none', padding: '0.8rem 1.5rem', 
                                    background: 'var(--accent)', color: '#000',
                                    boxShadow: '0 4px 20px var(--accent-soft)' 
                                }}
                            >
                                <FaCheckCircle style={{ marginRight: '8px' }} /> {t('admin.staff.confirm_modal.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaUsers style={{ color: '#fbbf24' }} /> {t('admin.staff.manager_title')}
                </h3>
                {!editingId && (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button onClick={startSync} className="btn-secondary" disabled={syncing} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                             {syncing ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaSync className="spin-icon" /> {t('admin.staff.syncing')}
                                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin-icon { animation: spin 1s linear infinite; }`}</style>
                                </span>
                             ) : (
                                <><FaSync style={{ marginRight: '5px' }} /> {t('admin.staff.sync_btn')}</>
                             )}
                        </button>
                        <button onClick={handleAdd} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                            <FaPlus size={12} style={{ marginRight: '5px' }} /> {t('admin.staff.add_member')}
                        </button>
                    </div>
                )}
            </div>

            {editingId && (
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                         <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {editingId === 'new' ? t('admin.staff.form.new_title') : t('admin.staff.form.edit_title')}
                            {formData.name && <span style={{ fontSize: '0.8em', color: '#aaa', fontWeight: 'normal' }}>- {formData.name}</span>}
                         </h4>
                         <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}><FaTimes /></button>
                    </div>

                    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                        
                        {/* Left Column: Preview & Avatar */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', flex: '0 0 auto', width: '100%', maxWidth: '200px', margin: '0 auto' }}>
                            <div style={{ 
                                width: '120px', 
                                height: '120px', 
                                borderRadius: '50%', 
                                overflow: 'hidden', 
                                border: `4px solid ${formData.color}`,
                                boxShadow: `0 0 20px ${formData.color}40`,
                                background: '#1a1a1a'
                            }}>
                                <img 
                                    src={formData.image?.startsWith('http') ? formData.image : `https://mc-heads.net/avatar/${formData.image || formData.name || 'MHF_Steve'}/120`} 
                                    alt="Preview" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    onError={(e) => e.currentTarget.src = `https://mc-heads.net/avatar/MHF_Steve/120`}
                                />
                            </div>
                            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formData.name || t('admin.staff.form.preview_name')}</div>
                                {getRoleBadge(formData.role) ? (
                                    <img src={getRoleBadge(formData.role) || undefined} alt={formData.role} style={{ height: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ color: formData.color, fontSize: '0.9rem', fontWeight: 'bold' }}>{formData.role || t('admin.staff.form.preview_role')}</div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Inputs */}
                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', flex: '1 1 300px' }}>
                            <div style={{ gridColumn: '1/-1' }}>
                                <label className="form-label">{t('admin.staff.form.name_label')}</label>
                                <input 
                                    className="admin-input" 
                                    required 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    placeholder={t('admin.staff.form.name_ph')}
                                />
                            </div>

                            <div>
                                <label className="form-label">{t('admin.staff.form.role_label')}</label>
                                <select 
                                    className="admin-input" 
                                    value={PRESET_ROLES.some(r => r.value === formData.role) ? formData.role : 'Custom'} 
                                    onChange={onRoleChange}
                                >
                                    {PRESET_ROLES.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                                {!PRESET_ROLES.some(r => r.value === formData.role && r.value !== 'Custom') && (
                                    <input 
                                        className="admin-input" 
                                        style={{ marginTop: '0.5rem' }}
                                        value={formData.role} 
                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                        placeholder={t('admin.staff.form.custom_role_ph')}
                                    />
                                )}
                            </div>

                            <div>
                                <label className="form-label">{t('admin.staff.form.color_label')}</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input 
                                        type="color" 
                                        value={formData.color} 
                                        onChange={e => setFormData({...formData, color: e.target.value})} 
                                        style={{ width:'50px', height:'40px', background:'none', border:'none', padding: 0, cursor: 'pointer' }} 
                                    />
                                    <span style={{ color: '#aaa', fontFamily: 'monospace' }}>{formData.color}</span>
                                </div>
                            </div>

                            <div style={{ gridColumn: '1/-1' }}>
                                <label className="form-label">{t('admin.staff.form.avatar_label')}</label>
                                <input 
                                    className="admin-input" 
                                    value={formData.image} 
                                    onChange={e => setFormData({...formData, image: e.target.value})} 
                                    placeholder={t('admin.staff.form.avatar_ph')} 
                                />
                            </div>

                            <div style={{ gridColumn: '1/-1' }}>
                                <label className="form-label">{t('admin.staff.form.bio_label')}</label>
                                <textarea 
                                    className="admin-input" 
                                    rows={3} 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    placeholder={t('admin.staff.form.bio_ph')}
                                />
                            </div>
                            
                            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 40%' }}>
                                    <label className="form-label"><FaDiscord /> Discord (User)</label>
                                    <input className="admin-input" value={formData.socials?.discord || ''} onChange={e => setFormData({...formData, socials: {...formData.socials, discord: e.target.value}})} placeholder="Usuario#0000" />
                                </div>
                                <div style={{ flex: '1 1 40%' }}>
                                    <label className="form-label"><FaTwitch /> Twitch (User)</label>
                                    <input className="admin-input" value={formData.socials?.twitch || ''} onChange={e => setFormData({...formData, socials: {...formData.socials, twitch: e.target.value}})} placeholder="Nombre de usuario" />
                                </div>
                                <div style={{ flex: '1 1 40%' }}>
                                    <label className="form-label"><FaTwitter /> Twitter (Link)</label>
                                    <input className="admin-input" value={formData.socials?.twitter || ''} onChange={e => setFormData({...formData, socials: {...formData.socials, twitter: e.target.value}})} placeholder="https://twitter.com/..." />
                                </div>
                                <div style={{ flex: '1 1 40%' }}>
                                    <label className="form-label"><FaYoutube /> YouTube (Link)</label>
                                    <input className="admin-input" value={formData.socials?.youtube || ''} onChange={e => setFormData({...formData, socials: {...formData.socials, youtube: e.target.value}})} placeholder="https://youtube.com/..." />
                                </div>
                            </div>

                            <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setEditingId(null)}>{t('admin.staff.form.cancel')}</button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? <Loader style={{ width: '20px', height: '20px' }} /> : <><FaSave style={{ marginRight: '5px' }} /> {t('admin.staff.form.save_changes')}</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="staff-cards" direction="horizontal">
                    {(provided) => (
                        <div 
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}
                        >
                            {cards.map((card, index) => (
                                <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                                    {(provided) => (
                                        <div 
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            style={{ 
                                                background: `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)`, 
                                                borderRadius: '12px', 
                                                padding: '1.5rem',
                                                position: 'relative',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                borderLeft: '1px solid rgba(255,255,255,0.05)',
                                                borderRight: '1px solid rgba(255,255,255,0.05)',
                                                borderTop: `3px solid ${card.color}`,
                                                ...provided.draggableProps.style
                                            }}
                                        >
                                            <div 
                                                {...provided.dragHandleProps}
                                                style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.5, cursor: 'grab', padding: '5px', color: '#fff' }}
                                                title={t('admin.staff.drag_tooltip')}
                                            >
                                                <FaGripVertical />
                                            </div>

                                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                                <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 1rem' }}>
                                                    <div style={{ 
                                                        width: '90px', 
                                                        height: '90px', 
                                                        borderRadius: '50%', 
                                                        overflow: 'hidden', 
                                                        border: `3px solid ${card.color}`,
                                                        boxShadow: `0 0 15px ${card.color}30`,
                                                        pointerEvents: 'none' // Prevent dragging image ghost
                                                    }}>
                                                    <img 
                                                        src={card.image?.startsWith('http') ? card.image : `https://mc-heads.net/avatar/${card.image || card.name}/128`} 
                                                        alt={card.name} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                        onError={(e) => e.currentTarget.src = `https://mc-heads.net/avatar/MHF_Steve/128`}
                                                    />
                                                </div>
                                                {/* Online Status Indicator */}
                                                <div 
                                                    title={onlineStaff.includes(card.name.toLowerCase()) ? "Online" : "Offline"}
                                                    style={{ 
                                                        position: 'absolute', 
                                                        bottom: '2px', 
                                                        right: '2px', 
                                                        width: '18px', 
                                                        height: '18px', 
                                                        borderRadius: '50%', 
                                                        background: onlineStaff.includes(card.name.toLowerCase()) ? '#22c55e' : '#52525b', 
                                                        border: '3px solid #1a1a1a', 
                                                        zIndex: 2,
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                                    }} 
                                                />
                                            </div>
                                                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.3rem', color: '#fff' }}>{card.name}</h4>
                                                
                                                {getRoleBadge(card.role) ? (
                                                    <div style={{ height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <img src={getRoleBadge(card.role) || undefined} alt={card.role} style={{ maxHeight: '100%', maxWidth: '100%' }} />
                                                    </div>
                                                ) : (
                                                    <span style={{ 
                                                        color: card.color, 
                                                        fontSize: '0.8rem', 
                                                        fontWeight: 'bold', 
                                                        textTransform: 'uppercase',
                                                        background: `${card.color}15`,
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        border: `1px solid ${card.color}30`
                                                    }}>
                                                        {card.role}
                                                    </span>
                                                )}
                                            </div>

                                            <p style={{ fontSize: '0.95rem', color: '#ccc', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.5', minHeight: '3em' }}>
                                                {card.description || <i style={{ opacity: 0.5 }}>{t('admin.staff.no_desc')}</i>}
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                                                {card.socials?.discord && (
                                                    <div title={`Discord: ${card.socials.discord}`} style={{ position: 'relative', color: '#aaa', cursor: 'help', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#5865F2'} onMouseOut={e => e.currentTarget.style.color = '#aaa'}>
                                                        <FaDiscord size={20} />
                                                        {card.socials?.discord && <FaCheckCircle size={10} style={{ position: 'absolute', bottom: -2, right: -2, color: '#22c55e', background: '#000', borderRadius: '50%' }} title={t('admin.staff.linked_account')} />}
                                                    </div>
                                                )}
                                                {card.socials?.twitch && (
                                                    <a href={`https://twitch.tv/${card.socials.twitch}`} target="_blank" rel="noopener noreferrer" style={{ position: 'relative', color: '#aaa', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#9146FF'} onMouseOut={e => e.currentTarget.style.color = '#aaa'}>
                                                        <FaTwitch size={20} />
                                                        {card.socials?.twitch && <FaCheckCircle size={10} style={{ position: 'absolute', bottom: -2, right: -2, color: '#22c55e', background: '#000', borderRadius: '50%' }} title={t('admin.staff.linked_account')} />}
                                                    </a>
                                                )}
                                                {card.socials?.twitter && (
                                                    <a href={card.socials.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#1DA1F2'} onMouseOut={e => e.currentTarget.style.color = '#aaa'}>
                                                        <FaTwitter size={20} />
                                                    </a>
                                                )}
                                                {card.socials?.youtube && (
                                                    <a href={card.socials.youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FF0000'} onMouseOut={e => e.currentTarget.style.color = '#aaa'}>
                                                        <FaYoutube size={20} />
                                                    </a>
                                                )}
                                                {(!card.socials?.twitter && !card.socials?.discord && !card.socials?.youtube && !card.socials?.twitch) && (
                                                    <span style={{ opacity: 0.3, fontSize: '0.8rem' }}>{t('admin.staff.no_socials')}</span>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                                <button onClick={() => handleEdit(card)} className="btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                    <FaEdit /> {t('admin.staff.edit_btn')}
                                                </button>
                                                <button onClick={() => handleDelete(card.id)} className="btn-danger" style={{ padding: '0.7rem 1rem' }} title={t('admin.staff.delete_tooltip')}>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            
            {cards.length === 0 && !editingId && (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', opacity: 0.5 }}>
                    <FaUsers size={48} style={{ marginBottom: '1rem' }} />
                    <p>{t('admin.staff.empty')}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                        <button onClick={startSync} className="btn-secondary" disabled={syncing} style={{ minWidth: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                             {syncing ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaSync className="spin-icon" /> Sincronizando...
                                </span>
                             ) : (
                                t('admin.staff.sync_btn')
                             )}
                        </button>
                        <button onClick={handleAdd} className="btn-primary">{t('admin.staff.add_manual')}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
