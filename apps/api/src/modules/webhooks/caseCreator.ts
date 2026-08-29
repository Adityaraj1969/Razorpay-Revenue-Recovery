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
  const isHoldoutControl = Math.random() < 0.10;

  // customer creation if provided
  let customerId: string | undefined = undefined;
  if (entity.contact || entity.email) {
    const emailHash = entity.email ? hashPII(entity.email) : '';
    const phoneHash = entity.contact ? hashPII(entity.contact) : '';
    
    let customer = await prisma.customer.findFirst({
      where: { emailHash, merchantId }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          emailHash,
          phoneHash,
          merchantId,
          pseudonymizedRef: crypto.randomUUID()
        }
      });
    }
    customerId = customer.id;
  }

  const entityType = payload.payload?.payment ? 'PAYMENT' : 'ORDER';

  let caseRecord = await prisma.case.findFirst({
    where: { rzpEntityId, merchantId }
  });

  if (!caseRecord) {
    caseRecord = await prisma.case.create({
      data: {
        rzpEntityId,
        merchantId,
        entityType,
        amountAtRiskPaise,
        isHoldoutControl,
        customerId: customerId!,
        currentStatus: 'OPEN'
      }
    });
  }

  return caseRecord;
}
