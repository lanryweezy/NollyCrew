import Pusher from 'pusher';
import { logger } from './utils/logger.js';

const PUSHER_APP_ID = process.env.PUSHER_APP_ID || '';
const PUSHER_KEY = process.env.PUSHER_KEY || '';
const PUSHER_SECRET = process.env.PUSHER_SECRET || '';
const PUSHER_CLUSTER = process.env.PUSHER_CLUSTER || 'mt1';

let pusher: Pusher | null = null;

if (PUSHER_APP_ID && PUSHER_KEY && PUSHER_SECRET) {
  pusher = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });
  logger.info('Pusher initialized');
} else {
  logger.warn('Pusher credentials missing. Real-time features will be disabled.');
}

export async function broadcastToProject(projectId: string, event: string, payload: any) {
  if (!pusher) return;
  
  try {
    await pusher.trigger(`project-${projectId}`, event, payload);
  } catch (error) {
    logger.error('Pusher trigger error', { error: (error as Error).message });
  }
}

export async function sendToUser(userId: string, event: string, payload: any) {
  if (!pusher) return;

  try {
    await pusher.trigger(`user-${userId}`, event, payload);
  } catch (error) {
    logger.error('Pusher user trigger error', { error: (error as Error).message });
  }
}

export default pusher;
