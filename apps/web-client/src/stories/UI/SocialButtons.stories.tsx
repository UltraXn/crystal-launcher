import type { Meta, StoryObj } from '@storybook/react-vite';
import DiscordButton from '../../components/UI/DiscordButton';
import TwitchButton from '../../components/UI/TwitchButton';
import TwitterButton from '../../components/UI/TwitterButton';

const meta = {
  title: 'UI/SocialButtons',
  component: DiscordButton, // Default wrapper
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="border border-white/10 p-4 rounded-xl inline-block">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiscordButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const SingleDecorator = (Story: any) => (
    <div className="w-full max-w-[400px]">
        <Story />
    </div>
);

// Discord
export const Discord: Story = {
    render: () => <DiscordButton />,
    decorators: [SingleDecorator]
};

// Twitch
export const Twitch: StoryObj<typeof TwitchButton> = {
    render: () => <TwitchButton />,
    decorators: [SingleDecorator]
};

// Twitter
export const Twitter: StoryObj<typeof TwitterButton> = {
    render: () => <TwitterButton />,
    decorators: [SingleDecorator]
};

// All (Grouped)
export const All: Story = {
    render: () => (
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-5xl">
            <div className="flex-1"><DiscordButton /></div>
            <div className="flex-1"><TwitchButton /></div>
            <div className="flex-1"><TwitterButton /></div>
        </div>
    )
};
