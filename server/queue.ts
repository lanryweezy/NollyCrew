import Queue from 'bull';
import * as ai from './ai';
import { storage } from './storage';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
};

// Create job queues
export const scriptAnalysisQueue = new Queue('script analysis', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const scheduleOptimizationQueue = new Queue('schedule optimization', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const castingRecommendationQueue = new Queue('casting recommendations', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const marketingContentQueue = new Queue('marketing content', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Job processors
scriptAnalysisQueue.process('analyze-script', async (job) => {
  const { projectId, scriptText, scriptUrl } = job.data;
  
  try {
    job.progress(10);
    
    // Analyze script with AI
    const breakdown = await ai.analyzeScriptWithAI(scriptText);
    job.progress(50);
    
    // Create version record
    const version = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      scriptUrl: scriptUrl || null,
      data: breakdown,
    };
    
    job.progress(70);
    
    // Update project with new version
    const project = await storage.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const prev = (project.scriptBreakdown as any) || {};
    const versions = Array.isArray(prev.versions) ? prev.versions : (prev.id ? [prev] : []);
    versions.push(version);
    const merged = { latestVersionId: version.id, versions };
    
    await storage.updateProject(projectId, {
      scriptBreakdown: merged,
    } as any);
    
    job.progress(100);
    
    return {
      success: true,
      breakdown,
      version,
      projectId,
    };
  } catch (error) {
    console.error('Script analysis job failed:', error);
    throw error;
  }
});

scheduleOptimizationQueue.process('optimize-schedule', async (job) => {
  const { projectId, scenes, constraints } = job.data;
  
  try {
    job.progress(10);
    
    // Optimize schedule with AI
    const optimization = await ai.optimizeScheduleWithAI(scenes, constraints);
    job.progress(70);
    
    // Save optimized schedule
    const project = await storage.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const prev = (project.scriptBreakdown as any) || {};
    const merged = { ...prev, schedule: optimization.days };
    
    await storage.updateProject(projectId, {
      scriptBreakdown: merged,
    } as any);
    
    job.progress(100);
    
    return {
      success: true,
      optimization,
      projectId,
    };
  } catch (error) {
    console.error('Schedule optimization job failed:', error);
    throw error;
  }
});

castingRecommendationQueue.process('generate-recommendations', async (job) => {
  const { role, requirements, candidates } = job.data;
  
  try {
    job.progress(10);
    
    // Generate casting recommendations
    const recommendations = await ai.generateCastingRecommendations(
      role,
      requirements,
      candidates
    );
    
    job.progress(100);
    
    return {
      success: true,
      recommendations,
    };
  } catch (error) {
    console.error('Casting recommendation job failed:', error);
    throw error;
  }
});

marketingContentQueue.process('generate-content', async (job) => {
  const { projectTitle, genre, synopsis, targetAudience } = job.data;
  
  try {
    job.progress(10);
    
    // Generate marketing content
    const content = await ai.generateMarketingContent(
      projectTitle,
      genre,
      synopsis,
      targetAudience
    );
    
    job.progress(100);
    
    return {
      success: true,
      content,
    };
  } catch (error) {
    console.error('Marketing content generation job failed:', error);
    throw error;
  }
});

// Job status tracking
export interface JobStatus {
  id: string;
  type: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export const getJobStatus = async (jobId: string): Promise<JobStatus | null> => {
  // Check all queues for the job
  const queues = [scriptAnalysisQueue, scheduleOptimizationQueue, castingRecommendationQueue, marketingContentQueue];
  
  for (const queue of queues) {
    const job = await queue.getJob(jobId);
    if (job) {
      return {
        id: job.id as string,
        type: job.name,
        status: await job.getState() as any,
        progress: job.progress(),
        result: job.returnvalue,
        error: job.failedReason,
        createdAt: new Date(job.timestamp),
        completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
      };
    }
  }
  
  return null;
};

// Cleanup function
export const cleanup = async () => {
  await Promise.all([
    scriptAnalysisQueue.close(),
    scheduleOptimizationQueue.close(),
    castingRecommendationQueue.close(),
    marketingContentQueue.close(),
  ]);
};

// Graceful shutdown
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
