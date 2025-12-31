import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    FaTrash, FaPlus, FaGripLines, FaEdit, FaExclamationCircle, 
    FaCheckCircle, FaExclamationTriangle, FaSpinner,
    FaCrown, FaTimes, FaGlobe
} from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Loader from '../UI/Loader';
import { supabase } from '../../services/supabaseClient';
import { getAuthHeaders } from '../../services/adminAuth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Donor {
    id: string; 
    name: string;
    skinUrl: string;
    description: string;
    description_en?: string;
    ranks: string[];
    isPremium?: boolean;
}

export default function DonorsManager() {
    const { t } = useTranslation();
    const [donors, setDonors] = useState<Donor[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Edit Modal State
    const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
    const [isNew, setIsNew] = useState(false);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'delete' | 'import' | null;
        payload?: string;
    }>({ isOpen: false, type: null });

    // Custom Alert State
    const [alert, setAlert] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null);

    // Available Ranks for Selector
    const AVAILABLE_RANKS = [
        { id: 'donador', label: 'Donador', img: '/ranks/rank-donador.png' },
        { id: 'fundador', label: 'Fundador', img: '/ranks/rank-fundador.png' },
        { id: 'killu', label: 'Killu', img: '/ranks/rank-killu.png' },
        { id: 'neroferno', label: 'Neroferno', img: '/ranks/rank-neroferno.png' },
        { id: 'developer', label: 'Developer', img: '/ranks/developer.png' },
        { id: 'admin', label: 'Admin', img: '/ranks/admin.png' },
        { id: 'mod', label: 'Moderator', img: '/ranks/moderator.png' },
        { id: 'helper', label: 'Helper', img: '/ranks/helper.png' },
        { id: 'staff', label: 'Staff', img: '/ranks/staff.png' },
    ];

    useEffect(() => {
        const fetchDonors = async () => {
             setLoading(true);
             try {
                const res = await fetch(`${API_URL}/settings`);
                const data = await res.json();
                if (data.donors_list) {
                    const parsed = typeof data.donors_list === 'string' ? JSON.parse(data.donors_list) : data.donors_list;
                    if (Array.isArray(parsed)) setDonors(parsed);
                }
             } catch (err) {
                 console.error(err);
             } finally {
                 setLoading(false);
             }
        };
        fetchDonors();
    }, []);

    const handleSaveList = async (newList: Donor[]) => {
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            await fetch(`${API_URL}/settings/donors_list`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ 
                    value: JSON.stringify(newList),
                })
            });
            setDonors(newList);
            if (!editingDonor) {
                 setAlert({ message: t('admin.donors.validation.success_save', 'Lista de donadores actualizada'), type: "success" });
            }
        } catch (error) {
            console.error("Error saving donors", error);
            setAlert({ message: t('admin.donors.validation.save_error'), type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleImportDefaults = () => {
        setConfirmModal({ isOpen: true, type: 'import' });
    };

    const confirmAction = () => {
        if (confirmModal.type === 'delete' && confirmModal.payload) {
             const newList = donors.filter(d => d.id !== confirmModal.payload);
             handleSaveList(newList);
        } else if (confirmModal.type === 'import') {
             const defaults: Donor[] = [
                {
                    id: '1',
                    name: "Killu Bysmali",
                    skinUrl: "/skins/killu.png?v=fixed",
                    description: t('donors.profiles.killu'),
                    ranks: ['killu']
                },
                {
                    id: '2',
                    name: "Neroferno Ultranix",
                    skinUrl: "https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c",
                    description: t('donors.profiles.neroferno'),
                    ranks: ['neroferno']
                },
                {
                    id: '3',
                    name: "Lawchihuahua",
                    skinUrl: "/skins/law.png",
                    description: t('donors.profiles.law'),
                    ranks: ['fundador']
                },
                {
                    id: '4',
                    name: "pixiesixer",
                    skinUrl: "https://minotar.net/skin/b47ee72ad3474abe9a081ab32f47153a",
                    description: t('donors.profiles.pixie'),
                    ranks: ['fundador']
                },
                {
                    id: '5',
                    name: "Zeta",
                    skinUrl: "/skins/zeta.png",
                    description: t('donors.profiles.zeta'),
                    ranks: ['fundador']
                },
                {
                    id: '6',
                    name: "SendPles",
                    skinUrl: "https://minotar.net/skin/5bec40ab-e459-474b-b96c-21ee1eae7d29",
                    description: t('donors.profiles.sendples'),
                    ranks: ['fundador']
                },
                {
                    id: '7',
                    name: "ZenXeone",
                    skinUrl: "https://minotar.net/skin/eacfb70c-c83a-4e0b-8465-ee4b0b86e041",
                    description: t('donors.profiles.zen'),
                    ranks: ['donador']
                },
                {
                    id: '8',
                    name: "Churly",
                    skinUrl: "/skins/churly.png",
                    description: t('donors.profiles.churly'),
                    ranks: ['donador', 'developer']
                },
                {
                    id: '9',
                    name: "Nana Fubuki",
                    skinUrl: "/skins/nana-fubuki.png",
                    description: t('donors.profiles.nana'),
                    ranks: ['donador']
                }
            ];
            handleSaveList(defaults);
        }
        setConfirmModal({ isOpen: false, type: null });
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        
        const items = Array.from(donors);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setDonors(items);
        handleSaveList(items);
    };

    const handleEditSave = () => {
        if (!editingDonor) return;
        
        if (!editingDonor.name) {
            setAlert({ message: t('admin.donors.validation.name_req'), type: "error" });
            return;
        }
        if (!editingDonor.isPremium && !editingDonor.skinUrl) {
            setAlert({ message: t('admin.donors.validation.skin_req'), type: "error" });
            return;
        }
        if (!editingDonor.description) {
            setAlert({ message: t('admin.donors.validation.desc_req'), type: "error" });
            return;
        }

        let newList = [...donors];
        const finalDonor = {
            ...editingDonor,
            skinUrl: editingDonor.isPremium 
                ? `https://minotar.net/skin/${editingDonor.name}` 
                : editingDonor.skinUrl
        };

        if (isNew) {
            finalDonor.id = Date.now().toString();
            newList.push(finalDonor);
        } else {
            newList = newList.map(d => d.id === editingDonor.id ? finalDonor : d);
        }
        
        handleSaveList(newList);
        setEditingDonor(null);
    };

    const [translating, setTranslating] = useState(false);
    const handleTranslate = async (text: string, toLang: 'es' | 'en', field: 'description' | 'description_en') => {
        if (!text) return;
        setTranslating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ text, targetLang: toLang })
            });
            const data = await res.json();
            if (data.success) {
                setEditingDonor(prev => prev ? ({ ...prev, [field]: data.translatedText }) : null);
            }
        } catch (e) {
            console.error("Translation fail", e);
            setAlert({ message: t('admin.donors.validation.translate_error'), type: "error" });
        } finally {
            setTranslating(false);
        }
    };

    const openNew = () => {
        setEditingDonor({
            id: '',
            name: '',
            skinUrl: '',
            description: '',
            description_en: '',
            ranks: ['donador'],
            isPremium: false
        });
        setIsNew(true);
    };

    if (loading) return <div style={{ padding: '8rem', display: 'flex', justifyContent: 'center' }}><Loader /></div>;

    return (
        <div className="donor-manager-container">
            <div className="news-header">
                <div>
                   <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'1rem', fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                        <div style={{ padding: '8px', background: 'rgba(var(--accent-rgb), 0.1)', borderRadius: '12px', display: 'flex', color: 'var(--accent)' }}>
                            <FaCrown />
                        </div>
                        {t('admin.donors.manager_title')}
                    </h3>
                    <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                        {t('admin.donors.manager_desc', 'Administra la lista de honor y personaliza el perfil de cada donador.')}
                    </p>
                </div>
                <button className="btn-primary poll-new-btn" onClick={openNew}>
                    <FaPlus /> {t('admin.donors.add_btn')}
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="donors-list">
                    {(provided) => (
                        <div 
                            className="donors-grid"
                            {...provided.droppableProps} 
                            ref={provided.innerRef}
                        >
                            {donors.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '6rem', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.05)' }}>
                                    <FaCrown size={48} style={{ opacity: 0.1, marginBottom: '1.5rem', color: 'var(--accent)' }} />
                                    <p style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>{t('admin.donors.empty_msg')}</p>
                                    <button onClick={handleImportDefaults} className="btn-secondary" style={{ padding: '0.8rem 2rem' }}>
                                        {t('admin.donors.import_btn')}
                                    </button>
                                </div>
                            )}
                            
                            {donors.map((donor, index) => (
                                <Draggable key={donor.id} draggableId={donor.id} index={index}>
                                    {(provided) => (
                                        <div
                                            className="donor-card-premium"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                        >
                                            <div className="donor-card-accent"></div>
                                            <div {...provided.dragHandleProps} className="donor-drag-handle">
                                                <FaGripLines />
                                            </div>
                                            
                                            <div className="donor-card-header">
                                                <div className="donor-avatar-wrapper">
                                                    <img 
                                                        className="donor-avatar"
                                                        src={donor.skinUrl || `https://mc-heads.net/avatar/${donor.name}/64`} 
                                                        alt={donor.name}
                                                        onError={(e) => e.currentTarget.src = `https://mc-heads.net/avatar/Steve/64`}
                                                    />
                                                </div>
                                                <div className="donor-info">
                                                    <h4 className="donor-name">{donor.name}</h4>
                                                    <div className="donor-ranks">
                                                        {donor.ranks.map(r => (
                                                            <span key={r} className="donor-rank-badge">{r}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="donor-description">
                                                "{donor.description}"
                                            </p>

                                            <div className="donor-card-actions">
                                                <button 
                                                    onClick={() => { setEditingDonor(donor); setIsNew(false); }} 
                                                    className="donor-btn-action edit"
                                                >
                                                    <FaEdit size={14} /> {t('admin.polls.edit_btn', 'Editar')}
                                                </button>
                                                <button 
                                                    onClick={() => setConfirmModal({ isOpen: true, type: 'delete', payload: donor.id })}
                                                    className="donor-btn-action delete"
                                                >
                                                    <FaTrash size={14} /> {t('admin.donors.delete_btn', 'Eliminar')}
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

            {/* MODAL: EDIT / CREATE */}
            {editingDonor && (
                <div className="sync-modal-overlay">
                    <div className="sync-modal-content" style={{ maxWidth: '850px' }}>
                        <div className="modal-accent-line"></div>
                        
                        <div className="poll-form-header">
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '1.5rem', fontWeight: '900' }}>
                                <FaCrown style={{ color: 'var(--accent)' }} />
                                {isNew ? t('admin.donors.new_title') : t('admin.donors.edit_title')}
                            </h3>
                            <button onClick={() => setEditingDonor(null)} className="btn-close-mini">
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="poll-form-body" style={{ overflowY: 'auto', maxHeight: '70vh', padding: '0.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                {/* Left Side: Basic Info */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="admin-label-premium">{t('admin.donors.form.nick')}</label>
                                        <input 
                                            className="admin-input-premium" 
                                            value={editingDonor.name} 
                                            onChange={e => setEditingDonor({...editingDonor, name: e.target.value})}
                                            placeholder={t('admin.donors.form.nick_ph')}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <input 
                                                type="checkbox" 
                                                id="isPremiumDonor"
                                                checked={editingDonor.isPremium || false}
                                                onChange={e => setEditingDonor({...editingDonor, isPremium: e.target.checked})}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
                                            <label htmlFor="isPremiumDonor" style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>
                                                {t('admin.donors.form.is_premium')}
                                            </label>
                                        </div>
                                    </div>

                                    {!editingDonor.isPremium && (
                                        <div className="form-group">
                                            <label className="admin-label-premium">{t('admin.donors.form.skin_url')}</label>
                                            <input 
                                                className="admin-input-premium" 
                                                value={editingDonor.skinUrl} 
                                                onChange={e => setEditingDonor({...editingDonor, skinUrl: e.target.value})}
                                                placeholder={t('admin.donors.form.skin_ph')}
                                            />
                                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>
                                                {t('admin.donors.form.skin_hint')}
                                            </p>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="admin-label-premium">{t('admin.donors.form.ranks')}</label>
                                        <div className="donor-ranks-selector">
                                            {AVAILABLE_RANKS.map(rank => {
                                                const isSelected = editingDonor.ranks.includes(rank.id);
                                                return (
                                                    <div 
                                                        key={rank.id}
                                                        onClick={() => {
                                                            const newRanks = isSelected 
                                                                ? editingDonor.ranks.filter(r => r !== rank.id)
                                                                : [...editingDonor.ranks, rank.id];
                                                            setEditingDonor({...editingDonor, ranks: newRanks});
                                                        }}
                                                        className={`rank-select-item ${isSelected ? 'active' : ''}`}
                                                    >
                                                        <img src={rank.img} alt={rank.label} />
                                                        <span>{rank.label}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Descriptions & Preview */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label className="admin-label-premium">{t('admin.donors.form.desc')}</label>
                                            <button 
                                                className="btn-secondary" 
                                                style={{ fontSize: '0.7rem', height: '28px', padding: '0 10px' }}
                                                onClick={() => handleTranslate(editingDonor.description, 'en', 'description_en')}
                                                disabled={translating || !editingDonor.description}
                                            >
                                                {translating ? <FaSpinner className="spin" /> : <FaGlobe />} {t('admin.donors.form.translate_en')}
                                            </button>
                                        </div>
                                        <textarea 
                                            className="admin-textarea-premium" 
                                            value={editingDonor.description} 
                                            onChange={e => setEditingDonor({...editingDonor, description: e.target.value})}
                                            placeholder={t('admin.donors.form.desc_ph')}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label className="admin-label-premium">{t('admin.donors.form.desc_en')}</label>
                                            <button 
                                                className="btn-secondary" 
                                                style={{ fontSize: '0.7rem', height: '28px', padding: '0 10px' }}
                                                onClick={() => handleTranslate(editingDonor.description_en || '', 'es', 'description')}
                                                disabled={translating || !editingDonor.description_en}
                                            >
                                                {translating ? <FaSpinner className="spin" /> : <FaGlobe />} {t('admin.donors.form.translate_es')}
                                            </button>
                                        </div>
                                        <textarea 
                                            className="admin-textarea-premium" 
                                            value={editingDonor.description_en || ''} 
                                            onChange={e => setEditingDonor({...editingDonor, description_en: e.target.value})}
                                            placeholder={t('admin.donors.form.desc_en_ph')}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="donor-preview-pane">
                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Preview</span>
                                        <div className="donor-card-premium" style={{ width: '100%', pointerEvents: 'none', background: 'rgba(255,255,255,0.02)' }}>
                                            <div className="donor-card-header">
                                                <div className="donor-avatar-wrapper">
                                                    <img 
                                                        className="donor-avatar"
                                                        src={editingDonor.isPremium ? `https://mc-heads.net/avatar/${editingDonor.name}/64` : editingDonor.skinUrl} 
                                                        alt="preview"
                                                        onError={(e) => e.currentTarget.src = `https://mc-heads.net/avatar/Steve/64`}
                                                    />
                                                </div>
                                                <div className="donor-info">
                                                    <h4 className="donor-name">{editingDonor.name || 'New Donor'}</h4>
                                                    <div className="donor-ranks">
                                                        {editingDonor.ranks.map(r => (
                                                            <span key={r} className="donor-rank-badge">{r}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="donor-description" style={{ fontSize: '0.8rem' }}>"{editingDonor.description || 'Description goes here...'}"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="poll-form-footer" style={{ marginTop: '2rem' }}>
                                <button className="btn-secondary" onClick={() => setEditingDonor(null)}>{t('admin.donors.form.cancel')}</button>
                                <button className="modal-btn-primary" onClick={handleEditSave} disabled={saving} style={{ height: '50px', padding: '0 2.5rem' }}>
                                    {saving ? <FaSpinner className="spin" /> : <><FaCheckCircle /> {t('admin.donors.form.save')}</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: ACTIONS (DELETE / IMPORT) */}
            {confirmModal.isOpen && (
                <div className="sync-modal-overlay">
                    <div className="sync-modal-content" style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem' }}>
                        <div className="modal-accent-line" style={{ background: confirmModal.type === 'delete' ? 'linear-gradient(90deg, transparent, #ef4444, transparent)' : '' }}></div>
                        <div style={{ 
                            width: '80px', height: '80px', 
                            background: confirmModal.type === 'delete' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(var(--accent-rgb), 0.1)', 
                            color: confirmModal.type === 'delete' ? '#ef4444' : 'var(--accent)', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', fontSize: '2rem' 
                        }}>
                            {confirmModal.type === 'delete' ? <FaTrash /> : <FaExclamationTriangle />}
                        </div>
                        <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.75rem', fontWeight: '900' }}>
                           {confirmModal.type === 'delete' ? t('admin.donors.delete_confirm.title') : t('admin.donors.import_confirm.title')}
                        </h3>
                        <p style={{ marginBottom: '2.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: '1.6', fontWeight: '500' }}>
                            {confirmModal.type === 'delete' ? t('admin.donors.delete_confirm.msg') : t('admin.donors.import_confirm.msg')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="modal-btn-secondary" style={{ flex: 1 }}>
                                {t('common.cancel', 'Cancelar')}
                            </button>
                            <button 
                                onClick={confirmAction} 
                                className="modal-btn-primary" 
                                style={{ 
                                    background: confirmModal.type === 'delete' ? '#ef4444' : '', 
                                    color: '#fff', flex: 1, 
                                    boxShadow: confirmModal.type === 'delete' ? '0 10px 30px rgba(239, 68, 68, 0.3)' : '' 
                                }}
                            >
                                {confirmModal.type === 'delete' ? t('admin.donors.delete_confirm.btn') : t('admin.donors.import_confirm.btn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ALERT TOAST */}
            {alert && (
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000000, animation: 'slideUp 0.3s ease-out' }}>
                   <div style={{ 
                       background: 'rgba(0,0,0,0.8)', 
                       backdropFilter: 'blur(20px)', 
                       border: `1px solid ${alert.type === 'error' ? '#ef4444' : (alert.type === 'success' ? '#10b981' : '#facc15')}`,
                       padding: '1rem 1.5rem',
                       borderRadius: '16px',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '12px',
                       boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                   }}>
                       {alert.type === 'error' ? <FaExclamationCircle color="#ef4444" /> : <FaCheckCircle color="#10b981" />}
                       <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{alert.message}</span>
                       <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px' }}>
                           <FaTimes />
                       </button>
                   </div>
                </div>
            )}
        </div>
    );
}
