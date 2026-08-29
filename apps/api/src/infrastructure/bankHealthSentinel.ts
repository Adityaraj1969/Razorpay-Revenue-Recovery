import { redisClient } from './redis.js';

const WINDOW_SIZE_MS = 300 * 1000; // 5 minutes
const _MAX_EVENTS = 50;
const BANK_DEGRADATION_THRESHOLD = 0.30;
const _BANK_RECOVERY_THRESHOLD = 0.90; // (1 - 0.90) == 0.10 failure rate

/**
 * Passive Bank Health Sentinel
 * Uses zero-polling architecture by observing transactions as they happen.
 */
export async function recordTransaction(issuerCode: string, isFailure: boolean, timestamp: number = Date.now()): Promise<void> {
  const key = `telemetry:sliding_window:${issuerCode}`;
  const eventValue = `${timestamp}:${isFailure ? '1' : '0'}`;

  // Add event, remove old ones, and cap at max
  const multi = redisClient.multi();
  multi.zadd(key, timestamp, eventValue);
  multi.zremrangebyscore(key, '-inf', timestamp - WINDOW_SIZE_MS);
  multi.zcard(key); // We can cap logic via Lua if needed, but doing simple cleanup here.
  
  await multi.exec();
}

export async function getIssuerHealth(issuerCode: string) {
  const key = `telemetry:sliding_window:${issuerCode}`;
  const now = Date.now();
  
  await redisClient.zremrangebyscore(key, '-inf', now - WINDOW_SIZE_MS);
  const events = await redisClient.zrange(key, 0, -1);
  
  const eventCount = events.length;
  let failures = 0;
  
  for (const event of events) {
    if (event.endsWith(':1')) {
      failures++;
    }
  }

  const failureRate = eventCount > 0 ? failures / eventCount : 0;
  const isDegraded = eventCount >= 5 && failureRate >= BANK_DEGRADATION_THRESHOLD;

  return {
    issuerCode,
    failureRate,
    isDegraded,
    eventCount,
    windowStart: now - WINDOW_SIZE_MS,
  };
}
