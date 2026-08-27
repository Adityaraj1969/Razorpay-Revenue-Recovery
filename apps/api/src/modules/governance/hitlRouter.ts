import { DiagnosisCode } from '@revloop/shared-types';

/**
 * HITL Router — Human Console Escalation Engine
 * Routes cases requiring human judgment to the operator desk.
 * 
 * Reference: Rules.md §6, PRD.md FR-6
 */

export interface EscalateResult {
  shouldEscalate: boolean;
  reason?: string;
}

export interface EscalateContext {
  caseId: string;
  amountAtRiskPaise: bigint;
  brokenPtpCount: number;
}

export function shouldEscalate(caseCtx: EscalateContext, diagnosisCode: DiagnosisCode, confidenceScore: number): EscalateResult {
  // Trigger 1: Dispute raised
  if (diagnosisCode === DiagnosisCode.DGN_09_INVOICE_OVERDUE_DISPUTED) {
    return { shouldEscalate: true, reason: 'Dispute raised (DGN-09)' };
  }
  
  // Trigger 2: Low confidence
  if (diagnosisCode === DiagnosisCode.DGN_12_UNKNOWN_LOW_CONFIDENCE || confidenceScore < 0.70) {
    return { shouldEscalate: true, reason: 'Low confidence diagnosis or unknown category' };
  }
  
  // Trigger 3: High value invoice (amount > ₹2L)
  if (caseCtx.amountAtRiskPaise > 20000000n) {
    return { shouldEscalate: true, reason: 'High value case (> ₹2L)' };
  }
  
  // Trigger 4: 2+ broken PTPs
  if (caseCtx.brokenPtpCount >= 2) {
    return { shouldEscalate: true, reason: '2+ broken Promise-to-Pay commitments' };
  }
  
  return { shouldEscalate: false };
}

// In-memory queue for buildathon
const humanQueue = new Set<string>();

export async function escalateCase(caseId: string, reason: string, context?: any): Promise<void> {
  console.log(`[HITLRouter] Escalating case ${caseId} to human queue. Reason: ${reason}`);
  humanQueue.add(caseId);
}

export async function getHumanQueueStats(): Promise<{ pendingCount: number }> {
  return { pendingCount: humanQueue.size };
}
