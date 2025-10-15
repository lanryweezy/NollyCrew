import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  analyzeScriptWithAI,
  generateCastingRecommendations,
  optimizeScheduleWithAI,
  generateMarketingContent,
  extractTextFromPDF
} from '../ai';
import OpenAI from 'openai';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn()
        }
      },
      embeddings: {
        create: vi.fn()
      }
    }))
  };
});

// Mock pdf-parse
vi.mock('pdf-parse', () => ({
  default: vi.fn()
}));

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractTextFromPDF', () => {
    it('should extract text from PDF buffer', async () => {
      const mockPdfData = { text: 'Sample PDF text content' };
      (await import('pdf-parse')).default.mockResolvedValue(mockPdfData);
      
      const buffer = Buffer.from('fake pdf content');
      const result = await extractTextFromPDF(buffer);
      
      expect(result).toBe('Sample PDF text content');
      expect((await import('pdf-parse')).default).toHaveBeenCalledWith(buffer);
    });

    it('should handle PDF parsing errors', async () => {
      (await import('pdf-parse')).default.mockRejectedValue(new Error('PDF parsing failed'));
      
      const buffer = Buffer.from('fake pdf content');
      
      await expect(extractTextFromPDF(buffer)).rejects.toThrow('Failed to parse PDF');
    });
  });

  describe('analyzeScriptWithAI', () => {
    it('should analyze script using OpenAI when API key is available', async () => {
      const mockAnalysis = {
        scenes: 5,
        sceneList: [
          {
            id: 'SCN-1',
            name: 'Opening Scene',
            location: 'Street',
            timeOfDay: 'Day',
            characters: ['John', 'Mary'],
            props: ['Car'],
            wardrobe: ['Casual'],
            vfx: []
          }
        ],
        characters: ['John', 'Mary'],
        locations: ['Street'],
        estimatedCrew: { director: 1, camera_operator: 2 },
        props: ['Car'],
        wardrobe: ['Casual'],
        vfx: [],
        analyzedAt: new Date().toISOString()
      };

      const openaiInstance = new OpenAI({ apiKey: 'test-key' });
      (openaiInstance.chat.completions.create as any).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockAnalysis)
          }
        }]
      });

      const scriptText = 'This is a sample script text for analysis.';
      const result = await analyzeScriptWithAI(scriptText);
      
      expect(result).toEqual(expect.objectContaining({
        scenes: 5,
        characters: ['John', 'Mary'],
        locations: ['Street']
      }));
    });

    it('should return mock analysis when OpenAI is not configured', async () => {
      // Temporarily remove OpenAI instance
      const originalOpenAI = (await import('../ai')).default;
      (await import('../ai')).default = null;
      
      const scriptText = 'This is a sample script text for analysis.';
      const result = await analyzeScriptWithAI(scriptText);
      
      expect(result).toHaveProperty('scenes');
      expect(result).toHaveProperty('sceneList');
      expect(result).toHaveProperty('characters');
      expect(result.analyzedAt).toBeDefined();
      
      // Restore OpenAI instance
      (await import('../ai')).default = originalOpenAI;
    });
  });

  describe('generateCastingRecommendations', () => {
    it('should generate casting recommendations with OpenAI', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const openaiInstance = new OpenAI({ apiKey: 'test-key' });
      (openaiInstance.embeddings.create as any).mockResolvedValue({
        data: [{ embedding: mockEmbedding }]
      });

      const role = 'Lead Actor';
      const requirements = 'Experienced dramatic actor, 30-40 years old';
      const candidates = [
        {
          id: '1',
          name: 'John Doe',
          bio: 'Experienced actor with 15 years in drama',
          skills: ['drama', 'comedy'],
          experience: '15 years',
          location: 'Lagos',
          availability: 'available',
          budget: 50000
        }
      ];

      const result = await generateCastingRecommendations(role, requirements, candidates);
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('userId');
      expect(result[0]).toHaveProperty('score');
      expect(result[0]).toHaveProperty('reasons');
    });

    it('should return mock recommendations when OpenAI is not configured', async () => {
      // Temporarily remove OpenAI instance
      const originalOpenAI = (await import('../ai')).default;
      (await import('../ai')).default = null;
      
      const role = 'Lead Actor';
      const requirements = 'Experienced dramatic actor, 30-40 years old';
      const candidates = [
        {
          id: '1',
          name: 'John Doe',
          bio: 'Experienced actor with 15 years in drama',
          skills: ['drama', 'comedy'],
          experience: '15 years',
          location: 'Lagos',
          availability: 'available',
          budget: 50000
        }
      ];

      const result = await generateCastingRecommendations(role, requirements, candidates);
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('userId', '1');
      expect(result[0]).toHaveProperty('score');
      
      // Restore OpenAI instance
      (await import('../ai')).default = originalOpenAI;
    });
  });

  describe('optimizeScheduleWithAI', () => {
    it('should optimize schedule using OpenAI', async () => {
      const mockOptimization = {
        days: [
          {
            day: 1,
            scenes: ['SCN-1', 'SCN-2'],
            totalDuration: 480,
            locations: ['Location A'],
            crewCall: '07:00',
            shootStart: '08:00',
            lunch: '12:00-13:00',
            wrap: '18:00'
          }
        ],
        totalDays: 5,
        estimatedCost: 500000,
        optimizationNotes: ['Optimized for location grouping']
      };

      const openaiInstance = new OpenAI({ apiKey: 'test-key' });
      (openaiInstance.chat.completions.create as any).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockOptimization)
          }
        }]
      });

      const scenes = [
        {
          id: 'SCN-1',
          name: 'Scene 1',
          location: 'Location A',
          timeOfDay: 'Day',
          duration: 120,
          characters: ['John'],
          props: ['Car'],
          wardrobe: ['Casual'],
          vfx: []
        }
      ];

      const constraints = {
        maxDays: 10,
        maxHoursPerDay: 12,
        locationCosts: { 'Location A': 10000 },
        daylightHours: { start: '08:00', end: '18:00' },
        crewAvailability: { director: ['2024-01-01'] }
      };

      const result = await optimizeScheduleWithAI(scenes, constraints);
      
      expect(result).toEqual(expect.objectContaining({
        totalDays: 5,
        estimatedCost: 500000
      }));
      expect(result.days).toHaveLength(1);
    });

    it('should return mock optimization when OpenAI is not configured', async () => {
      // Temporarily remove OpenAI instance
      const originalOpenAI = (await import('../ai')).default;
      (await import('../ai')).default = null;
      
      const scenes = [
        {
          id: 'SCN-1',
          name: 'Scene 1',
          location: 'Location A',
          timeOfDay: 'Day',
          duration: 120,
          characters: ['John'],
          props: ['Car'],
          wardrobe: ['Casual'],
          vfx: []
        }
      ];

      const constraints = {
        maxDays: 10,
        maxHoursPerDay: 12,
        locationCosts: { 'Location A': 10000 },
        daylightHours: { start: '08:00', end: '18:00' },
        crewAvailability: { director: ['2024-01-01'] }
      };

      const result = await optimizeScheduleWithAI(scenes, constraints);
      
      expect(result).toHaveProperty('days');
      expect(result).toHaveProperty('totalDays');
      expect(result).toHaveProperty('estimatedCost');
      
      // Restore OpenAI instance
      (await import('../ai')).default = originalOpenAI;
    });
  });

  describe('generateMarketingContent', () => {
    it('should generate marketing content using OpenAI', async () => {
      const mockContent = {
        tagline: 'An epic story of love and adventure',
        posterDescription: 'Dramatic poster with main characters',
        trailerScript: 'Fade in... dramatic music...',
        socialMediaPosts: ['Check out our new project!', 'Coming soon!']
      };

      const openaiInstance = new OpenAI({ apiKey: 'test-key' });
      (openaiInstance.chat.completions.create as any).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockContent)
          }
        }]
      });

      const result = await generateMarketingContent(
        'Love in Lagos',
        'Romantic Drama',
        'A heartwarming story about finding love',
        'Young Adults'
      );
      
      expect(result).toEqual(mockContent);
    });

    it('should return mock content when OpenAI is not configured', async () => {
      // Temporarily remove OpenAI instance
      const originalOpenAI = (await import('../ai')).default;
      (await import('../ai')).default = null;
      
      const result = await generateMarketingContent(
        'Love in Lagos',
        'Romantic Drama',
        'A heartwarming story about finding love',
        'Young Adults'
      );
      
      expect(result).toHaveProperty('tagline');
      expect(result).toHaveProperty('posterDescription');
      expect(result).toHaveProperty('trailerScript');
      expect(result).toHaveProperty('socialMediaPosts');
      
      // Restore OpenAI instance
      (await import('../ai')).default = originalOpenAI;
    });
  });
});