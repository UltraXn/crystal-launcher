import type { Meta, StoryObj } from '@storybook/react-vite';
import SkinViewerComponent from '../../components/Widgets/SkinViewer';

const meta = {
  title: 'Widgets/SkinViewer',
  component: SkinViewerComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    skinUrl: { control: 'text' },
    width: { control: 'number' },
    height: { control: 'number' },
  },
} satisfies Meta<typeof SkinViewerComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        // Steve Skin URL (standard)
        skinUrl: 'https://textures.minecraft.net/texture/31f477eb18d6eeea3da2e64ca6113840e6c271816f19430c6c06a855964f48b0',
        width: 300,
        height: 400
    }
};

export const CustomSize: Story = {
    args: {
        skinUrl: 'https://textures.minecraft.net/texture/31f477eb18d6eeea3da2e64ca6113840e6c271816f19430c6c06a855964f48b0',
        width: 150,
        height: 200
    }
};
