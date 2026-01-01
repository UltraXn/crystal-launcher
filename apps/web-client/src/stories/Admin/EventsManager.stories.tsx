import type { Meta, StoryObj } from '@storybook/react-vite';
import EventsManager from '../../components/Admin/EventsManager';

const meta: Meta<typeof EventsManager> = {
  title: 'Admin/EventsManager',
  component: EventsManager,
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
type Story = StoryObj<typeof EventsManager>;

const MOCK_EVENTS = [
    { 
        id: 1, 
        title: 'Torneo de Spleef', 
        description: 'El clásico torneo de romper bloques llega este fin de semana. ¡Premios increíbles!', 
        type: 'hammer', 
        status: 'soon',
        registrations: new Array(5).fill(null) // abstract representation
    },
    { 
        id: 2, 
        title: 'Dungeon Run Pro', 
        description: 'Carrera contra el tiempo en la nueva dungeon mítica.', 
        type: 'running', 
        status: 'active',
        registrations: new Array(12).fill(null)
    },
    { 
        id: 3, 
        title: 'Búsqueda del Tesoro', 
        description: 'Pistas escondidas por todo el spawn. ¿Podrás encontrarlas todas?', 
        type: 'map', 
        status: 'finished',
        registrations: new Array(20).fill(null)
    }
];

const MOCK_REGISTRATIONS_MAP = {
    1: [
        { id: 101, created_at: new Date().toISOString(), profiles: { username: 'GamerOne', avatar_url: '' } },
        { id: 102, created_at: new Date().toISOString(), profiles: { username: 'ProBuilder', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProBuilder' } },
        { id: 103, created_at: new Date().toISOString(), profiles: { username: 'NoobMaster', avatar_url: '' } }
    ],
    2: [
         { id: 201, created_at: new Date().toISOString(), profiles: { username: 'SpeedRunner', avatar_url: '' } }
    ]
};

export const Default: Story = {
    args: {
        mockEvents: MOCK_EVENTS,
        mockRegistrationsMap: MOCK_REGISTRATIONS_MAP
    }
};

export const Empty: Story = {
    args: {
        mockEvents: [],
        mockRegistrationsMap: {}
    }
};

export const Loading: Story = {
    // No mocks -> triggers loading
};
