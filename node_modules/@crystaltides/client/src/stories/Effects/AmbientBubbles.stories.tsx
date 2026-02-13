import type { Meta, StoryObj } from '@storybook/react-vite';
import AmbientBubbles from '../../components/Effects/AmbientBubbles';

const meta: Meta<typeof AmbientBubbles> = {
  title: 'Effects/AmbientBubbles',
  component: AmbientBubbles,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '100vh', background: 'linear-gradient(to bottom, #09090b, #1a1a2e)', position: 'relative', overflow: 'hidden' }}>
        <Story />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', zIndex: 10 }}>
            <h1 className="text-4xl font-bold">Ambient Content</h1>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AmbientBubbles>;

export const Default: Story = {};
