/**
 * Micro-Batcher — Groups cases into batches of 10 for LLM calls
 * Reduces 220 ambiguous cases to 22 API calls.
 * Alternates between Google AI Studio (15 RPM) and Groq Cloud (30 RPM).
 * 
 * Reference: Architecture.md §5, AI_Strategy.md §3
 */

import { CaseForDiagnosis, DiagnosticOutput } from './schemas.js';
import { LLMClassifier } from './llmClassifier.js';

interface ProviderState {
  requestsThisMinute: number;
  minuteWindowStart: number;
  rpmLimit: number;
}

export class MicroBatcher {
  private llmClassifier = new LLMClassifier();
  
  private providerStates: Record<'gemini' | 'groq', ProviderState> = {
    gemini: { requestsThisMinute: 0, minuteWindowStart: Date.now(), rpmLimit: 15 },
    groq: { requestsThisMinute: 0, minuteWindowStart: Date.now(), rpmLimit: 30 }
  };

  private currentProvider: 'gemini' | 'groq' = 'gemini';

  public batchCases(cases: CaseForDiagnosis[], batchSize: number = 10): CaseForDiagnosis[][] {
    const batches: CaseForDiagnosis[][] = [];
    for (let i = 0; i < cases.length; i += batchSize) {
      batches.push(cases.slice(i, i + batchSize));
    }
    return batches;
  }

  public async processBatches(batches: CaseForDiagnosis[][]): Promise<DiagnosticOutput[]> {
    const results: DiagnosticOutput[] = [];
    
    for (const batch of batches) {
      await this.enforceRateLimits();
      const batchResult = await this.llmClassifier.classifyWithLLM(batch);
      this.providerStates[this.currentProvider].requestsThisMinute++;
      results.push(...batchResult);
    }
    
    return results;
  }

  private async enforceRateLimits(): Promise<void> {
    const now = Date.now();
    const state = this.providerStates[this.currentProvider];
    
    if (now - state.minuteWindowStart > 60000) {
      state.requestsThisMinute = 0;
      state.minuteWindowStart = now;
    }
    
    if (state.requestsThisMinute >= state.rpmLimit) {
      // Toggle provider
      this.currentProvider = this.currentProvider === 'gemini' ? 'groq' : 'gemini';
      
      const newState = this.providerStates[this.currentProvider];
      if (now - newState.minuteWindowStart > 60000) {
        newState.requestsThisMinute = 0;
        newState.minuteWindowStart = now;
      }
      
      if (newState.requestsThisMinute >= newState.rpmLimit) {
        const timeToWait = 60000 - (now - Math.min(state.minuteWindowStart, newState.minuteWindowStart));
        if (timeToWait > 0) {
          await new Promise(resolve => setTimeout(resolve, timeToWait));
          this.providerStates.gemini.requestsThisMinute = 0;
          this.providerStates.gemini.minuteWindowStart = Date.now();
          this.providerStates.groq.requestsThisMinute = 0;
          this.providerStates.groq.minuteWindowStart = Date.now();
        }
      }
    }
  }
}
