import type { Meta, StoryObj } from '@storybook/react-vite';
import AnimatedCounter from '../../components/UI/AnimatedCounter';
import { useEffect, useState } from 'react';

const meta = {
  title: 'UI/AnimatedCounter',
  component: AnimatedCounter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number' },
    duration: { control: 'number' },
    decimals: { control: 'number' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
  },
} satisfies Meta<typeof AnimatedCounter>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper to allow triggering value changes for animation
const InteractiveWrapper = (args: any) => {
    const [val, setVal] = useState(0);
    
    useEffect(() => {
        // Trigger animation on mount
        setTimeout(() => setVal(args.value), 500);
    }, [args.value]);

    return (
        <div className="text-4xl font-bold text-white font-mono">
           <AnimatedCounter {...args} value={val} />
        </div>
    );
};

export const Default: Story = {
    args: {
        value: 100,
        duration: 1000,
    },
    render: (args) => <InteractiveWrapper {...args} />
};

export const Currency: Story = {
    args: {
        value: 1234.56,
        duration: 1500,
        decimals: 2,
        prefix: '$',
    },
    render: (args) => <InteractiveWrapper {...args} />
};

export const LargeNumber: Story = {
    args: {
        value: 9876543,
        duration: 2000,
        suffix: ' XP',
    },
    render: (args) => <InteractiveWrapper {...args} />
};
