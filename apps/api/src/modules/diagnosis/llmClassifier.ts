/**
 * Cognitive LLM Classifier — Gemini 2.5 Flash / Groq Fallback
 * Used only for ambiguous cases that the rule classifier cannot resolve.
 * Micro-batches 10 cases per prompt to stay within free-tier limits.
 * 
 * Reference: AI_Strategy.md §4.1, Architecture.md §5
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { CaseForDiagnosis, DiagnosticOutput, LLMClassificationResultSchema } from './schemas.js';

const SYSTEM_PROMPT = `
You are an expert payments diagnostic AI for Razorpay. Analyze the following batch of failed payment cases.
For each case, classify the root cause into one of the following diagnosis codes:
DGN_01: Insufficient Funds
DGN_02: Card Expired/Blocked
DGN_03: Generic Decline (Issuer)
DGN_04: Authentication Failure (3DS/OTP)
DGN_05: Technical/Gateway/Bank Downtime
DGN_06: Mandate/Subscription Setup Failure
DGN_07: Cart/Checkout Abandonment
DGN_10: Virtual Account Amount Mismatch
DGN_11: Fraud/Risk Block
DGN_12: Unknown / Requires Manual Review

Output your response strictly as a JSON array matching this schema for each case:
{
  "caseId": string,
  "diagnosisCode": string,
  "confidenceScore": number (0.0 to 1.0),
  "resolvedBy": "LLM",
  "reasoningSummary": string,
  "proposedAction"?: string,
  "executionDelaySeconds"?: number,
  "proposedDiscountPercent"?: number,
  "personalizationTone"?: string
}

Here are the cases:
{{CASES}}
`;

const OutputSchema = z.array(LLMClassificationResultSchema.extend({ caseId: z.string() }));

export class LLMClassifier {
  private gemini: GoogleGenerativeAI | null = null;
  private groq: Groq | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    if (process.env.GROQ_API_KEY) {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
  }

  public async classifyWithLLM(cases: CaseForDiagnosis[]): Promise<DiagnosticOutput[]> {
    if (cases.length === 0) return [];
    
    const prompt = SYSTEM_PROMPT.replace('{{CASES}}', JSON.stringify(cases, null, 2));

    try {
      return await this.callGemini(prompt, cases);
    } catch (geminiError) {
      console.warn('Gemini failed, falling back to Groq:', geminiError);
      try {
        return await this.callGroq(prompt, cases);
      } catch (groqError) {
        console.error('Groq fallback failed:', groqError);
        return this.generateFailClosedFallback(cases);
      }
    }
  }

  private async callGemini(prompt: string, cases: CaseForDiagnosis[]): Promise<DiagnosticOutput[]> {
    if (!this.gemini) throw new Error("Gemini not configured");
    const model = this.gemini.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return OutputSchema.parse(JSON.parse(responseText));
  }

  private async callGroq(prompt: string, cases: CaseForDiagnosis[]): Promise<DiagnosticOutput[]> {
    if (!this.groq) throw new Error("Groq not configured");
    const completion = await this.groq.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'llama3-8b-8192',
      response_format: { type: 'json_object' }
    });
    
    const content = completion.choices[0]?.message?.content || '[]';
    let parsed = JSON.parse(content);
    if (!Array.isArray(parsed) && parsed.cases) {
      parsed = parsed.cases;
    } else if (!Array.isArray(parsed)) {
       parsed = Object.values(parsed);
    }
    
    return OutputSchema.parse(parsed);
  }

  private generateFailClosedFallback(cases: CaseForDiagnosis[]): DiagnosticOutput[] {
    return cases.map(c => ({
      caseId: c.caseId,
      diagnosisCode: 'DGN_12',
      confidenceScore: 0.0,
      resolvedBy: 'LLM',
      reasoningSummary: 'LLM APIs unavailable. Falling back to fail-closed state.',
    }));
  }
}
