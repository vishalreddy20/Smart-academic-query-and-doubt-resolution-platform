import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/database.types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  connectionError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'faculty' | 'admin', inviteCode?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setConnectionError('Unable to connect to Supabase. Check VITE_SUPABASE_URL, network, and CORS (allowed origins).');
        setLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      setConnectionError(null);
    } catch (err: unknown) {
      console.error('Error loading profile:', err);
      setConnectionError('Failed to load profile. Check backend connection and that the profiles table exists.');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setConnectionError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || (err as any).name === 'TypeError') {
        throw new Error('Unable to connect to Supabase. Check VITE_SUPABASE_URL, network, and CORS (allowed origins).');
      }
      throw err;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'faculty' | 'admin', inviteCode?: string) => {
    // If creating an admin, validate invite code to avoid accidental admin creation
    if (role === 'admin') {
      const required = (import.meta.env.VITE_ADMIN_INVITE_CODE ?? '').toString().trim();
      const provided = (inviteCode ?? '').toString().trim();
      if (!required) throw new Error('Admin invite code is not configured on the client');
      if (!provided) throw new Error('Admin invite code is required to register as admin');
      if (provided !== required) throw new Error('Invalid admin invite code');
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('User creation failed');

      const { error: profileError } = await (supabase.from('profiles') as any)
        .insert([
          {
            id: data.user.id,
            email,
            full_name: fullName,
            role,
          },
        ]);

      if (profileError) throw profileError;
      setConnectionError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || (err as any).name === 'TypeError') {
        throw new Error('Unable to connect to Supabase. Check VITE_SUPABASE_URL, network, and CORS (allowed origins).');
      }
      throw err;
    }
  };


  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, connectionError, signIn, signUp, signOut }}>
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
