/**
 * Rule-First Deterministic Classifier
 * Fast V8 regex/lookup classifier for standard Razorpay error codes.
 * Handles 78% of incoming cases without any LLM call.
 * 
 * Reference: Architecture.md §5, AI_Strategy.md §3
 */

import { EntityType } from '@revloop/shared-types';
import { RuleClassificationResult } from './schemas.js';

export function classifyByRule(
  errorCode: string | null,
  errorSource: string | null,
  errorStep: string | null,
  entityType: EntityType,
  errorReason: string | null = null
): RuleClassificationResult | null {
  const code = (errorCode || '').toUpperCase();
  const source = (errorSource || '').toLowerCase();
  const step = (errorStep || '').toLowerCase();
  
  if (code.includes('INSUFFICIENT') || code.includes('INSUFFICIENT_FUNDS')) {
    return { diagnosisCode: 'DGN_01', confidenceScore: 0.98, resolvedBy: 'RULE', reasoningSummary: 'Matched hardcoded rule for insufficient funds.' };
  }
  
  if (code.includes('CARD_EXPIRED') || code.includes('CARD_BLOCKED')) {
    return { diagnosisCode: 'DGN_02', confidenceScore: 0.97, resolvedBy: 'RULE', reasoningSummary: 'Matched hardcoded rule for expired/blocked card.' };
  }
  
  if (code.includes('BAD_REQUEST_PAYMENT_TIMED_OUT') || code.includes('GATEWAY_ERROR') || code.includes('BANK_SYSTEM_ERROR')) {
    return { diagnosisCode: 'DGN_05', confidenceScore: 0.95, resolvedBy: 'RULE', reasoningSummary: 'Matched hardcoded rule for timeout/gateway/bank error.' };
  }
  
  if (code.includes('AUTHENTICATION') || step === 'payment_authentication') {
    return { diagnosisCode: 'DGN_04', confidenceScore: 0.93, resolvedBy: 'RULE', reasoningSummary: 'Matched hardcoded rule for authentication failure.' };
  }
  
  if (source === 'issuer_bank') { // Implicit generic decline since we checked specific codes above
    return { diagnosisCode: 'DGN_03', confidenceScore: 0.85, resolvedBy: 'RULE', reasoningSummary: 'Matched hardcoded rule for generic issuer bank decline.' };
  }
  
  if (entityType === 'SUBSCRIPTION' && (code.includes('MANDATE') || (errorReason && errorReason.toLowerCase().includes('mandate')))) {
    return { diagnosisCode: 'DGN_06', confidenceScore: 0.96, resolvedBy: 'RULE', reasoningSummary: 'Matched hardcoded rule for subscription mandate failure.' };
  }
  
  if (entityType === 'ORDER' && !code) {
    // Assuming no payment event, this is a proxy
    return { diagnosisCode: 'DGN_07', confidenceScore: 0.92, resolvedBy: 'RULE', reasoningSummary: 'Matched hardcoded rule for cart abandonment.' };
  }
  
  if (entityType === 'VIRTUAL_ACCOUNT' && (code.includes('AMOUNT_MISMATCH') || (errorReason && errorReason.includes('amount')))) {
    return { diagnosisCode: 'DGN_10', confidenceScore: 0.94, resolvedBy: 'RULE', reasoningSummary: 'Matched hardcoded rule for VA amount mismatch.' };
  }

  return null;
}
