import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from './routes';
import { Server } from 'http';
import { storage } from './storage';
import bcrypt from 'bcryptjs';
import { sign, verify } from './utils/jwt.js';

// Mock the storage module
vi.mock('./storage', () => {
  const mockStorage = {
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
  };
  return { storage: mockStorage };
});

// Mock JWT
vi.mock('./utils/jwt.js', () => ({
  sign: vi.fn(),
  verify: vi.fn(),
}));

vi.mock('bcryptjs');

describe('Auth Routes', () => {
  let app: express.Express;
  let server: Server;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(() => {
    server.close();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if no data is sent', async () => {
      const response = await request(app).post('/api/auth/register').send({});
      expect(response.status).toBe(400);
    });

    it('should register a new user successfully', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'Password123', // Updated to meet password requirements
        firstName: 'Test',
        lastName: 'User',
      };

      (storage.getUserByEmail as any).mockResolvedValue(null);
      (storage.createUser as any).mockResolvedValue({ ...newUser, id: '1', passwordHash: 'hashedpassword' });
      (sign as any).mockReturnValue('mockToken');
      (bcrypt.hash as any).mockResolvedValue('hashedpassword');

      const response = await request(app).post('/api/auth/register').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('should return 400 if user already exists', async () => {
      const existingUser = {
        email: 'existing@example.com',
        password: 'Password123', // Updated to meet password requirements
        firstName: 'Existing',
        lastName: 'User',
      };

      (storage.getUserByEmail as any).mockResolvedValue(existingUser);

      const response = await request(app).post('/api/auth/register').send(existingUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User already exists with this email');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user successfully', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
        passwordHash: 'hashedPassword123', // Use a mock hash instead of bcrypt.hash
      };

      (storage.getUserByEmail as any).mockResolvedValue(user);
      (bcrypt.compare as any).mockImplementation((password, hash) => password === 'password123');
      (sign as any).mockReturnValue('mockToken');

      const response = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      (storage.getUserByEmail as any).mockResolvedValue(null);

      const response = await request(app).post('/api/auth/login').send({ email: 'wrong@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});