import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { apiFetch, setAuthToken, getAuthToken } from './api';
import type { Profile, UserRole } from '@/types/database';

interface AuthContextType {
  user: any | null;
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

// Demo mode: default user when server is not reachable
const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@nollycrew.com',
  first_name: 'Demo',
  last_name: 'User',
};

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
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialUser();
  }, []);

  async function loadInitialUser() {
    try {
      // Try to load user with existing token
      const data = await apiFetch('/auth/me');
      if (data.user) {
        setUser(data.user);
        setProfile(data.user);
        setRoles(data.roles || []);
        setLoading(false);
        return;
      }
    } catch {
      // Token expired or invalid
      setAuthToken(null);
    }
    // Fall back to demo mode
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setRoles(DEMO_ROLES);
    setLoading(false);
  }

  async function signUp(email: string, password: string, firstName: string, lastName: string) {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName, lastName, first_name: firstName, last_name: lastName }),
      });
      if (data.user) {
        setUser(data.user);
        setProfile(data.user);
        return { error: null };
      }
      return { error: { message: 'Registration failed' } };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.user) {
        setUser(data.user);
        setProfile(data.user);
        // Fetch roles
        try {
          const rolesData = await apiFetch('/profile/roles');
          setRoles(Array.isArray(rolesData) ? rolesData : []);
        } catch {
          setRoles([]);
        }
        return { error: null };
      }
      return { error: { message: 'Login failed' } };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  async function signOut() {
    setAuthToken(null);
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    setProfile(null);
    setRoles([]);
  }

  async function refreshProfile() {
    try {
      const data = await apiFetch('/auth/me');
      if (data.user) {
        setUser(data.user);
        setProfile(data.user);
        setRoles(data.roles || []);
      }
    } catch {
      // ignore
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
