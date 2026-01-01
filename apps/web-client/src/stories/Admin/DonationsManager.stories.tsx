import type { Meta, StoryObj } from '@storybook/react-vite';
import DonationsManager from '../../components/Admin/DonationsManager';

const meta: Meta<typeof DonationsManager> = {
  title: 'Admin/DonationsManager',
  component: DonationsManager,
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
type Story = StoryObj<typeof DonationsManager>;

const MOCK_DONATIONS = [
    { id: 1, amount: 50.00, currency: 'USD', from_name: 'SuperFan', message: 'Love the server!', is_public: true, buyer_email: 'fan@mail.com', created_at: new Date().toISOString() },
    { id: 2, amount: 10.00, currency: 'EUR', from_name: 'Anonymous', message: '', is_public: false, buyer_email: 'anon@mail.com', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, amount: 100.00, currency: 'USD', from_name: 'WhaleGamer', message: 'Keep it up!', is_public: true, buyer_email: 'whale@mail.com', created_at: new Date(Date.now() - 172800000).toISOString() }
];

export const Default: Story = {
    args: {
        mockDonations: MOCK_DONATIONS
    }
};

export const Empty: Story = {
    args: {
        mockDonations: []
    }
};

export const Loading: Story = {
    // Falls back to loading state
};
