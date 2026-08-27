import { PrismaClient } from '@revloop/db';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

function hashPII(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function createOrLinkCase(payload: any, merchantId: string) {
  const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
  
  if (!entity) {
    throw new Error('Unsupported payload structure');
  }

  const amountAtRiskPaise = BigInt(entity.amount);
  const rzpEntityId = entity.id;
  const isHoldout = Math.random() < 0.10;

  // customer creation if provided
  let customerId = undefined;
  if (entity.contact || entity.email) {
    const customer = await prisma.customer.upsert({
      where: { emailHash: entity.email ? hashPII(entity.email) : '' },
      update: {},
      create: {
        emailHash: entity.email ? hashPII(entity.email) : '',
        phoneHash: entity.contact ? hashPII(entity.contact) : '',
        merchantId,
      }
    });
    customerId = customer.id;
  }

  const caseRecord = await prisma.recoveryCase.upsert({
    where: { rzpEntityId },
    update: {},
    create: {
      rzpEntityId,
      merchantId,
      amountAtRisk: amountAtRiskPaise,
      isHoldout,
      customerId,
      status: 'OPEN'
    }
  });

  return caseRecord;
}
