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

  const ptp = await prisma.promiseToPay.create({
    data: {
      caseId,
      promisedTimestamp,
      promisedAmountPaise: amountPaise,
      promisedMethod: method,
      status: 'PENDING'
    }
  });

  await prisma.case.update({
    where: { caseId },
    data: { currentStatus: 'PTP_LOCKED' }
  });

  // Schedule reminder T_PTP - 2 hours
  const reminderTime = new Date(promisedTimestamp.getTime() - 2 * 3600 * 1000);
  const delay = Math.max(0, reminderTime.getTime() - now.getTime());
  
  await scheduledQueue.add('ptp-reminder', { caseId, ptpId: ptp.ptpId }, { delay });

  await appendCaseEvent(caseId, 'PTP_CREATED', 'ptp-router', { ptpId: ptp.ptpId, promisedTimestamp });

  return {
    ptpId: ptp.ptpId,
    virtualAccountDetails: 'VA_1234567890' // Mocked Virtual Account
  };
}

export async function checkPTPFulfillment(caseId: string) {
  // Logic to check if payment was received
  return false;
}

export async function breakPTP(ptpId: string) {
  const ptp = await prisma.promiseToPay.update({
    where: { ptpId },
    data: { status: 'BROKEN' }
  });

  await prisma.case.update({
    where: { caseId: ptp.caseId },
    data: { 
      currentStatus: 'OPEN',
      // ptpBrokenCount doesn't exist on case model in schema. Removing it.
    }
  });

  await appendCaseEvent(ptp.caseId, 'PTP_BROKEN', 'ptp-state-machine', { ptpId });
  return ptp;
}

export async function fulfillPTP(ptpId: string, paymentId: string) {
  const ptp = await prisma.promiseToPay.update({
    where: { ptpId },
    data: { status: 'KEPT' }
  });

  await prisma.case.update({
    where: { caseId: ptp.caseId },
    data: { currentStatus: 'RECOVERED' }
  });

  await appendCaseEvent(ptp.caseId, 'PTP_KEPT', 'ptp-state-machine', { ptpId, paymentId });
  return ptp;
}
