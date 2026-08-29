import { DiagnosisCode, ActionCode, CaseStatus, EntityType } from '@revloop/shared-types';

export interface CaseContext {
  caseId: string;
  entityType: EntityType;
  amountAtRiskPaise: bigint;
  isHoldoutControl: boolean;
  attemptCount: number;
}

export interface DiagnosisContext {
  diagnosisCode: DiagnosisCode;
  confidenceScore: number;
}

export interface MerchantConfig {
  merchantId: string;
}

export interface BankHealthStatus {
  isHealthy: boolean;
}

export interface PolicyDecision {
  caseId: string;
  diagnosisCode: DiagnosisCode;
  actionCode: ActionCode;
  shouldStop: boolean;
  stoppingRule?: string;
  nextStatus: CaseStatus;
  evidence: string;
}

/**
 * Policy Gatekeeper — Pure Deterministic Policy Engine
 * Core Invariant: "The LLM Proposes, The Code Disposes"
 * 
 * Maps (Case, Diagnosis, MerchantConfig) → ActionCode
 * This function NEVER makes network calls, NEVER calls an LLM.
 * It is a pure, side-effect-free, unit-testable function.
 * 
 * Reference: Rules.md §1, Architecture.md §1 invariant 1, PRD.md FR-7
 */
export function determinePolicyAction(
  caseCtx: CaseContext,
  diagnosis: DiagnosisContext,
  merchantConfig: MerchantConfig,
  bankHealth: BankHealthStatus
): PolicyDecision {
  const { caseId, isHoldoutControl, amountAtRiskPaise, entityType, attemptCount } = caseCtx;
  const { diagnosisCode, confidenceScore } = diagnosis;

  if (isHoldoutControl) {
    return {
      caseId,
      diagnosisCode,
      actionCode: ActionCode.A11_SUPPRESS_AND_CLOSE,
      shouldStop: true,
      stoppingRule: 'HOLDOUT_CONTROL',
      nextStatus: CaseStatus.SUPPRESSED,
      evidence: JSON.stringify({ reason: 'Case is holdout control' })
    };
  }

  if (confidenceScore < 0.70) {
    return {
      caseId,
      diagnosisCode,
      actionCode: ActionCode.A10_ESCALATE_TO_HUMAN,
      shouldStop: true,
      stoppingRule: 'LOW_CONFIDENCE',
      nextStatus: CaseStatus.ESCALATED_HUMAN,
      evidence: JSON.stringify({ reason: 'Confidence score below 0.70 threshold', score: confidenceScore })
    };
  }

  let actionCode: ActionCode;

  switch (diagnosisCode) {
    case DiagnosisCode.DGN_01_INSUFFICIENT_FUNDS:
      actionCode = entityType === EntityType.SUBSCRIPTION ? ActionCode.A6_SCHEDULE_MANDATE_RECHECK : ActionCode.A2_SEND_ALTERNATE_METHOD_LINK;
      break;
    case DiagnosisCode.DGN_02_CARD_EXPIRED_OR_BLOCKED:
      actionCode = ActionCode.A7_REQUEST_CARD_UPDATE;
      break;
    case DiagnosisCode.DGN_03_ISSUER_DECLINED_GENERIC:
      actionCode = ActionCode.A2_SEND_ALTERNATE_METHOD_LINK;
      break;
    case DiagnosisCode.DGN_04_AUTHENTICATION_ABANDONED:
      actionCode = ActionCode.A4_SEND_REMINDER_WITH_LINK;
      break;
    case DiagnosisCode.DGN_05_TECHNICAL_GATEWAY_TIMEOUT:
      actionCode = bankHealth.isHealthy ? ActionCode.A1_RETRY_PAYMENT_SAME_METHOD : ActionCode.A4_SEND_REMINDER_WITH_LINK;
      break;
    case DiagnosisCode.DGN_06_MANDATE_LAPSED_OR_REVOKED:
      actionCode = ActionCode.A6_SCHEDULE_MANDATE_RECHECK;
      break;
    case DiagnosisCode.DGN_07_CHECKOUT_ABANDONED_PRE_PAYMENT:
      actionCode = ActionCode.A4_SEND_REMINDER_WITH_LINK;
      break;
    case DiagnosisCode.DGN_08_INVOICE_OVERDUE_NO_RESPONSE:
      actionCode = attemptCount < 2 ? ActionCode.A8_B2B_DUNNING_STEP : ActionCode.A9_CAPTURE_PROMISE_TO_PAY;
      break;
    case DiagnosisCode.DGN_09_INVOICE_OVERDUE_DISPUTED:
      actionCode = ActionCode.A10_ESCALATE_TO_HUMAN;
      break;
    case DiagnosisCode.DGN_10_VIRTUAL_ACCOUNT_UNDERPAID:
      actionCode = ActionCode.A3_SEND_REMINDER_SOFT;
      break;
    case DiagnosisCode.DGN_11_PTP_FOLLOWUP_DUE:
      actionCode = attemptCount < 2 ? ActionCode.A3_SEND_REMINDER_SOFT : ActionCode.A8_B2B_DUNNING_STEP;
      break;
    case DiagnosisCode.DGN_12_UNKNOWN_LOW_CONFIDENCE:
      actionCode = ActionCode.A10_ESCALATE_TO_HUMAN;
      break;
    default:
      actionCode = ActionCode.A10_ESCALATE_TO_HUMAN;
  }

  // High-value check: if amount > 20000000 paise (₹2L) and involves voice
  if (amountAtRiskPaise > 20000000n && (actionCode === ActionCode.A9_CAPTURE_PROMISE_TO_PAY || actionCode === ActionCode.A8_B2B_DUNNING_STEP)) {
    actionCode = ActionCode.A10_ESCALATE_TO_HUMAN;
  }

  // Touchpoint exhaustion: suppress after max attempts
  if (attemptCount >= 10) {
    actionCode = ActionCode.A11_SUPPRESS_AND_CLOSE;
  }

  const isEscalation = actionCode === ActionCode.A10_ESCALATE_TO_HUMAN;
  const isSuppression = actionCode === ActionCode.A11_SUPPRESS_AND_CLOSE;

  return {
    caseId,
    diagnosisCode,
    actionCode,
    shouldStop: isEscalation || isSuppression,
    stoppingRule: isEscalation ? 'ESCALATION_REQUIRED' : (isSuppression ? 'SUPPRESSION' : undefined),
    nextStatus: isEscalation ? CaseStatus.ESCALATED_HUMAN : (isSuppression ? CaseStatus.SUPPRESSED : CaseStatus.ACTION_TAKEN),
    evidence: JSON.stringify({ mappedAction: actionCode })
  };
}
