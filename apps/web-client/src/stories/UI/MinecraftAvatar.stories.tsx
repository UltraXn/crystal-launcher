import type { Meta, StoryObj } from '@storybook/react-vite';
import MinecraftAvatar from '../../components/UI/MinecraftAvatar';

const meta = {
  title: 'UI/MinecraftAvatar',
  component: MinecraftAvatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A smart avatar component that handles:\n- **Skin Textures**: Crops the face from a raw skin texture URL (8x8 -> 64x64).\n- **Nicknames**: Uses `mc-heads.net` for standard usernames.\n- **Direct URLs**: Renders standard images directly.\n\n**Dimensions**: By default, it fills the parent container (100% width/height). Use the `size` prop to control quality/crop or CSS to constrain the container size.',
      },
    },
    backgrounds: {
        default: 'dark',
        values: [
            { name: 'dark', value: '#0b0c10' },
            { name: 'white', value: '#ffffff' },
        ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'number', min: 32, max: 256, step: 8 }, description: 'Base size for calculation/quality (not strict CSS size)' },
    src: { control: 'text', description: 'Username, Skin URL, or Image URL' },
  },
} satisfies Meta<typeof MinecraftAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Nickname based (uses mc-heads)
export const Nickname: Story = {
  args: {
    src: 'Notch',
    size: 120,
    alt: 'Notch Avatar',
  },
};

// 2. Direct Skin Texture URL (triggers the crop logic)
export const SkinTexture: Story = {
  args: {
    // Official skin texture example (Steve)
    src: 'http://textures.minecraft.net/texture/344933a2d21124621cba10364c6328394208e82f53488277252033c415392e62',
    size: 120,
    alt: 'Steve Skin Crop',
  },
};

export const CustomSkinNanurin: Story = {
  args: {
    // Nanurin's custom skin texture
    src: 'https://textures.minecraft.net/texture/1a4af718455d4aab528e7a61f86fa25e6a369d1768dcb13f7df319a713eb810b',
    size: 120,
    alt: 'Nanurin Skin Crop',
  },
};

// 3. Regular Image URL (like a discord avatar or uploaded image)
export const RegularImage: Story = {
  args: {
    src: 'https://cdn.discordapp.com/embed/avatars/0.png',
    size: 120,
    alt: 'Discord Default',
  },
};

// 4. Fallback (Invalid/Empty src)
export const Fallback: Story = {
  args: {
    src: '', // Should default to MHF_Steve
    size: 120,
  },
};
