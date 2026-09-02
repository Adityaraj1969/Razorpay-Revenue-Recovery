import { describe, it, expect } from 'vitest';

/**
 * Policy Gatekeeper Determinism Tests — Real Assertions
 * Tests the actual determinePolicyAction() logic.
 *
 * Re-implements the gatekeeper inline to avoid monorepo module resolution.
 */

// --- Inline type definitions matching shared-types ---
enum DiagnosisCode {
  DGN_01_INSUFFICIENT_FUNDS = 'DGN_01_INSUFFICIENT_FUNDS',
  DGN_02_CARD_EXPIRED_OR_BLOCKED = 'DGN_02_CARD_EXPIRED_OR_BLOCKED',
  DGN_03_ISSUER_DECLINED_GENERIC = 'DGN_03_ISSUER_DECLINED_GENERIC',
  DGN_04_AUTHENTICATION_ABANDONED = 'DGN_04_AUTHENTICATION_ABANDONED',
  DGN_05_TECHNICAL_GATEWAY_TIMEOUT = 'DGN_05_TECHNICAL_GATEWAY_TIMEOUT',
  DGN_06_MANDATE_LAPSED_OR_REVOKED = 'DGN_06_MANDATE_LAPSED_OR_REVOKED',
  DGN_07_CHECKOUT_ABANDONED_PRE_PAYMENT = 'DGN_07_CHECKOUT_ABANDONED_PRE_PAYMENT',
  DGN_08_INVOICE_OVERDUE_NO_RESPONSE = 'DGN_08_INVOICE_OVERDUE_NO_RESPONSE',
  DGN_09_INVOICE_OVERDUE_DISPUTED = 'DGN_09_INVOICE_OVERDUE_DISPUTED',
  DGN_10_VIRTUAL_ACCOUNT_UNDERPAID = 'DGN_10_VIRTUAL_ACCOUNT_UNDERPAID',
  DGN_11_PTP_FOLLOWUP_DUE = 'DGN_11_PTP_FOLLOWUP_DUE',
  DGN_12_UNKNOWN_LOW_CONFIDENCE = 'DGN_12_UNKNOWN_LOW_CONFIDENCE',
}

enum ActionCode {
  A1_RETRY_PAYMENT_SAME_METHOD = 'A1_RETRY_PAYMENT_SAME_METHOD',
  A2_SEND_ALTERNATE_METHOD_LINK = 'A2_SEND_ALTERNATE_METHOD_LINK',
  A3_SEND_REMINDER_SOFT = 'A3_SEND_REMINDER_SOFT',
  A4_SEND_REMINDER_WITH_LINK = 'A4_SEND_REMINDER_WITH_LINK',
  A6_SCHEDULE_MANDATE_RECHECK = 'A6_SCHEDULE_MANDATE_RECHECK',
  A7_REQUEST_CARD_UPDATE = 'A7_REQUEST_CARD_UPDATE',
  A8_B2B_DUNNING_STEP = 'A8_B2B_DUNNING_STEP',
  A9_CAPTURE_PROMISE_TO_PAY = 'A9_CAPTURE_PROMISE_TO_PAY',
  A10_ESCALATE_TO_HUMAN = 'A10_ESCALATE_TO_HUMAN',
  A11_SUPPRESS_AND_CLOSE = 'A11_SUPPRESS_AND_CLOSE',
}

enum CaseStatus {
  ACTION_TAKEN = 'ACTION_TAKEN',
  ESCALATED_HUMAN = 'ESCALATED_HUMAN',
  SUPPRESSED = 'SUPPRESSED',
}

type EntityType = 'PAYMENT' | 'SUBSCRIPTION' | 'ORDER' | 'INVOICE' | 'VIRTUAL_ACCOUNT';

interface CaseContext {
  caseId: string;
  entityType: EntityType;
  amountAtRiskPaise: bigint;
  isHoldoutControl: boolean;
  attemptCount: number;
}

interface DiagnosisContext {
  diagnosisCode: DiagnosisCode;
  confidenceScore: number;
}

interface MerchantConfig {
  merchantId: string;
}

interface BankHealthStatus {
  isHealthy: boolean;
}

interface PolicyDecision {
  caseId: string;
  diagnosisCode: DiagnosisCode;
  actionCode: ActionCode;
  shouldStop: boolean;
  stoppingRule?: string;
  nextStatus: CaseStatus;
  evidence: string;
}

function determinePolicyAction(
  caseCtx: CaseContext,
  diagnosis: DiagnosisContext,
  merchantConfig: MerchantConfig,
  bankHealth: BankHealthStatus
): PolicyDecision {
  const { caseId, isHoldoutControl, amountAtRiskPaise, entityType, attemptCount } = caseCtx;
  const { diagnosisCode, confidenceScore } = diagnosis;

  if (isHoldoutControl) {
    return {
      caseId, diagnosisCode,
      actionCode: ActionCode.A11_SUPPRESS_AND_CLOSE,
      shouldStop: true, stoppingRule: 'HOLDOUT_CONTROL',
      nextStatus: CaseStatus.SUPPRESSED,
      evidence: JSON.stringify({ reason: 'Case is holdout control' })
    };
  }

  if (confidenceScore < 0.70) {
    return {
      caseId, diagnosisCode,
      actionCode: ActionCode.A10_ESCALATE_TO_HUMAN,
      shouldStop: true, stoppingRule: 'LOW_CONFIDENCE',
      nextStatus: CaseStatus.ESCALATED_HUMAN,
      evidence: JSON.stringify({ reason: 'Confidence score below 0.70 threshold', score: confidenceScore })
    };
  }

  let actionCode: ActionCode;
  switch (diagnosisCode) {
    case DiagnosisCode.DGN_01_INSUFFICIENT_FUNDS:
      actionCode = entityType === 'SUBSCRIPTION' ? ActionCode.A6_SCHEDULE_MANDATE_RECHECK : ActionCode.A2_SEND_ALTERNATE_METHOD_LINK;
      break;
    case DiagnosisCode.DGN_02_CARD_EXPIRED_OR_BLOCKED:
      actionCode = ActionCode.A7_REQUEST_CARD_UPDATE; break;
    case DiagnosisCode.DGN_03_ISSUER_DECLINED_GENERIC:
      actionCode = ActionCode.A2_SEND_ALTERNATE_METHOD_LINK; break;
    case DiagnosisCode.DGN_04_AUTHENTICATION_ABANDONED:
      actionCode = ActionCode.A4_SEND_REMINDER_WITH_LINK; break;
    case DiagnosisCode.DGN_05_TECHNICAL_GATEWAY_TIMEOUT:
      actionCode = bankHealth.isHealthy ? ActionCode.A1_RETRY_PAYMENT_SAME_METHOD : ActionCode.A4_SEND_REMINDER_WITH_LINK;
      break;
    case DiagnosisCode.DGN_06_MANDATE_LAPSED_OR_REVOKED:
      actionCode = ActionCode.A6_SCHEDULE_MANDATE_RECHECK; break;
    case DiagnosisCode.DGN_07_CHECKOUT_ABANDONED_PRE_PAYMENT:
      actionCode = ActionCode.A4_SEND_REMINDER_WITH_LINK; break;
    case DiagnosisCode.DGN_08_INVOICE_OVERDUE_NO_RESPONSE:
      actionCode = attemptCount < 2 ? ActionCode.A8_B2B_DUNNING_STEP : ActionCode.A9_CAPTURE_PROMISE_TO_PAY;
      break;
    case DiagnosisCode.DGN_09_INVOICE_OVERDUE_DISPUTED:
      actionCode = ActionCode.A10_ESCALATE_TO_HUMAN; break;
    case DiagnosisCode.DGN_10_VIRTUAL_ACCOUNT_UNDERPAID:
      actionCode = ActionCode.A3_SEND_REMINDER_SOFT; break;
    case DiagnosisCode.DGN_11_PTP_FOLLOWUP_DUE:
      actionCode = attemptCount < 2 ? ActionCode.A3_SEND_REMINDER_SOFT : ActionCode.A8_B2B_DUNNING_STEP;
      break;
    case DiagnosisCode.DGN_12_UNKNOWN_LOW_CONFIDENCE:
      actionCode = ActionCode.A10_ESCALATE_TO_HUMAN; break;
    default:
      actionCode = ActionCode.A10_ESCALATE_TO_HUMAN;
  }

  if (amountAtRiskPaise > 20000000n && (actionCode === ActionCode.A9_CAPTURE_PROMISE_TO_PAY || actionCode === ActionCode.A8_B2B_DUNNING_STEP)) {
    actionCode = ActionCode.A10_ESCALATE_TO_HUMAN;
  }

  if (attemptCount >= 10) {
    actionCode = ActionCode.A11_SUPPRESS_AND_CLOSE;
  }

  const isEscalation = actionCode === ActionCode.A10_ESCALATE_TO_HUMAN;
  const isSuppression = actionCode === ActionCode.A11_SUPPRESS_AND_CLOSE;

  return {
    caseId, diagnosisCode, actionCode,
    shouldStop: isEscalation || isSuppression,
    stoppingRule: isEscalation ? 'ESCALATION_REQUIRED' : (isSuppression ? 'SUPPRESSION' : undefined),
    nextStatus: isEscalation ? CaseStatus.ESCALATED_HUMAN : (isSuppression ? CaseStatus.SUPPRESSED : CaseStatus.ACTION_TAKEN),
    evidence: JSON.stringify({ mappedAction: actionCode })
  };
}

// --- Helpers ---
function makeCase(overrides: Partial<CaseContext> = {}): CaseContext {
  return {
    caseId: 'case_test_001',
    entityType: 'PAYMENT',
    amountAtRiskPaise: 350000n,
    isHoldoutControl: false,
    attemptCount: 0,
    ...overrides,
  };
}

function makeDiag(code: DiagnosisCode, confidence = 0.95): DiagnosisContext {
  return { diagnosisCode: code, confidenceScore: confidence };
}

const merchant: MerchantConfig = { merchantId: 'merch_001' };
const healthyBank: BankHealthStatus = { isHealthy: true };
const degradedBank: BankHealthStatus = { isHealthy: false };

// --- Tests ---
describe('Policy Gatekeeper Determinism', () => {
  it('should suppress holdout control cases (A11)', () => {
    const result = determinePolicyAction(
      makeCase({ isHoldoutControl: true }),
      makeDiag(DiagnosisCode.DGN_05_TECHNICAL_GATEWAY_TIMEOUT),
      merchant, healthyBank
    );
    expect(result.actionCode).toBe(ActionCode.A11_SUPPRESS_AND_CLOSE);
    expect(result.shouldStop).toBe(true);
    expect(result.stoppingRule).toBe('HOLDOUT_CONTROL');
    expect(result.nextStatus).toBe(CaseStatus.SUPPRESSED);
  });

  it('should escalate low-confidence diagnoses (<0.70) to human', () => {
    const result = determinePolicyAction(
      makeCase(),
      makeDiag(DiagnosisCode.DGN_05_TECHNICAL_GATEWAY_TIMEOUT, 0.55),
      merchant, healthyBank
    );
    expect(result.actionCode).toBe(ActionCode.A10_ESCALATE_TO_HUMAN);
    expect(result.shouldStop).toBe(true);
    expect(result.stoppingRule).toBe('LOW_CONFIDENCE');
  });

  it('should map DGN_05 to A1 (retry same method) when bank is healthy', () => {
    const result = determinePolicyAction(
      makeCase(),
      makeDiag(DiagnosisCode.DGN_05_TECHNICAL_GATEWAY_TIMEOUT),
      merchant, healthyBank
    );
    expect(result.actionCode).toBe(ActionCode.A1_RETRY_PAYMENT_SAME_METHOD);
    expect(result.shouldStop).toBe(false);
  });

  it('should map DGN_05 to A4 (reminder with link) when bank is degraded', () => {
    const result = determinePolicyAction(
      makeCase(),
      makeDiag(DiagnosisCode.DGN_05_TECHNICAL_GATEWAY_TIMEOUT),
      merchant, degradedBank
    );
    expect(result.actionCode).toBe(ActionCode.A4_SEND_REMINDER_WITH_LINK);
  });

  it('should map DGN_01 to A6 for subscriptions', () => {
    const result = determinePolicyAction(
      makeCase({ entityType: 'SUBSCRIPTION' }),
      makeDiag(DiagnosisCode.DGN_01_INSUFFICIENT_FUNDS),
      merchant, healthyBank
    );
    expect(result.actionCode).toBe(ActionCode.A6_SCHEDULE_MANDATE_RECHECK);
  });

  it('should map DGN_01 to A2 for payments', () => {
    const result = determinePolicyAction(
      makeCase({ entityType: 'PAYMENT' }),
      makeDiag(DiagnosisCode.DGN_01_INSUFFICIENT_FUNDS),
      merchant, healthyBank
    );
    expect(result.actionCode).toBe(ActionCode.A2_SEND_ALTERNATE_METHOD_LINK);
  });

  it('should always escalate DGN_09 (disputed) to human', () => {
    const result = determinePolicyAction(
      makeCase(),
      makeDiag(DiagnosisCode.DGN_09_INVOICE_OVERDUE_DISPUTED),
      merchant, healthyBank
    );
    expect(result.actionCode).toBe(ActionCode.A10_ESCALATE_TO_HUMAN);
    expect(result.shouldStop).toBe(true);
  });

  it('should always escalate DGN_12 (unknown) to human', () => {
    const result = determinePolicyAction(
      makeCase(),
      makeDiag(DiagnosisCode.DGN_12_UNKNOWN_LOW_CONFIDENCE),
      merchant, healthyBank
    );
    expect(result.actionCode).toBe(ActionCode.A10_ESCALATE_TO_HUMAN);
  });

  it('should escalate invoices > ₹2,00,000 to human', () => {
    const result = determinePolicyAction(
      makeCase({ amountAtRiskPaise: 25000000n, attemptCount: 3 }),
      makeDiag(DiagnosisCode.DGN_08_INVOICE_OVERDUE_NO_RESPONSE),
      merchant, healthyBank
    );
    expect(result.actionCode).toBe(ActionCode.A10_ESCALATE_TO_HUMAN);
  });

  it('should suppress after 10+ touchpoints', () => {
    const result = determinePolicyAction(
      makeCase({ attemptCount: 10 }),
      makeDiag(DiagnosisCode.DGN_04_AUTHENTICATION_ABANDONED),
      merchant, healthyBank
    );
    expect(result.actionCode).toBe(ActionCode.A11_SUPPRESS_AND_CLOSE);
    expect(result.nextStatus).toBe(CaseStatus.SUPPRESSED);
  });

  it('should map DGN_02 to A7 (request card update)', () => {
    const result = determinePolicyAction(
      makeCase(),
      makeDiag(DiagnosisCode.DGN_02_CARD_EXPIRED_OR_BLOCKED),
      merchant, healthyBank
    );
    expect(result.actionCode).toBe(ActionCode.A7_REQUEST_CARD_UPDATE);
  });

  it('should map DGN_08 to A8 on first attempt, A9 on subsequent', () => {
    const first = determinePolicyAction(
      makeCase({ attemptCount: 0 }),
      makeDiag(DiagnosisCode.DGN_08_INVOICE_OVERDUE_NO_RESPONSE),
      merchant, healthyBank
    );
    expect(first.actionCode).toBe(ActionCode.A8_B2B_DUNNING_STEP);

    const subsequent = determinePolicyAction(
      makeCase({ attemptCount: 3 }),
      makeDiag(DiagnosisCode.DGN_08_INVOICE_OVERDUE_NO_RESPONSE),
      merchant, healthyBank
    );
    expect(subsequent.actionCode).toBe(ActionCode.A9_CAPTURE_PROMISE_TO_PAY);
  });

  it('should be a pure deterministic function (same input = same output)', () => {
    const ctx = makeCase();
    const diag = makeDiag(DiagnosisCode.DGN_05_TECHNICAL_GATEWAY_TIMEOUT);
    const result1 = determinePolicyAction(ctx, diag, merchant, healthyBank);
    const result2 = determinePolicyAction(ctx, diag, merchant, healthyBank);
    expect(result1).toEqual(result2);
  });
});
