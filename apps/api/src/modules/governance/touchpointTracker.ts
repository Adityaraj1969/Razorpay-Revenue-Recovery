import { ChannelType } from '@revloop/shared-types';

/**
 * Touchpoint Tracker — Multi-Channel Frequency Matrix Enforcer
 * Tracks lifetime attempt counts and enforces mandatory cooldowns.
 * 
 * Reference: Rules.md §4
 */

// Simple in-memory mock for buildathon (could use Redis in production)
const mockRedis = new Map<string, any>();

const MAX_ATTEMPTS: Record<string, number> = {
  VOICE: 2,
  WHATSAPP: 3,
  EMAIL: 4,
  RETRY: 3
};

const COOLDOWN_HOURS: Record<string, number> = {
  VOICE: 24,
  WHATSAPP: 12,
  EMAIL: 48,
  RETRY: 24
};

export async function canAttempt(caseId: string, channel: ChannelType): Promise<boolean> {
  const channelStr = channel as string;
  const key = `ratelimit:${channelStr}:${caseId}`;
  const data = mockRedis.get(key) || { count: 0, lastAttempt: null };
  
  const maxForChannel = MAX_ATTEMPTS[channelStr] || 3;
  
  // Check lifetime cap
  if (data.count >= maxForChannel) {
    return false;
  }
  
  // Check cooldown
  if (data.lastAttempt) {
    const hoursSinceLast = (Date.now() - data.lastAttempt) / (1000 * 60 * 60);
    const cooldownForChannel = COOLDOWN_HOURS[channelStr] || 24;
    if (hoursSinceLast < cooldownForChannel) {
      return false;
    }
  }
  
  return true;
}

export async function recordAttempt(caseId: string, channel: ChannelType): Promise<void> {
  const channelStr = channel as string;
  const key = `ratelimit:${channelStr}:${caseId}`;
  const data = mockRedis.get(key) || { count: 0, lastAttempt: null };
  
  data.count += 1;
  data.lastAttempt = Date.now();
  
  mockRedis.set(key, data);
}

export async function getRemainingAttempts(caseId: string): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  
  for (const [channelStr, maxLimit] of Object.entries(MAX_ATTEMPTS)) {
    const key = `ratelimit:${channelStr}:${caseId}`;
    const data = mockRedis.get(key) || { count: 0 };
    result[channelStr] = Math.max(0, maxLimit - data.count);
  }
  
  return result;
}
