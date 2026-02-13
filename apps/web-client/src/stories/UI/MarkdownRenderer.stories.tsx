import type { Meta, StoryObj } from '@storybook/react-vite';
import MarkdownRenderer from '../../components/UI/MarkdownRenderer';

const meta: Meta<typeof MarkdownRenderer> = {
  title: 'UI/MarkdownRenderer',
  component: MarkdownRenderer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="text-white bg-zinc-900 p-4 rounded-lg max-w-lg w-full">
        <Story />
      </div>
    ),
  ]
};

export default meta;
type Story = StoryObj<typeof MarkdownRenderer>;

export const Default: Story = {
    args: {
        content: 'This is **bold** and this is *italic*.',
    },
};

export const WithLinks: Story = {
    args: {
        content: 'Visit [CrystalTides](https://crystaltidesSMP.net) for more info or join our [Discord](https://discord.gg/example).',
    },
};

export const WithImages: Story = {
    args: {
        content: 'Check out this cool image:\n\n![Minecraft Image](https://cdn.pixabay.com/photo/2016/11/18/15/55/minecraft-1834750_640.jpg)\n\nAmazing, right?',
    },
};

export const Complex: Story = {
    args: {
        content: 'Welcome to **CrystalTides**!\n\nWe feature:\n- Custom [Plugins](https://example.com)\n- *Epic* Battles\n\n![Logo](https://via.placeholder.com/150)\n\nJoin us today!',
    },
};
