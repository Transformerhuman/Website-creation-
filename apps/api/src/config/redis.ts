import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

let redisClient: Redis | null = null;
export let redisHealthy = false;

export function getRedis() {
  if (!redisClient) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times: number) => {
        if (times > 2) return null;
        return 1000;
      }
    });

    redisClient.on('error', (err: any) => {
      if (redisHealthy) {
        console.warn('⚠️ Redis connection lost. Market price caching disabled.');
        redisHealthy = false;
      }
    });

    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis');
      redisHealthy = true;
    });
  }
  return redisClient;
}

export const JWT_SECRET = process.env.JWT_SECRET || uuidv4();
