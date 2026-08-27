import { SyntheticCase } from './syntheticCaseGenerator';

/**
 * Holdout Controller — 10% Randomized Control Group
 * Assigns cases to treated vs. control cohort.
 * Control group receives zero automated outreach.
 * 
 * Reference: Architecture.md §1 invariant 4, Evaluation.md §1.2
 */

export function assignHoldout(cases: SyntheticCase[], ratio: number = 0.10): SyntheticCase[] {
  return cases.map(c => ({
    ...c,
    isHoldout: Math.random() < ratio
  }));
}

export function isHoldout(caseCtx: { isHoldout?: boolean }): boolean {
  return !!caseCtx.isHoldout;
}

export function computeMetrics(treatedResults: any, controlResults: any) {
  // compute NRR, NCR, IRY, Net Capital, ROI
  const nrrTreated = treatedResults.amountAtRisk > 0 
    ? treatedResults.recoveredAmount / treatedResults.amountAtRisk 
    : 0;
  
  const nrrControl = controlResults.amountAtRisk > 0 
    ? controlResults.recoveredAmount / controlResults.amountAtRisk 
    : 0;
    
  const iry = nrrTreated - nrrControl;
  
  const netIncrementalCapital = (iry * treatedResults.amountAtRisk);
  const roi = treatedResults.cost > 0 
    ? (netIncrementalCapital - treatedResults.cost) / treatedResults.cost 
    : 0;
    
  return {
    nrrTreated,
    nrrControl,
    iry,
    netIncrementalCapital,
    roi
  };
}
