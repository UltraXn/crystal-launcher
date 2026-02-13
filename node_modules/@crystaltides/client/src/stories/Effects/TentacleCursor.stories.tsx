import type { Meta, StoryObj } from '@storybook/react-vite';
import TentacleCursor from '../../components/Effects/TentacleCursor';

const meta: Meta<typeof TentacleCursor> = {
  title: 'Effects/TentacleCursor',
  component: TentacleCursor,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '100vh', background: '#ccc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <h1 className="text-black text-2xl font-bold">Move your mouse!</h1>
        <p className="text-gray-700">The custom cursor should follow you and point towards buttons.</p>
        
        <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Target 1</button>
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">Target 2</button>
        </div>

        <button className="px-8 py-4 bg-green-500 text-white rounded-lg font-bold text-xl shadow-lg hover:scale-110 transition cursor-pointer">
            Big Target
        </button>

        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TentacleCursor>;

export const Default: Story = {};
