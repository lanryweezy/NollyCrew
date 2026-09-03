import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projects, getAuthToken } from '../lib/api';

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return {
    ...actual,
    getAuthToken: vi.fn(),
  };
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthToken).mockReturnValue('mock-token');
  });

  describe('aiTools.analyzeScript', () => {
    it('should call apiFetch with correct parameters for happy path', async () => {
      const mockResponse = { scenes: 10, characters: ['Lead'] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const scriptText = 'Test script text';

      const result = await (await import('../lib/api')).aiTools.analyzeScript(scriptText);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ai/analyze-script',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ scriptText }),
        })
      );
    });

    it('should handle errors when the request fails gracefully', async () => {
      const errorMessage = 'Internal Server Error';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: errorMessage }),
      });

      const scriptText = 'Test script text';

      // The analyzeScript method catches errors and returns null
      const result = await (await import('../lib/api')).aiTools.analyzeScript(scriptText);
      expect(result).toBeNull();
    });
  });
});
