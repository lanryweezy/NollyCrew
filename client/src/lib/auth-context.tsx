import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { profiles, userRoles } from './api';
import type { Profile, UserRole } from '@/types/database';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  roles: UserRole[];
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo mode: default user when Supabase is not configured
const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@nollycrew.com',
  user_metadata: { first_name: 'Demo', last_name: 'User' },
} as User;

const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  email: 'demo@nollycrew.com',
  first_name: 'Demo',
  last_name: 'User',
  avatar: null,
  bio: 'Demo account for exploring NollyCrew',
  location: 'Lagos, Nigeria',
  phone: null,
  website: null,
  is_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_ROLES: UserRole[] = [{
  id: 'demo-role',
  user_id: 'demo-user',
  role: 'producer',
  specialties: null,
  experience: '10+ years',
  hourly_rate: null,
  availability: 'available',
  portfolio: [],
  skills: ['Directing', 'Producing'],
  languages: ['English', 'Yoruba'],
  awards: [],
  credits: [],
  is_active: true,
  created_at: new Date().toISOString(),
}];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Demo mode
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setRoles(DEMO_ROLES);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setRoles([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      const [profileData, rolesData] = await Promise.all([
        profiles.get(userId),
        userRoles.get(userId)
      ]);
      setProfile(profileData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, firstName: string, lastName: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } }
    });
    return { error };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRoles([]);
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id);
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      roles,
      loading,
      isAuthenticated: !!user,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Outside provider - return demo defaults
    return {
      user: DEMO_USER,
      profile: DEMO_PROFILE,
      roles: DEMO_ROLES,
      loading: false,
      isAuthenticated: true,
      signUp: async () => ({ error: null }),
      signIn: async () => ({ error: null }),
      signOut: async () => {},
      refreshProfile: async () => {},
    };
  }
  return context;
}
