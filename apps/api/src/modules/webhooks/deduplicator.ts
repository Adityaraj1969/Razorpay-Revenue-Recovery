import { redisClient } from '../../infrastructure/redis.js';

export async function isDuplicate(eventId: string): Promise<boolean> {
  const key = `idemp:webhook:${eventId}`;
  const result = await redisClient.setnx(key, '1');
  if (result === 1) {
    // Successfully set, meaning it's new. Set TTL for 7 days.
    await redisClient.expire(key, 7 * 24 * 60 * 60);
    return false;
  }
  return true;
}
