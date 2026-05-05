import Queue from 'bull';
import * as ai from './ai.js';
import { storage } from './storage.js';
import { logger } from './utils/logger.js';

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST;
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD;

const queueConfig = {
  redis: redisUrl ? redisUrl : {
    host: redisHost || 'localhost',
    port: redisPort,
    password: redisPassword
  }
};

const redisAvailable = !!(redisUrl || (redisHost && redisHost !== ''));

// Create queues
export const scriptAnalysisQueue = redisAvailable ? new Queue('script-analysis', (redisUrl || queueConfig) as any) : null;
export const scheduleOptimizationQueue = redisAvailable ? new Queue('schedule-optimization', (redisUrl || queueConfig) as any) : null;
export const castingRecommendationQueue = redisAvailable ? new Queue('casting-recommendation', (redisUrl || queueConfig) as any) : null;
export const marketingContentQueue = redisAvailable ? new Queue('marketing-content', (redisUrl || queueConfig) as any) : null;
export const castingMatchQueue = redisAvailable ? new Queue('casting-match', (redisUrl || queueConfig) as any) : null;

// Process Casting Match Queue (Automated Engine)
if (castingMatchQueue) {
  castingMatchQueue.process('daily-match', async (job) => {
    logger.info('Starting daily casting match job');
    
    try {
      const activeJobs = await storage.getJobs({ isActive: true });
      const talentUsers = await storage.searchTalent({}); // Get all talent

      for (const jobItem of activeJobs) {
        if (jobItem.type !== 'casting') continue;

        const recommendations = await ai.generateCastingRecommendations(
          jobItem.title,
          jobItem.description,
          talentUsers.map((u: any) => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`,
            bio: u.bio || '',
            skills: u.skills || [],
            experience: u.experience || 'mid',
            location: u.location || '',
            availability: u.availability || 'available',
            budget: Number(jobItem.budget) || 0
          }))
        );

        // Notify top 5 matches
        const topMatches = recommendations.slice(0, 5).filter(r => r.score > 0.7);
        for (const match of topMatches) {
          await storage.createMessage({
            senderId: 'system',
            recipientId: match.userId,
            subject: 'New Job Match Found!',
            content: `You're a strong match for the job: ${jobItem.title}. Check it out now!`,
            threadId: `match-${jobItem.id}`
          });
        }
      }
      
      logger.info('Daily casting match job completed');
      return { status: 'success', matchesNotified: activeJobs.length };
    } catch (error) {
      logger.error('Casting match error:', error);
      throw error;
    }
  });

  // Schedule daily match if not already scheduled
  castingMatchQueue.add('daily-match', {}, {
    repeat: { cron: '0 0 * * *' } // Run at midnight every day
  });
}

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
  if (!redisAvailable) return null;
  
  const queues = [scriptAnalysisQueue, scheduleOptimizationQueue, castingRecommendationQueue, marketingContentQueue, castingMatchQueue];
  
  for (const queue of queues) {
    if (!queue) continue;
    const job = await queue.getJob(jobId);
    if (job) {
      const state = await job.getState();
      return {
        id: job.id.toString(),
        type: queue.name,
        status: state as any,
        progress: job.progress(),
        result: job.returnvalue,
        error: job.failedReason,
        createdAt: new Date(job.timestamp),
        completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined
      };
    }
  }
  
  return null;
};

// Cleanup function
export const cleanup = async () => {
  if (!redisAvailable) return;
  
  const queues = [scriptAnalysisQueue, scheduleOptimizationQueue, castingRecommendationQueue, marketingContentQueue, castingMatchQueue];
  for (const queue of queues) {
    if (queue) await queue.close();
  }
};

// Graceful shutdown
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
