import React, { useEffect, useRef, useState } from "react"
import Section from "../components/Layout/Section"
import { FaHandshake, FaUserShield, FaCity, FaHammer, FaLeaf, FaPaintBrush, FaVideo, FaShieldAlt, FaPlus, FaEdit, FaTrash, FaSave } from "react-icons/fa"
import anime from "animejs/lib/anime.js"
import { useTranslation } from 'react-i18next'
import { useAuth } from "../context/AuthContext"
import { getRules, createRule, updateRule, deleteRule, Rule } from "../services/ruleService"
import { supabase } from "../services/supabaseClient"

// Icon mapping based on Category
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'General': <FaHandshake />,
    'Comportamiento': <FaUserShield />,
    'Chat': <FaCity />,
    'PvP': <FaHammer />,
    'Construcción': <FaLeaf />,
    'Clientes': <FaPaintBrush />,
    'Staff': <FaVideo />,
    'Cuenta': <FaShieldAlt />
}

const DEFAULT_ICON = <FaShieldAlt />;

export default function Rules() {
    const listRef = useRef<HTMLDivElement | null>(null)
    const { t } = useTranslation()
    const { user } = useAuth()
    const [rules, setRules] = useState<Rule[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Admin State
    const [isEditing, setIsEditing] = useState(false)
    const [editRuleId, setEditRuleId] = useState<number | null>(null)
    // Form State
    const [formData, setFormData] = useState<Partial<Rule>>({ category: 'General', title: '', content: '', sort_order: 0 })

    const isStaff = user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'owner' || user?.user_metadata?.role === 'developer';

    const fetchRules = async () => {
        setLoading(true)
        try {
            const data = await getRules();
            setRules(data);
            setError(null);
        } catch (err) {
            console.error("Failed to load rules:", err);
            // Fallback to empty or error message, don't use hardcoded defaults to encourage fixing DB
            setError("No se pudieron cargar las reglas. Intente más tarde.");
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRules();
    }, []);

    useEffect(() => {
        if (rules.length === 0) return;
        
        anime({
            targets: '.rule-card',
            opacity: [0, 1],
            translateX: [-20, 0],
            translateY: [20, 0],
            delay: anime.stagger(100, { start: 200 }),
            easing: 'easeOutExpo',
            duration: 800
        });
    }, [rules]);

    // Admin Actions
    const handleSave = async () => {
        if (!user) return;
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error("No token");

            if (editRuleId) {
                // Update
                await updateRule(editRuleId, formData, token);
            } else {
                // Create
                await createRule(formData as Omit<Rule, 'id'>, token);
            }
            
            // Reset and Refresh
            setFormData({ category: 'General', title: '', content: '', sort_order: 0 });
            setEditRuleId(null);
            setIsEditing(false);
            fetchRules();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            alert("Error al guardar: " + msg);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Seguro que quieres borrar esta regla?")) return;
        if (!user) return;
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error("No token");
            
            await deleteRule(id, token);
            fetchRules();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            alert("Error al borrar: " + msg);
        }
    };

    const startEdit = (rule: Rule) => {
        setFormData(rule);
        setEditRuleId(rule.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Grouping logic
    const groupedRules = rules.reduce((acc, rule) => {
        const cat = rule.category || 'Varios';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(rule);
        return acc;
    }, {} as Record<string, Rule[]>);

    return (
        <Section title={t('rules.title')}>
            
            {/* Header / Intro */}
            <div className="flex flex-col items-center mb-12">
                <p className="text-center max-w-2xl text-white/60 mb-6">
                    {t('rules.intro')}
                </p>
                {isStaff && !isEditing && (
                    <button 
                        onClick={() => { setIsEditing(true); setEditRuleId(null); setFormData({ category: 'General', title: '', content: '', sort_order: 0 }); }}
                        className="px-6 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg hover:bg-emerald-500/30 transition-all flex items-center gap-2"
                    >
                        <FaPlus /> Nueva Regla
                    </button>
                )}
            </div>

            {/* Editor Form */}
            {isEditing && (
                <div className="bg-slate-900/80 border border-white/10 rounded-xl p-6 mb-12 max-w-3xl mx-auto backdrop-blur-md shadow-2xl animate-fade-in-down">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        {editRuleId ? <FaEdit className="text-amber-400"/> : <FaPlus className="text-emerald-400"/>}
                        {editRuleId ? 'Editar Regla' : 'Crear Nueva Regla'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">Categoría</label>
                            <input 
                                type="text" 
                                list="categories"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-indigo-500 outline-none"
                            />
                            <datalist id="categories">
                                {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">Orden (Prioridad)</label>
                            <input 
                                type="number" 
                                value={formData.sort_order}
                                onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">Título</label>
                            <input 
                                type="text" 
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">Contenido (Markdown soportado)</label>
                            <textarea 
                                rows={4}
                                value={formData.content}
                                onChange={e => setFormData({...formData, content: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-indigo-500 outline-none font-mono text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded text-white/60 hover:text-white hover:bg-white/5">Cancelar</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 rounded text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all flex items-center gap-2">
                            <FaSave /> Guardar Regla
                        </button>
                    </div>
                </div>
            )}

            {/* Rules Display (Grouped) */}
            <div className="max-w-5xl mx-auto space-y-12" ref={listRef}>
                {loading && <p className="text-center text-white/40 animate-pulse">Cargando normativas...</p>}
                
                {!loading && rules.length === 0 && !error && (
                    <div className="text-center p-12 border border-dashed border-white/10 rounded-xl text-white/30">
                        <FaLeaf className="text-4xl mx-auto mb-4 opacity-50"/>
                        <p>No hay reglas definidas todavía.</p>
                    </div>
                )}

                {Object.entries(groupedRules).map(([category, catRules]) => (
                    <div key={category} className="category-group">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-2">
                            <span className="text-2xl text-indigo-400/80">
                                {CATEGORY_ICONS[category] || DEFAULT_ICON}
                            </span>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                                {category}
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {catRules.map(rule => (
                                <div key={rule.id} className="rule-card relative group bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-6 rounded-xl hover:border-indigo-500/30 transition-all duration-300">
                                    
                                    {/* Admin Controls */}
                                    {isStaff && (
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(rule)} className="p-2 bg-black/50 hover:bg-amber-500/20 text-white/50 hover:text-amber-400 rounded transition-colors" title="Editar">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(rule.id)} className="p-2 bg-black/50 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded transition-colors" title="Borrar">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1 text-indigo-400/50">
                                            <div className="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]"></div>
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                                                {rule.title}
                                            </h3>
                                            <div className="text-white/70 leading-relaxed text-sm whitespace-pre-line">
                                                {rule.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    )
}
