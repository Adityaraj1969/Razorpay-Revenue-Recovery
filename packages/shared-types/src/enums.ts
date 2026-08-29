/**
 * Entity types
 * Design.md §2
 */
export const EntityType = {
  PAYMENT: 'PAYMENT',
  ORDER: 'ORDER',
  SUBSCRIPTION: 'SUBSCRIPTION',
  INVOICE: 'INVOICE',
  VIRTUAL_ACCOUNT: 'VIRTUAL_ACCOUNT',
} as const;
export type EntityType = typeof EntityType[keyof typeof EntityType];

/**
 * Case status enum — ALL 10 statuses
 * Design.md §2
 */
export const CaseStatus = {
  OPEN: 'OPEN',
  DIAGNOSING: 'DIAGNOSING',
  AWAITING_POLICY: 'AWAITING_POLICY',
  ACTION_TAKEN: 'ACTION_TAKEN',
  PTP_LOCKED: 'PTP_LOCKED',
  COOLDOWN: 'COOLDOWN',
  ESCALATED_HUMAN: 'ESCALATED_HUMAN',
  RECOVERED: 'RECOVERED',
  SUPPRESSED: 'SUPPRESSED',
  CLOSED_UNRECOVERED: 'CLOSED_UNRECOVERED',
} as const;
export type CaseStatus = typeof CaseStatus[keyof typeof CaseStatus];

/**
 * Diagnosis codes — ALL 12 codes DGN_01 through DGN_12
 * Design.md §2
 */
export const DiagnosisCode = {
  DGN_01_INSUFFICIENT_FUNDS: 'DGN_01_INSUFFICIENT_FUNDS',
  DGN_02_CARD_EXPIRED_OR_BLOCKED: 'DGN_02_CARD_EXPIRED_OR_BLOCKED',
  DGN_03_ISSUER_DECLINED_GENERIC: 'DGN_03_ISSUER_DECLINED_GENERIC',
  DGN_04_AUTHENTICATION_ABANDONED: 'DGN_04_AUTHENTICATION_ABANDONED',
  DGN_05_TECHNICAL_GATEWAY_TIMEOUT: 'DGN_05_TECHNICAL_GATEWAY_TIMEOUT',
  DGN_06_MANDATE_LAPSED_OR_REVOKED: 'DGN_06_MANDATE_LAPSED_OR_REVOKED',
  DGN_07_CHECKOUT_ABANDONED_PRE_PAYMENT: 'DGN_07_CHECKOUT_ABANDONED_PRE_PAYMENT',
  DGN_08_INVOICE_OVERDUE_NO_RESPONSE: 'DGN_08_INVOICE_OVERDUE_NO_RESPONSE',
  DGN_09_INVOICE_OVERDUE_DISPUTED: 'DGN_09_INVOICE_OVERDUE_DISPUTED',
  DGN_10_VIRTUAL_ACCOUNT_UNDERPAID: 'DGN_10_VIRTUAL_ACCOUNT_UNDERPAID',
  DGN_11_PTP_FOLLOWUP_DUE: 'DGN_11_PTP_FOLLOWUP_DUE',
  DGN_12_UNKNOWN_LOW_CONFIDENCE: 'DGN_12_UNKNOWN_LOW_CONFIDENCE',
} as const;
export type DiagnosisCode = typeof DiagnosisCode[keyof typeof DiagnosisCode];

/**
 * Action codes — ALL 11 actions A1 through A11
 * Design.md §2
 */
export const ActionCode = {
  A1_RETRY_PAYMENT_SAME_METHOD: 'A1_RETRY_PAYMENT_SAME_METHOD',
  A2_SEND_ALTERNATE_METHOD_LINK: 'A2_SEND_ALTERNATE_METHOD_LINK',
  A3_SEND_REMINDER_SOFT: 'A3_SEND_REMINDER_SOFT',
  A4_SEND_REMINDER_WITH_LINK: 'A4_SEND_REMINDER_WITH_LINK',
  A5_OFFER_BOUNDED_INCENTIVE: 'A5_OFFER_BOUNDED_INCENTIVE',
  A6_SCHEDULE_MANDATE_RECHECK: 'A6_SCHEDULE_MANDATE_RECHECK',
  A7_REQUEST_CARD_UPDATE: 'A7_REQUEST_CARD_UPDATE',
  A8_B2B_DUNNING_STEP: 'A8_B2B_DUNNING_STEP',
  A9_CAPTURE_PROMISE_TO_PAY: 'A9_CAPTURE_PROMISE_TO_PAY',
  A10_ESCALATE_TO_HUMAN: 'A10_ESCALATE_TO_HUMAN',
  A11_SUPPRESS_AND_CLOSE: 'A11_SUPPRESS_AND_CLOSE',
} as const;
export type ActionCode = typeof ActionCode[keyof typeof ActionCode];

/**
 * Channel types
 * Design.md §2
 */
export const ChannelType = {
  VOICE: 'VOICE',
  WHATSAPP: 'WHATSAPP',
  RETRY: 'RETRY',
  EMAIL: 'EMAIL',
} as const;
export type ChannelType = typeof ChannelType[keyof typeof ChannelType];

/**
 * PTP status
 * Design.md §2
 */
export const PTPStatus = {
  PENDING: 'PENDING',
  KEPT: 'KEPT',
  BROKEN: 'BROKEN',
} as const;
export type PTPStatus = typeof PTPStatus[keyof typeof PTPStatus];

/**
 * Delivery status
 * Design.md §2
 */
export const DeliveryStatus = {
  QUEUED: 'QUEUED',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED',
  CLICKED: 'CLICKED',
} as const;
export type DeliveryStatus = typeof DeliveryStatus[keyof typeof DeliveryStatus];

/**
 * Personalization tone
 * Design.md §2
 */
export const PersonalizationTone = {
  HINGLISH_EMPATHETIC: 'hinglish_empathetic',
  ENGLISH_DIRECT: 'english_direct',
  HINDI_RESPECTFUL: 'hindi_respectful',
} as const;
export type PersonalizationTone = typeof PersonalizationTone[keyof typeof PersonalizationTone];

/**
 * Stopping rule IDs
 * Design.md §2
 */
export const StoppingRule = {
  STOP_01_SETTLEMENT_VERIFIED: 'STOP_01_SETTLEMENT_VERIFIED',
  STOP_02_CUSTOMER_OPT_OUT: 'STOP_02_CUSTOMER_OPT_OUT',
  STOP_03_DISPUTE_RAISED: 'STOP_03_DISPUTE_RAISED',
  STOP_04_TOUCHPOINT_LIMIT: 'STOP_04_TOUCHPOINT_LIMIT',
  STOP_05_BANK_DEGRADATION: 'STOP_05_BANK_DEGRADATION',
  STOP_06_PTP_LOCKED: 'STOP_06_PTP_LOCKED',
  STOP_07_KILL_SWITCH: 'STOP_07_KILL_SWITCH',
} as const;
export type StoppingRule = typeof StoppingRule[keyof typeof StoppingRule];
