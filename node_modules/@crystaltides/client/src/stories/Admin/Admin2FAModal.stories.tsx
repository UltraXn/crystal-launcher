import type { Meta, StoryObj } from '@storybook/react-vite';
import Admin2FAModal from '../../components/Admin/Admin2FAModal';
import { fn } from '@storybook/test';

const meta: Meta<typeof Admin2FAModal> = {
  title: 'Admin/Admin2FAModal',
  component: Admin2FAModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    onVerified: fn(),
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Admin2FAModal>;

export const Open: Story = {
    args: {
        isOpen: true,
    },
    decorators: [
        (Story) => (
            <div style={{ height: '100vh', backgroundImage: 'url(/images/backgrounds/home-bg.webp)', backgroundSize: 'cover' }}>
                <Story />
            </div>
        )
    ]
};

export const Closed: Story = {
    args: {
        isOpen: false,
    },
};
