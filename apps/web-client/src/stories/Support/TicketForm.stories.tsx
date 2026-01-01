import type { Meta, StoryObj } from '@storybook/react-vite';
import TicketForm from '../../components/Support/TicketForm';
import { fn } from '@storybook/test';

const meta: Meta<typeof TicketForm> = {
  title: 'Support/TicketForm',
  component: TicketForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ background: 'rgba(0,0,0,0.8)', padding: '2rem', height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onClose: fn(),
    onSubmit: fn(async (data) => {
        await new Promise(r => setTimeout(r, 2000));
        console.log("Submitted ticket:", data);
        alert(`Ticket created: ${data.title}`);
    })
  }
};

export default meta;
type Story = StoryObj<typeof TicketForm>;

export const Default: Story = {};

export const ErrorState: Story = {
    args: {
        onSubmit: fn(async () => {
            await new Promise(r => setTimeout(r, 1000));
            throw new Error("Simulated API failure");
        })
    }
};
