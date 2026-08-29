import { FastifyPluginAsync } from 'fastify';
import { verifyRazorpaySignature } from './hmacVerifier.js';
import { isDuplicate } from './deduplicator.js';
import { createOrLinkCase } from './caseCreator.js';
import { diagnosisQueue } from '../../infrastructure/queue.js';
import { config } from '../../config/index.js';

export const webhookRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post('/razorpay', async (request, reply) => {
    const signature = request.headers['x-razorpay-signature'] as string;
    const eventId = request.headers['x-razorpay-event-id'] as string;
    const rawBody = JSON.stringify(request.body);

    if (!signature || !eventId) {
      return reply.code(400).send({ error: 'Missing headers' });
    }

    const isValid = verifyRazorpaySignature(rawBody, signature, config.RAZORPAY_WEBHOOK_SECRET);
    if (!isValid) {
      return reply.code(401).send({ error: 'Invalid signature' });
    }

    const isDup = await isDuplicate(eventId);
    if (isDup) {
      return reply.code(200).send({ message: 'Duplicate event ignored' });
    }

    const payload = request.body as any;
    const merchantId = payload.account_id;

    try {
      const caseRecord = await createOrLinkCase(payload, merchantId);

      await diagnosisQueue.add('analyze', {
        caseId: caseRecord.caseId,
        eventId,
      });

      return reply.code(200).send({
        case_id: caseRecord.caseId,
        is_holdout: caseRecord.isHoldoutControl,
        status: 'enqueued',
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Meta WhatsApp Cloud API Webhook Handshake Verification
  fastify.get('/whatsapp', async (request, reply) => {
    const query = (request.query || {}) as Record<string, string>;
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const expectedToken = config.WHATSAPP_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && expectedToken && token === expectedToken) {
      fastify.log.info('Meta WhatsApp Webhook verified successfully');
      return reply.code(200).send(challenge);
    } else {
      fastify.log.warn({ received: token, expected: expectedToken }, 'WhatsApp Webhook verification failed');
      return reply.code(403).send('Forbidden: Verification token mismatch');
    }
  });

  // Meta WhatsApp Inbound Events & Customer Replies
  fastify.post('/whatsapp', async (request, reply) => {
    const payload = request.body as any;
    fastify.log.info({ event: 'whatsapp_webhook_received' }, 'Inbound WhatsApp event received');
    return reply.code(200).send({ status: 'EVENT_RECEIVED' });
  });
};
