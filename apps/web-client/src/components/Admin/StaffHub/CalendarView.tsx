import { Calendar, dateFnsLocalizer, View, ToolbarProps } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { enUS, es } from 'date-fns/locale';
import { KanbanTask } from '@crystaltides/shared';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaGoogle } from 'react-icons/fa';
import { SiNotion } from 'react-icons/si';

const locales = {
  'en-US': enUS,
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);

export interface GoogleEvent {
  id: string;
  summary: string;
  start: { dateTime: string; date?: string };
  end: { dateTime: string; date?: string };
  description?: string;
  htmlLink?: string;
}

interface CalendarViewProps {
  tasks: KanbanTask[];
  googleEvents?: GoogleEvent[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notionTasks?: any[];
  onEditTask: (task: KanbanTask) => void;
  onUpdateEventDate?: (id: number | string, newStart: Date) => void;
  onUpdateEventDuration?: (id: number | string, newStart: Date, newEnd: Date) => void;
}

interface CalendarEvent {
  id: number | string;
  title: string;
  start: Date;
  end: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resource: any;
  hexColor?: string;
  isDraggable?: boolean;
  type?: 'task' | 'google' | 'notion';
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#1e40af',      // Deep Blue
  medium: '#92400e',   // Deep Amber/Brown
  high: '#9f1239',     // Deep Rose/Crimson
  critical: '#4c0519'  // Very Dark Red
};

// --- Custom Components for "Premium" Feel ---

const CustomToolbar = (props: ToolbarProps<CalendarEvent, object>) => {
  const { label, onNavigate, onView, view } = props;
  const { t } = useTranslation();

  return (
    <div className="calendar-toolbar-custom">
      <div className="toolbar-left">
        <button className="nav-btn-round" onClick={() => onNavigate('PREV')}><FaChevronLeft /></button>
        <button className="today-btn-premium" onClick={() => onNavigate('TODAY')}>{t('status.today', 'Hoy')}</button>
        <button className="nav-btn-round" onClick={() => onNavigate('NEXT')}><FaChevronRight /></button>
      </div>
      
      <div className="toolbar-center">
        <h2>{label}</h2>
      </div>

      <div className="toolbar-right">
        <div className="view-switcher-pill">
          {['month', 'week', 'day', 'agenda'].map((v) => (
            <button 
              key={v}
              className={`switcher-btn ${view === v ? 'active' : ''}`}
              onClick={() => onView(v as View)}
            >
              {t(`calendar.${v}`, v.charAt(0).toUpperCase() + v.slice(1))}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  const isTask = event.type === 'task';
  const isGoogle = event.type === 'google';
  const isNotion = event.type === 'notion';
  
  return (
    <div className="custom-calendar-event" title={event.title}>
      <div className="event-inner" style={{ borderLeftColor: event.hexColor }}>
        <div className="event-dot" style={{ backgroundColor: event.hexColor }}></div>
        {isGoogle && <FaGoogle size={10} style={{ marginRight: '4px', opacity: 0.7 }} />}
        {isTask && <FaCalendarAlt size={10} style={{ marginRight: '4px', opacity: 0.7 }} />}
        {isNotion && <SiNotion size={10} style={{ marginRight: '4px', opacity: 0.7 }} />}
        <span className="event-title-text">{event.title}</span>
      </div>
    </div>
  );
};

export default function CalendarView({ tasks, googleEvents, notionTasks, onUpdateEventDate, onUpdateEventDuration }: CalendarViewProps) {
  const { i18n } = useTranslation();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Map KanbanTasks
  const taskEvents: CalendarEvent[] = useMemo(() => tasks
    .filter(t => t.columnId !== 'idea') // Exclude Backlog tasks from calendar
    .map(task => {
      const startDate = new Date(task.due_date || task.created_at);
      // If we have end_date use it, otherwise 1 hour if it's a specific time
      let endDate;
      if (task.end_date) {
        endDate = new Date(task.end_date);
      } else {
        const hasTime = task.due_date?.includes('T');
        endDate = new Date(startDate.getTime() + (hasTime ? 60 * 60 * 1000 : 0));
      }
      
      return {
        id: task.id,
        title: task.title,
        start: startDate,
        end: endDate,
        resource: task,
        hexColor: task.priority ? (PRIORITY_COLORS[task.priority.toLowerCase()] || '#4338ca') : '#4338ca',
        isDraggable: true,
        type: 'task'
      };
    }), [tasks]);

  // Map GoogleEvents
  const googleCalendarEvents: CalendarEvent[] = useMemo(() => (googleEvents || []).map(event => ({
    id: event.id,
    title: event.summary,
    start: new Date(event.start.dateTime || event.start.date || ''),
    end: new Date(event.end.dateTime || event.end.date || ''),
    resource: { id: -1, title: event.summary, columnId: 'google', url: event.htmlLink },
    hexColor: '#1e3a8a', // Deeper Google Blue
    isDraggable: false,
    type: 'google'
  })), [googleEvents]);

  // Map NotionTasks
  const notionCalendarEvents: CalendarEvent[] = useMemo(() => (notionTasks || []).map(task => ({
    id: task.id,
    title: task.title,
    start: new Date(task.created_at),
    end: new Date(task.created_at),
    resource: { id: -2, ...task, columnId: 'notion' },
    hexColor: '#111827', // Deep Notion Black
    isDraggable: false,
    type: 'notion'
  })), [notionTasks]);

  const events = useMemo(() => [...taskEvents, ...googleCalendarEvents, ...notionCalendarEvents], 
    [taskEvents, googleCalendarEvents, notionCalendarEvents]);

  const onEventDrop = ({ event, start }: { event: CalendarEvent, start: string | Date }) => {
     if (event.resource && typeof event.id === 'number' && event.id > 0 && onUpdateEventDate) {
        onUpdateEventDate(event.id, new Date(start));
     }
  };

  const onEventResize = ({ event, start, end }: { event: CalendarEvent, start: string | Date, end: string | Date }) => {
    if (event.resource && typeof event.id === 'number' && event.id > 0 && onUpdateEventDuration) {
       onUpdateEventDuration(event.id, new Date(start), new Date(end));
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      className: `calendar-event-${event.type || 'default'}`,
      style: {
        backgroundColor: 'transparent',
        border: 'none',
        padding: '0',
        zIndex: 10
      }
    };
  };

  const components = useMemo(() => ({
    toolbar: CustomToolbar,
    event: CustomEvent
  }), []);

  return (
    <div className="premium-calendar-container">
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor={(event: CalendarEvent) => event.start}
        endAccessor={(event: CalendarEvent) => event.end}
        style={{ height: '100%', minHeight: '800px' }}
        eventPropGetter={eventStyleGetter}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        draggableAccessor={(event: CalendarEvent) => !!event.isDraggable}
        resizable={true} 
        views={['month', 'week', 'day', 'agenda']}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        components={components}
        culture={i18n.language === 'es' ? 'es' : 'en-US'}
        messages={i18n.language === 'es' ? {
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          allDay: "Todo el día",
          noEventsInRange: "No hay tareas en este rango"
        } : undefined}
      />
      
      <style>{`
        .premium-calendar-container {
          height: auto;
          background: rgba(10, 10, 15, 0.6);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 2rem;
          border-radius: 32px;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Custom Toolbar Styles */
        .calendar-toolbar-custom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .toolbar-left, .toolbar-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-btn-round {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-btn-round:hover {
          background: var(--accent);
          color: #000;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(var(--accent-rgb), 0.2);
        }

        .today-btn-premium {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
          padding: 0.6rem 1.5rem;
          border-radius: 20px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 1.5px;
        }

        .today-btn-premium:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--accent);
          color: var(--accent);
        }

        .toolbar-center h2 {
          font-size: 1.5rem;
          font-weight: 900;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin: 0;
          background: linear-gradient(135deg, #fff 0%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .view-switcher-pill {
          background: rgba(0, 0, 0, 0.4);
          padding: 5px;
          border-radius: 40px;
          display: flex;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .switcher-btn {
          background: transparent;
          border: none;
          color: #888;
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .switcher-btn:hover { color: #fff; }
        .switcher-btn.active {
          background: var(--accent);
          color: #000;
          box-shadow: 0 8px 25px rgba(var(--accent-rgb), 0.4);
        }

        /* Custom Event Styles */
        .custom-calendar-event {
          width: 100%;
          height: 100%;
          padding: 2px;
        }

        .event-inner {
          background: rgba(30, 30, 40, 0.7) !important;
          backdrop-filter: blur(10px);
          border-left: 4px solid;
          padding: 6px 12px;
          border-radius: 10px;
          height: 100%;
          display: flex;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-left-width: 4px;
          cursor: grab !important;
          user-select: none;
        }
        .event-inner:active { cursor: grabbing !important; }

        .event-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 10px;
          box-shadow: 0 0 10px currentColor;
        }

        .event-inner:hover {
          background: rgba(40, 40, 50, 0.9) !important;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
          z-index: 50;
        }

        .event-title-text {
          font-size: 0.8rem;
          font-weight: 700;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* RBC Overrides */
        .rbc-calendar { font-family: inherit; }
        .rbc-month-view { border: none !important; }
        .rbc-day-bg { 
          border-color: rgba(255, 255, 255, 0.04) !important; 
          transition: background 0.3s ease;
        }
        .rbc-day-bg:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        
        .rbc-header {
          padding: 18px 0 !important;
          border: none !important;
          color: #64748b;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 2px;
        }
        .rbc-month-row { border-color: rgba(255, 255, 255, 0.04) !important; }
        .rbc-off-range-bg { background: rgba(0, 0, 0, 0.2) !important; }
        .rbc-today { background: rgba(var(--accent-rgb), 0.08) !important; }
        .rbc-show-more { background: transparent; color: var(--accent); font-weight: 900; font-size: 0.75rem; margin-top: 4px; }
        
        .rbc-time-view { 
          border: none !important; 
          background: rgba(0, 0, 0, 0.2);
          border-radius: 16px;
          overflow: hidden;
        }
        .rbc-time-header { border-bottom: 2px solid rgba(255, 255, 255, 0.08) !important; }
        .rbc-time-header-content { border-left: 1px solid rgba(255, 255, 255, 0.05) !important; }
        .rbc-timeslot-group { 
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; 
          min-height: 50px !important;
        }
        .rbc-day-slot .rbc-time-slot { border-top: 1px solid rgba(255, 255, 255, 0.02) !important; }
        .rbc-time-content { border-top: none !important; }
        .rbc-time-gutter { 
          color: #94a3b8; 
          font-weight: 800; 
          font-size: 0.75rem; 
          border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
          text-align: center;
          padding: 0 5px;
        }
        .rbc-events-container { margin-right: 10px !important; }
        .rbc-allday-cell { background: rgba(var(--accent-rgb), 0.03); }
        .rbc-current-time-indicator { background-color: var(--accent); height: 2px; }

        /* Agenda View Styling */
        .rbc-agenda-view {
          background: rgba(10, 10, 15, 0.4);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }
        .rbc-agenda-view table.rbc-agenda-table {
          border: none;
        }
        .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
          background: rgba(var(--accent-rgb), 0.05);
          color: #94a3b8;
          font-weight: 900;
          text-transform: uppercase;
          padding: 20px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.08);
          letter-spacing: 1px;
        }
        .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
          padding: 20px;
          color: #e2e8f0;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          vertical-align: middle;
        }
        .rbc-agenda-date-cell { font-weight: 900; color: var(--accent) !important; font-size: 0.9rem; }
        .rbc-agenda-time-cell { color: #64748b !important; font-weight: 600; font-size: 0.8rem; }
        .rbc-agenda-event-cell { font-weight: 700; color: #fff; }
        .rbc-agenda-row:hover { background: rgba(255,255,255,0.02); }

        /* General Calendar Fixes */
        .rbc-event-label { font-size: 0.7rem; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
        
        /* Drag & Drop & Resize Visuals */
        .rbc-addons-dnd-drag-preview {
          opacity: 0.4;
          transform: scale(0.98);
          filter: brightness(1.2);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .rbc-addons-dnd-over {
          background-color: rgba(var(--accent-rgb), 0.15) !important;
          box-shadow: inset 0 0 40px rgba(var(--accent-rgb), 0.1);
        }

        .rbc-addons-dnd-resize-ns-anchor, .rbc-addons-dnd-resize-ew-anchor {
          background-color: var(--accent) !important;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          border: 2px solid #000;
          cursor: ns-resize !important;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
          transition: all 0.2s;
        }
        .rbc-addons-dnd-resize-ns-anchor::after, .rbc-addons-dnd-resize-ew-anchor::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 24px;
          background: transparent;
        }
        .rbc-addons-dnd-resize-ns-anchor:hover, .rbc-addons-dnd-resize-ew-anchor:hover {
          opacity: 1;
          transform: scale(1.3);
          box-shadow: 0 0 15px var(--accent);
        }
        .rbc-addons-dnd-resize-ew-anchor {
          cursor: ew-resize !important;
        }

        .rbc-event {
          background: transparent !important;
          border: none !important;
          outline: none !important;
        }
        
        .rbc-event.rbc-selected { background: transparent !important; }

        @media (max-width: 768px) {
          .premium-calendar-container { padding: 1rem; border-radius: 20px; }
          .calendar-toolbar-custom { flex-direction: column; align-items: stretch; gap: 1rem; }
          .toolbar-center { text-align: center; order: -1; }
          .toolbar-left, .toolbar-right { justify-content: center; }
          .toolbar-center h2 { font-size: 1rem; letter-spacing: 1.5px; }
          .switcher-btn { padding: 6px 12px; font-size: 0.7rem; }
        }
      `}</style>
    </div>
  );
}
