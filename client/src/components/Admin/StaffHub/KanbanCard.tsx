import React from 'react';
import { FaGripVertical, FaUserCircle, FaClock, FaTrash } from 'react-icons/fa';

export interface KanbanTask {
    id: number;
    title: string;
    columnId: string;
    priority?: 'High' | 'Medium' | 'Low';
    type?: string;
    assignee?: string;
    date?: string;
    // Database fields potentially present during mapping
    column_id?: string;
}

interface KanbanCardProps {
    card: KanbanTask;
    onDragStart: (e: React.DragEvent, cardId: number) => void;
    onDelete?: (id: number) => void;
}

export default function KanbanCard({ card, onDragStart, onDelete }: KanbanCardProps) {
    return (
        <div 
            className="kanban-card"
            draggable
            onDragStart={(e) => onDragStart(e, card.id)}
            style={{
                background: '#131418', // Fondo oscuro sólido para mejor contraste
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)', // Borde más visible
                cursor: 'grab',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)', // Sombra más pronunciada
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                position: 'relative',
                zIndex: 10 // Asegurar que está por encima
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '600', lineHeight: '1.4', flex: 1, paddingRight: '1.5rem' }}>
                    {card.title}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {onDelete && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff4444', opacity: 0.3, transition: 'opacity 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.opacity = '1'}
                            onMouseOut={e => e.currentTarget.style.opacity = '0.3'}
                        >
                            <FaTrash size={12} />
                        </button>
                    )}
                    <FaGripVertical color="#444" size={14} style={{ cursor: 'grab', flexShrink: 0 }} />
                </div>
            </div>

            {/* Tags / Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: '#888' }}>
                {card.priority && (
                    <span style={{ 
                        background: getPriorityColor(card.priority) + '20', 
                        color: getPriorityColor(card.priority), 
                        padding: '2px 8px', 
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        border: `1px solid ${getPriorityColor(card.priority)}40`
                    }}>
                        {card.priority}
                    </span>
                )}
                {card.type && (
                     <span style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        padding: '2px 8px', 
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#aaa'
                    }}>
                        {card.type}
                    </span>
                )}
            </div>

             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     {card.assignee && card.assignee !== 'Unassigned' ? (
                         <img 
                            src={`https://minotar.net/helm/${card.assignee}/24.png`} 
                            alt={card.assignee}
                            style={{ borderRadius: '4px', width: '16px', height: '16px' }}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden'); // Fallback visual simple
                            }}
                         />
                     ) : (
                         <FaUserCircle color="#555" size={14} />
                     )}
                     <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: '500' }}>{card.assignee || 'Unassigned'}</span>
                </div>
                {card.date && (
                    <span style={{ fontSize: '0.7rem', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FaClock size={10} /> {card.date}
                    </span>
                 )}
            </div>
        </div>
    );
}

function getPriorityColor(p: string) {
    if (p === 'High') return '#ef4444'; 
    if (p === 'Medium') return '#facc15';
    if (p === 'Low') return '#10b981';
    return '#ccc';
}
