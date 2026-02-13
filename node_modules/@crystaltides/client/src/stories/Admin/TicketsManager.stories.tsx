import type { Meta, StoryObj } from '@storybook/react-vite';
import TicketsManager from '../../components/Admin/TicketsManager';

const meta: Meta<typeof TicketsManager> = {
  title: 'Admin/TicketsManager',
  component: TicketsManager,
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
type Story = StoryObj<typeof TicketsManager>;

const MOCK_TICKETS = [
    {
        id: 101,
        user_id: 'user-1',
        subject: 'Cannot login to server',
        description: 'I try to join but get "Authentication Failed".',
        priority: 'high' as const,
        status: 'open' as const,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        profiles: { username: 'Gamer123', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gamer123' }
    },
    {
        id: 102,
        user_id: 'user-2',
        subject: 'Report: Hacker on BedWars',
        description: 'Player X is flying.',
        priority: 'urgent' as const,
        status: 'pending' as const,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        profiles: { username: 'JusticeSeeker', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Justice' }
    },
    {
        id: 103,
        user_id: 'user-3',
        subject: 'Refund request',
        description: 'Bought rank but did not receive it.',
        priority: 'medium' as const,
        status: 'resolved' as const,
        created_at: new Date(Date.now() - 400000000).toISOString(),
        profiles: { username: 'RichKid', avatar_url: '' }
    }
];

const MOCK_MESSAGES = {
    101: [
        { id: 1, user_id: 'user-1', message: 'I try to join but get "Authentication Failed".', is_staff: false, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 2, user_id: 'admin-1', message: 'Hello! Are you using the latest version of the client?', is_staff: true, created_at: new Date(Date.now() - 85000000).toISOString() },
        { id: 3, user_id: 'user-1', message: 'Yes, 1.20.1', is_staff: false, created_at: new Date(Date.now() - 84000000).toISOString() }
    ]
};

export const Default: Story = {
    args: {
        mockTickets: MOCK_TICKETS,
        mockMessages: MOCK_MESSAGES
    }
};

export const Empty: Story = {
    args: {
        mockTickets: []
    }
};

export const Loading: Story = {
    // No mockTickets provided, so it will try to fetch (and spin)
};
