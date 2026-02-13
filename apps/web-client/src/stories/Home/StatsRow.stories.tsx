import type { Meta, StoryObj } from '@storybook/react-vite';
import StatsRow from '../../components/Home/StatsRow';

const meta = {
    title: 'Home/StatsRow',
    component: StatsRow,
    parameters: {
        layout: 'padded',
        backgrounds: { default: 'dark' }
    },
    tags: ['autodocs'],
} satisfies Meta<typeof StatsRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        mockStats: {
            discord: 1234,
            registered: 5678,
            years: 2,
            staff: 15
        }
    }
};

export const LoadingOrEmpty: Story = {
    args: {
        mockStats: {
            discord: 0,
            registered: 0,
            years: 0,
            staff: 0
        }
    }
};
