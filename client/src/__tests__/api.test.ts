import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../lib/api';
import { authService } from '../lib/auth';

vi.mock('../lib/auth', () => ({
  authService: {
    getToken: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
  });

  describe('analyzeProjectScriptStart', () => {
    it('should call apiFetch with correct parameters for happy path', async () => {
      const mockResponse = { jobId: 'job-123', status: 'pending', message: 'Analysis started' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const projectId = 'project-456';
      const payload = { scriptUrl: 'https://example.com/script.pdf' };

      const result = await api.analyzeProjectScriptStart(projectId, payload);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/projects/${projectId}/script/analyze`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });

    it('should handle errors when the request fails', async () => {
      const errorMessage = 'Internal Server Error';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: errorMessage }),
      });

      const projectId = 'project-456';
      const payload = { scriptText: 'Some script content' };

      await expect(api.analyzeProjectScriptStart(projectId, payload)).rejects.toThrow(errorMessage);
    });
  });
});
