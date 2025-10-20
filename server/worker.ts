import { scriptAnalysisQueue, scheduleOptimizationQueue, castingRecommendationQueue, marketingContentQueue } from './queue.js';

// This module initializes Bull processors when launched as a worker process.
// If the web server imports it, the processors are already registered in queue.ts
// and this file will just export a noop.

if (process.env.WORKER === 'true') {
  // Touch queues to ensure processors are registered via side-effect imports in queue.ts
  // No additional code needed; queue.ts calls .process handlers on import.
  console.log('[worker] started');

  // Keep process alive
  setInterval(() => {
    // noop heartbeat
  }, 60_000);
}

export {};


