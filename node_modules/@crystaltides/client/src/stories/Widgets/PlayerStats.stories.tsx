import type { Meta, StoryObj } from '@storybook/react-vite';
import PlayerStats from '../../components/Widgets/PlayerStats';

const meta = {
  title: 'Widgets/PlayerStats',
  component: PlayerStats,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-[#0b0c10] p-6 rounded-xl max-w-4xl mx-auto">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayerStats>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Mock Data ---
const MOCK_STATS_PRO = {
    rank: 'Fundador',
    rank_image: 'rank-fundador.png',
    money: 1500000,
    playtime: '1240h 30m',
    member_since: '2023-01-01',
    kills: 1337,
    mob_kills: 50000,
    deaths: 12,
    blocks_mined: 1200000,
    blocks_placed: 850000,
};

const MOCK_STATS_NEWBIE = {
    rank: 'Miembro',
    rank_image: 'user.png',
    money: 100,
    playtime: '2h 15m',
    member_since: '2025-01-01',
    kills: 0,
    mob_kills: 5,
    deaths: 10,
    blocks_mined: 50,
    blocks_placed: 10,
};

export const Default: Story = {
    args: {
        statsData: MOCK_STATS_PRO,
        loading: false,
        error: null
    }
};

export const NewPlayer: Story = {
    args: {
        statsData: MOCK_STATS_NEWBIE,
        loading: false,
        error: null
    }
};

export const Loading: Story = {
    args: {
        statsData: null,
        loading: true,
        error: null
    }
};

export const ErrorState: Story = {
    args: {
        statsData: null,
        loading: false,
        error: 'Network Error'
    }
};
