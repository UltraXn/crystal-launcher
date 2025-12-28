import React from 'react';
import { FaGripVertical, FaUserCircle, FaClock, FaTrash, FaEdit } from 'react-icons/fa';
import { KanbanTask } from '@crystaltides/shared';

interface KanbanCardProps {
    card: KanbanTask;
    onDragStart: (e: React.DragEvent, cardId: number) => void;
    onDelete?: (id: number) => void;
    onEdit?: (task: KanbanTask) => void;
}

export default function KanbanCard({ card, onDragStart, onDelete, onEdit }: KanbanCardProps) {
    const hasTime = card.due_date?.includes('T');
    
    return (
        <div 
            className="kanban-card-premium"
            draggable
            onDragStart={(e) => onDragStart(e, card.id)}
            style={{
                background: 'rgba(25, 25, 30, 0.4)',
                backdropFilter: 'blur(10px)',
                padding: '1.25rem',
                marginBottom: '1rem',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)',
                cursor: 'grab',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                zIndex: 10
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="card-title-premium">
                    {card.title}
                </span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {onEdit && (
                        <button 
                            className="card-action-btn edit"
                            onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                        >
                            <FaEdit size={12} />
                        </button>
                    )}
                    {onDelete && (
                        <button 
                            className="card-action-btn delete"
                            onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                        >
                            <FaTrash size={12} />
                        </button>
                    )}
                    <FaGripVertical color="#444" size={14} style={{ cursor: 'grab', flexShrink: 0, marginLeft: '4px' }} />
                </div>
            </div>

            {/* Tags / Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                {card.priority && (
                    <span style={{ 
                        background: `${getPriorityColor(card.priority)}20`, 
                        color: getPriorityColor(card.priority), 
                        padding: '4px 10px', 
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        border: `1px solid ${getPriorityColor(card.priority)}40`
                    }}>
                        {card.priority}
                    </span>
                )}
                {card.type && (
                    <span style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        padding: '4px 10px', 
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        color: '#888',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                    }}>
                        {card.type}
                    </span>
                )}
            </div>

             <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginTop: '0.5rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid rgba(255,255,255,0.03)' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     {card.assignee && card.assignee !== 'Unassigned' ? (
                         <div style={{ position: 'relative' }}>
                            <img 
                                src={`https://minotar.net/helm/${card.assignee}/24.png`} 
                                alt={card.assignee}
                                style={{ borderRadius: '6px', width: '20px', height: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                         </div>
                     ) : (
                         <FaUserCircle color="#333" size={18} />
                     )}
                     <span style={{ fontSize: '0.8rem', color: '#777', fontWeight: '700' }}>{card.assignee || 'Unassigned'}</span>
                </div>
                {card.columnId === 'idea' ? (
                    <div style={{ 
                        fontSize: '0.65rem', 
                        color: 'rgba(255,255,255,0.4)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <FaClock size={10} color="#666" />
                        <span style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Por confirmar
                        </span>
                    </div>
                ) : card.due_date ? (
                    <div style={{ 
                        fontSize: '0.7rem', 
                        color: '#666', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '4px 10px',
                        borderRadius: '6px'
                    }}>
                        <FaClock size={10} color="var(--accent)" />
                        <span style={{ fontWeight: '800' }}>
                            {hasTime ? new Date(card.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : card.date}
                        </span>
                    </div>
                 ) : null}
            </div>

            <style>{`
                .kanban-card-premium:hover {
                    background: rgba(35, 35, 45, 0.6) !important;
                    transform: translateY(-4px);
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }

                .card-title-premium {
                    font-size: 0.95rem;
                    color: #fff;
                    font-weight: 700;
                    line-height: 1.5;
                    flex: 1;
                    padding-right: 1.5rem;
                }

                .card-action-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    color: #444;
                }

                .card-action-btn.edit:hover { background: rgba(var(--accent-rgb), 0.1); color: var(--accent); }
                .card-action-btn.delete:hover { background: rgba(255, 68, 68, 0.1); color: #ff4444; }
            `}</style>
        </div>
    );
}

function getPriorityColor(p: string) {
    if (p === 'High') return '#ef4444'; 
    if (p === 'Medium') return '#facc15';
    if (p === 'Low') return '#10b981';
    return '#ccc';
}
