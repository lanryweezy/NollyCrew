import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService, type User, type UserRole } from '../lib/auth';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorageMock.clear();
    // Reset auth service state
    (authService as any).token = null;
    (authService as any).user = null;
    (authService as any).roles = [];
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          isVerified: true
        },
        token: 'mockToken',
        roles: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const result = await authService.register(userData);

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('auth_token')).toBe('mockToken');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
    });

    it('should handle registration errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Email already exists' })
      });

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(authService.register(userData)).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          isVerified: true
        },
        token: 'mockToken',
        roles: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('auth_token')).toBe('mockToken');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
    });

    it('should handle login errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve(JSON.stringify({ error: 'Invalid credentials' }))
      });

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when authenticated', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isVerified: true
      };

      const mockRoles: UserRole[] = [
        {
          id: 'role1',
          userId: '123',
          role: 'actor',
          isActive: true
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser, roles: mockRoles })
      });

      // Set token first
      (authService as any).token = 'mockToken';

      const result = await authService.getCurrentUser();

      expect(result).toEqual({ user: mockUser, roles: mockRoles });
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
        headers: {
          'Authorization': 'Bearer mockToken',
        },
      });
    });

    it('should return null when not authenticated', async () => {
      const result = await authService.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should handle demo mode', async () => {
      // Set environment to demo mode
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'development' };

      const result = await authService.getCurrentUser();

      expect(result).not.toBeNull();
      expect(result?.user.firstName).toBe('Demo');
      expect(result?.roles.length).toBe(2);

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      (authService as any).token = 'mockToken';
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when no token', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return true in demo mode', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'development' };
      
      expect(authService.isAuthenticated()).toBe(true);
      
      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('logout', () => {
    it('should clear authentication data', () => {
      (authService as any).token = 'mockToken';
      (authService as any).user = { id: '123' } as User;
      (authService as any).roles = [{ id: 'role1' }] as UserRole[];
      
      localStorageMock.setItem('auth_token', 'mockToken');
      
      authService.logout();
      
      expect(authService.getToken()).toBeNull();
      expect(authService.getUser()).toBeNull();
      expect(authService.getRoles()).toEqual([]);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });
});import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService, type User, type UserRole } from '../lib/auth';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorageMock.clear();
    // Reset auth service state
    (authService as any).token = null;
    (authService as any).user = null;
    (authService as any).roles = [];
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          isVerified: true
        },
        token: 'mockToken',
        roles: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const result = await authService.register(userData);

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('auth_token')).toBe('mockToken');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
    });

    it('should handle registration errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Email already exists' })
      });

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(authService.register(userData)).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          isVerified: true
        },
        token: 'mockToken',
        roles: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('auth_token')).toBe('mockToken');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
    });

    it('should handle login errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve(JSON.stringify({ error: 'Invalid credentials' }))
      });

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when authenticated', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isVerified: true
      };

      const mockRoles: UserRole[] = [
        {
          id: 'role1',
          userId: '123',
          role: 'actor',
          isActive: true
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser, roles: mockRoles })
      });

      // Set token first
      (authService as any).token = 'mockToken';

      const result = await authService.getCurrentUser();

      expect(result).toEqual({ user: mockUser, roles: mockRoles });
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
        headers: {
          'Authorization': 'Bearer mockToken',
        },
      });
    });

    it('should return null when not authenticated', async () => {
      const result = await authService.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should handle demo mode', async () => {
      // Set environment to demo mode
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'development' };

      const result = await authService.getCurrentUser();

      expect(result).not.toBeNull();
      expect(result?.user.firstName).toBe('Demo');
      expect(result?.roles.length).toBe(2);

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      (authService as any).token = 'mockToken';
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when no token', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return true in demo mode', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'development' };
      
      expect(authService.isAuthenticated()).toBe(true);
      
      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('logout', () => {
    it('should clear authentication data', () => {
      (authService as any).token = 'mockToken';
      (authService as any).user = { id: '123' } as User;
      (authService as any).roles = [{ id: 'role1' }] as UserRole[];
      
      localStorageMock.setItem('auth_token', 'mockToken');
      
      authService.logout();
      
      expect(authService.getToken()).toBeNull();
      expect(authService.getUser()).toBeNull();
      expect(authService.getRoles()).toEqual([]);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });
});