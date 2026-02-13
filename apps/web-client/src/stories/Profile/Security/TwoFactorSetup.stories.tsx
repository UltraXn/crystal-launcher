import type { Meta, StoryObj } from '@storybook/react-vite';
import TwoFactorSetup from '../../../components/Profile/Security/TwoFactorSetup';

const meta = {
    title: 'Profile/Security/TwoFactorSetup',
    component: TwoFactorSetup,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' }
    },
    tags: ['autodocs'],
    args: {
        onSetup: async () => {
            await new Promise(r => setTimeout(r, 1000));
            return { 
                success: true, 
                data: { secret: 'JBSWY3DPEHPK3PXP', qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=example' } 
            };
        },
        onEnable: async () => {
            await new Promise(r => setTimeout(r, 1000));
            return { success: true };
        },
        onDisable: async () => {
            await new Promise(r => setTimeout(r, 1000));
            return { success: true };
        }
    }
} satisfies Meta<typeof TwoFactorSetup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        mockEnabled: false,
        mockLoading: false
    }
};

export const Loading: Story = {
    args: {
        mockEnabled: false,
        mockLoading: true
    }
};

export const Enabled: Story = {
    args: {
        mockEnabled: true,
        mockLoading: false
    }
};

export const SetupInProgress: Story = {
    args: {
        mockEnabled: false,
        mockLoading: false,
        mockSetupData: {
            secret: 'JBSWY3DPEHPK3PXP',
            qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/CrystalTides?secret=JBSWY3DPEHPK3PXP'
        }
    }
};
