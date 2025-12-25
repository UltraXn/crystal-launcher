import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

import { User, Provider, AuthResponse, OAuthResponse } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext) as AuthContextType;
};

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<AuthResponse['data']>;
    loginWithProvider: (provider: Provider) => Promise<OAuthResponse['data']>;
    logout: () => Promise<void>;
    register: (email: string, password: string, metadata?: Record<string, any>) => Promise<AuthResponse['data']>;
    updateUser: (data: Record<string, any>) => Promise<User | undefined>;
    loading: boolean;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Verificar sesión activa al inicio
        const checkSession = async () => {
            try {
                // Usar getUser() en lugar de getSession() para asegurar datos frescos del servidor (roles actualizados, etc)
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user ?? null);
            } catch (error) {
                console.error("Error verificando sesión:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // 2. Escuchar cambios de estado (Login, Logout, Token Refreshed) en tiempo real
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 3. Revalidación Inteligente (Móvil/Tab Focus)
    // Cuando el usuario vuelve a la pestaña, verificamos si sus permisos cambiaron en el servidor.
    useEffect(() => {
        const handleFocus = async () => {
            if (document.visibilityState === 'visible') {
                const { data: { user: freshUser } } = await supabase.auth.getUser();
                if (freshUser) {
                    setUser(freshUser); 
                }
            }
        };

        window.addEventListener('visibilitychange', handleFocus);
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('visibilitychange', handleFocus);
            window.removeEventListener('focus', handleFocus);
        }
    }, []);

    // 4. Auto-Sync Discord Username if missing or default
    useEffect(() => {
        if (!user) return;

        const syncDiscordProfile = async () => {
            const metadata = user.user_metadata || {};
            const emailName = user.email?.split('@')[0];

            // Check if username is missing or exactly matches email prefix (default behavior)
            // We use loose check or specific check. Here we check strict equality or if missing.
            if (!metadata.username || (emailName && metadata.username === emailName)) {
                
                const discordIdentity = user.identities?.find(id => id.provider === 'discord');

                if (discordIdentity && discordIdentity.identity_data) {
                    const globalName = discordIdentity.identity_data.custom_claims?.global_name;
                    const discordUser = discordIdentity.identity_data.full_name || discordIdentity.identity_data.name;
                    const newName = globalName || discordUser;

                    // If we found a valid Discord name and it's different from current
                    if (newName && newName !== metadata.username) {
                        console.log("Auto-syncing Discord username:", newName);
                        // We use supabase client directly to avoid circular dependency issues with 'updateUser'
                        const { data: { user: updatedUser } } = await supabase.auth.updateUser({
                            data: { username: newName }
                        });
                        
                        if (updatedUser) {
                            setUser(updatedUser);
                        }
                    }
                }
            }
        };

        syncDiscordProfile();
    }, [user]);

    // Función de Login
    const login = async (email: string, password: string): Promise<AuthResponse['data']> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    };

    // Función de Logout
    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setUser(null);
        }
    };

    // Función extra: Registro (Opcional, pero útil tenerla lista)
    // Función extra: Registro (Opcional, pero útil tenerla lista)
    const register = async (email: string, password: string, metadata: Record<string, any> = {}): Promise<AuthResponse['data']> => {
        // Ensure we send the correct production URL if we are not on localhost (forcing HTTPS for prod)
        const productionUrl = 'https://crystaltidessmp.net/login';
        const redirectUrl = window.location.hostname.includes('localhost') 
            ? window.location.origin + '/login' 
            : productionUrl;

        console.log("Registering with Email Redirect:", redirectUrl);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: redirectUrl
            }
        });
        if (error) throw error;
        return data;
    };

    const loginWithProvider = async (provider: Provider): Promise<OAuthResponse['data']> => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin + '/account'
            }
        });
        if (error) throw error;
        return data;
    };

    const updateUser = async (data: Record<string, any>): Promise<User | undefined> => {
        const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
            data: data
        });
        if (error) throw error;
        // Solo actualizamos el estado si tenemos un usuario válido de vuelta
        if (updatedUser) {
            setUser(updatedUser);
            return updatedUser;
        }
    };

    const value = {
        user,
        login,
        loginWithProvider,
        logout,
        register,
        updateUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
