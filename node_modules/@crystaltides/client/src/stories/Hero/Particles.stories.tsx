import type { Meta, StoryObj } from '@storybook/react-vite';
import HeroParticles from '../../components/Hero/Particles';

const meta = {
    title: 'Hero/Particles',
    component: HeroParticles,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' }
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ width: '100%', height: '500px', position: 'relative', background: '#0b0c10', overflow: 'hidden' }}>
                <Story />
            </div>
        )
    ]
} satisfies Meta<typeof HeroParticles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
