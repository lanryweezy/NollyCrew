import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  phone?: string | null;
  website?: string | null;
  isVerified: boolean;
}

export interface UserRole {
  id: string;
  userId: string;
  role: 'actor' | 'crew' | 'producer';
  specialties?: string[] | null;
  experience?: string | null;
  hourlyRate?: string | null;
  availability?: string | null;
  portfolio?: any;
  skills?: string[] | null;
  languages?: string[] | null;
  awards?: any;
  credits?: any;
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  roles?: UserRole[];
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;
  private roles: UserRole[] = [];

  constructor() {
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    location?: string;
    phone?: string;
    website?: string;
  }): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const authData: AuthResponse = await response.json();
    this.setAuthData(authData);
    return authData;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const authData: AuthResponse = await response.json();
    this.setAuthData(authData);
    return authData;
  }

  async getCurrentUser(): Promise<{ user: User; roles: UserRole[] } | null> {
    if (!this.token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const data = await response.json();
      this.user = data.user;
      this.roles = data.roles || [];
      return { user: data.user, roles: data.roles };
    } catch (error) {
      console.error('Get current user error:', error);
      this.logout();
      return null;
    }
  }

  async addUserRole(roleData: {
    role: 'actor' | 'crew' | 'producer';
    specialties?: string[];
    experience?: string;
    hourlyRate?: string;
    availability?: string;
    portfolio?: any;
    skills?: string[];
    languages?: string[];
  }): Promise<UserRole> {
    if (!this.token || !this.user) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/users/${this.user.id}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add role');
    }

    const { role } = await response.json();
    this.roles.push(role);
    return role;
  }

  logout(): void {
    this.token = null;
    this.user = null;
    this.roles = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  getRoles(): UserRole[] {
    return this.roles;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  hasRole(role: 'actor' | 'crew' | 'producer'): boolean {
    return this.roles.some(r => r.role === role && r.isActive);
  }

  private setAuthData(authData: AuthResponse): void {
    this.token = authData.token;
    this.user = authData.user;
    this.roles = authData.roles || [];
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', authData.token);
    }
  }
}

export const authService = new AuthService();

// Custom hook for using auth in components
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authData = await authService.getCurrentUser();
        if (authData) {
          setUser(authData.user);
          setRoles(authData.roles);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const authData = await authService.login(email, password);
      setUser(authData.user);
      setRoles(authData.roles || []);
      setIsAuthenticated(true);
      return authData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: Parameters<typeof authService.register>[0]) => {
    try {
      const authData = await authService.register(userData);
      setUser(authData.user);
      setRoles(authData.roles || []);
      setIsAuthenticated(true);
      return authData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setRoles([]);
    setIsAuthenticated(false);
  };

  const addRole = async (roleData: Parameters<typeof authService.addUserRole>[0]) => {
    try {
      const newRole = await authService.addUserRole(roleData);
      setRoles(prev => [...prev, newRole]);
      return newRole;
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    roles,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    addRole,
    hasRole: (role: 'actor' | 'crew' | 'producer') => roles.some(r => r.role === role && r.isActive),
  };
}