import type { Meta, StoryObj } from '@storybook/react-vite';
import { KoFiButton } from '../../components/Widgets/KoFi';

const meta = {
  title: 'Widgets/KoFiButton',
  component: KoFiButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text' },
    kofiId: { control: 'text' }
  }
} satisfies Meta<typeof KoFiButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        text: 'Donate on Ko-Fi',
        kofiId: 'G2G03Y8FL'
    }
};

export const CustomText: Story = {
    args: {
        text: 'Support Us!',
        kofiId: 'ExampleID'
    }
};
