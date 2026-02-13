import type { Meta, StoryObj } from '@storybook/react-vite';
import TypingBubbles from '../../components/Effects/TypingBubbles';

const meta: Meta<typeof TypingBubbles> = {
  title: 'Effects/TypingBubbles',
  component: TypingBubbles,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Start Typing!</h2>
        <p className="text-gray-400">Bubbles will appear from the bottom of the screen (Portal to body).</p>
        <input 
            type="text" 
            placeholder="Type here..." 
            className="mt-4 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-blue-500"
            autoFocus
        />
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TypingBubbles>;

export const Default: Story = {};
