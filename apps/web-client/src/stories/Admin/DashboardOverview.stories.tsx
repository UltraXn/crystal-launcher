import type { Meta, StoryObj } from '@storybook/react-vite';
import DashboardOverview from '../../components/Admin/DashboardOverview';
import { AuthContext } from '../../context/AuthContext';
import { useEffect } from 'react';

// Mock Data
const mockStaffOnline = [
    {
        username: 'Neroferno',
        role: 'founder',
        avatar: 'Neroferno', // Will trigger mc-heads
        mc_status: 'online',
        discord_status: 'online',
        login_time: Date.now()
    },
    {
        username: 'Nanurin',
        role: 'staff',
        avatar: 'https://textures.minecraft.net/texture/1a4af718455d4aab528e7a61f86fa25e6a369d1768dcb13f7df319a713eb810b', // Custom Skin
        mc_status: 'online',
        discord_status: 'offline',
        login_time: Date.now()
    }
];

const mockServerStats = {
    status: 'running',
    memory: { current: 8192, limit: 16384 }, // 8GB / 16GB
    cpu: 45.5,
    online: 125, // Players
    total_players: 15420,
    new_players: 12,
    total_playtime_hours: 5400
};

const mockLiveStatus = {
    online: true,
    players: { online: 125, max: 500 }
};

const mockTicketStats = { open: 12, urgent: 3 };
const mockDonationStats = { currentMonth: "1,250.00", percentChange: 15 };

// Mock Auth Context
const mockAuth = {
    user: { id: 'test-user', email: 'admin@test.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' },
    login: async () => ({ user: null, session: null }),
    loginWithProvider: async () => ({ provider: 'google', url: null }),
    logout: async () => {},
    register: async () => ({ user: null, session: null }),
    updateUser: async () => undefined,
    loading: false
};

const meta = {
  title: 'Admin/DashboardOverview',
  component: DashboardOverview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main dashboard overview widget containing:\n- **Server Stats**: CPU/RAM/Players.\n- **Live Status**: Online/Offline indicator.\n- **Staff Online**: Widget showing active staff (supports custom skins).\n- **Revenue & Tickets**: Quick stat summaries.\n\n**Note**: This story mocks Supabase and Backend API calls.',
      },
    },
  },
  decorators: [
    (Story) => {
        // Mock Window Fetch
         useEffect(() => {
            const originalFetch = window.fetch;
            window.fetch = async (input, init) => {
                const url = typeof input === 'string' ? input : input.toString();
                
                // Server Resources
                if (url.includes('/server/resources')) {
                    return new Response(JSON.stringify({ success: true, data: mockServerStats }), { status: 200 });
                }
                // Live Status
                if (url.includes('/server/status/live')) {
                    return new Response(JSON.stringify({ success: true, data: mockLiveStatus }), { status: 200 });
                }
                // Staff Online
                if (url.includes('/server/staff')) {
                     return new Response(JSON.stringify({ success: true, data: mockStaffOnline }), { status: 200 });
                }
                // Tickets
                if (url.includes('/tickets/stats')) {
                     return new Response(JSON.stringify({ success: true, data: mockTicketStats }), { status: 200 });
                }
                // Donations
                if (url.includes('/donations/stats')) {
                     return new Response(JSON.stringify({ success: true, data: mockDonationStats }), { status: 200 });
                }

                return originalFetch(input, init);
            };
            return () => { window.fetch = originalFetch; };
        }, []);

      return (
        <AuthContext.Provider value={mockAuth}>
             <div style={{ padding: '2rem', background: '#0b0c10', minHeight: '100vh' }}>
                 <Story />
             </div>
        </AuthContext.Provider>
      );
    }
  ]
} satisfies Meta<typeof DashboardOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
    decorators: [
        (Story) => {
            useEffect(() => {
                const originalFetch = window.fetch;
                // Never resolve fetch to simulate loading
                window.fetch = async () => new Promise(() => {}); 
                return () => { window.fetch = originalFetch; };
            }, []);
            return <Story />;
        }
    ]
};

export const ServerOffline: Story = {
    decorators: [
         (Story) => {
            useEffect(() => {
                const originalFetch = window.fetch;
                window.fetch = async (input, _init) => {
                    const url = typeof input === 'string' ? input : input.toString();
                    if (url.includes('/server/resources') || url.includes('/server/status/live')) {
                        return new Response(JSON.stringify({ success: false, data: null }), { status: 200 });
                    }
                    // Fallback for others to avoid crash
                     return new Response(JSON.stringify({ success: true, data: [] }), { status: 200 });
                };
                return () => { window.fetch = originalFetch; };
            }, []);
            return <Story />;
        }
    ]
};
