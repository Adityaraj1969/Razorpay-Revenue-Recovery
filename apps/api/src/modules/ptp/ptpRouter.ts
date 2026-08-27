import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { createPTP } from './ptpStateMachine.js';

const PTPCommitmentSchema = z.object({
  promisedDate: z.string().datetime(),
  amountPaise: z.string().regex(/^\d+$/),
  method: z.string(),
  transcriptExcerpt: z.string().optional()
});

export const ptpRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post('/:caseId/ptp', async (request, reply) => {
    const { caseId } = request.params as { caseId: string };
    
    const parsed = PTPCommitmentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.format() });
    }

    try {
      const result = await createPTP(
        caseId,
        new Date(parsed.data.promisedDate),
        BigInt(parsed.data.amountPaise),
        parsed.data.method,
        parsed.data.transcriptExcerpt
      );

      return reply.code(201).send({
        ptp_id: result.ptpId,
        hold_active: true,
        reminder_scheduled_at: new Date(new Date(parsed.data.promisedDate).getTime() - 2 * 3600 * 1000).toISOString(),
        virtual_account_issued: result.virtualAccountDetails !== undefined
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to create PTP' });
    }
  });
};
