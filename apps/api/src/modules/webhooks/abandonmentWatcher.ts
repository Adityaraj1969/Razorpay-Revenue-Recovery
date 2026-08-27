import { Queue } from 'bullmq';
import { createRedisConnection } from '../../infrastructure/redis.js';

const connection = createRedisConnection();
const abandonmentWatcherQueue = new Queue('abandonment-watcher', { connection });

export async function startAbandonmentWatcher() {
  await abandonmentWatcherQueue.add('check-abandoned', {}, {
    repeat: {
      every: 60000, // every 60 seconds
    }
  });
  console.log('Started abandonment watcher');
}
