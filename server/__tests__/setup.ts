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
  return {
    storage: {
      getUser: vi.fn(),
      getUserByEmail: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      getUserRoles: vi.fn(),
      createUserRole: vi.fn(),
      updateUserRole: vi.fn(),
      deleteRole: vi.fn(),
      getProject: vi.fn(),
      getProjects: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
      getJob: vi.fn(),
      getJobs: vi.fn(),
      createJob: vi.fn(),
      updateJob: vi.fn(),
      deleteJob: vi.fn(),
      getJobApplication: vi.fn(),
      getJobApplications: vi.fn(),
      createJobApplication: vi.fn(),
      updateJobApplication: vi.fn(),
      getMessages: vi.fn(),
      createMessage: vi.fn(),
      markMessageAsRead: vi.fn(),
      getUserReviews: vi.fn(),
      createReview: vi.fn(),
      getProjectMembers: vi.fn(),
      createProjectMember: vi.fn(),
      searchTalent: vi.fn(),
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

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.resetAllMocks();
});