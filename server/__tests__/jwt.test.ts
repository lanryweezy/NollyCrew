import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { sign, verify } from '../utils/jwt';

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

describe('JWT Utils', () => {
  const payload = { userId: '123' };
  const secret = 'test-secret';
  const token = 'mock-token';

  describe('sign', () => {
    it('should call jwt.sign with correct arguments', () => {
      vi.mocked(jwt.sign).mockReturnValue(token as any);

      const result = sign(payload, secret);

      expect(jwt.sign).toHaveBeenCalledWith(payload, secret, undefined);
      expect(result).toBe(token);
    });

    it('should pass options to jwt.sign', () => {
      const options = { expiresIn: '1h' };
      vi.mocked(jwt.sign).mockReturnValue(token as any);

      const result = sign(payload, secret, options);

      expect(jwt.sign).toHaveBeenCalledWith(payload, secret, options);
      expect(result).toBe(token);
    });
  });

  describe('verify', () => {
    it('should call jwt.verify with correct arguments', () => {
      vi.mocked(jwt.verify).mockReturnValue(payload as any);

      const result = verify(token, secret);

      expect(jwt.verify).toHaveBeenCalledWith(token, secret, undefined);
      expect(result).toEqual(payload);
    });

    it('should pass options to jwt.verify', () => {
      const options = { algorithms: ['HS256'] as any };
      vi.mocked(jwt.verify).mockReturnValue(payload as any);

      const result = verify(token, secret, options);

      expect(jwt.verify).toHaveBeenCalledWith(token, secret, options);
      expect(result).toEqual(payload);
    });

    it('should throw error if jwt.verify fails', () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verify(token, secret)).toThrow('Invalid token');
    });
  });
});
