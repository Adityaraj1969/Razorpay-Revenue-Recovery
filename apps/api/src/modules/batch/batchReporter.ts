import { computeMetrics } from './holdoutController';

export function generateBatchReport(results: any): void {
  const metrics = computeMetrics(results.treated, results.control);
  
  console.log('\n======================================================');
  console.log('         RevRecover-1000 Benchmark Report');
  console.log('======================================================');
  console.log(`Total Cases Processed: ${results.totalCases}`);
  console.log(`Treated Cohort: ${results.treated.count} cases`);
  console.log(`Control (Holdout) Cohort: ${results.control.count} cases`);
  
  console.log('\n--- Financials ---');
  console.log(`Treated At Risk: ₹${results.treated.amountAtRisk.toFixed(2)}`);
  console.log(`Treated Recovered: ₹${results.treated.recoveredAmount.toFixed(2)}`);
  console.log(`Operating Cost: ₹${results.treated.cost.toFixed(2)}`);
  
  console.log('\n--- Key Metrics ---');
  console.log(`Treated NRR (Net Recovery Rate): ${(metrics.nrrTreated * 100).toFixed(2)}%`);
  console.log(`Control NRR (Organic Recovery): ${(metrics.nrrControl * 100).toFixed(2)}%`);
  console.log(`IRY (Incremental Recovery Yield): ${(metrics.iry * 100).toFixed(2)}%`);
  
  console.log('\n--- ROI Analysis ---');
  console.log(`Net Incremental Capital: ₹${metrics.netIncrementalCapital.toFixed(2)}`);
  console.log(`Net ROI: ${(metrics.roi * 100).toFixed(2)}%`);
  console.log('======================================================\n');
}
