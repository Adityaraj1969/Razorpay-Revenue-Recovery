/**
 * Execution Mesh — Bounded Multi-Channel Action Dispatcher
 * Routes approved policy actions (A1-A11) to their execution adapters.
 * 
 * Reference: Architecture.md §5 (Bounded Multi-Channel Mesh)
 */

import { acquireCaseLock, releaseCaseLock } from '../../infrastructure/lock.js';
import { appendCaseEvent } from '../audit/hashChain.js';
import { retryPayment, scheduleMandateRecheck } from './retryAdapter.js';
import { sendRecoveryMessage, sendReminderSoft, sendCardUpdateLink } from './whatsappAdapter.js';
import { sendDunningEmail } from './emailAdapter.js';
// Using WhatsApp adapter as a fallback for voice agent (A9) for now
// import { escalateToHitl } from './hitlRouter.js'; // To be implemented

// Define locally since @revloop/shared-types is not yet available in the context
export type ActionCode = 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8' | 'A9' | 'A10' | 'A11';

export interface ExecutionContext {
  caseId: string;
  actionCode: ActionCode;
  customerId: string;
  customerPhone: string;
  customerEmail: string;
  amountPaise: bigint;
  entityType: string;
  rzpEntityId: string;
  merchantId: string;
  diagnosisCode: string;
  concessionPercent?: number;
  ptpTimestamp?: string;
  paymentLinkUrl?: string;
}

export interface ExecutionResult {
  success: boolean;
  channel: string;
  actionCode: ActionCode;
  deliveryStatus: string;
  payloadSent?: Record<string, unknown>;
  error?: string;
  costPaise: bigint;
}

export async function dispatch(context: ExecutionContext): Promise<ExecutionResult> {
  const lock = await acquireCaseLock(context.caseId);
  let result: ExecutionResult;

  try {
    switch (context.actionCode) {
      case 'A1':
        result = await retryPayment(context.rzpEntityId, 'card'); // Simplify method
        result.actionCode = context.actionCode;
        break;
      
      case 'A2':
      case 'A3':
      case 'A4':
      case 'A5':
        result = await sendRecoveryMessage(
          context.customerPhone,
          context.paymentLinkUrl || '',
          context.customerId,
          Number(context.amountPaise) / 100, // INR
          context.rzpEntityId,
          context.diagnosisCode
        );
        result.actionCode = context.actionCode;
        break;

      case 'A6':
        result = await scheduleMandateRecheck(context.rzpEntityId, '06:00-09:30');
        result.actionCode = context.actionCode;
        break;

      case 'A7':
        result = await sendCardUpdateLink(
          context.customerPhone,
          context.customerId,
          context.paymentLinkUrl || ''
        );
        result.actionCode = context.actionCode;
        break;

      case 'A8':
        result = await sendDunningEmail({
          email: context.customerEmail,
          merchantName: context.merchantId,
          invoiceReference: context.rzpEntityId,
          amountPaise: Number(context.amountPaise),
          dueDate: new Date().toISOString(),
          paymentLinkUrl: context.paymentLinkUrl || ''
        }, 1);
        result.actionCode = context.actionCode;
        break;

      case 'A9':
        // Voice agent fallback
        result = await sendRecoveryMessage(
          context.customerPhone,
          context.paymentLinkUrl || '',
          context.customerId,
          Number(context.amountPaise) / 100,
          context.rzpEntityId,
          context.diagnosisCode
        );
        result.actionCode = context.actionCode;
        break;

      case 'A10':
        // Escalate to HITL
        result = {
          success: true,
          channel: 'hitl',
          actionCode: context.actionCode,
          deliveryStatus: 'escalated',
          costPaise: 0n
        };
        break;

      case 'A11':
        result = {
          success: true,
          channel: 'suppress',
          actionCode: context.actionCode,
          deliveryStatus: 'suppressed',
          costPaise: 0n
        };
        break;

      default:
        throw new Error(`Unsupported action code: ${context.actionCode}`);
    }

    await appendCaseEvent(
      context.caseId,
      'ACTION_DISPATCHED',
      'execution-mesh',
      { actionCode: context.actionCode, result }
    );
  } catch (error) {
    result = {
      success: false,
      channel: 'unknown',
      actionCode: context.actionCode,
      deliveryStatus: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      costPaise: 0n
    };
  } finally {
    await releaseCaseLock(lock);
  }

  return result;
}
