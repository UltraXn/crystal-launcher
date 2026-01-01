import type { Meta, StoryObj } from '@storybook/react-vite';
import SocialSidebar from '../../components/Layout/SocialSidebar';
import { MemoryRouter } from 'react-router-dom';

const meta = {
  title: 'Layout/SocialSidebar',
  component: SocialSidebar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minHeight: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SocialSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultOnHome: Story = {
    decorators: [
        (Story) => (
           <MemoryRouter initialEntries={['/']}>
             <Story />
             <p className="text-white mt-4">Scroll down to see the sidebar (simulated in story via js if needed, but logic is scroll-based)</p>
           </MemoryRouter>
        )
    ]
};

export const OnOtherPage: Story = {
    decorators: [
        (Story) => (
           <MemoryRouter initialEntries={['/forum']}>
             <Story />
           </MemoryRouter>
        )
    ]
};
