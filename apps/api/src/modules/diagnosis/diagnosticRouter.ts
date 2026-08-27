/**
 * Diagnostic Router — BullMQ Worker
 * Stage 1: Try rule classifier (78% resolved in <5ms)
 * Stage 2: If unresolved, queue for LLM micro-batcher
 * 
 * Reference: Architecture.md §4
 */

import { Worker, Job, Queue } from 'bullmq';
import { CaseForDiagnosis, DiagnosticOutput } from './schemas.js';
import { classifyByRule } from './ruleClassifier.js';
import { MicroBatcher } from './microBatcher.js';

const redisConnection = { host: process.env.REDIS_HOST || '127.0.0.1', port: parseInt(process.env.REDIS_PORT || '6379') };
const policyQueue = new Queue('policy-evaluation', { connection: redisConnection });

export class DiagnosticRouter {
  private llmBuffer: CaseForDiagnosis[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private microBatcher = new MicroBatcher();

  public worker: Worker;

  constructor() {
    this.worker = new Worker('diagnosis', async (job: Job<CaseForDiagnosis>) => {
      await this.processJob(job.data);
    }, { connection: redisConnection });
    
    this.worker.on('failed', (job, err) => {
      console.error(`Diagnosis job ${job?.id} failed`, err);
    });
  }

  private async processJob(caseData: CaseForDiagnosis) {
    const ruleResult = classifyByRule(
      caseData.errorCode || null,
      caseData.errorSource || null,
      caseData.errorStep || null,
      caseData.entityType,
      caseData.errorReason || null
    );

    if (ruleResult) {
      const output: DiagnosticOutput = {
        caseId: caseData.caseId,
        ...ruleResult
      };
      await this.routeToPolicy(caseData, output);
    } else {
      this.bufferForLLM(caseData);
    }
  }

  private bufferForLLM(caseData: CaseForDiagnosis) {
    this.llmBuffer.push(caseData);
    
    if (this.llmBuffer.length >= 10) {
      this.flushLLMBuffer();
    } else if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => this.flushLLMBuffer(), 5000);
    }
  }

  private async flushLLMBuffer() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    if (this.llmBuffer.length === 0) return;

    const casesToProcess = [...this.llmBuffer];
    this.llmBuffer = [];

    try {
      const batches = this.microBatcher.batchCases(casesToProcess, 10);
      const results = await this.microBatcher.processBatches(batches);
      
      for (const result of results) {
        const caseData = casesToProcess.find(c => c.caseId === result.caseId);
        if (caseData) {
          await this.routeToPolicy(caseData, result);
        }
      }
    } catch (err) {
      console.error("Failed to process LLM batches:", err);
      // Fail closed
      for (const caseData of casesToProcess) {
        await this.routeToPolicy(caseData, {
          caseId: caseData.caseId,
          diagnosisCode: 'DGN_12',
          confidenceScore: 0.0,
          resolvedBy: 'LLM',
          reasoningSummary: 'Failed to process LLM batch. Fallback to manual review.'
        });
      }
    }
  }

  private async routeToPolicy(caseData: CaseForDiagnosis, output: DiagnosticOutput) {
    // Enqueue to the policy evaluation queue.
    await policyQueue.add('evaluate', { caseData, diagnosticOutput: output });
  }
}
