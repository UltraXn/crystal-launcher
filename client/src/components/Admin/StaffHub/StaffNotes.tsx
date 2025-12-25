import { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Loader from '../../UI/Loader';
import ConfirmationModal from '../../UI/ConfirmationModal';

const API_URL = import.meta.env.VITE_API_URL;
const COLORS = [
    'rgba(139, 92, 246, 0.15)', // Purple
    'rgba(59, 130, 246, 0.15)', // Blue
    'rgba(16, 185, 129, 0.15)', // Emerald
    'rgba(249, 115, 22, 0.15)', // Orange
    'rgba(255, 255, 255, 0.05)' // Gray
];

interface Note {
    id: number;
    text: string;
    color: string;
    date?: string;
}

export default function StaffNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNoteText, setNewNoteText] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await fetch(`${API_URL}/staff/notes`);
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async () => {
        if (!newNoteText.trim()) return;
        
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const newNoteData = {
            text: newNoteText,
            color: randomColor,
            rotation: 0 
        };

        try {
            const res = await fetch(`${API_URL}/staff/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNoteData)
            });

            if (res.ok) {
                const savedNote = await res.json();
                setNotes(prev => [savedNote, ...prev]);
                setShowCreateModal(false);
                setNewNoteText('');
            }
        } catch (error) {
            console.error("Error creating note:", error);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;

        // Optimistic update
        const previousNotes = [...notes];
        setNotes(notes.filter(n => n.id !== deleteConfirmId));

        try {
            const res = await fetch(`${API_URL}/staff/notes/${deleteConfirmId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete');
        } catch (error) {
            console.error("Error deleting note:", error);
            setNotes(previousNotes); // Revert on error
        } finally {
            setDeleteConfirmId(null);
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <Loader style={{ height: 'auto', minHeight: '100px' }} />
        </div>
    );

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Notas Rápidas
                </h3>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="btn-secondary"
                    style={{ 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.8rem',
                        display: 'flex', alignItems: 'center', gap: '5px'
                    }}
                >
                    <FaPlus /> Nueva Nota
                </button>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '1rem', 
                overflowY: 'auto',
                paddingRight: '10px',
                paddingBottom: '1rem',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.05) transparent'
            }}>
                {notes.map(note => {
                    // Fallback for old light-theme notes (legacy hex colors)
                    // If the color starts with '#', we map it to one of the new dark colors
                    // to prevent white-text-on-light-background issues.
                    const isLegacyColor = note.color.startsWith('#');
                    const displayColor = isLegacyColor ? COLORS[note.id % COLORS.length] : note.color;

                    return (
                        <div key={note.id} style={{
                            background: displayColor,
                            border: '1px solid rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(5px)',
                            color: '#eee',
                            padding: '1.25rem',
                            borderRadius: '12px',
                            minHeight: '160px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative',
                            transition: 'box-shadow 0.2s',
                        }}
                        // Hover handlers removed
                        >
                        <p style={{ 
                            margin: 0, 
                            fontSize: '0.9rem', 
                            whiteSpace: 'pre-wrap', 
                            lineHeight: '1.5',
                            color: 'rgba(255,255,255,0.9)'
                        }}>
                            {note.text}
                        </p>
                        
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginTop: '1rem', 
                            paddingTop: '0.75rem', 
                            borderTop: '1px solid rgba(255,255,255,0.05)' 
                        }}>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{note.date}</span>
                            <button 
                                onClick={() => setDeleteConfirmId(note.id)}
                                style={{ 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    color: '#ccc',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                title="Borrar"
                                onMouseOver={e => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                    e.currentTarget.style.color = '#ef4444';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.color = '#ccc';
                                }}
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>

            {/* Create Note Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div 
                        className="modal-content" 
                        style={{ 
                            width: '400px', 
                            maxWidth: '90%', 
                            background: '#111', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ 
                                margin: '0 0 1.5rem 0', 
                                fontSize: '1.2rem',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{ color: 'var(--accent)', display:'flex' }}><FaPlus size={16}/></span> Nueva Nota
                            </h3>
                            
                            <textarea
                                autoFocus
                                value={newNoteText}
                                onChange={(e) => setNewNoteText(e.target.value)}
                                placeholder="Escribe tu nota aquí..."
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    padding: '1rem',
                                    minHeight: '120px',
                                    resize: 'none',
                                    outline: 'none',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5'
                                }}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleCreateNote();
                                    }
                                }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                                <button 
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn-secondary"
                                    style={{ padding: '0.6rem 1.2rem' }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleCreateNote}
                                    className="btn-primary"
                                    style={{ padding: '0.6rem 1.5rem' }}
                                >
                                    Guardar Nota
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal 
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={confirmDelete}
                title="¿Eliminar Nota?"
                message="Esta acción no se puede deshacer."
                confirmText="Sí, Eliminar"
                isDanger={true}
            />
        </div>
    );
}
