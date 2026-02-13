import KanbanBoard from './KanbanBoard';
import StaffNotes from './StaffNotes';

export default function StaffWorkspace() {
    return (
        <div className="staff-workspace-container">
            {/* Left: Kanban (Takes more space) */}
            <section className="staff-workspace-section">
                <KanbanBoard />
            </section>

            {/* Right: Notes (Takes less space) */}
            <section className="staff-workspace-section">
                <StaffNotes />
            </section>
        </div>
    );
}
