import { Redis } from 'ioredis';
import { logger } from './logger.js';

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST;
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD;

let redis: Redis | null = null;
let isRedisAvailable = false;

// In-memory fallback
const memoryCache = new Map<string, { value: any; expires: number }>();

if (redisUrl || (redisHost && redisHost !== '')) {
  const finalHost = redisHost || 'localhost';
  try {
    const config = redisUrl || {
      host: finalHost,
      port: redisPort,
      password: redisPassword,
      retryStrategy: (times: number) => {
        if (times > 3) {
          logger.warn('Redis connection failed, falling back to in-memory cache');
          isRedisAvailable = false;
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000);
      }
    };
    
    redis = typeof config === 'string' ? new Redis(config) : new Redis(config as any);

    redis.on('connect', () => {
      logger.info('Connected to Redis');
      isRedisAvailable = true;
    });

    redis.on('error', (err) => {
      logger.error('Redis error:', err);
      isRedisAvailable = false;
    });
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (isRedisAvailable && redis) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
    }
  }

  // Fallback to memory cache
  const item = memoryCache.get(key);
  if (item && item.expires > Date.now()) {
    return item.value;
  } else if (item) {
    memoryCache.delete(key);
  }
  
  return null;
}

export async function setCache(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
  const serializedValue = JSON.stringify(value);

  if (isRedisAvailable && redis) {
    try {
      await redis.set(key, serializedValue, 'EX', ttlSeconds);
      return;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  // Fallback to memory cache
  memoryCache.set(key, {
    value,
    expires: Date.now() + ttlSeconds * 1000
  });
}

export async function deleteCache(key: string): Promise<void> {
  if (isRedisAvailable && redis) {
    try {
      await redis.del(key);
      return;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  memoryCache.delete(key);
}
