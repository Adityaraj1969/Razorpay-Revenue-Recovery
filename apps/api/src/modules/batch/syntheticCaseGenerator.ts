import { DiagnosisCode } from '@revloop/db';

/**
 * Synthetic Case Generator — RevRecover-1000 Test Data
 * Generates realistic failure cases matching the 3-cohort distribution.
 * 
 * Reference: Evaluation.md §4.2
 */

export interface SyntheticCase {
  id: string;
  cohort: number;
  amountAtRiskPaise: bigint;
  diagnosisCode: DiagnosisCode;
  rzpEntityId: string;
  isHoldout?: boolean;
}

export function generateSyntheticCases(total: number): SyntheticCase[] {
  const cases: SyntheticCase[] = [];
  
  // Cohort 1: E-Commerce Checkout (40.5%)
  const c1Count = Math.floor(total * 0.405);
  for (let i = 0; i < c1Count; i++) {
    const r = Math.random();
    const dCode = r < 0.48 ? DiagnosisCode.DGN_05_TECHNICAL_GATEWAY_TIMEOUT 
                : r < 0.84 ? DiagnosisCode.DGN_04_AUTHENTICATION_ABANDONED 
                : DiagnosisCode.DGN_07_CHECKOUT_ABANDONED_PRE_PAYMENT;
    cases.push({
      id: `c1_${i}`,
      cohort: 1,
      amountAtRiskPaise: 500000n, // Avg AOV ₹5,000
      diagnosisCode: dCode,
      rzpEntityId: `pay_${Math.random().toString(36).substring(7)}`
    });
  }
  
  // Cohort 2: Subscriptions (31.5%)
  const c2Count = Math.floor(total * 0.315);
  for (let i = 0; i < c2Count; i++) {
    const r = Math.random();
    const dCode = r < 0.52 ? DiagnosisCode.DGN_01_INSUFFICIENT_FUNDS 
                : r < 0.69 ? DiagnosisCode.DGN_06_MANDATE_LAPSED_OR_REVOKED 
                : DiagnosisCode.DGN_02_CARD_EXPIRED_OR_BLOCKED;
    cases.push({
      id: `c2_${i}`,
      cohort: 2,
      amountAtRiskPaise: 971400n, // Avg MRR ₹9,714
      diagnosisCode: dCode,
      rzpEntityId: `sub_${Math.random().toString(36).substring(7)}`
    });
  }
  
  // Cohort 3: B2B Invoices (18.0% + remainder to hit 1000)
  const c3Count = total - cases.length;
  for (let i = 0; i < c3Count; i++) {
    const r = Math.random();
    const dCode = r < 0.60 ? DiagnosisCode.DGN_08_INVOICE_OVERDUE_NO_RESPONSE 
                : r < 0.85 ? DiagnosisCode.DGN_11_PTP_FOLLOWUP_DUE 
                : DiagnosisCode.DGN_09_INVOICE_OVERDUE_DISPUTED;
    cases.push({
      id: `c3_${i}`,
      cohort: 3,
      amountAtRiskPaise: 3400000n, // Avg ₹34,000
      diagnosisCode: dCode,
      rzpEntityId: `inv_${Math.random().toString(36).substring(7)}`
    });
  }
  
  return cases;
}
