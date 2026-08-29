import crypto from 'node:crypto';
import { PrismaClient } from '@revloop/db';

const prisma = new PrismaClient();

export function computeRecordHash(caseId: string, payload: any, previousRecordHash: string): string {
  const data = caseId + JSON.stringify(payload) + previousRecordHash;
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function appendCaseEvent(caseId: string, eventType: string, actor: string, payload: any) {
  return await prisma.$transaction(async (tx) => {
    const lastEvent = await tx.caseEvent.findFirst({
      where: { caseId },
      orderBy: { sequenceNumber: 'desc' },
    });

    const previousRecordHash = lastEvent ? lastEvent.currentRecordHash : '0'.repeat(64);
    const sequenceNumber = lastEvent ? lastEvent.sequenceNumber + 1 : 1;
    const currentRecordHash = computeRecordHash(caseId, payload, previousRecordHash);

    const newEvent = await tx.caseEvent.create({
      data: {
        caseId,
        eventType,
        actor,
        payload,
        previousRecordHash,
        currentRecordHash,
        sequenceNumber,
      },
    });

    return newEvent;
  });
}

export async function verifyCaseChain(caseId: string): Promise<boolean> {
  const events = await prisma.caseEvent.findMany({
    where: { caseId },
    orderBy: { sequenceNumber: 'asc' },
  });

  let currentPrevHash = '0'.repeat(64);
  for (const event of events) {
    if (event.previousRecordHash !== currentPrevHash) {
      return false; // Chain broken
    }
    const computed = computeRecordHash(caseId, event.payload, event.previousRecordHash);
    if (computed !== event.currentRecordHash) {
      return false; // Data tampered
    }
    currentPrevHash = event.currentRecordHash;
  }
  return true;
}

export function computeMerkleRoot(caseIds: string[]): string {
  if (caseIds.length === 0) return '';
  const hashes = caseIds.map(id => crypto.createHash('sha256').update(id).digest('hex'));
  return hashes[0]; // Simplistic merkle root implementation placeholder
}
