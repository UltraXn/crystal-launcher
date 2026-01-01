import type { Meta, StoryObj } from '@storybook/react-vite';
import NewsForm from '../../components/Admin/NewsForm';
import { fn } from '@storybook/test';

const meta: Meta<typeof NewsForm> = {
  title: 'Admin/NewsForm',
  component: NewsForm,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 p-8 min-h-screen text-white">
        <div className="max-w-7xl mx-auto">
             <Story />
        </div>
      </div>
    ),
  ],
  args: {
    onSave: fn(async (data) => {
        await new Promise(r => setTimeout(r, 1000));
        console.log("Saved!", data);
    }),
    onCancel: fn(),
    user: { id: 'mock-user', email: 'admin@example.com' } as any
  }
};

export default meta;
type Story = StoryObj<typeof NewsForm>;

export const Create: Story = {
    args: {
        initialData: undefined
    }
};

export const Edit: Story = {
    args: {
        initialData: {
            id: 123,
            title: "Summer Event 2024",
            title_en: "Evento de Verano 2024",
            category: "Evento",
            content: "¡El evento ya está aquí! Disfruta de nuevos minijuegos.",
            content_en: "The event is here! Enjoy new minigames.",
            status: "Published",
            image: "https://via.placeholder.com/800x400.png?text=Event+Banner",
            author_id: "admin-1",
            author_name: "Admin"
        } as any // Cast to satisfy type if ID or fields differ slightly
    }
};
