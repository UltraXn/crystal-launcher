import type { Meta, StoryObj } from '@storybook/react-vite';
import DonationFeed from '../../components/Widgets/DonationFeed';

const meta = {
  title: 'Widgets/DonationFeed',
  component: DonationFeed,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px', background: '#09090b', padding: '1rem', borderRadius: '12px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DonationFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Mock Data ---
const MOCK_DONATIONS = [
    {
        id: '1',
        from_name: 'SuperFan123',
        amount: 25,
        currency: 'USD',
        message: 'Keep up the great work!',
        created_at: new Date().toISOString(),
        is_public: true
    },
    {
        id: '2',
        from_name: 'Anonymous',
        amount: 5,
        currency: 'EUR',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        is_public: true
    },
    {
        id: '3',
        from_name: 'GamerGirl',
        amount: 100,
        currency: 'USD',
        message: 'For the server upgrade!',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        is_public: true
    }
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
    render: () => <DonationFeed /> // Without mock data, it defaults to loading/fetch
};
