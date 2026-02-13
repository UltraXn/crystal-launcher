import type { Meta, StoryObj } from '@storybook/react-vite';
import KanbanBoard from '../../components/Admin/StaffHub/KanbanBoard';

const meta: Meta<typeof KanbanBoard> = {
  title: 'Admin/KanbanBoard',
  component: KanbanBoard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 p-8 min-h-screen text-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

const MOCK_TASKS = [
    { id: 1, title: 'Diseñar nueva interfaz', description: 'Usar Figma', columnId: 'idea', priority: 'High' as const, type: 'Feature' as const, assignee: 'Designer', due_date: null, end_date: null, created_at: new Date().toISOString() },
    { id: 2, title: 'Corregir bug de login', description: 'Error 500', columnId: 'todo', priority: 'High' as const, type: 'Bug' as const, assignee: 'Dev1', due_date: null, end_date: null, created_at: new Date().toISOString() },
    { id: 3, title: 'Implementar Kanban', description: 'Drag and drop', columnId: 'in-progress', priority: 'Medium' as const, type: 'Feature' as const, assignee: 'Me', due_date: null, end_date: null, created_at: new Date().toISOString() },
    { id: 4, title: 'Lanzar v2.0', description: 'Deploy', columnId: 'done', priority: 'High' as const, type: 'General' as const, assignee: 'Admin', due_date: null, end_date: null, created_at: new Date().toISOString() },
];

const MOCK_GOOGLE_EVENTS = [
    { id: 'g1', summary: 'Reunión de Staff', start: { dateTime: new Date().toISOString() }, end: { dateTime: new Date(Date.now() + 3600000).toISOString() }, htmlLink: '#' }
];

const MOCK_NOTION = [
    { id: 'n1', title: 'Roadmap planning', url: '#' }
];

export const Default: Story = {
    args: {
        mockTasks: MOCK_TASKS,
        mockGoogleEvents: MOCK_GOOGLE_EVENTS,
        mockNotionTasks: MOCK_NOTION
    }
};

export const Empty: Story = {
    args: {
        mockTasks: []
    }
};

export const Loading: Story = {
    // Falls back to fetching/loading state
};
