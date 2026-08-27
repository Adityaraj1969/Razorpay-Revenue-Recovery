/**
 * Event Publisher — Internal Pub/Sub for Dashboard SSE
 * Publishes case lifecycle events to Redis pub/sub for real-time streaming.
 */

import { redisClient } from '../../infrastructure/redis.js';

export type DashboardEventType = 
  | 'WEBHOOK_RECEIVED' 
  | 'DIAGNOSIS_COMPLETED' 
  | 'ACTION_DISPATCHED' 
  | 'SETTLEMENT_VERIFIED' 
  | 'PTP_LOCKED' 
  | 'HARD_STOP_TRIGGERED' 
  | 'KILL_SWITCH_ACTIVATED';

export interface DashboardEvent {
  id: string;
  type: DashboardEventType;
  timestamp: string;
  caseId?: string;
  summary: string;
  metadata?: Record<string, any>;
}

export async function publishEvent(event: DashboardEvent): Promise<void> {
  const channel = 'revloop:events';
  try {
    await redisClient.publish(channel, JSON.stringify(event));
  } catch (error) {
    console.error(`Failed to publish event ${event.id} to ${channel}`, error);
  }
}
