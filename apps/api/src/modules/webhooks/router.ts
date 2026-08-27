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
        caseId: caseRecord.id,
        eventId,
      });

      return reply.code(200).send({
        case_id: caseRecord.id,
        is_holdout: caseRecord.isHoldout,
        status: 'enqueued',
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};
