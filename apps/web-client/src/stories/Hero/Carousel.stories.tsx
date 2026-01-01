import type { Meta, StoryObj } from '@storybook/react-vite';
import HeroBackgroundCarousel from '../../components/Hero/Carousel';

const meta = {
    title: 'Hero/Carousel',
    component: HeroBackgroundCarousel,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof HeroBackgroundCarousel>;

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
    },
    {
        image: 'https://images.unsplash.com/photo-1587573088697-b4f9d1730902?q=80&w=2070',
        title: 'New Event!',
        text: 'Join our latest building contest',
        buttonText: 'Read More',
        link: '#'
    }
];

export const Default: Story = {
    args: {
        slides: MOCK_SLIDES
    }
};

export const StaticImages: Story = {
    args: {
        slides: [] // Should fall back to static internal list
    }
};
