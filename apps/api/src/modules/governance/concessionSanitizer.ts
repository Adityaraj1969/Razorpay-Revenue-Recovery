import { randomBytes, createHmac } from 'crypto';

/**
 * Concession Sanitizer — Mathematical Margin Floor Clamp
 * SanctionedDiscount = min(ProposedDiscount, MerchantMarginFloor)
 * 
 * Reference: Rules.md §5, AI_Strategy.md §6
 */

const SECRET_KEY = process.env.CONCESSION_SECRET || 'default_secret_key_for_buildathon';

export function clamp(proposedPercent: number, merchantFloorPercent: number): number {
  if (proposedPercent > merchantFloorPercent) {
    console.warn(`[ConcessionSanitizer] WARNING: LLM proposed ${proposedPercent}% which exceeds merchant floor of ${merchantFloorPercent}%. Clamping to floor.`);
  }
  return Math.min(proposedPercent, merchantFloorPercent);
}

export interface ConcessionTokenPayload {
  caseId: string;
  sanctionedPercent: number;
  exp: number;
}

export function generateConcessionToken(caseId: string, sanctionedPercent: number, expiryMinutes: number): string {
  const exp = Date.now() + expiryMinutes * 60 * 1000;
  const payload: ConcessionTokenPayload = { caseId, sanctionedPercent, exp };
  
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = createHmac('sha256', SECRET_KEY).update(data).digest('base64');
  
  return `${data}.${signature}`;
}

export function validateConcessionToken(token: string): ConcessionTokenPayload | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    
    const expectedSignature = createHmac('sha256', SECRET_KEY).update(data).digest('base64');
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(data, 'base64').toString('utf-8')) as ConcessionTokenPayload;
    if (Date.now() > payload.exp) return null;
    
    return payload;
  } catch (error) {
    return null;
  }
}
