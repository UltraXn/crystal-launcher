import type { Meta, StoryObj } from '@storybook/react-vite';
import WikiManager from '../../components/Admin/WikiManager';

const meta: Meta<typeof WikiManager> = {
  title: 'Admin/WikiManager',
  component: WikiManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 p-8 min-h-screen text-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WikiManager>;

const MOCK_ARTICLES = [
    { id: 1, title: 'Comandos Básicos', slug: 'comandos-basicos', category: 'Comandos', content: 'Lista de comandos para usuarios...', author_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, title: 'Sistema de Economía', slug: 'economia', category: 'Economía', content: 'Cómo funciona el dinero en el servidor...', author_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, title: 'Protección de Terrenos', slug: 'protecciones', category: 'Mecánicas', content: 'Guía para proteger tu casa...', author_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, title: 'Rangos VIP', slug: 'rangos', category: 'Rangos', content: 'Beneficios de los rangos...', author_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const Default: Story = {
    args: {
        mockArticles: MOCK_ARTICLES
    }
};

export const Empty: Story = {
    args: {
        mockArticles: []
    }
};

export const Loading: Story = {
    // No mock -> Loading
};
