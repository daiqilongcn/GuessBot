import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Tables } from '../lib/types';

interface AuthContextType {
    user: User | null;
    profile: Tables<'profiles'> | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, username?: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    resetPassword: (email: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data);
    }, []);

    useEffect(() => {
        // Safety timeout: if loading isn't resolved in 10s, force it
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 10000);

        // Use onAuthStateChange with INITIAL_SESSION event (Supabase recommended pattern)
        // This avoids the race condition between getSession() and onAuthStateChange()
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, s) => {
                setSession(s);
                setUser(s?.user ?? null);
                if (s?.user) {
                    try {
                        await fetchProfile(s.user.id);
                    } catch (err) {
                        console.error('Failed to fetch profile:', err);
                    }
                } else {
                    setProfile(null);
                }
                // Always resolve loading state on any auth event
                setLoading(false);
                clearTimeout(timeout);
            }
        );

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, [fetchProfile]);

    const signUp = async (email: string, password: string, username?: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username: username || email.split('@')[0] },
            },
        });
        return { error: error as Error | null };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error as Error | null };
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
            },
        });
        return { error: error as Error | null };
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                loading,
                signUp,
                signIn,
                signInWithGoogle,
                resetPassword,
                signOut,
                isAdmin: profile?.is_admin ?? false,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
