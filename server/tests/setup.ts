// Test setup file
import { jest } from '@jest/globals';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

// Mock crypto for UUID generation
global.crypto = {
  randomUUID: () => 'test-uuid-1234'
} as any;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);
