import type { Meta, StoryObj } from '@storybook/react-vite';
import ProfileWall from '../../components/User/ProfileWall';

const meta = {
    title: 'User/ProfileWall',
    component: ProfileWall,
    parameters: {
        layout: 'padded',
        backgrounds: { default: 'dark' }
    },
    tags: ['autodocs'],
} satisfies Meta<typeof ProfileWall>;

export default meta;
type Story = StoryObj<typeof meta>;

const MOCK_COMMENTS = [
    {
        id: 1,
        content: 'Great server!',
        created_at: new Date().toISOString(),
        author_id: 'user1',
        profile_id: 'profile1',
        author: {
            username: 'Neroferno',
            avatar_url: '',
            role: 'Founder'
        }
    },
    {
        id: 2,
        content: 'Can someone help me with claims?',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        author_id: 'user2',
        profile_id: 'profile1',
        author: {
            username: 'NewPlayer',
            avatar_url: '',
            role: 'User'
        }
    }
];

export const Default: Story = {
    args: {
        profileId: '123',
        mockComments: MOCK_COMMENTS
    }
};

export const AdminView: Story = {
    args: {
        profileId: '123',
        isAdmin: true,
        mockComments: MOCK_COMMENTS
    }
};

export const Empty: Story = {
    args: {
        profileId: '123',
        mockComments: []
    }
};
