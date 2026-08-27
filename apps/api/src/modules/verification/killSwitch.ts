import { prisma, CaseStatus } from '@revloop/db';
import { abortAllInFlight } from './hardStopExecutor';

/**
 * Kill Switch — Global & Per-Merchant Emergency Brake
 * p95 < 50ms for complete system shutdown.
 * 
 * Reference: Rules.md STOP-07, PRD.md FR-13
 */

// Mock Redis for buildathon
const mockRedis = new Map<string, string>();

export async function activateKillSwitch(scope: 'global' | 'merchant', merchantId?: string): Promise<{ affectedCases: number, latencyMs: number }> {
  const start = process.hrtime.bigint();
  
  const key = scope === 'global' ? 'killswitch:global' : `killswitch:merchant:${merchantId}`;
  mockRedis.set(key, 'true');
  
  // Find affected active cases
  const whereClause = scope === 'global' 
    ? { currentStatus: { notIn: [CaseStatus.RECOVERED, CaseStatus.CLOSED_UNRECOVERED, CaseStatus.SUPPRESSED] } }
    : { merchantId, currentStatus: { notIn: [CaseStatus.RECOVERED, CaseStatus.CLOSED_UNRECOVERED, CaseStatus.SUPPRESSED] } };
    
  const activeCases = await prisma.case.findMany({ where: whereClause });
  
  let affectedCases = 0;
  for (const c of activeCases) {
    await abortAllInFlight(c.caseId);
    affectedCases++;
  }
  
  await prisma.case.updateMany({
    where: whereClause,
    data: { currentStatus: CaseStatus.SUPPRESSED }
  });
  
  const end = process.hrtime.bigint();
  const latencyMs = Number(end - start) / 1_000_000;
  
  return { affectedCases, latencyMs };
}

export async function deactivateKillSwitch(scope: 'global' | 'merchant', merchantId?: string): Promise<void> {
  const key = scope === 'global' ? 'killswitch:global' : `killswitch:merchant:${merchantId}`;
  mockRedis.delete(key);
}

export async function isKillSwitchActive(merchantId?: string): Promise<boolean> {
  if (mockRedis.get('killswitch:global') === 'true') return true;
  if (merchantId && mockRedis.get(`killswitch:merchant:${merchantId}`) === 'true') return true;
  return false;
}
