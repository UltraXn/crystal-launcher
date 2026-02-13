import type { Meta, StoryObj } from '@storybook/react-vite';
import SkinViewer from '../../components/User/SkinViewer';

const meta = {
    title: 'User/SkinViewer',
    component: SkinViewer,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' }
    },
    tags: ['autodocs'],
} satisfies Meta<typeof SkinViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        username: 'Neroferno'
    }
};

export const HeadOnly: Story = {
    args: {
        username: 'Steve',
        width: 100,
        height: 100
        // headOnly is not supported by this component yet
    }
};

export const CustomSize: Story = {
    args: {
        username: 'Alex',
        width: 200,
        height: 300
    }
};
