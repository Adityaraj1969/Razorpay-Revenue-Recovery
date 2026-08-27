import crypto from 'node:crypto';
import { PrismaClient } from '@revloop/db';

const prisma = new PrismaClient();

export function computeRecordHash(caseId: string, payload: any, previousHash: string): string {
  const data = caseId + JSON.stringify(payload) + previousHash;
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function appendCaseEvent(caseId: string, eventType: string, actor: string, payload: any) {
  return await prisma.$transaction(async (tx) => {
    const lastEvent = await tx.caseEvent.findFirst({
      where: { caseId },
      orderBy: { sequenceNumber: 'desc' },
    });

    const previousHash = lastEvent ? lastEvent.hash : '0'.repeat(64);
    const sequenceNumber = lastEvent ? lastEvent.sequenceNumber + 1 : 1;
    const hash = computeRecordHash(caseId, payload, previousHash);

    const newEvent = await tx.caseEvent.create({
      data: {
        caseId,
        eventType,
        actor,
        payload,
        previousHash,
        hash,
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
    if (event.previousHash !== currentPrevHash) {
      return false; // Chain broken
    }
    const computed = computeRecordHash(caseId, event.payload, event.previousHash);
    if (computed !== event.hash) {
      return false; // Data tampered
    }
    currentPrevHash = event.hash;
  }
  return true;
}

export function computeMerkleRoot(caseIds: string[]): string {
  if (caseIds.length === 0) return '';
  const hashes = caseIds.map(id => crypto.createHash('sha256').update(id).digest('hex'));
  return hashes[0]; // Simplistic merkle root implementation placeholder
}
