import type { Meta, StoryObj } from '@storybook/react-vite';
import Hero from '../../components/Hero';
import { useEffect } from 'react';

const meta = {
  title: 'Home/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => <Story />,
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;
const mockSlides = [
    {
        image: 'https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072823_960_720.jpg',
        title: 'Welcome to CrystalTides',
        text: 'Adventure awaits!',
        buttonText: 'Join Now',
        link: '/play'
    }
];

export const Default: Story = {
    decorators: [
        (Story) => {
             // Mock fetch for settings and player count
             useEffect(() => {
                const originalFetch = window.fetch;
                window.fetch = async (input, init) => {
                    const url = typeof input === 'string' ? input : input.toString();
                    
                    if (url.includes('/settings')) {
                         return new Response(JSON.stringify({ 
                             hero_slides: JSON.stringify(mockSlides) 
                         }), { status: 200 });
                    }
                     if (url.includes('/minecraft/status')) {
                         return new Response(JSON.stringify({ 
                             online: true,
                             players: { online: 50, max: 100 }
                         }), { status: 200 });
                    }

                    return originalFetch(input, init);
                };
                return () => { window.fetch = originalFetch; };
            }, []);
            return <Story />;
        }
    ]
};
