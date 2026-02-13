import type { Meta, StoryObj } from '@storybook/react-vite';
import AuditLog from '../../components/Admin/AuditLog';

const meta: Meta<typeof AuditLog> = {
  title: 'Admin/AuditLog',
  component: AuditLog,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ background: '#09090b', padding: '2rem', minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AuditLog>;

const MOCK_LOGS = [
    { id: '1', created_at: new Date().toISOString(), username: 'Staff', action: 'BAN_USER', details: 'Banned user "Hacker123" for fly hacking', source: 'web' as const },
    { id: '2', created_at: new Date(Date.now() - 3600000).toISOString(), username: 'Console', action: 'SERVER_RESTART', details: 'Scheduled restart', source: 'game' as const },
    { id: '3', created_at: new Date(Date.now() - 7200000).toISOString(), username: 'BuilderBob', action: 'CREATE_WARP', details: 'Created warp "spawn"', source: 'game' as const },
    { id: '4', created_at: new Date(Date.now() - 10800000).toISOString(), username: 'AdminAlice', action: 'UPDATE_CONFIG', details: 'Changed site settings', source: 'web' as const },
    { id: '5', created_at: new Date(Date.now() - 14400000).toISOString(), username: 'System', action: 'AUTO_BACKUP', details: 'Backup completed successfully', source: 'web' as const },
];

export const Default: Story = {
    args: {
        mockLogs: MOCK_LOGS,
        mockTotal: 50
    }
};

export const Empty: Story = {
    args: {
        mockLogs: [],
        mockTotal: 0
    }
};

export const Loading: Story = {
    render: () => <AuditLog /> // Defaults to loading if no mocks provided (and fetching logic spins)
};
