import React, { useState, useEffect } from 'react';
import KanbanColumn from './KanbanColumn';
import { KanbanTask, KANBAN_COLUMNS, TaskPriority } from '@crystaltides/shared';
import CalendarView, { GoogleEvent } from './CalendarView';
import { FaPlus, FaTimes, FaLayerGroup, FaTag, FaUser, FaCalendar, FaList, FaGoogle, FaBullseye, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Loader from '../../UI/Loader';
import ConfirmationModal from '../../UI/ConfirmationModal';
import { supabase } from '../../../services/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

const COLUMNS = KANBAN_COLUMNS;

export default function KanbanBoard() {
    const [tasks, setTasks] = useState<KanbanTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');
    const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([]); // Initialize googleEvents state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [notionTasks, setNotionTasks] = useState<any[]>([]); // Initialize notionTasks state
    const [syncing, setSyncing] = useState(false);
    const [notionSyncing, setNotionSyncing] = useState(false);

    // --- Google Calendar Integration ---
    const fetchGoogleEvents = async () => {
        setSyncing(true);
        try {
            const { data: session } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/staff/tasks/calendar`, {
                headers: {
                    Authorization: `Bearer ${session?.session?.access_token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch calendar');
            const events = await response.json();
            setGoogleEvents(events);
        } catch (err) {
            console.error("Calendar Sync Error:", err);
            // Optionally show toast error
        } finally {
            setSyncing(false);
        }
    };

    const subscribeToCalendar = async () => {
        try {
            const { data: session } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/staff/tasks/calendar/subscribe`, {
                headers: {
                    Authorization: `Bearer ${session?.session?.access_token}`
                }
            });
            if (!response.ok) throw new Error('Failed to get subscribe link');
            const { url } = await response.json();
            window.open(url, '_blank');
        } catch (err) {
            console.error("Subscription Error:", err);
        }
    };

    const fetchNotionTasks = async () => {
        setNotionSyncing(true);
        try {
            const { data: session } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/staff/tasks/notion`, {
                headers: {
                    Authorization: `Bearer ${session?.session?.access_token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch Notion tasks');
            const tasks = await response.json();
            setNotionTasks(tasks);
        } catch (err) {
            console.error("Notion Sync Error:", err);
        } finally {
            setNotionSyncing(false);
        }
    };

    useEffect(() => {
        if (notionTasks.length > 0) {
            console.log("Synced Notion Tasks:", notionTasks);
        }
    }, [notionTasks]);

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
    const [newTask, setNewTask] = useState({
        title: '',
        priority: 'Medium',
        type: 'General',
        assignee: '',
        due_date: '',
        end_date: ''
    });
    const [dateError, setDateError] = useState<string | null>(null);

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
                const mappedData = data.map((task: KanbanTask) => ({
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

        if (newTask.due_date && newTask.end_date && new Date(newTask.end_date) < new Date(newTask.due_date)) {
            setDateError('La fecha de fin no puede ser anterior a la de inicio');
            return;
        }
        setDateError(null);

        const taskPayload = {
            ...newTask,
            assignee: newTask.assignee || 'Unassigned',
            column_id: 'idea',
            date: newTask.due_date ? new Date(newTask.due_date).toLocaleDateString() : new Date().toLocaleDateString(),
            due_date: newTask.due_date || null,
            end_date: newTask.end_date || null
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
                setTasks(prev => [{ ...savedTask, columnId: savedTask.column_id || 'idea' }, ...prev]);
                setShowCreateModal(false);
                setNewTask({ title: '', priority: 'Medium', type: 'General', assignee: '', due_date: '', end_date: '' });
            }
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const handleUpdateTaskDate = async (id: number | string, newDate: Date) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/staff/tasks/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': session ? `Bearer ${session.access_token}` : ''
                },
                body: JSON.stringify({ 
                    due_date: newDate.toISOString(),
                    date: newDate.toLocaleDateString()
                })
            });

            if (res.ok) {
                const updatedTask = await res.json();
                setTasks(prev => prev.map(t => t.id === id ? { ...updatedTask, columnId: updatedTask.column_id || 'idea' } : t));
            }
        } catch (error) {
            console.error("Error updating task date:", error);
        }
    };

    const handleUpdateTaskDuration = async (id: number | string, start: Date, end: Date) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/staff/tasks/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': session ? `Bearer ${session.access_token}` : ''
                },
                body: JSON.stringify({ 
                    due_date: start.toISOString(),
                    end_date: end.toISOString(),
                    date: start.toLocaleDateString()
                })
            });

            if (res.ok) {
                const updatedTask = await res.json();
                setTasks(prev => prev.map(t => t.id === id ? { ...updatedTask, columnId: updatedTask.column_id || 'idea' } : t));
            }
        } catch (error) {
            console.error("Error updating task duration:", error);
        }
    };

    const handleEditTask = (task: KanbanTask) => {
        setEditingTask(task);
        setNewTask({
            title: task.title,
            priority: task.priority || 'Medium',
            type: task.type || 'General',
            assignee: task.assignee || '',
            due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
            end_date: task.end_date ? new Date(task.end_date).toISOString().slice(0, 16) : ''
        });
        setShowCreateModal(true);
    };

    const handleSaveTask = async () => {
        if (!editingTask) return;

        if (newTask.due_date && newTask.end_date && new Date(newTask.end_date) < new Date(newTask.due_date)) {
            setDateError('La fecha de fin no puede ser anterior a la de inicio');
            return;
        }
        setDateError(null);
        
        const taskPayload = {
            ...newTask,
            due_date: newTask.due_date || null,
            end_date: newTask.end_date || null,
            date: newTask.due_date ? new Date(newTask.due_date).toLocaleDateString() : new Date().toLocaleDateString()
        };

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/staff/tasks/${editingTask.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': session ? `Bearer ${session.access_token}` : ''
                },
                body: JSON.stringify(taskPayload)
            });

            if (res.ok) {
                const updatedTask = await res.json();
                setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...updatedTask, columnId: updatedTask.column_id || 'idea' } : t));
                setShowCreateModal(false);
                setEditingTask(null);
                setNewTask({ title: '', priority: 'Medium', type: 'General', assignee: '', due_date: '', end_date: '' });
            }
        } catch (error) {
            console.error("Error saving task:", error);
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
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                        <button 
                            onClick={() => setViewMode('board')}
                            style={{ 
                                background: viewMode === 'board' ? 'var(--accent)' : 'transparent',
                                border: 'none', 
                                color: viewMode === 'board' ? '#000' : '#888',
                                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold'
                            }}
                        >
                            <FaList /> Board
                        </button>
                        <button 
                            onClick={() => setViewMode('calendar')}
                            style={{ 
                                background: viewMode === 'calendar' ? 'var(--accent)' : 'transparent',
                                border: 'none', 
                                color: viewMode === 'calendar' ? '#000' : '#888',
                                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold'
                            }}
                        >
                            <FaCalendar /> Calendar
                        </button>
                    </div>

                    {viewMode === 'calendar' && (
                        <>
                            <button 
                                onClick={fetchGoogleEvents}
                                disabled={syncing}
                                style={{ 
                                    background: 'rgba(66, 133, 244, 0.2)', // Google Blue tint
                                    border: '1px solid rgba(66, 133, 244, 0.4)',
                                    color: '#4285F4',
                                    padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold'
                                }}
                            >
                                <FaGoogle /> {syncing ? 'Syncing...' : 'Sync Calendar'}
                            </button>
                            <button 
                                onClick={subscribeToCalendar}
                                style={{ 
                                    background: 'transparent',
                                    border: '1px solid #444',
                                    color: '#ccc',
                                    padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold'
                                }}
                                title="Add CrystalTides Calendar to your Google Calendar"
                            >
                                <FaPlus /> Add to My Calendar
                            </button>
                        </>
                    )}

                    {viewMode === 'calendar' && (
                        <button 
                            onClick={fetchNotionTasks}
                            disabled={notionSyncing}
                            style={{ 
                                background: 'rgba(0, 0, 0, 0.2)', // Notion Black tint
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: '#fff',
                                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold'
                            }}
                        >
                             <FaBullseye /> {notionSyncing ? 'Syncing...' : 'Sync Notion'}
                        </button>
                    )}

                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary" 
                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', background: 'var(--accent)', border: 'none', color:'#000', fontWeight:'bold' }}
                    >
                        <FaPlus /> Nueva Tarea
                    </button>
                </div>
            </div>

            {viewMode === 'board' ? (
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
                            onEdit={handleEditTask}
                        />
                    ))}
                </div>
            ) : (
                <CalendarView
                    tasks={tasks}
                    googleEvents={googleEvents}
                    notionTasks={notionTasks}
                    onEditTask={handleEditTask}
                    onUpdateEventDate={handleUpdateTaskDate}
                    onUpdateEventDuration={handleUpdateTaskDuration}
                />
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <div className="premium-modal" style={{
                        background: 'rgba(15, 15, 20, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '2.5rem',
                        borderRadius: '32px',
                        width: '90%', maxWidth: '500px',
                        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7)',
                        position: 'relative',
                        animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <button 
                            onClick={() => { setShowCreateModal(false); setEditingTask(null); }}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            <FaTimes />
                        </button>

                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {editingTask ? <FaBullseye color="var(--accent)" /> : <FaPlus color="var(--accent)" />}
                                {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                            </h2>
                            <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>
                                {editingTask ? 'Actualiza los detalles de tu tarea' : 'Planifica una nueva actividad para el equipo'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="admin-label-premium">TÍTULO DE LA TAREA</label>
                                <input 
                                    className="admin-input-premium" 
                                    placeholder="¿En qué vamos a trabajar?"
                                    value={newTask.title}
                                    onChange={e => { setNewTask({...newTask, title: e.target.value}); setDateError(null); }}
                                />
                            </div>

                            {dateError && (
                                <div style={{ 
                                    background: 'rgba(255, 68, 68, 0.1)', 
                                    color: '#ff4444', 
                                    padding: '10px', 
                                    borderRadius: '8px', 
                                    fontSize: '0.8rem', 
                                    marginBottom: '1rem',
                                    fontWeight: 'bold',
                                    border: '1px solid rgba(255, 68, 68, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FaTimes /> {dateError}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="admin-label-premium"><FaTag size={10} /> Prioridad</label>
                                    <select 
                                        className="admin-input-premium"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
                                    >
                                        <option value="Low">Baja</option>
                                        <option value="Medium">Media</option>
                                        <option value="High">Alta</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="admin-label-premium"><FaLayerGroup size={10} /> Tipo</label>
                                    <select 
                                        className="admin-input-premium"
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

                            <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                                {(!editingTask || editingTask.columnId === 'idea') && (
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: '-18px', 
                                        right: '4px', 
                                        fontSize: '0.62rem', 
                                        color: 'var(--accent)', 
                                        opacity: 0.7,
                                        fontWeight: '900',
                                        letterSpacing: '1px',
                                        textTransform: 'uppercase'
                                    }}>
                                       Fechas opcionales para backlog
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <label className="admin-label-premium"><FaCalendarAlt size={10} /> Inicio</label>
                                    <input 
                                        type="datetime-local"
                                        className="admin-input-premium" 
                                        value={newTask.due_date}
                                        onChange={e => { setNewTask({...newTask, due_date: e.target.value}); setDateError(null); }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="admin-label-premium"><FaClock size={10} /> Fin</label>
                                    <input 
                                        type="datetime-local"
                                        className="admin-input-premium" 
                                        value={newTask.end_date}
                                        min={newTask.due_date}
                                        onChange={e => { setNewTask({...newTask, end_date: e.target.value}); setDateError(null); }}
                                        style={dateError ? { borderColor: 'rgba(255, 68, 68, 0.5)' } : {}}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="admin-label-premium"><FaUser size={10} /> Asignado a</label>
                                <input 
                                    className="admin-input-premium" 
                                    placeholder="Nombre del staff..."
                                    value={newTask.assignee}
                                    onChange={e => setNewTask({...newTask, assignee: e.target.value})}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button 
                                    className="modal-btn-secondary"
                                    onClick={() => { setShowCreateModal(false); setEditingTask(null); }}
                                >
                                    CANCELAR
                                </button>
                                <button 
                                    className="modal-btn-primary"
                                    onClick={editingTask ? handleSaveTask : handleCreateTask}
                                >
                                    {editingTask ? 'GUARDAR CAMBIOS' : 'CREAR TAREA'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes modalSlideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                        
                        .admin-label-premium {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            color: #888;
                            font-size: 0.75rem;
                            font-weight: 800;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 8px;
                        }

                        .admin-input-premium {
                            width: 100%;
                            background: rgba(255, 255, 255, 0.03);
                            border: 1px solid rgba(255, 255, 255, 0.08);
                            padding: 12px 16px;
                            border-radius: 12px;
                            color: #fff;
                            font-size: 0.9rem;
                            transition: all 0.3s;
                            outline: none;
                        }

                        .admin-input-premium:focus {
                            border-color: var(--accent);
                            background: rgba(255, 255, 255, 0.05);
                            box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.1);
                        }

                        .modal-btn-secondary {
                            flex: 1;
                            background: transparent;
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            color: #666;
                            padding: 14px;
                            border-radius: 16px;
                            font-weight: 800;
                            cursor: pointer;
                            transition: all 0.3s;
                            letter-spacing: 1px;
                        }

                        .modal-btn-secondary:hover {
                            background: rgba(255, 255, 255, 0.05);
                            color: #fff;
                        }

                        .modal-btn-primary {
                            flex: 1.5;
                            background: var(--accent);
                            border: none;
                            color: #000;
                            padding: 14px;
                            border-radius: 16px;
                            font-weight: 900;
                            cursor: pointer;
                            transition: all 0.3s;
                            letter-spacing: 1px;
                            box-shadow: 0 10px 20px rgba(var(--accent-rgb), 0.2);
                        }

                        .modal-btn-primary:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 15px 30px rgba(var(--accent-rgb), 0.3);
                        }
                    `}</style>
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
