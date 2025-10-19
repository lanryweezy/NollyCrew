import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  analyzeScriptWithAI,
  generateEnhancedCastingRecommendations,
  optimizeEnhancedScheduleWithAI,
  generateEnhancedMarketingContent,
  extractTextFromPDF
} from '../ai-enhanced';
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

describe('Enhanced AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractTextFromPDF', () => {
    it('should extract text from PDF buffer', async () => {
      const mockPdfData = { text: 'Sample PDF text content for enhanced analysis' };
      (await import('pdf-parse')).default.mockResolvedValue(mockPdfData);
      
      const buffer = Buffer.from('fake pdf content for testing');
      const result = await extractTextFromPDF(buffer);
      
      expect(result).toBe('Sample PDF text content for enhanced analysis');
      expect((await import('pdf-parse')).default).toHaveBeenCalledWith(buffer);
    });

    it('should handle PDF parsing errors', async () => {
      (await import('pdf-parse')).default.mockRejectedValue(new Error('PDF parsing failed in enhanced service'));
      
      const buffer = Buffer.from('fake pdf content');
      
      await expect(extractTextFromPDF(buffer)).rejects.toThrow('Failed to parse PDF');
    });
  });

  describe('analyzeScriptWithAI', () => {
    it('should analyze script using OpenAI when API key is available', async () => {
      const mockAnalysis = {
        scenes: 8,
        sceneList: [
          {
            id: 'SCN-1',
            name: 'Opening Scene',
            location: 'Street',
            timeOfDay: 'Day',
            duration: 10,
            characters: ['John', 'Mary'],
            props: ['Car', 'Phone'],
            wardrobe: ['Casual'],
            vfx: [],
            soundEffects: ['Traffic'],
            lighting: ['Natural'],
            cameraAngles: ['Wide'],
            emotionalTone: 'Tense',
            narrativePurpose: 'Introduction',
            notes: 'Character introduction'
          }
        ],
        characters: [
          {
            name: 'John',
            description: 'Protagonist',
            characterArc: 'Journey from doubt to confidence',
            emotionalRange: ['Determined', 'Vulnerable'],
            keyTraits: ['Resilient', 'Intelligent']
          }
        ],
        locations: [
          {
            name: 'Street',
            description: 'Busy urban street',
            type: 'Exterior',
            lightingRequirements: ['Natural lighting'],
            soundRequirements: ['Traffic noise']
          }
        ],
        estimatedCrew: { director: 1, camera_operator: 2 },
        props: ['Car', 'Phone'],
        wardrobe: ['Casual'],
        vfx: [],
        soundDesign: ['Ambient noise'],
        lightingSetup: ['Key lighting'],
        cameraEquipment: ['DSLR'],
        budgetEstimate: { low: 1000000, high: 2000000, breakdown: { crew: 500000 } },
        timeline: { preProduction: 60, shooting: 45, postProduction: 90, total: 195 },
        risks: [
          {
            category: 'Logistical',
            description: 'Location availability',
            severity: 'medium',
            mitigation: 'Secure backup locations'
          }
        ],
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

      const scriptText = 'This is a sample script text for enhanced analysis.';
      const result = await analyzeScriptWithAI(scriptText);
      
      expect(result).toEqual(expect.objectContaining({
        scenes: 8,
        characters: expect.any(Array),
        locations: expect.any(Array),
        estimatedCrew: expect.any(Object),
        props: expect.any(Array),
        wardrobe: expect.any(Array),
        vfx: expect.any(Array),
        soundDesign: expect.any(Array),
        lightingSetup: expect.any(Array),
        cameraEquipment: expect.any(Array),
        budgetEstimate: expect.any(Object),
        timeline: expect.any(Object),
        risks: expect.any(Array),
        analyzedAt: expect.any(String)
      }));
    });

    it('should return mock analysis when OpenAI is not configured', async () => {
      // Temporarily remove OpenAI instance
      const originalOpenAI = (await import('../ai-enhanced')).openai;
      (await import('../ai-enhanced')).openai = null;
      
      const scriptText = 'This is a sample script text for enhanced analysis.';
      const result = await analyzeScriptWithAI(scriptText);
      
      expect(result).toHaveProperty('scenes');
      expect(result).toHaveProperty('sceneList');
      expect(result).toHaveProperty('characters');
      expect(result).toHaveProperty('locations');
      expect(result).toHaveProperty('estimatedCrew');
      expect(result).toHaveProperty('props');
      expect(result).toHaveProperty('wardrobe');
      expect(result).toHaveProperty('vfx');
      expect(result).toHaveProperty('soundDesign');
      expect(result).toHaveProperty('lightingSetup');
      expect(result).toHaveProperty('cameraEquipment');
      expect(result).toHaveProperty('budgetEstimate');
      expect(result).toHaveProperty('timeline');
      expect(result).toHaveProperty('risks');
      expect(result.analyzedAt).toBeDefined();
      
      // Restore OpenAI instance
      (await import('../ai-enhanced')).openai = originalOpenAI;
    });
  });

  describe('generateEnhancedCastingRecommendations', () => {
    it('should generate enhanced casting recommendations with OpenAI', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
      const openaiInstance = new OpenAI({ apiKey: 'test-key' });
      (openaiInstance.embeddings.create as any).mockResolvedValue({
        data: [{ embedding: mockEmbedding }]
      });

      const role = 'Lead Actor';
      const characterDescription = 'Protagonist with complex emotional journey';
      const requirements = 'Experienced dramatic actor, 30-40 years old';
      const candidates = [
        {
          id: '1',
          name: 'John Doe',
          bio: 'Experienced actor with 15 years in drama',
          skills: ['drama', 'comedy', 'improvisation'],
          experience: '15 years',
          location: 'Lagos',
          availability: 'available',
          budget: 50000,
          previousRoles: [
            { title: 'Drama Film', genre: 'Drama', role: 'Lead', rating: 4.5 }
          ]
        }
      ];

      const result = await generateEnhancedCastingRecommendations(
        role, 
        characterDescription, 
        requirements, 
        candidates
      );
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('userId');
      expect(result[0]).toHaveProperty('score');
      expect(result[0]).toHaveProperty('confidence');
      expect(result[0]).toHaveProperty('reasons');
      expect(result[0]).toHaveProperty('matchFactors');
      expect(result[0]).toHaveProperty('biasCheck');
      expect(result[0]).toHaveProperty('suggestedImprovements');
      expect(result[0]).toHaveProperty('projectedSuccess');
    });

    it('should return mock recommendations when OpenAI is not configured', async () => {
      // Temporarily remove OpenAI instance
      const originalOpenAI = (await import('../ai-enhanced')).openai;
      (await import('../ai-enhanced')).openai = null;
      
      const role = 'Lead Actor';
      const characterDescription = 'Protagonist with complex emotional journey';
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

      const result = await generateEnhancedCastingRecommendations(
        role, 
        characterDescription, 
        requirements, 
        candidates
      );
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('userId', '1');
      expect(result[0]).toHaveProperty('score');
      expect(result[0]).toHaveProperty('confidence');
      expect(result[0]).toHaveProperty('reasons');
      expect(result[0]).toHaveProperty('matchFactors');
      expect(result[0]).toHaveProperty('biasCheck');
      expect(result[0]).toHaveProperty('suggestedImprovements');
      expect(result[0]).toHaveProperty('projectedSuccess');
      
      // Restore OpenAI instance
      (await import('../ai-enhanced')).openai = originalOpenAI;
    });
  });

  describe('optimizeEnhancedScheduleWithAI', () => {
    it('should optimize schedule using enhanced AI', async () => {
      const mockOptimization = {
        days: [
          {
            day: 1,
            date: '2024-01-01',
            scenes: ['SCN-1', 'SCN-2'],
            totalDuration: 480,
            locations: ['Location A'],
            crewCall: '07:00',
            shootStart: '08:00',
            lunch: '12:00-13:00',
            wrap: '18:00',
            equipmentNeeded: ['Camera A', 'Lighting Kit'],
            specialRequirements: ['Special setup required'],
            weatherDependencies: ['Exterior scenes']
          }
        ],
        totalDays: 5,
        estimatedCost: 500000,
        costBreakdown: {
          crew: 200000,
          equipment: 150000,
          locations: 100000,
          other: 50000
        },
        optimizationNotes: ['Optimized for location grouping', 'Balanced daily workload'],
        riskAssessment: {
          highRiskDays: [2, 5],
          weatherDependencies: ['Day 3 scenes'],
          crewFatigueFactors: ['Long consecutive shooting days']
        },
        resourceAllocation: {
          crew: { director: 1, camera: 3 },
          equipment: { cameras: 2, lights: 5 },
          locations: { studio: 2, exterior: 1 }
        }
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
          vfx: [],
          soundEffects: ['Traffic'],
          lighting: ['Natural'],
          cameraAngles: ['Wide'],
          emotionalTone: 'Tense',
          narrativePurpose: 'Introduction'
        }
      ];

      const constraints = {
        maxDays: 10,
        maxHoursPerDay: 12,
        locationCosts: { 'Location A': 10000 },
        daylightHours: { start: '08:00', end: '18:00' },
        crewAvailability: { director: ['2024-01-01'] },
        equipmentAvailability: { camera: ['2024-01-01'] },
        weatherDependencies: ['SCN-1']
      };

      const result = await optimizeEnhancedScheduleWithAI(scenes, constraints);
      
      expect(result).toEqual(expect.objectContaining({
        days: expect.any(Array),
        totalDays: 5,
        estimatedCost: 500000,
        costBreakdown: expect.any(Object),
        optimizationNotes: expect.any(Array),
        riskAssessment: expect.any(Object),
        resourceAllocation: expect.any(Object)
      }));
      expect(result.days).toHaveLength(1);
    });

    it('should return mock optimization when OpenAI is not configured', async () => {
      // Temporarily remove OpenAI instance
      const originalOpenAI = (await import('../ai-enhanced')).openai;
      (await import('../ai-enhanced')).openai = null;
      
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
          vfx: [],
          soundEffects: ['Traffic'],
          lighting: ['Natural'],
          cameraAngles: ['Wide'],
          emotionalTone: 'Tense',
          narrativePurpose: 'Introduction'
        }
      ];

      const constraints = {
        maxDays: 10,
        maxHoursPerDay: 12,
        locationCosts: { 'Location A': 10000 },
        daylightHours: { start: '08:00', end: '18:00' },
        crewAvailability: { director: ['2024-01-01'] },
        equipmentAvailability: { camera: ['2024-01-01'] },
        weatherDependencies: ['SCN-1']
      };

      const result = await optimizeEnhancedScheduleWithAI(scenes, constraints);
      
      expect(result).toHaveProperty('days');
      expect(result).toHaveProperty('totalDays');
      expect(result).toHaveProperty('estimatedCost');
      expect(result).toHaveProperty('costBreakdown');
      expect(result).toHaveProperty('optimizationNotes');
      expect(result).toHaveProperty('riskAssessment');
      expect(result).toHaveProperty('resourceAllocation');
      
      // Restore OpenAI instance
      (await import('../ai-enhanced')).openai = originalOpenAI;
    });
  });

  describe('generateEnhancedMarketingContent', () => {
    it('should generate enhanced marketing content using AI', async () => {
      const mockContent = {
        tagline: 'An epic story of love and adventure in the heart of Lagos',
        posterDescription: 'Dramatic poster with main characters in iconic Lagos setting',
        trailerScript: 'Fade in... dramatic music... character introduction...',
        socialMediaPosts: ['Check out our new project!', 'Coming soon to theaters!'],
        pressKit: {
          logline: 'A compelling story of human drama set in bustling Lagos',
          themes: ['Love', 'Conflict', 'Redemption'],
          visualStyle: 'Cinematic and visually striking',
          keyCast: ['Lead Actor', 'Supporting Actor'],
          crewHighlights: ['Acclaimed Director', 'Award-winning Cinematographer']
        },
        distributionStrategy: {
          platforms: ['Theatrical', 'Streaming'],
          releaseTiming: 'Q3 2025',
          promotionalTactics: ['Film Festivals', 'Social Media Campaign']
        }
      };

      const openaiInstance = new OpenAI({ apiKey: 'test-key' });
      (openaiInstance.chat.completions.create as any).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockContent)
          }
        }]
      });

      const result = await generateEnhancedMarketingContent(
        'Love in Lagos',
        'Romantic Drama',
        'A heartwarming story about finding love',
        'Young Adults',
        '₦50M',
        'Kemi Adetiba'
      );
      
      expect(result).toEqual(mockContent);
    });

    it('should return mock content when OpenAI is not configured', async () => {
      // Temporarily remove OpenAI instance
      const originalOpenAI = (await import('../ai-enhanced')).openai;
      (await import('../ai-enhanced')).openai = null;
      
      const result = await generateEnhancedMarketingContent(
        'Love in Lagos',
        'Romantic Drama',
        'A heartwarming story about finding love',
        'Young Adults',
        '₦50M',
        'Kemi Adetiba'
      );
      
      expect(result).toHaveProperty('tagline');
      expect(result).toHaveProperty('posterDescription');
      expect(result).toHaveProperty('trailerScript');
      expect(result).toHaveProperty('socialMediaPosts');
      expect(result).toHaveProperty('pressKit');
      expect(result).toHaveProperty('distributionStrategy');
      
      // Restore OpenAI instance
      (await import('../ai-enhanced')).openai = originalOpenAI;
    });
  });
});import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  analyzeScriptWithAI,
  generateEnhancedCastingRecommendations,
  optimizeEnhancedScheduleWithAI,
  generateEnhancedMarketingContent,
  extractTextFromPDF
} from '../ai-enhanced';
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

describe('Enhanced AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractTextFromPDF', () => {
    it('should extract text from PDF buffer', async () => {
      const mockPdfData = { text: 'Sample PDF text content for enhanced analysis' };
      (await import('pdf-parse')).default.mockResolvedValue(mockPdfData);
      
      const buffer = Buffer.from('fake pdf content for testing');
      const result = await extractTextFromPDF(buffer);
      
      expect(result).toBe('Sample PDF text content for enhanced analysis');
      expect((await import('pdf-parse')).default).toHaveBeenCalledWith(buffer);
    });

    it('should handle PDF parsing errors', async () => {
      (await import('pdf-parse')).default.mockRejectedValue(new Error('PDF parsing failed in enhanced service'));
      
      const buffer = Buffer.from('fake pdf content');
      
      await expect(extractTextFromPDF(buffer)).rejects.toThrow('Failed to parse PDF');
    });
  });

  describe('analyzeScriptWithAI', () => {
    it('should analyze script using OpenAI when API key is available', async () => {
      const mockAnalysis = {
        scenes: 8,
        sceneList: [
          {
            id: 'SCN-1',
            name: 'Opening Scene',
            location: 'Street',
            timeOfDay: 'Day',
            duration: 10,
            characters: ['John', 'Mary'],
            props: ['Car', 'Phone'],
            wardrobe: ['Casual'],
            vfx: [],
            soundEffects: ['Traffic'],
            lighting: ['Natural'],
            cameraAngles: ['Wide'],
            emotionalTone: 'Tense',
            narrativePurpose: 'Introduction',
            notes: 'Character introduction'
          }
        ],
        characters: [
          {
            name: 'John',
            description: 'Protagonist',
            characterArc: 'Journey from doubt to confidence',
            emotionalRange: ['Determined', 'Vulnerable'],
            keyTraits: ['Resilient', 'Intelligent']
          }
        ],
        locations: [
          {
            name: 'Street',
            description: 'Busy urban street',
            type: 'Exterior',
            lightingRequirements: ['Natural lighting'],
            soundRequirements: ['Traffic noise']
          }
        ],
        estimatedCrew: { director: 1, camera_operator: 2 },
        props: ['Car', 'Phone'],
        wardrobe: ['Casual'],
        vfx: [],
        soundDesign: ['Ambient noise'],
        lightingSetup: ['Key lighting'],
        cameraEquipment: ['DSLR'],
        budgetEstimate: { low: 1000000, high: 2000000, breakdown: { crew: 500000 } },
        timeline: { preProduction: 60, shooting: 45, postProduction: 90, total: 195 },
        risks: [
          {
            category: 'Logistical',
            description: 'Location availability',
            severity: 'medium',
            mitigation: 'Secure backup locations'
          }
        ],
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

      const scriptText = 'This is a sample script text for enhanced analysis.';
      const result = await analyzeScriptWithAI(scriptText);
      
      expect(result).toEqual(expect.objectContaining({
        scenes: 8,
        characters: expect.any(Array),
        locations: expect.any(Array),
        estimatedCrew: expect.any(Object),
        props: expect.any(Array),
        wardrobe: expect.any(Array),
        vfx: expect.any(Array),
        soundDesign: expect.any(Array),
        lightingSetup: expect.any(Array),
        cameraEquipment: expect.any(Array),
        budgetEstimate: expect.any(Object),
        timeline: expect.any(Object),
        risks: expect.any(Array),
        analyzedAt: expect.any(String)
      }));
    });

    it('should return mock analysis when OpenAI is not configured', async () => {
      // Temporarily remove OpenAI instance
      const originalOpenAI = (await import('../ai-enhanced')).openai;
      (await import('../ai-enhanced')).openai = null;
      
      const scriptText = 'This is a sample script text for enhanced analysis.';
      const result = await analyzeScriptWithAI(scriptText);
      
      expect(result).toHaveProperty('scenes');
      expect(result).toHaveProperty('sceneList');
      expect(result).toHaveProperty('characters');
      expect(result).toHaveProperty('locations');
      expect(result).toHaveProperty('estimatedCrew');
      expect(result).toHaveProperty('props');
      expect(result).toHaveProperty('wardrobe');
      expect(result).toHaveProperty('vfx');
      expect(result).toHaveProperty('soundDesign');
      expect(result).toHaveProperty('lightingSetup');
      expect(result).toHaveProperty('cameraEquipment');
      expect(result).toHaveProperty('budgetEstimate');
      expect(result).toHaveProperty('timeline');
      expect(result).toHaveProperty('risks');
      expect(result.analyzedAt).toBeDefined();
      
      // Restore OpenAI instance
      (await import('../ai-enhanced')).openai = originalOpenAI;
    });
  });

  describe('generateEnhancedCastingRecommendations', () => {
    it('should generate enhanced casting recommendations with OpenAI', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
      const openaiInstance = new OpenAI({ apiKey: 'test-key' });
      (openaiInstance.embeddings.create as any).mockResolvedValue({
        data: [{ embedding: mockEmbedding }]
      });

      const role = 'Lead Actor';
      const characterDescription = 'Protagonist with complex emotional journey';
      const requirements = 'Experienced dramatic actor, 30-40 years old';
      const candidates = [
        {
          id: '1',
          name: 'John Doe',
          bio: 'Experienced actor with 15 years in drama',
          skills: ['drama', 'comedy', 'improvisation'],
          experience: '15 years',
          location: 'Lagos',
          availability: 'available',
          budget: 50000,
          previousRoles: [
            { title: 'Drama Film', genre: 'Drama', role: 'Lead', rating: 4.5 }
          ]
        }
      ];

      const result = await generateEnhancedCastingRecommendations(
        role, 
        characterDescription, 
        requirements, 
        candidates
      );
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('userId');
      expect(result[0]).toHaveProperty('score');
      expect(result[0]).toHaveProperty('confidence');
      expect(result[0]).toHaveProperty('reasons');
      expect(result[0]).toHaveProperty('matchFactors');
      expect(result[0]).toHaveProperty('biasCheck');
      expect(result[0]).toHaveProperty('suggestedImprovements');
      expect(result[0]).toHaveProperty('projectedSuccess');
    });

    it('should return mock recommendations when OpenAI is not configured', async () => {
      // Temporarily remove OpenAI instance
      const originalOpenAI = (await import('../ai-enhanced')).openai;
      (await import('../ai-enhanced')).openai = null;
      
      const role = 'Lead Actor';
      const characterDescription = 'Protagonist with complex emotional journey';
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

      const result = await generateEnhancedCastingRecommendations(
        role, 
        characterDescription, 
        requirements, 
        candidates
      );
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('userId', '1');
      expect(result[0]).toHaveProperty('score');
      expect(result[0]).toHaveProperty('confidence');
      expect(result[0]).toHaveProperty('reasons');
      expect(result[0]).toHaveProperty('matchFactors');
      expect(result[0]).toHaveProperty('biasCheck');
      expect(result[0]).toHaveProperty('suggestedImprovements');
      expect(result[0]).toHaveProperty('projectedSuccess');
      
      // Restore OpenAI instance
      (await import('../ai-enhanced')).openai = originalOpenAI;
    });
  });

  describe('optimizeEnhancedScheduleWithAI', () => {
    it('should optimize schedule using enhanced AI', async () => {
      const mockOptimization = {
        days: [
          {
            day: 1,
            date: '2024-01-01',
            scenes: ['SCN-1', 'SCN-2'],
            totalDuration: 480,
            locations: ['Location A'],
            crewCall: '07:00',
            shootStart: '08:00',
            lunch: '12:00-13:00',
            wrap: '18:00',
            equipmentNeeded: ['Camera A', 'Lighting Kit'],
            specialRequirements: ['Special setup required'],
            weatherDependencies: ['Exterior scenes']
          }
        ],
        totalDays: 5,
        estimatedCost: 500000,
        costBreakdown: {
          crew: 200000,
          equipment: 150000,
          locations: 100000,
          other: 50000
        },
        optimizationNotes: ['Optimized for location grouping', 'Balanced daily workload'],
        riskAssessment: {
          highRiskDays: [2, 5],
          weatherDependencies: ['Day 3 scenes'],
          crewFatigueFactors: ['Long consecutive shooting days']
        },
        resourceAllocation: {
          crew: { director: 1, camera: 3 },
          equipment: { cameras: 2, lights: 5 },
          locations: { studio: 2, exterior: 1 }
        }
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
          vfx: [],
          soundEffects: ['Traffic'],
          lighting: ['Natural'],
          cameraAngles: ['Wide'],
          emotionalTone: 'Tense',
          narrativePurpose: 'Introduction'
        }
      ];

      const constraints = {
        maxDays: 10,
        maxHoursPerDay: 12,
        locationCosts: { 'Location A': 10000 },
        daylightHours: { start: '08:00', end: '18:00' },
        crewAvailability: { director: ['2024-01-01'] },
        equipmentAvailability: { camera: ['2024-01-01'] },
        weatherDependencies: ['SCN-1']
      };

      const result = await optimizeEnhancedScheduleWithAI(scenes, constraints);
      
      expect(result).toEqual(expect.objectContaining({
        days: expect.any(Array),
        totalDays: 5,
        estimatedCost: 500000,
        costBreakdown: expect.any(Object),
        optimizationNotes: expect.any(Array),
        riskAssessment: expect.any(Object),
        resourceAllocation: expect.any(Object)
      }));
      expect(result.days).toHaveLength(1);
    });

    it('should return mock optimization when OpenAI is not configured', async () => {
      // Temporarily remove OpenAI instance
      const originalOpenAI = (await import('../ai-enhanced')).openai;
      (await import('../ai-enhanced')).openai = null;
      
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
          vfx: [],
          soundEffects: ['Traffic'],
          lighting: ['Natural'],
          cameraAngles: ['Wide'],
          emotionalTone: 'Tense',
          narrativePurpose: 'Introduction'
        }
      ];

      const constraints = {
        maxDays: 10,
        maxHoursPerDay: 12,
        locationCosts: { 'Location A': 10000 },
        daylightHours: { start: '08:00', end: '18:00' },
        crewAvailability: { director: ['2024-01-01'] },
        equipmentAvailability: { camera: ['2024-01-01'] },
        weatherDependencies: ['SCN-1']
      };

      const result = await optimizeEnhancedScheduleWithAI(scenes, constraints);
      
      expect(result).toHaveProperty('days');
      expect(result).toHaveProperty('totalDays');
      expect(result).toHaveProperty('estimatedCost');
      expect(result).toHaveProperty('costBreakdown');
      expect(result).toHaveProperty('optimizationNotes');
      expect(result).toHaveProperty('riskAssessment');
      expect(result).toHaveProperty('resourceAllocation');
      
      // Restore OpenAI instance
      (await import('../ai-enhanced')).openai = originalOpenAI;
    });
  });

  describe('generateEnhancedMarketingContent', () => {
    it('should generate enhanced marketing content using AI', async () => {
      const mockContent = {
        tagline: 'An epic story of love and adventure in the heart of Lagos',
        posterDescription: 'Dramatic poster with main characters in iconic Lagos setting',
        trailerScript: 'Fade in... dramatic music... character introduction...',
        socialMediaPosts: ['Check out our new project!', 'Coming soon to theaters!'],
        pressKit: {
          logline: 'A compelling story of human drama set in bustling Lagos',
          themes: ['Love', 'Conflict', 'Redemption'],
          visualStyle: 'Cinematic and visually striking',
          keyCast: ['Lead Actor', 'Supporting Actor'],
          crewHighlights: ['Acclaimed Director', 'Award-winning Cinematographer']
        },
        distributionStrategy: {
          platforms: ['Theatrical', 'Streaming'],
          releaseTiming: 'Q3 2025',
          promotionalTactics: ['Film Festivals', 'Social Media Campaign']
        }
      };

      const openaiInstance = new OpenAI({ apiKey: 'test-key' });
      (openaiInstance.chat.completions.create as any).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockContent)
          }
        }]
      });

      const result = await generateEnhancedMarketingContent(
        'Love in Lagos',
        'Romantic Drama',
        'A heartwarming story about finding love',
        'Young Adults',
        '₦50M',
        'Kemi Adetiba'
      );
      
      expect(result).toEqual(mockContent);
    });

    it('should return mock content when OpenAI is not configured', async () => {
      // Temporarily remove OpenAI instance
      const originalOpenAI = (await import('../ai-enhanced')).openai;
      (await import('../ai-enhanced')).openai = null;
      
      const result = await generateEnhancedMarketingContent(
        'Love in Lagos',
        'Romantic Drama',
        'A heartwarming story about finding love',
        'Young Adults',
        '₦50M',
        'Kemi Adetiba'
      );
      
      expect(result).toHaveProperty('tagline');
      expect(result).toHaveProperty('posterDescription');
      expect(result).toHaveProperty('trailerScript');
      expect(result).toHaveProperty('socialMediaPosts');
      expect(result).toHaveProperty('pressKit');
      expect(result).toHaveProperty('distributionStrategy');
      
      // Restore OpenAI instance
      (await import('../ai-enhanced')).openai = originalOpenAI;
    });
  });
});