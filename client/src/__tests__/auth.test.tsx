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
          first_name: 'Test',
          last_name: 'User',
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
        status: 400,
        text: () => Promise.resolve('Email already exists')
      });

      const result = await authService.signUp('test@example.com', 'password123', 'Test', 'User');
      expect(result.user).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe('signIn', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
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
          'Authorization': 'Bearer mockToken',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
    });

    it('should handle login errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Invalid credentials')
      });

      const result = await authService.signIn('test@example.com', 'wrongpassword');
      expect(result.user).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe('getUser', () => {
    it('should return user data when authenticated', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
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
          'Authorization': 'Bearer mockToken',
          'Content-Type': 'application/json',
        },
      });
    });

    it('should return null when not authenticated', async () => {
      mockFetch.mockRejectedValueOnce(new Error('unauthorized'));
      const result = await authService.getUser();
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
    });
  });
});
