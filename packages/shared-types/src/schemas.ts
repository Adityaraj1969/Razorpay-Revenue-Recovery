import { z } from 'zod';
import { 
  PersonalizationTone, 
  Channel, 
  StoppingRule, 
  CaseStatus 
} from './enums.js';

/**
 * RazorpayWebhookPayload — the webhook event structure from Design.md §4.1
 */
export const RazorpayWebhookPayloadSchema = z.object({
  entity: z.string(),
  account_id: z.string(),
  event: z.string(),
  contains: z.array(z.string()),
  payload: z.record(z.any()), // Can be payment, invoice, order, subscription, virtual_account
  created_at: z.number(),
});
export type RazorpayWebhookPayload = z.infer<typeof RazorpayWebhookPayloadSchema>;

/**
 * DiagnosticOutput — the LLM output schema from AI_Strategy.md §4.1
 */
export const DiagnosticOutputSchema = z.object({
  rootCauseCategory: z.string(),
  confidenceScore: z.number().min(0).max(1),
  recommendedAction: z.string(),
  executionDelaySeconds: z.number(),
  proposedDiscountPercent: z.number().max(5.0),
  personalizationTone: z.nativeEnum(PersonalizationTone),
  reasoningSummary: z.string(),
});
export type DiagnosticOutput = z.infer<typeof DiagnosticOutputSchema>;

/**
 * PolicyDecision schema
 */
export const PolicyDecisionSchema = z.object({
  caseId: z.string().uuid(),
  diagnosisCode: z.string(),
  actionCode: z.string(),
  shouldStop: z.boolean(),
  stoppingRule: z.nativeEnum(StoppingRule).optional(),
  nextStatus: z.nativeEnum(CaseStatus),
  evidence: z.record(z.any()),
});
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

/**
 * PTPCommitment — from Design.md §4.2
 */
export const PTPCommitmentSchema = z.object({
  promised_timestamp: z.string().datetime(),
  promised_amount_paise: z.number(), // bigint in DB, but TS handles as number in schema or z.bigint() if required, using number for zod parsing ease unless bigints are strict
  promised_method: z.string(),
  channel: z.nativeEnum(Channel),
  transcript_excerpt: z.string(),
});
export type PTPCommitment = z.infer<typeof PTPCommitmentSchema>;

/**
 * MerchantConfig schema
 */
export const MerchantConfigSchema = z.object({
  merchantId: z.string().uuid(),
  maxConcessionPercent: z.number(),
  maxVoiceAttempts: z.number().default(2),
  maxWhatsappMessages: z.number().default(3),
  maxDunningEmails: z.number().default(4),
  maxMandateRetries: z.number().default(3),
  operatingWindowStart: z.string().default('09:00'),
  operatingWindowEnd: z.string().default('19:00'),
  marginFloorPercent: z.number(),
  isKillSwitchActive: z.boolean().default(false),
});
export type MerchantConfig = z.infer<typeof MerchantConfigSchema>;

/**
 * CaseEvent schema
 */
export const CaseEventSchema = z.object({
  globalEventId: z.string().uuid(),
  caseId: z.string().uuid(),
  sequenceNumber: z.number(),
  eventType: z.string(),
  actor: z.string(),
  payload: z.record(z.any()),
  previousRecordHash: z.string(),
  currentRecordHash: z.string(),
  occurredAt: z.string().datetime(),
});
export type CaseEvent = z.infer<typeof CaseEventSchema>;

/**
 * AuditEntry schema - from Rules.md §7
 */
export const AuditEntrySchema = z.object({
  caseId: z.string().uuid(),
  action: z.string(),
  actor: z.string(),
  timestamp: z.string().datetime(),
  payload: z.record(z.any()),
});
export type AuditEntry = z.infer<typeof AuditEntrySchema>;
