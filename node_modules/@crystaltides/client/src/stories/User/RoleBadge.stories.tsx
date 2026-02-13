import type { Meta, StoryObj } from '@storybook/react-vite';
import RoleBadge from '../../components/User/RoleBadge';

const meta = {
    title: 'User/RoleBadge',
    component: RoleBadge,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' }
    },
    tags: ['autodocs'],
    // Define argTypes to help controls
    argTypes: {
        role: {
            control: { type: 'select' },
            options: ['Founder', 'Admin', 'Mod', 'Helper', 'Builder', 'MVP+', 'MVP', 'VIP+', 'VIP', 'User']
        }
    }
} satisfies Meta<typeof RoleBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Founder: Story = {
    args: {
        role: 'Founder'
    }
};

export const Admin: Story = {
    args: {
        role: 'Admin'
    }
};

export const User: Story = {
    args: {
        role: 'User'
    }
};
