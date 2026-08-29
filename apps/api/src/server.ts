import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { config } from './config/index.js';
import { webhookRouter } from './modules/webhooks/router.js';
import { ptpRouter } from './modules/ptp/ptpRouter.js';
import { redisClient } from './infrastructure/redis.js';

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  },
});

async function startServer() {
  await fastify.register(cors);
  await fastify.register(sensible);

  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  fastify.get('/api/v1/events/stream', async (request, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    const interval = setInterval(() => {
      reply.raw.write('event: ping\ndata: {}\n\n');
    }, 15000);

    request.raw.on('close', () => {
      clearInterval(interval);
    });
  });

  fastify.register(webhookRouter, { prefix: '/api/v1/webhooks' });
  fastify.register(ptpRouter, { prefix: '/api/v1/cases' });

  const port = parseInt(config.PORT, 10);
  try {
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  fastify.log.info('SIGINT received. Shutting down gracefully...');
  await fastify.close();
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  fastify.log.info('SIGTERM received. Shutting down gracefully...');
  await fastify.close();
  await redisClient.quit();
  process.exit(0);
});
