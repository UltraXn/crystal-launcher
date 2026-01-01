import type { Meta, StoryObj } from '@storybook/react-vite';
import PollDisplay from '../../components/Forum/PollDisplay';

const meta = {
    title: 'Forum/PollDisplay',
    component: PollDisplay,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' }
    },
    tags: ['autodocs'],
    args: {
        refreshPoll: () => console.log('refreshPoll called'),
        onVote: async (id) => console.log('onVote called with', id)
    }
} satisfies Meta<typeof PollDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

const MOCK_POLL = {
    id: '1',
    question: 'What is your favorite gamemode?',
    options: [
        { id: 'opt1', label: 'Survival', percent: 60, votes: 300 },
        { id: 'opt2', label: 'Skyblock', percent: 25, votes: 125 },
        { id: 'opt3', label: 'PVP', percent: 15, votes: 75 }
    ],
    totalVotes: 500,
    closesIn: '2 días'
};

export const Default: Story = {
    args: {
        poll: MOCK_POLL
    }
};

export const DiscordPoll: Story = {
    args: {
        poll: {
            id: '2',
            question: 'Discord Poll',
            discord_link: 'https://discord.gg/example',
            options: [],
            totalVotes: 0,
            closesIn: 'Unknown'
        }
    }
};

export const Closed: Story = {
    args: {
        poll: {
            ...MOCK_POLL,
            closesIn: 'Finalizada'
        }
    }
};

export const LoadingOrNull: Story = {
    args: {
        poll: null
    }
};
