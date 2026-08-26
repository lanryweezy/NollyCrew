import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth as authService } from '../lib/api';

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
        token: 'mockToken'
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

      const result = await authService.signUp(userData.email, userData.password, userData.firstName, userData.lastName);

      expect(result).toEqual({ user: mockResponse.user, error: null });
      expect(localStorage.getItem('nollycrew_token')).toBe('mockToken');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          first_name: userData.firstName,
          last_name: userData.lastName
        }),
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

      const result = await authService.signUp(userData.email, userData.password, userData.firstName, userData.lastName);
      expect(result.error).toEqual({ message: 'Email already exists' });
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
        token: 'mockToken'
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
          'Authorization': 'Bearer mockToken',
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
      expect(result.error).toEqual({ message: 'Invalid credentials' });
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
        json: () => Promise.resolve({ error: 'Not authenticated' })
      });
      const result = await authService.getUser();
      expect(result).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should clear authentication data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      localStorageMock.setItem('nollycrew_token', 'mockToken');
      
      await authService.signOut();
      
      expect(localStorage.getItem('nollycrew_token')).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });
  });
});
