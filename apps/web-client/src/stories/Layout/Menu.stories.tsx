import type { Meta, StoryObj } from '@storybook/react-vite';
import Menu from '../../components/Layout/Menu';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

const meta: Meta<typeof Menu> = {
  title: 'Layout/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '400px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '50px', background: '#09090b', width: '300px' }}>
        <Story />
        <p style={{ color: '#666', fontSize: '12px', marginTop: '20px', textAlign: 'center' }}>Click the bars icon to open menu</p>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Menu>;

// --- Mocks ---
const mockAuthContext = (user: User | null) => ({
    user,
    login: async () => ({ user, session: null }),
    loginWithProvider: async () => ({ session: null }),
    logout: async () => {},
    register: async () => ({ user, session: null }),
    updateUser: async () => undefined,
    loading: false
});

const mockUser = (role: string = 'user'): User => ({
    id: '123',
    app_metadata: {},
    user_metadata: { role, full_name: 'Test User' },
    aud: 'authenticated',
    created_at: new Date().toISOString()
});

export const Guest: Story = {
    decorators: [
        (Story) => (
            <AuthContext.Provider value={mockAuthContext(null)}>
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            </AuthContext.Provider>
        )
    ]
};

export const LoggedInUser: Story = {
    decorators: [
        (Story) => (
            <AuthContext.Provider value={mockAuthContext(mockUser('user'))}>
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            </AuthContext.Provider>
        )
    ]
};

export const AdminUser: Story = {
    decorators: [
        (Story) => (
            <AuthContext.Provider value={mockAuthContext(mockUser('admin'))}>
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            </AuthContext.Provider>
        )
    ]
};
