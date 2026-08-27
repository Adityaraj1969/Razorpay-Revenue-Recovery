import { CaseStatus, DiagnosisCode } from '@revloop/shared-types';

export interface InterceptorContext {
  caseId: string;
  isSettlementVerified: boolean;
  isCustomerOptedOut: boolean;
  diagnosisCode?: DiagnosisCode;
  voiceAttemptCount: number;
  whatsappAttemptCount: number;
  issuerFailureRate: number;
  hasActivePTP: boolean;
  isKillSwitchEngaged: boolean;
}

export interface RuleEvaluationResult {
  ruleId: string;
  triggered: boolean;
  reason?: string;
  nextStatus?: CaseStatus;
  latencyMs: number;
}

/**
 * Governance Interceptor — Hard-Stopping Rule Engine
 * Evaluates the 7-rule stopping matrix BEFORE any action executes.
 * If ANY rule triggers, execution halts immediately.
 * 
 * Reference: Rules.md §2, PRD.md FR-9, FR-13
 */
export async function evaluateStoppingRules(ctx: InterceptorContext): Promise<RuleEvaluationResult | null> {
  const start = Date.now();

  const rules = [
    {
      id: 'STOP-07',
      eval: () => ctx.isKillSwitchEngaged,
      reason: 'Kill switch engaged',
      status: CaseStatus.COOLDOWN
    },
    {
      id: 'STOP-01',
      eval: () => ctx.isSettlementVerified,
      reason: 'Settlement verified (payment.authorized/order.paid/virtual_account.credited)',
      status: CaseStatus.RECOVERED
    },
    {
      id: 'STOP-02',
      eval: () => ctx.isCustomerOptedOut,
      reason: 'Customer opt-out (STOP/UNSUBSCRIBE/DND/verbal refusal)',
      status: CaseStatus.SUPPRESSED
    },
    {
      id: 'STOP-03',
      eval: () => ctx.diagnosisCode === DiagnosisCode.DGN_09_INVOICE_OVERDUE_DISPUTED,
      reason: 'Dispute raised (DGN-09)',
      status: CaseStatus.ESCALATED_HUMAN
    },
    {
      id: 'STOP-04',
      eval: () => ctx.voiceAttemptCount >= 2 || ctx.whatsappAttemptCount >= 3,
      reason: 'Touchpoint limit exhausted (voice >= 2, whatsapp >= 3)',
      status: CaseStatus.COOLDOWN
    },
    {
      id: 'STOP-05',
      eval: () => ctx.issuerFailureRate >= 0.30,
      reason: 'Bank degradation (issuer failure rate >= 30%)',
      status: CaseStatus.COOLDOWN
    },
    {
      id: 'STOP-06',
      eval: () => ctx.hasActivePTP,
      reason: 'PTP locked (active promise-to-pay)',
      status: CaseStatus.PTP_LOCKED
    }
  ];

  for (const rule of rules) {
    if (rule.eval()) {
      return {
        ruleId: rule.id,
        triggered: true,
        reason: rule.reason,
        nextStatus: rule.status,
        latencyMs: Date.now() - start
      };
    }
  }

  return null;
}
