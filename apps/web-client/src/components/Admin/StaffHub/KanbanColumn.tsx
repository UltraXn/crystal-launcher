import React, { useState } from 'react';
import KanbanCard, { KanbanTask } from './KanbanCard';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface KanbanColumnData {
    id: string;
    title: string;
    color: string;
}

interface KanbanColumnProps {
    column: KanbanColumnData;
    cards: KanbanTask[];
    onDragStart: (e: React.DragEvent, cardId: number) => void;
    onDrop: (e: React.DragEvent, columnId: string) => void;
    onDelete?: (id: number) => void;
    onEdit?: (task: KanbanTask) => void;
}

export default function KanbanColumn({ column, cards, onDragStart, onDrop, onDelete, onEdit }: KanbanColumnProps) {
    // Default expanded on desktop/tablet, collapsed on mobile (< 768px)
    const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 768);
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        // Auto-expand on drag over if collapsed? Optional UX improvement
        if (!isExpanded) setIsExpanded(true);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        onDrop(e, column.id);
    };

    // Detectar móvil de forma simple para estilos condicionales
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <div 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
                height: isExpanded && !isMobile ? '100%' : 'auto',
                background: 'rgba(15, 15, 20, 0.4)',
                backdropFilter: 'blur(15px)',
                borderRadius: '24px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: isExpanded && !isMobile ? '100%' : 'none',
                overflow: isMobile && isExpanded ? 'visible' : 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
            }}
        >
            <div 
                className="column-header-premium"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ 
                    marginBottom: isExpanded ? '1.5rem' : '0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    paddingBottom: isExpanded ? '1rem' : '0',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'all 0.3s'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="toggle-icon-premium">
                        {isExpanded ? <FaChevronDown size={10} color="#666" /> : <FaChevronRight size={10} color="#666" />}
                    </div>
                    
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: column.color, boxShadow: `0 0 15px ${column.color}` }}></div>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{column.title}</h4>
                </div>
                <span className="column-count-premium">
                    {cards.length}
                </span>
            </div>

            {isExpanded && (
                <div 
                    className="kanban-cards-container"
                    style={{
                        flex: 1,
                        overflowY: isMobile ? 'visible' : 'auto', // Scroll natural en móvil
                        paddingRight: '6px',
                        minHeight: '100px'
                    }}
                >
                    {cards.map(card => (
                        <KanbanCard 
                            key={card.id} 
                            card={card} 
                            onDragStart={onDragStart} 
                            onDelete={onDelete}
                            onEdit={onEdit}
                        />
                    ))}
                    {cards.length === 0 && (
                        <div style={{ 
                            height: '100px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: '#444', 
                            fontSize: '0.8rem', 
                            border: '2px dashed rgba(255,255,255,0.05)', 
                            borderRadius: '12px',
                        }}>
                            Vacío
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .kanban-cards-container::-webkit-scrollbar {
                    width: 4px;
                }
                .kanban-cards-container::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
                .column-header-premium:hover .toggle-icon-premium {
                    transform: translateX(2px);
                    color: #fff;
                }
                .column-count-premium {
                    background: rgba(255,255,255,0.03);
                    color: #555;
                    padding: 4px 12px;
                    borderRadius: 100px;
                    fontSize: 0.7rem;
                    fontWeight: 900;
                    border: 1px solid rgba(255,255,255,0.03);
                    transition: all 0.3s;
                }
                .column-header-premium:hover .column-count-premium {
                    background: rgba(255,255,255,0.08);
                    color: #fff;
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
}
