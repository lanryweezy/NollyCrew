import Queue from 'bull';
import * as ai from './ai.js';
import { storage } from './storage.js';
import { logger } from './utils/logger.js';

// Disable Redis functionality entirely
const redisAvailable = false;

// Export null queues to disable all Redis functionality
export const scriptAnalysisQueue: Queue.Queue | null = null;
export const scheduleOptimizationQueue: Queue.Queue | null = null;
export const castingRecommendationQueue: Queue.Queue | null = null;
export const marketingContentQueue: Queue.Queue | null = null;

// Job status tracking - always returns null to indicate job not found
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
  // Always return null since Redis is disabled
  return null;
};

// Cleanup function - no-op since Redis is disabled
export const cleanup = async () => {
  // No cleanup needed when Redis is disabled
};

// Graceful shutdown - no-op since Redis is disabled
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
