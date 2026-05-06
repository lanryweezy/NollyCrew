process.env.JWT_SECRET = "test-secret";
import { beforeEach, afterEach, vi } from 'vitest';
import { db } from '../db';

// Mock database for tests
vi.mock('../db', () => {
  return {
    db: {
      query: {
        users: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
        userRoles: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
        projects: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
        jobs: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
      },
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    }
  };
});

// Mock storage
vi.mock('../storage', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    passwordHash: 'clerk-managed',
    isVerified: true,
  };

  return {
    storage: {
      getUser: vi.fn().mockResolvedValue(mockUser),
      getUserByEmail: vi.fn().mockResolvedValue(mockUser),
      createUser: vi.fn().mockResolvedValue(mockUser),
      updateUser: vi.fn().mockResolvedValue(mockUser),
      getUserRoles: vi.fn().mockResolvedValue([{ role: 'producer' }]),
      createUserRole: vi.fn().mockResolvedValue({ role: 'producer' }),
      updateUserRole: vi.fn().mockResolvedValue({ role: 'producer' }),
      deleteRole: vi.fn().mockResolvedValue(true),
      getProject: vi.fn().mockResolvedValue({ id: '1', title: 'Test Project', createdById: '1' }),
      getProjects: vi.fn().mockResolvedValue([{ id: '1', title: 'Test Project', createdById: '1' }]),
      createProject: vi.fn().mockResolvedValue({ id: '1', title: 'Test Project', createdById: '1' }),
      updateProject: vi.fn().mockResolvedValue({ id: '1', title: 'Test Project', createdById: '1' }),
      deleteProject: vi.fn().mockResolvedValue(true),
      getJob: vi.fn().mockResolvedValue({ id: '1', title: 'Test Job', postedById: '1' }),
      getJobs: vi.fn().mockResolvedValue([{ id: '1', title: 'Test Job', postedById: '1' }]),
      createJob: vi.fn().mockResolvedValue({ id: '1', title: 'Test Job', postedById: '1' }),
      updateJob: vi.fn().mockResolvedValue({ id: '1', title: 'Test Job', postedById: '1' }),
      deleteJob: vi.fn().mockResolvedValue(true),
      getJobApplication: vi.fn().mockResolvedValue({ id: '1', jobId: '1', applicantId: '1' }),
      getJobApplications: vi.fn().mockResolvedValue([{ id: '1', jobId: '1', applicantId: '1' }]),
      createJobApplication: vi.fn().mockResolvedValue({ id: '1', jobId: '1', applicantId: '1' }),
      updateJobApplication: vi.fn().mockResolvedValue({ id: '1', jobId: '1', applicantId: '1' }),
      getMessages: vi.fn().mockResolvedValue([]),
      createMessage: vi.fn().mockResolvedValue({ id: '1', senderId: '1', recipientId: '2', content: 'test' }),
      markMessageAsRead: vi.fn().mockResolvedValue(true),
      getUserReviews: vi.fn().mockResolvedValue([]),
      createReview: vi.fn().mockResolvedValue({ id: '1', rating: 5 }),
      getProjectMembers: vi.fn().mockResolvedValue([{ userId: '1', role: 'producer' }]),
      createProjectMember: vi.fn().mockResolvedValue({ userId: '1', role: 'producer' }),
      searchTalent: vi.fn().mockResolvedValue([]),
    }
  };
});

// Mock JWT - handle both import styles
vi.mock('jsonwebtoken', () => {
  const jwtMock = {
    sign: vi.fn(),
    verify: vi.fn(),
  };
  
  // For default import style: import jwt from 'jsonwebtoken'
  // And namespace import style: import * as jwt from 'jsonwebtoken'
  return {
    ...jwtMock,
    default: jwtMock
  };
});

// Mock bcrypt - handle default import style
vi.mock('bcryptjs', () => {
  const bcryptMock = {
    hash: vi.fn(),
    compare: vi.fn(),
  };
  
  return {
    ...bcryptMock,
    default: bcryptMock
  };
});

// Mock Clerk SDK
vi.mock('@clerk/clerk-sdk-node', () => {
  return {
    createClerkClient: vi.fn().mockReturnValue({
      verifyToken: vi.fn().mockResolvedValue({
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        image_url: 'https://example.com/image.png'
      }),
    }),
  };
});

// Mock authentication middleware directly
vi.mock('../middleware/auth.js', () => {
  return {
    authenticateWithClerk: vi.fn((req, res, next) => {
      req.user = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      };
      next();
    }),
  };
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.resetAllMocks();
});