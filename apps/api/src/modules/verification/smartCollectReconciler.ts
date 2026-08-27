import { prisma, CaseStatus, DiagnosisCode } from '@revloop/db';

/**
 * Smart Collect Reconciler — B2B Virtual Account Payment Matcher
 * Matches incoming RTGS/NEFT/IMPS transfers to Virtual Accounts.
 * 
 * Reference: Architecture.md §5, Design.md §5
 */

export async function handleVirtualAccountCredit(webhookPayload: any): Promise<void> {
  const { payload } = webhookPayload;
  const vaId = payload.virtual_account.entity.id;
  const amountReceivedPaise = BigInt(payload.virtual_account.entity.amount_received);
  
  const recoveryCase = await prisma.case.findFirst({
    where: { rzpEntityId: vaId, currentStatus: { notIn: [CaseStatus.RECOVERED, CaseStatus.CLOSED_UNRECOVERED] } }
  });
  
  if (!recoveryCase) return;
  
  if (amountReceivedPaise >= recoveryCase.amountAtRiskPaise) {
    // Full match
    await prisma.case.update({
      where: { caseId: recoveryCase.caseId },
      data: {
        amountRecoveredPaise: amountReceivedPaise,
        currentStatus: CaseStatus.RECOVERED,
        resolvedAt: new Date()
      }
    });
  } else {
    // Underpaid
    await prisma.case.update({
      where: { caseId: recoveryCase.caseId },
      data: {
        amountRecoveredPaise: { increment: amountReceivedPaise },
        rootCauseCategory: DiagnosisCode.DGN_10_VIRTUAL_ACCOUNT_UNDERPAID
      }
    });
    
    await prisma.diagnosis.create({
      data: {
        caseId: recoveryCase.caseId,
        diagnosisCode: DiagnosisCode.DGN_10_VIRTUAL_ACCOUNT_UNDERPAID,
        confidenceScore: 1.0,
        resolvedBy: 'RULE',
        reasoningSummary: `Underpaid virtual account. Expected ${recoveryCase.amountAtRiskPaise}, received ${amountReceivedPaise}`
      }
    });
    
    // In a real flow, this would trigger the policy engine which maps DGN_10 to A3 (Soft Reminder)
  }
}

export async function issueVirtualAccount(caseId: string, invoiceId: string, amountPaise: bigint): Promise<string> {
  console.log(`[SmartCollectReconciler] Issuing VA for case ${caseId}, invoice ${invoiceId}, amount ${amountPaise}`);
  // Mock external Razorpay API call
  return `va_${Math.random().toString(36).substring(2, 10)}`;
}
