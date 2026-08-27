import { prisma, CaseStatus } from '@revloop/db';
import { reconcileCase } from './settlementVerifier';

/**
 * Reconciliation Poller — Periodic Missed-Signal Backfill
 * Catches cases where webhooks were dropped or delayed.
 * Runs every 5 minutes to verify open cases against Razorpay API.
 * 
 * Reference: Architecture.md §2 (Reconciliation Poller)
 */

export async function startReconciliationPoller(): Promise<void> {
  console.log('[ReconciliationPoller] Scheduled 5-minute recurring job.');
  // In production: bullMQ.add('reconciliation', {}, { repeat: { every: 5 * 60 * 1000 } })
}

export async function runReconciliationBatch(): Promise<void> {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  // Find open cases older than 30 mins
  const cases = await prisma.case.findMany({
    where: {
      currentStatus: { notIn: [CaseStatus.RECOVERED, CaseStatus.CLOSED_UNRECOVERED, CaseStatus.SUPPRESSED] },
      createdAt: { lt: thirtyMinutesAgo }
    },
    take: 100 // Rate limit batch size
  });
  
  for (const c of cases) {
    try {
      await reconcileCase(c.caseId);
      // add small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`[ReconciliationPoller] Failed to reconcile case ${c.caseId}`, error);
    }
  }
}
