import OpenAI from 'openai';
import { getCache, setCache } from './utils/cache.js';
import crypto from 'node:crypto';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Helper to generate cache keys
function generateCacheKey(prefix: string, content: any): string {
  const hash = crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
  return `ai:${prefix}:${hash}`;
}

// Generic helper for OpenAI calls with schema and caching
async function callOpenAIWithSchema<T>(options: {
  prefix: string;
  cacheContent: any;
  systemPrompt: string;
  userPrompt: string;
  schema: any;
  schemaName: string;
  model?: string;
  ttl?: number;
  fallback: () => T;
}): Promise<T> {
  if (!openai) return options.fallback();

  const cacheKey = generateCacheKey(options.prefix, options.cacheContent);
  const cached = await getCache<T>(cacheKey);
  if (cached) return cached;

  try {
    const completion = await openai.chat.completions.create({
      model: options.model || "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: options.schemaName,
          strict: true,
          schema: options.schema
        }
      },
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from OpenAI');

    const result = JSON.parse(response) as T;
    await setCache(cacheKey, result, options.ttl || 86400);
    return result;
  } catch (error) {
    console.error(`AI error (${options.prefix}):`, error);
    return options.fallback();
  }
}

type PdfParseModule = typeof import('pdf-parse');

let pdfParse: PdfParseModule['default'] | null = null;

async function loadPdfParse(): Promise<PdfParseModule['default']> {
  if (!pdfParse) {
    const mod: PdfParseModule = await import('pdf-parse');
    pdfParse = mod.default ?? (mod as unknown as PdfParseModule['default']);
  }
  return pdfParse as PdfParseModule['default'];
}

export interface ScriptAnalysis {
  scenes: number;
  sceneList: Array<{
    id: string;
    name: string;
    location: string;
    timeOfDay: string;
    duration: number;
    characters: string[];
    props: string[];
    wardrobe: string[];
    vfx: string[];
    cameraShots: string[];
    directorNotes: string;
    notes: string;
  }>;
  characters: string[];
  locations: string[];
  estimatedCrew: Record<string, number>;
  props: string[];
  wardrobe: string[];
  vfx: string[];
  cameraShots: string[];
  analyzedAt: string;
}

export interface CastingRecommendation {
  userId: string;
  score: number;
  reasons: string[];
  matchFactors: {
    experience: number;
    skills: number;
    location: number;
    availability: number;
    budget: number;
  };
  biasCheck: {
    diversityScore: number;
    fairnessFlags: string[];
    auditTrail: string[];
  };
}

export interface ScheduleOptimization {
  days: Array<{
    day: number;
    scenes: string[];
    totalDuration: number;
    locations: string[];
    crewCall: string;
    shootStart: string;
    lunch: string;
    wrap: string;
  }>;
  totalDays: number;
  estimatedCost: number;
  optimizationNotes: string[];
}

// Extract text from PDF
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const parsePdf = await loadPdfParse();
    const data = await parsePdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF');
  }
}

// Analyze script using OpenAI
export async function analyzeScriptWithAI(scriptText: string): Promise<ScriptAnalysis> {
  return callOpenAIWithSchema<ScriptAnalysis>({
    prefix: 'script',
    cacheContent: scriptText.substring(0, 15000),
    systemPrompt: "You are a professional Nollywood Virtual Director. Extract detailed production information, suggest creative camera shots, and provide directorial notes.",
    userPrompt: `Analyze this film script and extract detailed production information. Script text:\n${scriptText.substring(0, 15000)}`,
    schemaName: "script_analysis",
    schema: {
      type: "object",
      properties: {
        scenes: { type: "number" },
        sceneList: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              location: { type: "string" },
              timeOfDay: { type: "string" },
              duration: { type: "number" },
              characters: { type: "array", items: { type: "string" } },
              props: { type: "array", items: { type: "string" } },
              wardrobe: { type: "array", items: { type: "string" } },
              vfx: { type: "array", items: { type: "string" } },
              cameraShots: { type: "array", items: { type: "string" } },
              directorNotes: { type: "string" },
              notes: { type: "string" }
            },
            required: ["id", "name", "location", "timeOfDay", "duration", "characters", "props", "wardrobe", "vfx", "cameraShots", "directorNotes", "notes"],
            additionalProperties: false
          }
        },
        characters: { type: "array", items: { type: "string" } },
        locations: { type: "array", items: { type: "string" } },
        estimatedCrew: {
          type: "object",
          additionalProperties: { type: "number" }
        },
        props: { type: "array", items: { type: "string" } },
        wardrobe: { type: "array", items: { type: "string" } },
        vfx: { type: "array", items: { type: "string" } },
        cameraShots: { type: "array", items: { type: "string" } }
      },
      required: ["scenes", "sceneList", "characters", "locations", "estimatedCrew", "props", "wardrobe", "vfx", "cameraShots"],
      additionalProperties: false
    },
    fallback: () => generateMockAnalysis(scriptText)
  }).then(analysis => ({ ...analysis, analyzedAt: analysis.analyzedAt || new Date().toISOString() }));
}

// Generate casting recommendations using embeddings
export async function generateCastingRecommendations(
  role: string,
  requirements: string,
  candidates: Array<{
    id: string;
    name: string;
    bio: string;
    skills: string[];
    experience: string;
    location: string;
    availability: string;
    budget: number;
  }>
): Promise<CastingRecommendation[]> {
  if (!openai) {
    // Fallback to mock recommendations
    return generateMockCastingRecommendations(candidates);
  }

  try {
    const roleEmbedding = await getEmbedding(`${role}: ${requirements}`);
    
    const recommendations: CastingRecommendation[] = [];
    
    // Parallelize embedding requests for all candidates
    const candidateEmbeddings = await Promise.all(
      candidates.map(candidate => {
        const candidateText = `${candidate.name} - ${candidate.bio} - Skills: ${candidate.skills.join(', ')} - Experience: ${candidate.experience}`;
        return getEmbedding(candidateText);
      })
    );

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const candidateEmbedding = candidateEmbeddings[i];
      
      // Calculate cosine similarity
      const similarity = cosineSimilarity(roleEmbedding, candidateEmbedding);
      
      // Calculate match factors
      const matchFactors = {
        experience: calculateExperienceMatch(candidate.experience, requirements),
        skills: calculateSkillsMatch(candidate.skills, requirements),
        location: candidate.location.toLowerCase().includes('lagos') ? 0.9 : 0.7,
        availability: candidate.availability === 'available' ? 1.0 : 0.5,
        budget: candidate.budget <= 100000 ? 1.0 : 0.8
      };
      
      const reasons = generateRecommendationReasons(candidate, matchFactors);
      const biasCheck = performBiasCheck(candidate, recommendations);
      
      recommendations.push({
        userId: candidate.id,
        score: similarity * 0.6 + Object.values(matchFactors).reduce((a, b) => a + b, 0) / 5 * 0.4,
        reasons,
        matchFactors,
        biasCheck
      });
    }
    
    return recommendations.sort((a, b) => b.score - a.score);
    
  } catch (error) {
    console.error('Casting AI error:', error);
    return generateMockCastingRecommendations(candidates);
  }
}

// Optimize schedule using constraint-based optimization
export async function optimizeScheduleWithAI(
  scenes: Array<{
    id: string;
    name: string;
    location: string;
    timeOfDay: string;
    duration: number;
    characters: string[];
    props: string[];
    wardrobe: string[];
    vfx: string[];
  }>,
  constraints: {
    maxDays: number;
    maxHoursPerDay: number;
    locationCosts: Record<string, number>;
    daylightHours: { start: string; end: string };
    crewAvailability: Record<string, string[]>;
  }
): Promise<ScheduleOptimization> {
  return callOpenAIWithSchema<ScheduleOptimization>({
    prefix: 'schedule',
    cacheContent: { scenes, constraints },
    systemPrompt: "You are a professional film production scheduler. Create optimal shooting schedules that minimize costs and maximize efficiency.",
    userPrompt: `Optimize this film shooting schedule with the following constraints:\nScenes:\n${JSON.stringify(scenes)}\nConstraints:\n${JSON.stringify(constraints)}`,
    schemaName: "schedule_optimization",
    schema: {
      type: "object",
      properties: {
        days: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "number" },
              scenes: { type: "array", items: { type: "string" } },
              totalDuration: { type: "number" },
              locations: { type: "array", items: { type: "string" } },
              crewCall: { type: "string" },
              shootStart: { type: "string" },
              lunch: { type: "string" },
              wrap: { type: "string" }
            },
            required: ["day", "scenes", "totalDuration", "locations", "crewCall", "shootStart", "lunch", "wrap"],
            additionalProperties: false
          }
        },
        totalDays: { type: "number" },
        estimatedCost: { type: "number" },
        optimizationNotes: { type: "array", items: { type: "string" } }
      },
      required: ["days", "totalDays", "estimatedCost", "optimizationNotes"],
      additionalProperties: false
    },
    fallback: () => generateMockScheduleOptimization(scenes, constraints)
  });
}

// Generate marketing content using AI
export async function generateMarketingContent(
  projectTitle: string,
  genre: string,
  synopsis: string,
  targetAudience: string
): Promise<{
  tagline: string;
  posterDescription: string;
  trailerScript: string;
  socialMediaPosts: string[];
}> {
  return callOpenAIWithSchema<{
    tagline: string;
    posterDescription: string;
    trailerScript: string;
    socialMediaPosts: string[];
  }>({
    prefix: 'marketing',
    cacheContent: { projectTitle, genre, synopsis, targetAudience },
    systemPrompt: "You are a professional film marketing expert. Create compelling marketing content that resonates with target audiences.",
    userPrompt: `Generate marketing content for this film project:\nTitle: ${projectTitle}\nGenre: ${genre}\nSynopsis: ${synopsis}\nTarget Audience: ${targetAudience}`,
    schemaName: "marketing_content",
    schema: {
      type: "object",
      properties: {
        tagline: { type: "string" },
        posterDescription: { type: "string" },
        trailerScript: { type: "string" },
        socialMediaPosts: { type: "array", items: { type: "string" } }
      },
      required: ["tagline", "posterDescription", "trailerScript", "socialMediaPosts"],
      additionalProperties: false
    },
    fallback: () => ({
      tagline: "An epic story that will change everything",
      posterDescription: "Dramatic poster with main character in center",
      trailerScript: "Fade in... dramatic music... character introduction...",
      socialMediaPosts: ["Check out our new project!", "Coming soon to theaters"]
    })
  });
}

// Helper functions
async function getEmbedding(text: string): Promise<number[]> {
  if (!openai) return [];
  
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });
  
  return response.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function calculateExperienceMatch(experience: string, requirements: string): number {
  const expYears = parseInt(experience.match(/\d+/)?.[0] || '0');
  const reqYears = parseInt(requirements.match(/\d+/)?.[0] || '0');
  
  if (expYears >= reqYears) return 1.0;
  return expYears / Math.max(reqYears, 1);
}

function calculateSkillsMatch(skills: string[], requirements: string): number {
  const reqSkills = requirements.toLowerCase().split(/[,\s]+/);
  const matches = skills.filter(skill => 
    reqSkills.some(req => skill.toLowerCase().includes(req))
  );
  
  return matches.length / Math.max(reqSkills.length, 1);
}

function generateRecommendationReasons(candidate: any, matchFactors: any): string[] {
  const reasons = [];
  
  if (matchFactors.experience > 0.8) {
    reasons.push("Strong experience match");
  }
  if (matchFactors.skills > 0.7) {
    reasons.push("Relevant skills");
  }
  if (matchFactors.location > 0.8) {
    reasons.push("Good location match");
  }
  if (matchFactors.availability === 1.0) {
    reasons.push("Available for project");
  }
  if (matchFactors.budget > 0.8) {
    reasons.push("Within budget range");
  }
  
  return reasons.length > 0 ? reasons : ["Potential match"];
}

function performBiasCheck(candidate: any, existingRecommendations: any[]): {
  diversityScore: number;
  fairnessFlags: string[];
  auditTrail: string[];
} {
  const fairnessFlags: string[] = [];
  const auditTrail: string[] = [];
  let diversityScore = 1.0;

  // Check for demographic diversity
  const existingGenders = existingRecommendations.map(r => r.gender || 'unknown');
  const existingAges = existingRecommendations.map(r => r.age || 0);
  const existingLocations = existingRecommendations.map(r => r.location || '');

  // Gender diversity check
  if (candidate.gender && existingGenders.includes(candidate.gender)) {
    const genderCount = existingGenders.filter(g => g === candidate.gender).length;
    if (genderCount > existingRecommendations.length * 0.7) {
      fairnessFlags.push("Gender imbalance detected");
      diversityScore -= 0.2;
    }
  }

  // Age diversity check
  if (candidate.age) {
    const similarAges = existingAges.filter(age => Math.abs(age - candidate.age) < 5);
    if (similarAges.length > existingRecommendations.length * 0.6) {
      fairnessFlags.push("Age group concentration");
      diversityScore -= 0.1;
    }
  }

  // Location diversity check
  if (candidate.location && existingLocations.includes(candidate.location)) {
    const locationCount = existingLocations.filter(l => l === candidate.location).length;
    if (locationCount > existingRecommendations.length * 0.8) {
      fairnessFlags.push("Geographic concentration");
      diversityScore -= 0.1;
    }
  }

  // Experience bias check
  if (candidate.experience && candidate.experience.includes('newcomer')) {
    const experiencedCount = existingRecommendations.filter(r => 
      r.experience && !r.experience.includes('newcomer')
    ).length;
    if (experiencedCount > existingRecommendations.length * 0.9) {
      fairnessFlags.push("Experience bias - favoring established actors");
      diversityScore -= 0.15;
    }
  }

  // Audit trail
  auditTrail.push(`Candidate: ${candidate.name}`);
  auditTrail.push(`Gender: ${candidate.gender || 'Not specified'}`);
  auditTrail.push(`Age: ${candidate.age || 'Not specified'}`);
  auditTrail.push(`Location: ${candidate.location || 'Not specified'}`);
  auditTrail.push(`Experience: ${candidate.experience || 'Not specified'}`);
  auditTrail.push(`Diversity score: ${diversityScore.toFixed(2)}`);
  
  if (fairnessFlags.length > 0) {
    auditTrail.push(`Fairness flags: ${fairnessFlags.join(', ')}`);
  }

  return {
    diversityScore: Math.max(0, diversityScore),
    fairnessFlags,
    auditTrail
  };
}

// Mock fallback functions
function generateMockAnalysis(scriptText: string): ScriptAnalysis {
  const words = scriptText.trim().split(/\s+/).filter(Boolean);
  const scenes = Math.max(8, Math.min(80, Math.round(words.length / 50)));
  
  const sceneList = Array.from({ length: scenes }).map((_, i) => ({
    id: `SCN-${i+1}`,
    name: `Scene ${i+1}`,
    location: i % 2 === 0 ? 'Street' : 'Interior',
    timeOfDay: i % 3 === 0 ? 'Night' : 'Day',
    duration: 5 + Math.random() * 10,
    characters: ['Lead', 'Support'],
    props: ['Phone', 'Keys'],
    wardrobe: ['Casual', 'Formal'],
    vfx: [],
    cameraShots: ['Establishing Shot', 'Close-up'],
    directorNotes: 'Dramatic pacing',
    notes: `Scene ${i+1} notes`
  }));
  
  return {
    scenes,
    sceneList,
    characters: ['Lead', 'Support', 'Extra'],
    locations: ['Street', 'Apartment Interior', 'Office'],
    estimatedCrew: { gaffer: 1, sound_engineer: 1, makeup_artist: 1, editor: 1, camera_operator: 2 },
    props: ['Phone', 'Keys', 'Car'],
    wardrobe: ['Casual', 'Formal', 'Costume'],
    vfx: ['Color correction', 'Background replacement'],
    cameraShots: ['Establishing Shot', 'Close-up'],
    analyzedAt: new Date().toISOString()
  };
}

function generateMockCastingRecommendations(candidates: any[]): CastingRecommendation[] {
  return candidates.map((candidate, index) => {
    const biasCheck = performBiasCheck(candidate, candidates.slice(0, index));
    return {
      userId: candidate.id,
      score: 0.9 - (index * 0.1),
      reasons: ['Good experience', 'Relevant skills', 'Available'],
      matchFactors: {
        experience: 0.8,
        skills: 0.7,
        location: 0.9,
        availability: 1.0,
        budget: 0.8
      },
      biasCheck
    };
  });
}

function generateMockScheduleOptimization(scenes: any[], constraints: any): ScheduleOptimization {
  const days = [];
  const scenesPerDay = Math.ceil(scenes.length / constraints.maxDays);
  
  for (let day = 1; day <= constraints.maxDays; day++) {
    const startIndex = (day - 1) * scenesPerDay;
    const endIndex = Math.min(startIndex + scenesPerDay, scenes.length);
    const dayScenes = scenes.slice(startIndex, endIndex);
    
    if (dayScenes.length > 0) {
      days.push({
        day,
        scenes: dayScenes.map(s => s.id),
        totalDuration: dayScenes.reduce((sum, s) => sum + (s.duration || 5), 0),
        locations: [...new Set(dayScenes.map(s => s.location))],
        crewCall: "07:00",
        shootStart: "08:00",
        lunch: "12:00-13:00",
        wrap: "18:00"
      });
    }
  }
  
  return {
    days,
    totalDays: days.length,
    estimatedCost: 500000,
    optimizationNotes: ['Optimized for location grouping', 'Balanced daily workload']
  };
}
