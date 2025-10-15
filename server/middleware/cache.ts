import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import { logger } from '../utils/logger';

// Redis client for caching
let redisClient: ReturnType<typeof createClient> | null = null;

// Initialize Redis client if environment variables are set
if (process.env.REDIS_HOST) {
  try {
    // ioredis options have changed in redis v4 client; use url string
    const port = parseInt(process.env.REDIS_PORT || '6379');
    const db = parseInt(process.env.REDIS_DB || '0');
    const password = process.env.REDIS_PASSWORD;
    const host = process.env.REDIS_HOST;
    const url = password
      ? `redis://:${password}@${host}:${port}/${db}`
      : `redis://${host}:${port}/${db}`;
    redisClient = createClient({ url });
    
    redisClient.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
    });
    
    redisClient.connect().catch(err => {
      logger.error('Failed to connect to Redis', { error: err.message });
    });
  } catch (error) {
    logger.error('Failed to initialize Redis client', { error: (error as Error).message });
  }
}

// Cache middleware
export const cache = (duration: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }
    
    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
      const cachedResponse = await redisClient.get(key);
      
      if (cachedResponse) {
        logger.debug('Cache hit', { key });
        return res.json(JSON.parse(cachedResponse as string));
      }
      
      logger.debug('Cache miss', { key });
      
      // Override res.send to cache the response
      const originalSend = res.send;
      res.send = function(body) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient?.setEx(key, duration, body).catch(err => {
            logger.error('Failed to cache response', { error: err.message, key });
          });
        }
        return originalSend.call(this, body);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error', { error: (error as Error).message, key });
      next();
    }
  };
};

// Clear cache for a specific key
export const clearCache = async (key: string): Promise<void> => {
  if (!redisClient || !redisClient.isOpen) return;
  
  try {
    await redisClient.del(key);
    logger.debug('Cache cleared', { key });
  } catch (error) {
    logger.error('Failed to clear cache', { error: (error as Error).message, key });
  }
};

// Clear cache pattern
export const clearCachePattern = async (pattern: string): Promise<void> => {
  if (!redisClient || !redisClient.isOpen) return;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.debug('Cache pattern cleared', { pattern, count: keys.length });
    }
  } catch (error) {
    logger.error('Failed to clear cache pattern', { error: (error as Error).message, pattern });
  }
};