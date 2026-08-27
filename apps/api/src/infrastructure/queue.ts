import { Queue, DefaultJobOptions } from 'bullmq';
import { createRedisConnection } from './redis.js';

const connection = createRedisConnection();

const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};

export const diagnosisQueue = new Queue('diagnosis', { connection, defaultJobOptions });
export const executionQueue = new Queue('execution', { connection, defaultJobOptions });
export const verificationQueue = new Queue('verification', { connection, defaultJobOptions });
export const scheduledQueue = new Queue('scheduled', { connection, defaultJobOptions });
