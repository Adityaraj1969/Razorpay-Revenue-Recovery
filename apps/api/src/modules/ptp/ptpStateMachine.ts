/**
 * Promise-to-Pay State Machine
 * Manages PTP lifecycle: PENDING → KEPT / BROKEN
 * Freezes outreach until T_PTP - 2 hours.
 * 
 * Reference: Rules.md STOP-06, Design.md §4.2
 */

import { PrismaClient } from '@revloop/db';
import { scheduledQueue } from '../../infrastructure/queue.js';
import { appendCaseEvent } from '../audit/hashChain.js';

const prisma = new PrismaClient();

export async function createPTP(
  caseId: string, 
  promisedTimestamp: Date, 
  amountPaise: bigint, 
  method: string, 
  transcriptExcerpt?: string
) {
  const now = new Date();
  const diffDays = (promisedTimestamp.getTime() - now.getTime()) / (1000 * 3600 * 24);
  
  if (diffDays > 30) {
    throw new Error('PTP date cannot be more than 30 days in the future (EDGE-03)');
  }

  const ptp = await prisma.ptpCommitment.create({
    data: {
      caseId,
      promisedDate: promisedTimestamp,
      amountPaise,
      method,
      status: 'PENDING',
      transcriptExcerpt
    }
  });

  await prisma.recoveryCase.update({
    where: { id: caseId },
    data: { status: 'PTP_LOCKED' }
  });

  // Schedule reminder T_PTP - 2 hours
  const reminderTime = new Date(promisedTimestamp.getTime() - 2 * 3600 * 1000);
  const delay = Math.max(0, reminderTime.getTime() - now.getTime());
  
  await scheduledQueue.add('ptp-reminder', { caseId, ptpId: ptp.id }, { delay });

  await appendCaseEvent(caseId, 'PTP_CREATED', 'ptp-router', { ptpId: ptp.id, promisedTimestamp });

  return {
    ptpId: ptp.id,
    virtualAccountDetails: 'VA_1234567890' // Mocked Virtual Account
  };
}

export async function checkPTPFulfillment(caseId: string) {
  // Logic to check if payment was received
  return false;
}

export async function breakPTP(ptpId: string) {
  const ptp = await prisma.ptpCommitment.update({
    where: { id: ptpId },
    data: { status: 'BROKEN' }
  });

  await prisma.recoveryCase.update({
    where: { id: ptp.caseId },
    data: { 
      status: 'OPEN',
      ptpBrokenCount: { increment: 1 } 
    }
  });

  await appendCaseEvent(ptp.caseId, 'PTP_BROKEN', 'ptp-state-machine', { ptpId });
  return ptp;
}

export async function fulfillPTP(ptpId: string, paymentId: string) {
  const ptp = await prisma.ptpCommitment.update({
    where: { id: ptpId },
    data: { status: 'KEPT' }
  });

  await prisma.recoveryCase.update({
    where: { id: ptp.caseId },
    data: { status: 'RECOVERED' }
  });

  await appendCaseEvent(ptp.caseId, 'PTP_KEPT', 'ptp-state-machine', { ptpId, paymentId });
  return ptp;
}
