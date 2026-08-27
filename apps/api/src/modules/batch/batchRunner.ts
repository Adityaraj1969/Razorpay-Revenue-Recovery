import { generateSyntheticCases } from './syntheticCaseGenerator';
import { assignHoldout } from './holdoutController';
import { generateBatchReport } from './batchReporter';

/**
 * Batch Evaluation Engine — RevRecover-1000 Benchmark
 * Processes 1,000 synthetic failure cases with 90/10 treated/holdout split.
 * Measures NRR, NCR, IRY, and Net ROI.
 * 
 * Reference: Evaluation.md §1-4
 */

export interface BatchConfig {
  merchantId?: string;
}

export async function runBatch(config?: BatchConfig): Promise<any> {
  console.log('[BatchRunner] Starting RevRecover-1000 batch evaluation...');
  
  // 1. Generate 1,000 synthetic cases
  const cases = generateSyntheticCases(1000);
  
  // 2. Assign 10% holdout control
  const assignedCases = assignHoldout(cases, 0.10);
  
  const treated = assignedCases.filter(c => !c.isHoldout);
  const control = assignedCases.filter(c => c.isHoldout);
  
  console.log(`[BatchRunner] Split: ${treated.length} treated, ${control.length} control.`);
  
  // 3. Process treated cohort (Simulated)
  let treatedRecoveredAmount = 0n;
  let treatedCost = 0n;
  
  for (const c of treated) {
    // Simulate recovery probabilities based on rules
    let recoveryProb = 0;
    if (c.cohort === 1) recoveryProb = 0.38; // Checkouts
    else if (c.cohort === 2) recoveryProb = 0.65; // Subs
    else if (c.cohort === 3) recoveryProb = 0.28; // B2B
    
    if (Math.random() < recoveryProb) {
      treatedRecoveredAmount += c.amountAtRiskPaise;
    }
    
    // Simulate cost (e.g. ₹5 WhatsApp/Voice avg)
    treatedCost += 500n; // 500 paise = ₹5
  }
  
  // 4. Simulate control cohort (Baseline organic recovery)
  let controlRecoveredAmount = 0n;
  for (const c of control) {
    // Baseline organic recovery is much lower
    let baselineProb = 0.05;
    if (Math.random() < baselineProb) {
      controlRecoveredAmount += c.amountAtRiskPaise;
    }
  }
  
  const totalAtRiskTreated = treated.reduce((sum, c) => sum + c.amountAtRiskPaise, 0n);
  const totalAtRiskControl = control.reduce((sum, c) => sum + c.amountAtRiskPaise, 0n);
  
  // 5. Compute metrics
  const results = {
    totalCases: cases.length,
    treated: {
      count: treated.length,
      amountAtRisk: Number(totalAtRiskTreated) / 100, // INR
      recoveredAmount: Number(treatedRecoveredAmount) / 100, // INR
      cost: Number(treatedCost) / 100 // INR
    },
    control: {
      count: control.length,
      amountAtRisk: Number(totalAtRiskControl) / 100,
      recoveredAmount: Number(controlRecoveredAmount) / 100
    }
  };
  
  // Generate and print report
  generateBatchReport(results);
  
  return results;
}
