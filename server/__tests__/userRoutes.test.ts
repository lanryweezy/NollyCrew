import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import { registerRoutes } from '../routes';
import { storage } from '../storage';
import * as jwt from 'jsonwebtoken';

// Mock storage functions
vi.mock('../storage');

describe('User Routes', () => {
  let app: Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    await registerRoutes(app);
  });

  describe('GET /api/auth/me', () => {
    it('should return user data when authenticated', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      };

      const mockRoles = [
        {
          id: '456',
          userId: '123',
          role: 'actor',
          isActive: true
        }
      ];

      // Mock JWT verification
      (jwt.verify as any).mockReturnValue({ userId: '123' });
      (storage.getUser as any).mockResolvedValue(mockUser);
      (storage.getUserRoles as any).mockResolvedValue(mockRoles);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer mockToken')
        .expect(200);

      expect(response.body).toEqual({
        user: mockUser,
        roles: mockRoles
      });
    });
  });

  describe('POST /api/users/:userId/roles', () => {
    it('should create a new user role', async () => {
      const mockRole = {
        id: '456',
        userId: '123',
        role: 'actor',
        isActive: true
      };

      // Mock JWT verification
      (jwt.verify as any).mockReturnValue({ userId: '123' });
      (storage.getUser as any).mockResolvedValue({ id: '123' });
      (storage.getUserRoles as any).mockResolvedValue([]);
      (storage.createUserRole as any).mockResolvedValue(mockRole);

      const response = await request(app)
        .post('/api/users/123/roles')
        .set('Authorization', 'Bearer mockToken')
        .send({
          role: 'actor',
          experience: '5 years'
        })
        .expect(201);

      expect(response.body).toEqual({
        role: mockRole
      });
    });

    it('should return error if user already has this role', async () => {
      // Mock JWT verification
      (jwt.verify as any).mockReturnValue({ userId: '123' });
      (storage.getUser as any).mockResolvedValue({ id: '123' });
      (storage.getUserRoles as any).mockResolvedValue([
        {
          id: '456',
          userId: '123',
          role: 'actor',
          isActive: true
        }
      ]);

      const response = await request(app)
        .post('/api/users/123/roles')
        .set('Authorization', 'Bearer mockToken')
        .send({
          role: 'actor',
          experience: '5 years'
        })
        .expect(400);

      expect(response.body).toEqual({
        error: 'User already has this role'
      });
    });
  });
});