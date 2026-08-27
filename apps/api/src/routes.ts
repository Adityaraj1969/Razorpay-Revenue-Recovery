/**
 * Route Registry — Registers all API endpoints on the Fastify instance.
 */
import { FastifyInstance } from 'fastify';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Health check
  app.get('/health', async () => ({ status: 'ok', version: '2.4.0', service: 'revloop-api' }));

  // Webhook ingestion
  // app.register(webhookRouter, { prefix: '/api/v1/webhooks' });

  // Case management
  // app.register(caseRouter, { prefix: '/api/v1/cases' });

  // PTP endpoints
  // app.register(ptpRouter, { prefix: '/api/v1/cases' });

  // SSE events
  // app.register(sseHandler, { prefix: '/api/v1/events' });

  // Admin endpoints (kill switch)
  // app.register(adminRouter, { prefix: '/api/v1/admin' });

  // Batch evaluation (development only)
  // app.register(batchRouter, { prefix: '/api/v1/batch' });
}
