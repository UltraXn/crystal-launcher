import type { Meta, StoryObj } from '@storybook/react-vite';
import PollsManager from '../../components/Admin/PollsManager';

const meta: Meta<typeof PollsManager> = {
  title: 'Admin/PollsManager',
  component: PollsManager,
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
type Story = StoryObj<typeof PollsManager>;

const MOCK_ACTIVE_POLL = {
    id: 1,
    title: '¿Qué evento prefieren para el fin de semana?',
    question: 'Estamos planeando el próximo evento comunitario y queremos saber qué prefieren jugar.',
    options: [
        { id: 1, label: 'Torneo PvP', votes: 150, percent: 45 },
        { id: 2, label: 'Carrera de Botes', votes: 80, percent: 24 },
        { id: 3, label: 'Concurso de Construcción', votes: 100, percent: 31 }
    ],
    closesIn: '2 días',
    totalVotes: 330,
    created_at: new Date().toISOString(),
    is_active: true
};

const MOCK_HISTORY = [
    { id: 10, title: 'Encuesta Anterior', question: 'Pregunta anterior', options: [], created_at: new Date(Date.now() - 86400000 * 10).toISOString(), totalVotes: 500, is_active: false },
    { id: 11, title: 'Feedback v1.0', question: 'Pregunta feedback', options: [], created_at: new Date(Date.now() - 86400000 * 20).toISOString(), totalVotes: 120, is_active: false }
];

export const Default: Story = {
    args: {
        mockActivePoll: MOCK_ACTIVE_POLL,
        mockHistoryPolls: MOCK_HISTORY
    }
};

export const NoActivePoll: Story = {
    args: {
        mockActivePoll: null,
        mockHistoryPolls: MOCK_HISTORY
    }
};

export const HistoryEmpty: Story = {
    args: {
        mockActivePoll: MOCK_ACTIVE_POLL,
        mockHistoryPolls: []
    }
};

export const CompletelyEmpty: Story = {
    args: {
        mockActivePoll: null,
        mockHistoryPolls: []
    }
};

export const Loading: Story = {
    // No mocks -> triggers loading state
};
