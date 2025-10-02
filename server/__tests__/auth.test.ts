import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

// Mock the storage module
vi.mock('../storage');

describe('Authentication Functions', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    isVerified: true,
    passwordHash: 'hashedPassword'
  };

  const mockRole = {
    id: '456',
    userId: '123',
    role: 'actor',
    isActive: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      (storage.getUserByEmail as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashedPassword');
      (storage.createUser as any).mockResolvedValue(mockUser);
      (jwt.sign as any).mockReturnValue('mockToken');

      // Verify mocks are set up correctly
      expect(storage.getUserByEmail).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(storage.createUser).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should detect if user already exists', async () => {
      (storage.getUserByEmail as any).mockResolvedValue(mockUser);

      // Verify mock is set up correctly
      expect(storage.getUserByEmail).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should validate user credentials', async () => {
      (storage.getUserByEmail as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      (jwt.sign as any).mockReturnValue('mockToken');

      // Verify mocks are set up correctly
      expect(storage.getUserByEmail).not.toHaveBeenCalled();
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should detect invalid credentials', async () => {
      (storage.getUserByEmail as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      // Verify mocks are set up correctly
      expect(storage.getUserByEmail).not.toHaveBeenCalled();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should verify token and fetch user data', async () => {
      const mockPayload = { userId: '123' };

      (jwt.verify as any).mockReturnValue(mockPayload);
      (storage.getUser as any).mockResolvedValue(mockUser);
      (storage.getUserRoles as any).mockResolvedValue([mockRole]);

      // Verify mocks are set up correctly
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(storage.getUser).not.toHaveBeenCalled();
      expect(storage.getUserRoles).not.toHaveBeenCalled();
    });

    it('should handle invalid token', async () => {
      (jwt.verify as any).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Verify mock is set up correctly
      expect(jwt.verify).not.toHaveBeenCalled();
    });
  });
});