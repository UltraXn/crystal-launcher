import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSave, FaEdit, FaTimes, FaFileExport, FaFileImport, FaLanguage, FaSpinner } from 'react-icons/fa';
import ConfirmationModal from '../../UI/ConfirmationModal';
import { getRules, createRule, updateRule, deleteRule, Rule } from '../../../services/ruleService';
import { supabase } from '../../../services/supabaseClient';

const CATEGORY_OPTIONS = [
    'General',
    'Comportamiento',
    'Chat',
    'PvP',
    'Construcción',
    'Clientes',
    'Staff',
    'Cuenta'
];

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function RulesEditor() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [editingRule, setEditingRule] = useState<Rule | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // Translation state
    const [translating, setTranslating] = useState<'title' | 'content' | 'title_en' | 'content_en' | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Rule>>({
        category: 'General',
        title: '',
        title_en: '',
        content: '',
        content_en: '',
        color: '#6366f1',
        sort_order: 0
    });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const data = await getRules();
            setRules(data);
        } catch (error) {
            console.error('Error fetching rules:', error);
            alert('Error al cargar las reglas');
        } finally {
            setLoading(false);
        }
    };

    const handleTranslate = async (text: string, toLang: 'es' | 'en', field: 'title' | 'content' | 'title_en' | 'content_en') => {
        if (!text) return;
        setTranslating(field);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) {
                alert('No hay sesión activa para traducir');
                return;
            }

            const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text, targetLang: toLang })
            });

            if (!res.ok) throw new Error('Translation request failed');

            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, [field]: data.translatedText }));
            } else {
                alert('Error en la traducción: ' + (data.message || 'Desconocido'));
            }
        } catch (error) {
            console.error("Translation fail", error);
            alert('Error al conectar con el servicio de traducción');
        } finally {
            setTranslating(null);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            alert('Por favor completa título y contenido');
            return;
        }

        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) {
                alert('No hay sesión activa');
                return;
            }

            if (editingRule) {
                // Update existing rule
                await updateRule(editingRule.id, formData, token);
            } else {
                // Create new rule
                await createRule(formData as Omit<Rule, 'id'>, token);
            }

            // Reset form and refresh
            setFormData({ category: 'General', title: '', title_en: '', content: '', content_en: '', color: '#6366f1', sort_order: 0 });
            setEditingRule(null);
            setIsCreating(false);
            await fetchRules();
        } catch (error) {
            console.error('Error saving rule:', error);
            alert('Error al guardar la regla');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (rule: Rule) => {
        setFormData({
            ...rule,
            title_en: rule.title_en || '',
            content_en: rule.content_en || ''
        });
        setEditingRule(rule);
        setIsCreating(true);
    };

    const handleDelete = async (id: number) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) {
                alert('No hay sesión activa');
                return;
            }

            await deleteRule(deleteConfirmId, token);
            setDeleteConfirmId(null);
            await fetchRules();
        } catch (error) {
            console.error('Error deleting rule:', error);
            alert('Error al borrar la regla');
        }
    };

    const handleCancel = () => {
        setFormData({ category: 'General', title: '', title_en: '', content: '', content_en: '', color: '#6366f1', sort_order: 0 });
        setEditingRule(null);
        setIsCreating(false);
    };

    const startCreate = () => {
        setFormData({ category: 'General', title: '', title_en: '', content: '', content_en: '', color: '#6366f1', sort_order: 0 });
        setEditingRule(null);
        setIsCreating(true);
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `server_rules_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                if (!Array.isArray(json)) {
                    alert('Formato de archivo inválido. Debe ser un array de reglas.');
                    return;
                }

                // Validate basic structure
                const valid = json.every(r => r.title && r.content && r.category);
                if (!valid) {
                    alert('El archivo contiene reglas con datos faltantes.');
                    return;
                }

                // Confirm import
                if (!confirm(`¿Importar ${json.length} reglas? Esto NO eliminará las reglas existentes.`)) {
                    return;
                }

                // Import all rules
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                
                if (!token) {
                    alert('No hay sesión activa');
                    return;
                }

                for (const rule of json) {
                    // Remove id if exists to create new entries
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id: _id, ...ruleData } = rule;
                    await createRule(ruleData as Omit<Rule, 'id'>, token);
                }

                await fetchRules();
                alert('Reglas importadas exitosamente');
            } catch (error) {
                console.error('Error importing:', error);
                alert('Error al importar las reglas. Verifica el formato del archivo.');
            }
        };
        reader.readAsText(file);
        
        // Reset input
        if (e.target) e.target.value = '';
    };

    // Group rules by category
    const groupedRules = rules.reduce((acc, rule) => {
        const cat = rule.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(rule);
        return acc;
    }, {} as Record<string, Rule[]>);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                Cargando reglas del servidor...
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                        Editor de Reglas del Servidor
                    </h3>
                    <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                        Gestiona las normativas que se muestran en /reglas
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleExport}
                        className="modal-btn-secondary"
                        style={{ height: '48px', padding: '0 1.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        title="Exportar reglas como JSON"
                    >
                        <FaFileExport /> Exportar
                    </button>
                    <label
                        className="modal-btn-secondary"
                        style={{ height: '48px', padding: '0 1.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                        title="Importar reglas desde JSON"
                    >
                        <FaFileImport /> Importar
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                        />
                    </label>
                    {!isCreating && (
                        <button
                            onClick={startCreate}
                            className="modal-btn-primary"
                            style={{ height: '48px', padding: '0 1.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <FaPlus /> Nueva Regla
                        </button>
                    )}
                </div>
            </div>

            {/* Create/Edit Form Modal */}
            {isCreating && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 1000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '1rem'
                }} onClick={(e) => {
                    // Close if clicking outside the modal content
                    if (e.target === e.currentTarget) handleCancel();
                }}>
                    <div className="admin-card" style={{ 
                        background: 'rgba(20, 20, 25, 0.95)', 
                        backdropFilter: 'blur(20px)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: '24px', 
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {editingRule ? <><FaEdit /> Editar Regla</> : <><FaPlus /> Nueva Regla</>}
                            </h4>
                            <button onClick={handleCancel} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.5rem' }}>
                                <FaTimes />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label className="admin-label-premium">Categoría</label>
                                <select
                                    className="admin-select-premium"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {CATEGORY_OPTIONS.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="admin-label-premium">Orden (Prioridad)</label>
                                <input
                                    type="number"
                                    className="admin-input-premium"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div>
                                <label className="admin-label-premium">Color Representativo</label>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={formData.color || '#6366f1'}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        style={{ 
                                            width: '48px', 
                                            height: '48px', 
                                            padding: '0', 
                                            border: 'none', 
                                            borderRadius: '10px', 
                                            background: 'none', 
                                            cursor: 'pointer' 
                                        }}
                                    />
                                    <input
                                        type="text"
                                        className="admin-input-premium"
                                        value={formData.color || '#6366f1'}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        placeholder="#HEX"
                                        style={{ flex: 1, fontFamily: 'monospace' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Spanish Title & Translation to EN */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="admin-label-premium" style={{ marginBottom: 0 }}>Título (Español)</label>
                                <button 
                                    type="button" 
                                    className="modal-btn-secondary"
                                    style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    onClick={() => handleTranslate(formData.title || '', 'en', 'title_en')}
                                    disabled={!!translating || !formData.title}
                                >
                                    {translating === 'title_en' ? <FaSpinner className="spin" /> : <FaLanguage />} Traducir a EN
                                </button>
                            </div>
                            <input
                                type="text"
                                className="admin-input-premium"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ej: PVP Consensuado"
                            />
                        </div>

                        {/* English Title & Translation to ES */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="admin-label-premium" style={{ marginBottom: 0 }}>Título (Inglés) <span style={{ opacity: 0.5, fontSize: '0.8em' }}>(Opcional)</span></label>
                                <button 
                                    type="button" 
                                    className="modal-btn-secondary"
                                    style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    onClick={() => handleTranslate(formData.title_en || '', 'es', 'title')}
                                    disabled={!!translating || !formData.title_en}
                                >
                                    {translating === 'title' ? <FaSpinner className="spin" /> : <FaLanguage />} Traducir a ES
                                </button>
                            </div>
                            <input
                                type="text"
                                className="admin-input-premium"
                                value={formData.title_en || ''}
                                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                                placeholder="Ex: Consensual PVP"
                            />
                        </div>

                        {/* Spanish Content & Translation to EN */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="admin-label-premium" style={{ marginBottom: 0 }}>Contenido (Español)</label>
                                <button 
                                    type="button" 
                                    className="modal-btn-secondary"
                                    style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    onClick={() => handleTranslate(formData.content || '', 'en', 'content_en')}
                                    disabled={!!translating || !formData.content}
                                >
                                    {translating === 'content_en' ? <FaSpinner className="spin" /> : <FaLanguage />} Traducir a EN
                                </button>
                            </div>
                            <textarea
                                className="admin-textarea-premium"
                                rows={5}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Descripción detallada de la regla..."
                            />
                        </div>

                        {/* English Content & Translation to ES */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="admin-label-premium" style={{ marginBottom: 0 }}>Contenido (Inglés) <span style={{ opacity: 0.5, fontSize: '0.8em' }}>(Opcional)</span></label>
                                <button 
                                    type="button" 
                                    className="modal-btn-secondary"
                                    style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    onClick={() => handleTranslate(formData.content_en || '', 'es', 'content')}
                                    disabled={!!translating || !formData.content_en}
                                >
                                    {translating === 'content' ? <FaSpinner className="spin" /> : <FaLanguage />} Traducir a ES
                                </button>
                            </div>
                            <textarea
                                className="admin-textarea-premium"
                                rows={5}
                                value={formData.content_en || ''}
                                onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                                placeholder="Detailed description of the rule..."
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={handleCancel}
                                className="modal-btn-secondary"
                                style={{ height: '48px', padding: '0 1.5rem' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="modal-btn-primary"
                                style={{ height: '48px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                disabled={saving}
                            >
                                <FaSave /> {saving ? 'Guardando...' : 'Guardar Regla'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rules List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {Object.entries(groupedRules).length === 0 ? (
                    <div className="admin-card" style={{ background: 'rgba(15, 15, 20, 0.4)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1rem' }}>
                            No hay reglas definidas. Crea la primera regla.
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedRules).map(([category, categoryRules]) => (
                        <div key={category}>
                            <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {category}
                            </h4>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {categoryRules.sort((a, b) => a.sort_order - b.sort_order).map(rule => (
                                    <div
                                        key={rule.id}
                                        className="admin-card"
                                        style={{
                                            background: 'rgba(15, 15, 20, 0.4)',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: '1rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <span style={{
                                                    background: `${rule.color || 'var(--accent)'}20`,
                                                    color: rule.color || 'var(--accent)',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    border: `1px solid ${rule.color || 'var(--accent)'}40`
                                                }}>
                                                    #{rule.sort_order}
                                                </span>
                                                <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                                                    {rule.title}
                                                </h5>
                                                {rule.title_en && (
                                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginLeft: '0.5rem' }}>
                                                        ({rule.title_en})
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
                                                {rule.content}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                            <button
                                                onClick={() => handleEdit(rule)}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    padding: '0.5rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                title="Editar"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rule.id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    color: '#ef4444',
                                                    padding: '0.5rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                title="Eliminar"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Confirmation Modal */}
            {deleteConfirmId && (
                <ConfirmationModal
                    isOpen={true}
                    title="Confirmar Eliminación"
                    message="¿Estás seguro de que quieres eliminar esta regla? Esta acción no se puede deshacer."
                    onConfirm={confirmDelete}
                    onClose={() => setDeleteConfirmId(null)}
                    isDanger={true}
                />
            )}
        </div>
    );
}
