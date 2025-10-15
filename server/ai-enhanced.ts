import OpenAI from 'openai';
import pdf from 'pdf-parse';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface EnhancedScriptAnalysis {
  scenes: number;
  sceneList: Array<{
    id: string;
    name: string;
    location: string;
    timeOfDay: string;
    duration?: number;
    characters: string[];
    props: string[];
    wardrobe: string[];
    vfx: string[];
    soundEffects: string[];
    lighting: string[];
    cameraAngles: string[];
    notes?: string;
    emotionalTone: string;
    narrativePurpose: string;
  }>;
  characters: Array<{
    name: string;
    description: string;
    characterArc: string;
    emotionalRange: string[];
    keyTraits: string[];
  }>;
  locations: Array<{
    name: string;
    description: string;
    type: string;
    lightingRequirements: string[];
    soundRequirements: string[];
  }>;
  estimatedCrew: Record<string, number>;
  props: string[];
  wardrobe: string[];
  vfx: string[];
  soundDesign: string[];
  lightingSetup: string[];
  cameraEquipment: string[];
  budgetEstimate: {
    low: number;
    high: number;
    breakdown: Record<string, number>;
  };
  timeline: {
    preProduction: number;
    shooting: number;
    postProduction: number;
    total: number;
  };
  risks: Array<{
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
  analyzedAt: string;
}

export interface EnhancedCastingRecommendation {
  userId: string;
  score: number;
  confidence: number;
  reasons: string[];
  matchFactors: {
    experience: number;
    skills: number;
    location: number;
    availability: number;
    budget: number;
    genreCompatibility: number;
    characterFit: number;
  };
  biasCheck: {
    diversityScore: number;
    fairnessFlags: string[];
    auditTrail: string[];
  };
  suggestedImprovements: string[];
  projectedSuccess: {
    boxOffice: number;
    criticalReception: number;
    audienceAppeal: number;
  };
}

export interface EnhancedScheduleOptimization {
  days: Array<{
    day: number;
    date?: string;
    scenes: string[];
    totalDuration: number;
    locations: string[];
    crewCall: string;
    shootStart: string;
    lunch: string;
    wrap: string;
    equipmentNeeded: string[];
    specialRequirements: string[];
    weatherDependencies: string[];
  }>;
  totalDays: number;
  estimatedCost: number;
  costBreakdown: Record<string, number>;
  optimizationNotes: string[];
  riskAssessment: {
    highRiskDays: number[];
    weatherDependencies: string[];
    crewFatigueFactors: string[];
  };
  resourceAllocation: {
    crew: Record<string, number>;
    equipment: Record<string, number>;
    locations: Record<string, number>;
  };
}

// Extract text from PDF
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF');
  }
}

// Enhanced script analysis with more detailed breakdown
export async function analyzeScriptWithAI(scriptText: string): Promise<EnhancedScriptAnalysis> {
  if (!openai) {
    // Fallback to mock analysis if OpenAI not configured
    return generateMockEnhancedAnalysis(scriptText);
  }

  try {
    const prompt = `
Analyze this film script and extract detailed information. Return a JSON object with the following structure:

{
  "scenes": number,
  "sceneList": [
    {
      "id": "SCN-1",
      "name": "Scene Name",
      "location": "Location Name",
      "timeOfDay": "Day/Night/Dawn/Dusk",
      "duration": estimated_minutes,
      "characters": ["Character1", "Character2"],
      "props": ["Prop1", "Prop2"],
      "wardrobe": ["Wardrobe1", "Wardrobe2"],
      "vfx": ["VFX1", "VFX2"],
      "soundEffects": ["Sound1", "Sound2"],
      "lighting": ["Lighting1", "Lighting2"],
      "cameraAngles": ["Angle1", "Angle2"],
      "notes": "Additional notes",
      "emotionalTone": "emotional tone of scene",
      "narrativePurpose": "purpose in story"
    }
  ],
  "characters": [
    {
      "name": "Character Name",
      "description": "Physical and personality description",
      "characterArc": "Character development arc",
      "emotionalRange": ["Emotion1", "Emotion2"],
      "keyTraits": ["Trait1", "Trait2"]
    }
  ],
  "locations": [
    {
      "name": "Location Name",
      "description": "Detailed location description",
      "type": "Interior/Exterior/Studio",
      "lightingRequirements": ["Requirement1", "Requirement2"],
      "soundRequirements": ["Requirement1", "Requirement2"]
    }
  ],
  "estimatedCrew": {
    "director": 1,
    "camera_operator": 2,
    "sound_engineer": 1,
    "gaffer": 1,
    "makeup_artist": 1,
    "editor": 1
  },
  "props": ["All props needed"],
  "wardrobe": ["All wardrobe items"],
  "vfx": ["All VFX requirements"],
  "soundDesign": ["Sound design elements"],
  "lightingSetup": ["Lighting setup requirements"],
  "cameraEquipment": ["Camera equipment needed"],
  "budgetEstimate": {
    "low": 1000000,
    "high": 2000000,
    "breakdown": {
      "crew": 500000,
      "equipment": 300000,
      "locations": 200000
    }
  },
  "timeline": {
    "preProduction": 60,
    "shooting": 45,
    "postProduction": 90,
    "total": 195
  },
  "risks": [
    {
      "category": "Logistical/Creative/Financial",
      "description": "Risk description",
      "severity": "low/medium/high",
      "mitigation": "How to mitigate"
    }
  ]
}

Script text:
${scriptText.substring(0, 8000)} // Limit to avoid token limits
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional film script analyst. Extract detailed production information from scripts. Always return valid JSON. Be comprehensive and specific in your analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const analysis = JSON.parse(response);
    
    // Add analyzedAt timestamp
    analysis.analyzedAt = new Date().toISOString();
    
    // Ensure all required fields exist
    return {
      scenes: analysis.scenes || 0,
      sceneList: analysis.sceneList || [],
      characters: analysis.characters || [],
      locations: analysis.locations || [],
      estimatedCrew: analysis.estimatedCrew || {},
      props: analysis.props || [],
      wardrobe: analysis.wardrobe || [],
      vfx: analysis.vfx || [],
      soundDesign: analysis.soundDesign || [],
      lightingSetup: analysis.lightingSetup || [],
      cameraEquipment: analysis.cameraEquipment || [],
      budgetEstimate: analysis.budgetEstimate || { low: 0, high: 0, breakdown: {} },
      timeline: analysis.timeline || { preProduction: 0, shooting: 0, postProduction: 0, total: 0 },
      risks: analysis.risks || [],
      analyzedAt: analysis.analyzedAt
    };

  } catch (error) {
    console.error('OpenAI analysis error:', error);
    // Fallback to mock analysis
    return generateMockEnhancedAnalysis(scriptText);
  }
}

// Enhanced casting recommendations with deeper analysis
export async function generateEnhancedCastingRecommendations(
  role: string,
  characterDescription: string,
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
    portfolio?: any;
    previousRoles?: Array<{
      title: string;
      genre: string;
      role: string;
      rating: number;
    }>;
    training?: string[];
  }>
): Promise<EnhancedCastingRecommendation[]> {
  if (!openai) {
    // Fallback to mock recommendations
    return generateMockEnhancedCastingRecommendations(candidates);
  }

  try {
    const roleEmbedding = await getEmbedding(`${role}: ${characterDescription} - ${requirements}`);
    
    const recommendations: EnhancedCastingRecommendation[] = [];
    
    for (const candidate of candidates) {
      const candidateText = `${candidate.name} - ${candidate.bio} - Skills: ${candidate.skills.join(', ')} - Experience: ${candidate.experience}`;
      const candidateEmbedding = await getEmbedding(candidateText);
      
      // Calculate cosine similarity
      const similarity = cosineSimilarity(roleEmbedding, candidateEmbedding);
      
      // Calculate match factors with more sophisticated approach
      const matchFactors = {
        experience: calculateExperienceMatch(candidate.experience, requirements),
        skills: calculateSkillsMatch(candidate.skills, requirements),
        location: candidate.location.toLowerCase().includes('lagos') ? 0.9 : 0.7,
        availability: candidate.availability === 'available' ? 1.0 : 0.5,
        budget: candidate.budget <= 100000 ? 1.0 : 0.8,
        genreCompatibility: calculateGenreCompatibility(candidate.previousRoles || [], role),
        characterFit: calculateCharacterFit(characterDescription, candidate.previousRoles || [])
      };
      
      // Calculate confidence based on data completeness
      const confidenceFactors = [
        candidate.previousRoles ? 1.0 : 0.7,
        candidate.portfolio ? 1.0 : 0.8,
        candidate.training ? 1.0 : 0.9
      ];
      const confidence = confidenceFactors.reduce((a, b) => a * b, 1);
      
      const reasons = generateEnhancedRecommendationReasons(candidate, matchFactors);
      const biasCheck = performEnhancedBiasCheck(candidate, recommendations);
      const suggestedImprovements = generateSuggestedImprovements(candidate, role, requirements);
      const projectedSuccess = calculateProjectedSuccess(candidate, role, matchFactors);
      
      recommendations.push({
        userId: candidate.id,
        score: calculateWeightedScore(similarity, matchFactors),
        confidence,
        reasons,
        matchFactors,
        biasCheck,
        suggestedImprovements,
        projectedSuccess
      });
    }
    
    return recommendations.sort((a, b) => b.score - a.score);
    
  } catch (error) {
    console.error('Enhanced casting AI error:', error);
    return generateMockEnhancedCastingRecommendations(candidates);
  }
}

// Enhanced schedule optimization with more factors
export async function optimizeEnhancedScheduleWithAI(
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
    soundEffects: string[];
    lighting: string[];
    cameraAngles: string[];
    emotionalTone: string;
    narrativePurpose: string;
  }>,
  constraints: {
    maxDays: number;
    maxHoursPerDay: number;
    locationCosts: Record<string, number>;
    daylightHours: { start: string; end: string };
    crewAvailability: Record<string, string[]>;
    equipmentAvailability: Record<string, string[]>;
    weatherDependencies: string[];
  }
): Promise<EnhancedScheduleOptimization> {
  if (!openai) {
    // Fallback to simple optimization
    return generateMockEnhancedScheduleOptimization(scenes, constraints);
  }

  try {
    const prompt = `
Optimize this film shooting schedule with the following constraints:

Scenes:
${JSON.stringify(scenes, null, 2)}

Constraints:
- Maximum days: ${constraints.maxDays}
- Maximum hours per day: ${constraints.maxHoursPerDay}
- Location costs: ${JSON.stringify(constraints.locationCosts)}
- Daylight hours: ${constraints.daylightHours.start} - ${constraints.daylightHours.end}
- Crew availability: ${JSON.stringify(constraints.crewAvailability)}
- Equipment availability: ${JSON.stringify(constraints.equipmentAvailability)}
- Weather dependencies: ${JSON.stringify(constraints.weatherDependencies)}

Return a JSON object with this structure:
{
  "days": [
    {
      "day": 1,
      "date": "2024-01-01",
      "scenes": ["SCN-1", "SCN-2"],
      "totalDuration": 480,
      "locations": ["Location1", "Location2"],
      "crewCall": "07:00",
      "shootStart": "08:00",
      "lunch": "12:00-13:00",
      "wrap": "18:00",
      "equipmentNeeded": ["Camera1", "Light1"],
      "specialRequirements": ["Special requirement 1"],
      "weatherDependencies": ["Scene requiring good weather"]
    }
  ],
  "totalDays": 5,
  "estimatedCost": 500000,
  "costBreakdown": {
    "crew": 200000,
    "equipment": 150000,
    "locations": 100000,
    "other": 50000
  },
  "optimizationNotes": ["Note1", "Note2"],
  "riskAssessment": {
    "highRiskDays": [3],
    "weatherDependencies": ["Day 2 scenes"],
    "crewFatigueFactors": ["Long consecutive shooting days"]
  },
  "resourceAllocation": {
    "crew": {"director": 5, "camera": 10},
    "equipment": {"cameras": 5, "lights": 15},
    "locations": {"studio": 3, "exterior": 2}
  }
}

Optimize for:
1. Minimize location changes
2. Group scenes by time of day
3. Respect daylight hours for exterior scenes
4. Minimize total cost
5. Balance daily workload
6. Consider crew fatigue
7. Account for equipment availability
8. Plan for weather dependencies
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional film production scheduler. Create optimal shooting schedules that minimize costs and maximize efficiency. Always return valid JSON. Consider all constraints carefully."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 3000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
    
  } catch (error) {
    console.error('Enhanced schedule optimization error:', error);
    return generateMockEnhancedScheduleOptimization(scenes, constraints);
  }
}

// Generate enhanced marketing content using AI
export async function generateEnhancedMarketingContent(
  projectTitle: string,
  genre: string,
  synopsis: string,
  targetAudience: string,
  budget: string,
  director: string
): Promise<{
  tagline: string;
  posterDescription: string;
  trailerScript: string;
  socialMediaPosts: string[];
  pressKit: {
    logline: string;
    themes: string[];
    visualStyle: string;
    keyCast: string[];
    crewHighlights: string[];
  };
  distributionStrategy: {
    platforms: string[];
    releaseTiming: string;
    promotionalTactics: string[];
  };
}> {
  if (!openai) {
    return {
      tagline: "An epic story that will change everything",
      posterDescription: "Dramatic poster with main character in center",
      trailerScript: "Fade in... dramatic music... character introduction...",
      socialMediaPosts: ["Check out our new project!", "Coming soon to theaters"],
      pressKit: {
        logline: "A compelling story of human drama",
        themes: ["Love", "Conflict", "Redemption"],
        visualStyle: "Cinematic and visually striking",
        keyCast: ["Lead Actor", "Supporting Actor"],
        crewHighlights: ["Acclaimed Director", "Award-winning Cinematographer"]
      },
      distributionStrategy: {
        platforms: ["Theatrical", "Streaming"],
        releaseTiming: "Q3 2025",
        promotionalTactics: ["Film Festivals", "Social Media Campaign"]
      }
    };
  }

  try {
    const prompt = `
Generate comprehensive marketing content for this film project:

Title: ${projectTitle}
Genre: ${genre}
Synopsis: ${synopsis}
Target Audience: ${targetAudience}
Budget: ${budget}
Director: ${director}

Return JSON with:
{
  "tagline": "Compelling one-liner",
  "posterDescription": "Detailed poster concept",
  "trailerScript": "Trailer script with timing",
  "socialMediaPosts": ["Post 1", "Post 2", "Post 3"],
  "pressKit": {
    "logline": "One sentence summary",
    "themes": ["Theme 1", "Theme 2"],
    "visualStyle": "Visual description",
    "keyCast": ["Actor 1", "Actor 2"],
    "crewHighlights": ["Crew member 1", "Crew member 2"]
  },
  "distributionStrategy": {
    "platforms": ["Platform 1", "Platform 2"],
    "releaseTiming": "Release timing strategy",
    "promotionalTactics": ["Tactic 1", "Tactic 2"]
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional film marketing expert. Create comprehensive marketing content that resonates with target audiences and maximizes commercial potential."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
    
  } catch (error) {
    console.error('Enhanced marketing content generation error:', error);
    return {
      tagline: "An epic story that will change everything",
      posterDescription: "Dramatic poster with main character in center",
      trailerScript: "Fade in... dramatic music... character introduction...",
      socialMediaPosts: ["Check out our new project!", "Coming soon to theaters"],
      pressKit: {
        logline: "A compelling story of human drama",
        themes: ["Love", "Conflict", "Redemption"],
        visualStyle: "Cinematic and visually striking",
        keyCast: ["Lead Actor", "Supporting Actor"],
        crewHighlights: ["Acclaimed Director", "Award-winning Cinematographer"]
      },
      distributionStrategy: {
        platforms: ["Theatrical", "Streaming"],
        releaseTiming: "Q3 2025",
        promotionalTactics: ["Film Festivals", "Social Media Campaign"]
      }
    };
  }
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

function calculateGenreCompatibility(previousRoles: any[], targetRole: string): number {
  if (!previousRoles.length) return 0.5;
  
  const matchingGenres = previousRoles.filter(role => 
    role.genre && targetRole.toLowerCase().includes(role.genre.toLowerCase())
  );
  
  return matchingGenres.length / previousRoles.length;
}

function calculateCharacterFit(characterDescription: string, previousRoles: any[]): number {
  if (!previousRoles.length) return 0.5;
  
  // This would be enhanced with more sophisticated NLP in a real implementation
  const keyTraits = characterDescription.toLowerCase().split(/[,\s]+/);
  let totalMatches = 0;
  
  for (const role of previousRoles) {
    const roleTraits = (role.role + ' ' + role.title).toLowerCase().split(/[,\s]+/);
    const matches = keyTraits.filter(trait => 
      roleTraits.some(roleTrait => roleTrait.includes(trait) || trait.includes(roleTrait))
    );
    totalMatches += matches.length;
  }
  
  return Math.min(1, totalMatches / (keyTraits.length * previousRoles.length));
}

function calculateWeightedScore(similarity: number, matchFactors: any): number {
  const weights = {
    similarity: 0.4,
    experience: 0.15,
    skills: 0.15,
    location: 0.05,
    availability: 0.05,
    budget: 0.05,
    genreCompatibility: 0.1,
    characterFit: 0.05
  };
  
  return (
    similarity * weights.similarity +
    matchFactors.experience * weights.experience +
    matchFactors.skills * weights.skills +
    matchFactors.location * weights.location +
    matchFactors.availability * weights.availability +
    matchFactors.budget * weights.budget +
    matchFactors.genreCompatibility * weights.genreCompatibility +
    matchFactors.characterFit * weights.characterFit
  );
}

function generateEnhancedRecommendationReasons(candidate: any, matchFactors: any): string[] {
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
  if (matchFactors.genreCompatibility > 0.7) {
    reasons.push("Genre compatibility");
  }
  if (matchFactors.characterFit > 0.6) {
    reasons.push("Strong character fit");
  }
  
  return reasons.length > 0 ? reasons : ["Potential match"];
}

function performEnhancedBiasCheck(candidate: any, existingRecommendations: any[]): {
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
  const existingExperienceLevels = existingRecommendations.map(r => r.experienceLevel || 'unknown');

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

  // Experience level diversity check
  if (candidate.experienceLevel && existingExperienceLevels.includes(candidate.experienceLevel)) {
    const experienceCount = existingExperienceLevels.filter(e => e === candidate.experienceLevel).length;
    if (experienceCount > existingRecommendations.length * 0.8) {
      fairnessFlags.push("Experience level concentration");
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
  auditTrail.push(`Experience Level: ${candidate.experienceLevel || 'Not specified'}`);
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

function generateSuggestedImprovements(candidate: any, role: string, requirements: string): string[] {
  const improvements = [];
  
  // Experience suggestions
  const reqYears = parseInt(requirements.match(/\d+/)?.[0] || '0');
  const expYears = parseInt(candidate.experience.match(/\d+/)?.[0] || '0');
  
  if (expYears < reqYears) {
    improvements.push(`Gain ${reqYears - expYears} more years of relevant experience`);
  }
  
  // Skill suggestions
  const reqSkills = requirements.toLowerCase().split(/[,\s]+/);
  const missingSkills = reqSkills.filter(skill => 
    !candidate.skills.some((s: string) => s.toLowerCase().includes(skill))
  );
  
  if (missingSkills.length > 0) {
    improvements.push(`Develop skills in: ${missingSkills.slice(0, 3).join(', ')}`);
  }
  
  // Training suggestions
  if (!candidate.training || candidate.training.length === 0) {
    improvements.push("Consider formal training in acting techniques");
  }
  
  return improvements;
}

function calculateProjectedSuccess(candidate: any, role: string, matchFactors: any): {
  boxOffice: number;
  criticalReception: number;
  audienceAppeal: number;
} {
  // This is a simplified model - in reality this would be much more complex
  const values = Object.values(matchFactors) as number[];
  const baseScore = values.reduce((a: number, b: number) => a + b, 0) / Object.keys(matchFactors).length;
  
  // Adjust based on candidate's previous success
  let successFactor = 1.0;
  if (candidate.previousRoles && candidate.previousRoles.length > 0) {
    const avgRating = candidate.previousRoles.reduce((sum: number, role: any) => sum + (role.rating || 0), 0) / candidate.previousRoles.length;
    successFactor = 0.8 + (avgRating / 5 * 0.4); // Scale 0.8 to 1.2
  }
  
  return {
    boxOffice: Math.min(1, baseScore * successFactor * 0.9),
    criticalReception: Math.min(1, baseScore * successFactor),
    audienceAppeal: Math.min(1, baseScore * successFactor * 1.1)
  };
}

// Mock fallback functions
function generateMockEnhancedAnalysis(scriptText: string): EnhancedScriptAnalysis {
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
    soundEffects: ['Traffic', 'Dialogue'],
    lighting: ['Natural', 'Artificial'],
    cameraAngles: ['Wide', 'Close-up'],
    emotionalTone: i % 2 === 0 ? 'Tense' : 'Calm',
    narrativePurpose: 'Character development',
    notes: `Scene ${i+1} notes`
  }));
  
  const characters = [
    {
      name: 'Lead Character',
      description: 'Protagonist with complex motivations',
      characterArc: 'Journey from doubt to confidence',
      emotionalRange: ['Determined', 'Vulnerable', 'Angry'],
      keyTraits: ['Resilient', 'Intelligent', 'Empathetic']
    }
  ];
  
  const locations = [
    {
      name: 'Street',
      description: 'Busy urban street setting',
      type: 'Exterior',
      lightingRequirements: ['Natural lighting', 'Reflectors'],
      soundRequirements: ['Traffic noise', 'Crowd sounds']
    }
  ];
  
  return {
    scenes,
    sceneList,
    characters,
    locations,
    estimatedCrew: { gaffer: 1, sound_engineer: 1, makeup_artist: 1, editor: 1, camera_operator: 2 },
    props: ['Phone', 'Keys', 'Car'],
    wardrobe: ['Casual', 'Formal', 'Costume'],
    vfx: ['Color correction', 'Background replacement'],
    soundDesign: ['Ambient noise', 'Sound effects'],
    lightingSetup: ['Key lighting', 'Fill lighting'],
    cameraEquipment: ['DSLR', 'Stabilizer'],
    budgetEstimate: { 
      low: 1000000, 
      high: 2000000, 
      breakdown: { 
        crew: 500000, 
        equipment: 300000, 
        locations: 200000 
      } 
    },
    timeline: { 
      preProduction: 60, 
      shooting: 45, 
      postProduction: 90, 
      total: 195 
    },
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
}

function generateMockEnhancedCastingRecommendations(candidates: any[]): EnhancedCastingRecommendation[] {
  return candidates.map((candidate, index) => {
    const biasCheck = performEnhancedBiasCheck(candidate, candidates.slice(0, index));
    return {
      userId: candidate.id,
      score: 0.9 - (index * 0.1),
      confidence: 0.85,
      reasons: ['Good experience', 'Relevant skills', 'Available'],
      matchFactors: {
        experience: 0.8,
        skills: 0.7,
        location: 0.9,
        availability: 1.0,
        budget: 0.8,
        genreCompatibility: 0.75,
        characterFit: 0.85
      },
      biasCheck,
      suggestedImprovements: ['Consider additional training in method acting'],
      projectedSuccess: {
        boxOffice: 0.75,
        criticalReception: 0.8,
        audienceAppeal: 0.85
      }
    };
  });
}

function generateMockEnhancedScheduleOptimization(scenes: any[], constraints: any): EnhancedScheduleOptimization {
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
        wrap: "18:00",
        equipmentNeeded: ["Camera A", "Lighting Kit"],
        specialRequirements: ["Special setup required"],
        weatherDependencies: day % 3 === 0 ? ["Exterior scenes"] : []
      });
    }
  }
  
  return {
    days,
    totalDays: days.length,
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
      weatherDependencies: ["Day 3 scenes"],
      crewFatigueFactors: ["Long consecutive shooting days"]
    },
    resourceAllocation: {
      crew: { director: 1, camera: 3 },
      equipment: { cameras: 2, lights: 5 },
      locations: { studio: 2, exterior: 1 }
    }
  };
}