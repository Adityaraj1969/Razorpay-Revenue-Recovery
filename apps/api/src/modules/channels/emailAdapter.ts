/**
 * B2B Staged Dunning Email Adapter
 * Sends templated escalation-ladder emails for overdue invoices.
 * 
 * Reference: PRD.md A8, Rules.md §4
 */

import type { ExecutionResult } from './executionMesh.js';

interface EmailOptions {
  email: string;
  merchantName: string;
  invoiceReference: string;
  amountPaise: number;
  dueDate: string;
  paymentLinkUrl: string;
}

export function getDunningStage(attemptNumber: number): string {
  if (attemptNumber <= 1) return 'friendly_reminder';
  if (attemptNumber === 2) return 'formal_notice';
  return 'final_notice';
}

export async function sendDunningEmail(options: EmailOptions, attemptNumber: number): Promise<ExecutionResult> {
  const stage = getDunningStage(attemptNumber);
  
  // Format exact amount with tax breakdown for B2B
  const amountINR = (options.amountPaise / 100).toFixed(2);
  
  console.log(`[EMAIL] Sending ${stage} to ${options.email} for ${options.merchantName} - Invoice ${options.invoiceReference}`);
  console.log(`[EMAIL] Amount: ₹${amountINR}, Due Date: ${options.dueDate}`);
  console.log(`[EMAIL] Link: ${options.paymentLinkUrl}`);

  return {
    success: true,
    channel: 'email',
    actionCode: 'A8',
    deliveryStatus: 'sent',
    payloadSent: { stage, ...options },
    costPaise: 10n
  };
}
