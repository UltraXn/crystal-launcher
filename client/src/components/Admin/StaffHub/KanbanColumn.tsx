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
}

export default function KanbanColumn({ column, cards, onDragStart, onDrop, onDelete }: KanbanColumnProps) {
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
                height: isExpanded && !isMobile ? '100%' : 'auto', // En PC ocupa todo, en Móvil crece
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: isExpanded && !isMobile ? '100%' : 'none',
                overflow: isMobile && isExpanded ? 'visible' : 'hidden', // Permitir desbordamiento natural en móvil
                transition: 'all 0.3s ease'
            }}
        >
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ 
                    marginBottom: isExpanded ? '1.25rem' : '0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    paddingBottom: isExpanded ? '0.75rem' : '0',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     {/* Toggle Icon */}
                    {isExpanded ? <FaChevronDown size={12} color="#666" /> : <FaChevronRight size={12} color="#666" />}
                    
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: column.color, boxShadow: `0 0 10px ${column.color}` }}></div>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '0.9rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{column.title}</h4>
                </div>
                <span style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    color: '#666', 
                    padding: '2px 10px', 
                    borderRadius: '100px', 
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
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
            `}</style>
        </div>
    );
}
