import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTrash, FaPlus, FaGripLines, FaPen, FaExclamationCircle, FaCheckCircle, FaExclamationTriangle, FaLanguage, FaSpinner } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Loader from '../UI/Loader';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../UI/ConfirmationModal';

const API_URL = '/api'; // import.meta.env.VITE_API_URL;

interface Donor {
    id: string; // Unique ID for Drag and Drop
    name: string;
    skinUrl: string;
    description: string;
    description_en?: string;
    ranks: string[]; // ['donador', 'developer']
    isPremium?: boolean;
}

export default function DonorsManager() {
    const { t } = useTranslation();
    const { user } = useAuth();
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

    // Fetch initial settings
    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.donors_list) {
                    try {
                        const parsed = typeof data.donors_list === 'string' ? JSON.parse(data.donors_list) : data.donors_list;
                        if (Array.isArray(parsed)) setDonors(parsed);
                    } catch (e) {
                        console.error("Failed to parse donors list", e);
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSaveList = async (newList: Donor[]) => {
        setSaving(true);
        try {
            await fetch(`${API_URL}/settings/donors_list`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    value: JSON.stringify(newList),
                    userId: user?.id,
                    username: user?.email 
                })
            });
            setDonors(newList);
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
        // Auto-save on drag end? Or explicit save? Let's auto-save for better UX
        handleSaveList(items);
    };

    const handleEditSave = () => {
        if (!editingDonor) return;
        
        // Validation
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
        if (isNew) {
            const finalDonor = {
                 ...editingDonor, 
                 id: Date.now().toString(),
                 skinUrl: editingDonor.isPremium 
                    ? `https://minotar.net/skin/${editingDonor.name}` 
                    : editingDonor.skinUrl
            };
            newList.push(finalDonor);
        } else {
            // Apply premium skin logic if needed
            const finalDonor = {
                ...editingDonor,
                skinUrl: editingDonor.isPremium 
                    ? `https://minotar.net/skin/${editingDonor.name}` 
                    : editingDonor.skinUrl
            };
            newList = newList.map(d => d.id === editingDonor.id ? finalDonor : d);
        }
        
        handleSaveList(newList);
        setEditingDonor(null);
    };

    const handleDelete = (id: string) => {
        setConfirmModal({ isOpen: true, type: 'delete', payload: id });
    };

    const [translating, setTranslating] = useState(false);
    const handleTranslate = async (text: string, toLang: 'es' | 'en', field: 'description' | 'description_en') => {
        if (!text) return;
        setTranslating(true);
        try {
            const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    const openEdit = (donor: Donor) => {
        setEditingDonor({ ...donor });
        setIsNew(false);
    };

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3>🏆 {t('admin.donors.manager_title')}</h3>
                <button className="btn-primary" onClick={openNew}>
                    <FaPlus /> {t('admin.donors.add_btn')}
                </button>
            </div>

            {loading ? (
                <div style={{textAlign: 'center', padding: '2rem'}}><Loader /></div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="donors-list">
                        {(provided) => (
                            <div 
                                {...provided.droppableProps} 
                                ref={provided.innerRef}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
                            >
                                {donors.length === 0 && (
                                     <div style={{ textAlign: 'center', color: '#666', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                         <p>{t('admin.donors.empty_msg')}</p>
                                         <button onClick={handleImportDefaults} className="btn-secondary" style={{ fontSize: '0.9rem' }}>
                                             📥 {t('admin.donors.import_btn')}
                                         </button>
                                     </div>
                                )}
                                
                                {donors.map((donor, index) => (
                                    <Draggable key={donor.id} draggableId={donor.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    borderRadius: '8px',
                                                    padding: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    flexWrap: 'wrap'
                                                }}
                                            >
                                                <div {...provided.dragHandleProps} style={{ color: '#666', cursor: 'grab' }}>
                                                    <FaGripLines />
                                                </div>
                                                
                                                {/* Avatar Preview */}
                                                <img 
                                                    src={donor.skinUrl || `https://mc-heads.net/avatar/${donor.name}/64`} 
                                                    alt={donor.name}
                                                    style={{ width: '40px', height: '40px', borderRadius: '4px' }}
                                                    onError={(e) => e.currentTarget.src = `https://mc-heads.net/avatar/Steve/64`}
                                                />

                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 'bold' }}>{donor.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888', display: 'flex', gap: '5px' }}>
                                                        {donor.ranks.map(r => (
                                                            <span key={r} style={{ background: '#333', padding: '1px 5px', borderRadius: '3px' }}>{r}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div style={{ fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic', width: '100%', minWidth: '200px', flex: '1 1 100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', order: 3, marginTop: '0.5rem' }}>
                                                    "{donor.description}"
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                                    <button 
                                                        onClick={() => openEdit(donor)} 
                                                        style={{ 
                                                            border: 'none', 
                                                            background: 'rgba(59, 130, 246, 0.1)', 
                                                            color: '#3b82f6',
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        title={t('admin.staff.edit_btn')}
                                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                                    >
                                                        <FaPen size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(donor.id)}
                                                        style={{ 
                                                            border: 'none', 
                                                            background: 'rgba(239, 68, 68, 0.1)', 
                                                            color: '#ef4444',
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        title={t('admin.staff.delete_tooltip')}
                                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                    >
                                                        <FaTrash size={14} />
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
            )}

            {/* Edit/Create Modal */}
            {editingDonor && (
                <div className="modal-overlay">
                    <div className="admin-card" style={{ width: '500px', maxWidth: '95%', border: '1px solid #444', animation: 'fadeIn 0.2s' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{isNew ? t('admin.donors.new_title') : t('admin.donors.edit_title')}</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="admin-label">{t('admin.donors.form.nick')}</label>
                                <input 
                                    className="admin-input" 
                                    value={editingDonor.name} 
                                    onChange={e => setEditingDonor({...editingDonor, name: e.target.value})}
                                    placeholder={t('admin.donors.form.nick_ph')}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px' }}>
                                <input 
                                    type="checkbox" 
                                    id="isPremium"
                                    checked={editingDonor.isPremium || false}
                                    onChange={e => setEditingDonor({...editingDonor, isPremium: e.target.checked})}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="isPremium" style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#fff', userSelect: 'none' }}>
                                    {t('admin.donors.form.is_premium')}
                                </label>
                            </div>

                            {!editingDonor.isPremium && (
                                <div>
                                    <label className="admin-label">{t('admin.donors.form.skin_url')}</label>
                                    <input 
                                        className="admin-input" 
                                        value={editingDonor.skinUrl} 
                                        onChange={e => setEditingDonor({...editingDonor, skinUrl: e.target.value})}
                                        placeholder={t('admin.donors.form.skin_ph')}
                                    />
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
                                        {t('admin.donors.form.skin_hint')}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="admin-label">{t('admin.donors.form.desc')}</label>
                                <textarea 
                                    className="admin-input" 
                                    value={editingDonor.description} 
                                    onChange={e => setEditingDonor({...editingDonor, description: e.target.value})}
                                    placeholder={t('admin.donors.form.desc_ph')}
                                    rows={2}
                                />
                                <button 
                                    className="btn-secondary" 
                                    style={{ marginTop: '5px', fontSize: '0.8rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    onClick={() => handleTranslate(editingDonor.description, 'en', 'description_en')}
                                    disabled={translating || !editingDonor.description}
                                >
                                    {translating ? <FaSpinner className="spin" /> : <FaLanguage />} {t('admin.donors.form.translate_en')}
                                </button>
                            </div>

                            <div>
                                <label className="admin-label">{t('admin.donors.form.desc_en')}</label>
                                <textarea 
                                    className="admin-input" 
                                    value={editingDonor.description_en || ''} 
                                    onChange={e => setEditingDonor({...editingDonor, description_en: e.target.value})}
                                    placeholder={t('admin.donors.form.desc_en_ph')}
                                    rows={2}
                                />
                                <button 
                                    className="btn-secondary" 
                                    style={{ marginTop: '5px', fontSize: '0.8rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    onClick={() => handleTranslate(editingDonor.description_en || '', 'es', 'description')}
                                    disabled={translating || !editingDonor.description_en}
                                >
                                    {translating ? <FaSpinner className="spin" /> : <FaLanguage />} {t('admin.donors.form.translate_es')}
                                </button>
                            </div>

                            <div>
                                <label className="admin-label">{t('admin.donors.form.ranks')}</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: '#222', padding: '0.5rem', borderRadius: '4px' }}>
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
                                                style={{
                                                    cursor: 'pointer',
                                                    border: `1px solid ${isSelected ? 'var(--accent)' : '#444'}`,
                                                    background: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    opacity: isSelected ? 1 : 0.6
                                                }}
                                            >
                                                <img src={rank.img} alt={rank.label} style={{ height: '16px' }} />
                                                <span style={{ fontSize: '0.8rem' }}>{rank.label}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button className="btn-secondary" onClick={() => setEditingDonor(null)}>{t('admin.donors.form.cancel')}</button>
                            <button className="btn-primary" onClick={handleEditSave} disabled={saving}>
                                {saving ? <FaSpinner className="spin" /> : t('admin.donors.form.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmAction}
                title={confirmModal.type === 'delete' ? t('admin.donors.delete_confirm.title') : t('admin.donors.import_confirm.title')}
                message={confirmModal.type === 'delete' 
                    ? t('admin.donors.delete_confirm.msg') 
                    : t('admin.donors.import_confirm.msg')
                }
                confirmText={confirmModal.type === 'delete' ? t('admin.donors.delete_confirm.btn') : t('admin.donors.import_confirm.btn')}
                isDanger={confirmModal.type === 'delete'}
            />

            {alert && (
                <CustomAlert 
                    message={alert.message} 
                    type={alert.type} 
                    onClose={() => setAlert(null)} 
                />
            )}
        </div>
    );
}

function CustomAlert({ message, type = 'error', onClose }: { message: string, type?: 'error' | 'success' | 'warning', onClose: () => void }) {
    const { t } = useTranslation();
    const colors: Record<string, string> = { error: '#ef4444', success: '#10b981', warning: '#facc15' };
    const Icon = type === 'error' ? FaExclamationCircle : (type === 'success' ? FaCheckCircle : FaExclamationTriangle);
    
    const titles: Record<string, string> = {
        error: t('admin.alerts.error_title'),
        success: t('admin.alerts.success_title'),
        warning: t('admin.alerts.warning_title')
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 100000 }}>
            <div className="admin-card modal-content" style={{ width: '400px', maxWidth: '90%', textAlign: 'center', padding: '2rem', border: `1px solid ${colors[type]}`, boxShadow: `0 0 30px ${colors[type]}20` }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <Icon size={48} color={colors[type]} />
                </div>
                <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.5rem' }}>
                    {titles[type]}
                </h3>
                <p style={{ color: '#ccc', marginBottom: '2rem', lineHeight: '1.6' }}>{message}</p>
                <button 
                    onClick={onClose} 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', background: colors[type], color: '#000', fontWeight: 'bold' }}
                >
                    {t('admin.alerts.accept')}
                </button>
            </div>
        </div>
    )
}
