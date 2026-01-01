import type { Meta, StoryObj } from '@storybook/react-vite';
import StaffShowcase from '../../components/Home/StaffShowcase';
import { useEffect } from 'react';

// Mock Data
const mockStaffData = [
    {
        id: 1,
        name: 'Neroferno',
        mc_nickname: 'Neroferno',
        role: 'Neroferno',
        description: 'Creador y Owner de CrystalTides.',
        image: '',
        color: '#8b5cf6',
        socials: { twitter: 'neroferno', discord: 'neroferno', youtube: '', twitch: 'neroferno' }
    },
    {
        id: 2,
        name: 'Killuwu',
        mc_nickname: 'Killuwu',
        role: 'Killuwu',
        description: 'Administradora y Co-Owner.',
        image: '',
        color: '#0ea5e9',
        socials: { twitter: '', discord: 'killuwu', youtube: '', twitch: '' }
    },
    {
        id: 3,
        name: 'Nanurin',
        mc_nickname: 'nana_fubuki',
        role: 'Staff',
        description: 'Testing custom skin URL logic.',
        image: 'https://textures.minecraft.net/texture/1a4af718455d4aab528e7a61f86fa25e6a369d1768dcb13f7df319a713eb810b',
        color: '#db7700',
        socials: { twitter: '', discord: '', youtube: '', twitch: '' }
    },
    {
        id: 4,
        name: 'Steve',
        mc_nickname: 'Steve',
        role: 'Usuario',
        description: 'Un usuario normal del servidor.',
        image: '',
        color: '#555555',
        socials: { twitter: '', discord: '', youtube: '', twitch: '' }
    }
];

const mockOnlineStatus = [
    { username: 'Neroferno', mc_status: 'online', discord_status: 'online' },
    { username: 'Killuwu', mc_status: 'offline', discord_status: 'dnd' },
    { username: 'Nanurin', mc_status: 'online', discord_status: 'online' },
    { username: 'Steve', mc_status: 'online', discord_status: 'offline' }
];

const meta = {
  title: 'Admin/StaffShowcase',
  component: StaffShowcase,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StaffShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        mockStaff: mockStaffData,
        mockOnlineStatus: mockOnlineStatus.reduce((acc: any, curr: any) => ({ ...acc, [curr.username.toLowerCase()]: { mc: curr.mc_status, discord: curr.discord_status } }), {}),
        mockRecruitment: { status: 'true', link: 'https://google.com' }
    }
};

export const Loading: Story = {
    // No mocks -> triggers fetch loading
};

export const RecruitmentHidden: Story = {
    args: {
        mockStaff: mockStaffData,
        mockOnlineStatus: { 'Neroferno': { mc: 'online', discord: 'online' }, 'Killuwu': { mc: 'offline', discord: 'dnd' } },
        mockRecruitment: { status: 'false', link: '' }
    }
};

export const NoData: Story = {
    args: {
        mockStaff: []
    }
};
