import { z } from 'zod';
import { EntityType } from '@revloop/shared-types';

export const CaseForDiagnosisSchema = z.object({
  caseId: z.string().uuid(),
  entityType: z.custom<EntityType>(),
  rzpEntityId: z.string(),
  errorCode: z.string().nullable().optional(),
  errorDescription: z.string().nullable().optional(),
  errorSource: z.string().nullable().optional(),
  errorStep: z.string().nullable().optional(),
  errorReason: z.string().nullable().optional(),
  amountPaise: z.number().int(),
  customerHistory: z.record(z.any()).optional(),
  bankHealthStatus: z.string().optional()
});

export type CaseForDiagnosis = z.infer<typeof CaseForDiagnosisSchema>;

export interface RuleClassificationResult {
  diagnosisCode: string;
  confidenceScore: number;
  resolvedBy: 'RULE';
  reasoningSummary: string;
}

export const LLMClassificationResultSchema = z.object({
  diagnosisCode: z.string(),
  confidenceScore: z.number().min(0).max(1),
  resolvedBy: z.literal('LLM'),
  reasoningSummary: z.string(),
  proposedAction: z.string().optional(),
  executionDelaySeconds: z.number().int().optional(),
  proposedDiscountPercent: z.number().optional(),
  personalizationTone: z.string().optional(),
});

export type LLMClassificationResult = z.infer<typeof LLMClassificationResultSchema>;

export type DiagnosticOutput = LLMClassificationResult & { caseId: string };
