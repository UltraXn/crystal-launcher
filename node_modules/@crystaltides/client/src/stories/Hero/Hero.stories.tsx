import type { Meta, StoryObj } from '@storybook/react-vite';
import Hero from '../../components/Hero';

const meta = {
    title: 'Hero/Main',
    component: Hero,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock Slides
const MOCK_SLIDES = [
    {
        image: 'https://images.unsplash.com/photo-1607988795691-3d0147b43231?q=80&w=2070',
        title: 'Welcome to CrystalTides',
        text: 'An immersive Minecraft experience',
        buttonText: 'Join Now',
        link: '#'
    }
];

export const Default: Story = {
    args: {
        mockSlides: MOCK_SLIDES,
        mockPlayerCount: 125,
        mockIsOnline: true
    }
};

export const Offline: Story = {
    args: {
        mockSlides: MOCK_SLIDES,
        mockPlayerCount: 0,
        mockIsOnline: false
    }
};

export const LoadingStatus: Story = {
    args: {
        mockSlides: MOCK_SLIDES,
        // No status mocks -> triggers loading state logic (or fetch if not mocked)
    }
};
