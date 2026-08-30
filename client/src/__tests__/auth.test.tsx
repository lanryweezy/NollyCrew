import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth as authService } from '../lib/api';
import { User, UserRole } from '../../../shared/schema';

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
  });

  describe('signUp', () => {
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
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await authService.signUp('test@example.com', 'password123', 'Test', 'User');

      expect(result).toEqual({ user: mockResponse.user, error: null });
      expect(localStorage.getItem('nollycrew_token')).toBe('mockToken');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User', first_name: 'Test', last_name: 'User' }),
      });
    });

    it('should handle registration errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Email already exists' })
      });

      const result = await authService.signUp('test@example.com', 'password123', 'Test', 'User');
      expect(result.error).toBeDefined();
    });
  });

  describe('signIn', () => {
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
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result).toEqual({ user: mockResponse.user, error: null });
      expect(localStorage.getItem('nollycrew_token')).toBe('mockToken');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mockToken'
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
    });

    it('should handle login errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid credentials' })
      });

      const result = await authService.signIn('test@example.com', 'wrongpassword');
      expect(result.error).toBeDefined();
    });
  });

  describe('getUser', () => {
    it('should return user data when authenticated', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isVerified: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser })
      });

      localStorageMock.setItem('nollycrew_token', 'mockToken');

      const result = await authService.getUser();

      expect(result).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mockToken',
        },
      });
    });

    it('should return null when not authenticated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      });

      const result = await authService.getUser();
      expect(result).toBeNull();
    });
  });

  describe('getSession', () => {
    it('should return user session data', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser })
      });

      const result = await authService.getSession();
      expect(result).toEqual({ user: mockUser });
    });

    it('should return null when not authenticated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      });

      const result = await authService.getSession();
      expect(result).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should clear authentication data', async () => {
      localStorageMock.setItem('nollycrew_token', 'mockToken');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });
      
      await authService.signOut();
      
      expect(localStorage.getItem('nollycrew_token')).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    });
  });
});
