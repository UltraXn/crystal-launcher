import { useState } from 'react';
import { FaGavel, FaPlus, FaTrash, FaSave, FaFileExport } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '../../UI/ConfirmationModal';

interface Rule {
    id: number;
    title: string;
    description: string;
}

interface RulesEditorProps {
    settings: {
        server_rules?: string | Rule[];
    };
    onUpdate: (key: string, value: string) => void;
    saving: string | null;
}

// Initial mock rules if none exist
const DEFAULT_RULES: Rule[] = [
    { id: 1, title: 'PVP Consensuado', description: 'Estará permitido el PVP mientras sea acordado entre las partes. No abusen de jugadores que no quieran participar.' },
    { id: 2, title: 'Cero Tolerancia al Robo', description: 'Prohibido robar, destruir construcciones o matar mascotas. Todo queda registrado (CoreProtect) y se castiga con Permaban.' },
    { id: 3, title: 'Bases en Aldeas', description: 'Si ocupas una aldea, deja una señal visible (cartel, muralla) para indicar que es tu base y evitar saqueos accidentales.' },
    { id: 4, title: 'Granjas y Automatización', description: 'Prohibidas las granjas de Aldeanos y de Hierro. La automatización debe ser SEMI-automática (requiere activación manual).' },
    { id: 5, "title": "Límite de Mega-Construcciones", "description": "No se permiten construcciones masivas que abarquen demasiados chunks/carguen el servidor innecesariamente." },
    { id: 6, title: 'Estética del Bioma', description: 'Elimina construcciones temporales (pilares de tierra, puentes 1x1) que afeen el entorno.' },
    { id: 7, title: 'Calidad de Construcción', description: 'Se espera un esfuerzo estético mínimo. Evita dejar estructuras a medio terminar o sin propósito.' },
    { id: 8, title: 'Contenido y Streaming', description: 'Se permite el stream dando créditos al servidor. Invitados son bienvenidos bajo estas mismas reglas.' },
    { id: 9, title: 'Uso de /co inspect', description: 'Puedes usar este comando para investigar robos. Reporta los hallazgos a la administración, no actúes por tu cuenta.' },
    { id: 10, title: 'Mediación de Conflictos', description: 'No tomes la justicia por tu mano. Si alguien rompe las reglas, repórtalo en lugar de tomar represalias.' }
];

export default function RulesEditor({ settings, onUpdate, saving }: RulesEditorProps) {
    const { t } = useTranslation();
    const [rules, setRules] = useState<Rule[]>([]);
    const [prevRulesStr, setPrevRulesStr] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    // Pattern: Adjust state during render when props change
    const rulesStr = settings?.server_rules ? (typeof settings.server_rules === 'string' ? settings.server_rules : JSON.stringify(settings.server_rules)) : null;

    if (rulesStr !== prevRulesStr) {
        setPrevRulesStr(rulesStr);
        if (rulesStr) {
            try {
                const parsed = JSON.parse(rulesStr);
                setRules(Array.isArray(parsed) ? parsed : DEFAULT_RULES);
            } catch { setRules(DEFAULT_RULES); }
        } else {
            setRules(DEFAULT_RULES);
        }
    }

    const handleAdd = () => {
        const newRule = { id: Date.now(), title: '', description: '' };
        setRules([...rules, newRule]);
    };

    const handleDelete = (id: number) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = () => {
        setRules(rules.filter(r => r.id !== deleteConfirmId));
        setDeleteConfirmId(null);
    };

    const handleChange = (id: number, field: keyof Rule, value: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleSave = () => {
        onUpdate('server_rules', JSON.stringify(rules));
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "server_rules.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaGavel /> {t('admin.settings.rules.title')}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleExport} className="btn-secondary" title={t('admin.settings.rules.export_tooltip')}>
                        <FaFileExport />
                    </button>
                    <button onClick={handleSave} className="btn-primary" disabled={saving === 'server_rules'}>
                        <FaSave /> {saving === 'server_rules' ? t('admin.settings.saving') : t('admin.settings.rules.save_btn')}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {rules.map((rule, index) => (
                    <div key={rule.id} style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid #333',
                        borderRadius: '8px', 
                        padding: '1rem'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ 
                                background: 'rgba(255,255,255,0.1)', 
                                width: '30px', 
                                height: '30px', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 'bold'
                            }}>
                                {index + 1}
                            </div>
                            
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input 
                                    className="admin-input" 
                                    value={rule.title} 
                                    onChange={(e) => handleChange(rule.id, 'title', e.target.value)}
                                    placeholder={t('admin.settings.rules.title_ph')}
                                    style={{ fontWeight: 'bold' }}
                                />
                                <textarea 
                                    className="admin-input" 
                                    value={rule.description} 
                                    onChange={(e) => handleChange(rule.id, 'description', e.target.value)}
                                    placeholder={t('admin.settings.rules.desc_ph')}
                                    rows={2}
                                />
                            </div>

                            <button 
                                onClick={() => handleDelete(rule.id)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={handleAdd} 
                className="btn-secondary" 
                style={{ marginTop: '1rem', width: '100%', border: '1px dashed #444', background: 'transparent' }}
            >
                <FaPlus /> {t('admin.settings.rules.add_btn')}
            </button>

            <ConfirmationModal 
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={confirmDelete}
                title={t('admin.settings.rules.delete_title')}
                message={t('admin.settings.rules.delete_msg')}
                confirmText={t('admin.settings.rules.delete_confirm')}
                isDanger={true}
            />
        </div>
    );
}
