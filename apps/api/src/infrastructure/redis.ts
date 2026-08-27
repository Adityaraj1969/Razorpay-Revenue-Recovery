import { Redis } from 'ioredis';
import { config } from '../config/index.js';

export const redisClient = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export function createRedisConnection(): Redis {
  return new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
}
