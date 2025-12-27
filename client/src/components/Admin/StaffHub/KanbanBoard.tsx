import React, { useState, useEffect } from 'react';
import KanbanColumn from './KanbanColumn';
import { FaPlus, FaTimes, FaLayerGroup, FaTag, FaUser } from 'react-icons/fa';
import { KanbanTask } from './KanbanCard';
import Loader from '../../UI/Loader';
import ConfirmationModal from '../../UI/ConfirmationModal';
import { supabase } from '../../../services/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

const COLUMNS = [
    { id: 'idea', title: 'Ideas / Backlog', color: '#a855f7' },
    { id: 'pending', title: 'Pendiente', color: '#facc15' },
    { id: 'in_progress', title: 'En Progreso', color: '#3b82f6' },
    { id: 'review', title: 'Revisión', color: '#f97316' },
    { id: 'done', title: 'Completado', color: '#22c55e' },
    { id: 'blocked', title: 'Bloqueado', color: '#ef4444' }
];

export default function KanbanBoard() {
    const [tasks, setTasks] = useState<KanbanTask[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        priority: 'Medium',
        type: 'General',
        assignee: ''
    });

    // Delete Modal State
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/staff/tasks`, {
               headers: session ? { 'Authorization': `Bearer ${session.access_token}` } : undefined
            });
            if (res.ok) {
                const data = await res.json() as KanbanTask[];
                const mappedData = data.map((task: any) => ({
                    ...task,
                    columnId: task.column_id || 'idea'
                }));
                setTasks(mappedData);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newTask.title.trim()) return;

        const taskPayload = {
            ...newTask,
            assignee: newTask.assignee || 'Unassigned',
            column_id: 'idea',
            date: new Date().toLocaleDateString()
        };

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/staff/tasks`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': session ? `Bearer ${session.access_token}` : ''
                },
                body: JSON.stringify(taskPayload)
            });

            if (res.ok) {
                const savedTask = await res.json();
                setTasks(prev => [...prev, { ...savedTask, columnId: savedTask.column_id || 'idea' }]);
                setShowCreateModal(false);
                setNewTask({ title: '', priority: 'Medium', type: 'General', assignee: '' });
            }
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        const id = deleteConfirm;

        const previousTasks = [...tasks];
        setTasks(prev => prev.filter(t => t.id !== id));

        try {
            const { data: { session } } = await supabase.auth.getSession();
            await fetch(`${API_URL}/staff/tasks/${id}`, { 
                method: 'DELETE',
                headers: session ? { 'Authorization': `Bearer ${session.access_token}` } : undefined
             });
        } catch (error) {
            console.error("Error deleting task:", error);
            setTasks(previousTasks);
        } finally {
            setDeleteConfirm(null);
        }
    };

    const onDragStart = (e: React.DragEvent, cardId: number) => {
        e.dataTransfer.setData("cardId", cardId.toString());
    };

    const onDrop = async (e: React.DragEvent, columnId: string) => {
        const cardId = e.dataTransfer.getData("cardId");
        
        const taskToUpdate = tasks.find(t => t.id === Number(cardId));
        if (!taskToUpdate || taskToUpdate.columnId === columnId) return;

        const previousTasks = [...tasks];
        setTasks(prev => prev.map(task => {
            if (task.id === Number(cardId)) {
                return { ...task, columnId };
            }
            return task;
        }));

        try {
            const { data: { session } } = await supabase.auth.getSession();
            await fetch(`${API_URL}/staff/tasks/${cardId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': session ? `Bearer ${session.access_token}` : ''
                },
                body: JSON.stringify({ column_id: columnId })
            });
        } catch (error) {
            console.error("Error updating task:", error);
            setTasks(previousTasks);
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <Loader style={{ minHeight: '100px' }} />
        </div>
    );

    return (
        <div className="kanban-board-container" style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <div style={{ padding: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Tablero
                </h3>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary" 
                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', background: 'var(--accent)', border: 'none', color:'#000', fontWeight:'bold' }}
                >
                    <FaPlus /> Nueva Tarea
                </button>
            </div>

            <div style={{ 
                flex: 1, 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gridAutoRows: 'minmax(0, 1fr)',
                gap: '1rem', 
                overflow: 'auto', // Allow scroll if columns stack
                paddingBottom: '0.5rem'
            }}>
                {COLUMNS.map(col => (
                    <KanbanColumn 
                        key={col.id} 
                        column={col} 
                        cards={tasks.filter(t => t.columnId === col.id)}
                        onDragStart={onDragStart}
                        onDrop={onDrop}
                        onDelete={(id) => setDeleteConfirm(id)}
                    />
                ))}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div className="admin-card" style={{ 
                        width: '450px', 
                        maxWidth: '90%', 
                        background: '#151519', 
                        border: '1px solid #333',
                        // Animation removed
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}><FaPlus size={16} color="var(--accent)"/> Nueva Tarea</h3>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.2rem' }}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="admin-label" style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.85rem' }}>Título de la tarea</label>
                                <input 
                                    className="admin-input" 
                                    value={newTask.title}
                                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                                    placeholder="Ej: Revisar reporte de bugs..."
                                    autoFocus
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="admin-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                        <FaLayerGroup size={10} /> Prioridad
                                    </label>
                                    <select 
                                        className="admin-input"
                                        style={{ backgroundColor: '#1a1b20', color: 'white', cursor: 'pointer' }}
                                        value={newTask.priority}
                                        onChange={e => setNewTask({...newTask, priority: e.target.value})}
                                    >
                                        <option value="Low">Baja</option>
                                        <option value="Medium">Media</option>
                                        <option value="High">Alta</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="admin-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                        <FaTag size={10} /> Tipo
                                    </label>
                                    <select 
                                        className="admin-input"
                                        style={{ backgroundColor: '#1a1b20', color: 'white', cursor: 'pointer' }}
                                        value={newTask.type}
                                        onChange={e => setNewTask({...newTask, type: e.target.value})}
                                    >
                                        <option value="General">General</option>
                                        <option value="Bug">Bug</option>
                                        <option value="Feature">Feature</option>
                                        <option value="Maintenance">Mantenimiento</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="admin-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                    <FaUser size={10} /> Asignado a (Opcional)
                                </label>
                                <input 
                                    className="admin-input" 
                                    value={newTask.assignee}
                                    onChange={e => setNewTask({...newTask, assignee: e.target.value})}
                                    placeholder="Nombre del staff..."
                                />
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancelar</button>
                                <button type="submit" className="btn-primary" disabled={!newTask.title.trim()}>Crear Tarea</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal 
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="Eliminar Tarea"
                message="¿Estás seguro de que quieres eliminar esta tarea permanentemente?"
                confirmText="Eliminar"
                isDanger={true}
            />
        </div>
    );
}
