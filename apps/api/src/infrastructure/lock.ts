import Redlock, { Lock } from 'redlock';
import { redisClient } from './redis.js';

const redlock = new Redlock([redisClient], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200,
  retryJitter: 200,
  automaticExtensionThreshold: 500,
});

export async function acquireCaseLock(caseId: string): Promise<Lock> {
  const resource = `lock:recovery:case:${caseId}`;
  const ttl = 30000; // 30 seconds
  try {
    const lock = await redlock.acquire([resource], ttl);
    return lock;
  } catch (error) {
    throw new Error(`Failed to acquire lock for case ${caseId}: ${error}`);
  }
}

export async function releaseCaseLock(lock: Lock): Promise<void> {
  try {
    await lock.release();
  } catch (error) {
    console.error('Failed to release lock:', error);
  }
}
