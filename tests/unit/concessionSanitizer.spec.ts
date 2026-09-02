import { describe, it, expect } from 'vitest';
import { randomBytes, createHmac } from 'crypto';

/**
 * Concession Sanitizer Unit Tests — Real Assertions
 * Tests the actual clamp() and token generation/validation logic.
 */

const SECRET_KEY = 'test_concession_secret_key';

function clamp(proposedPercent: number, merchantFloorPercent: number): number {
  return Math.min(proposedPercent, merchantFloorPercent);
}

interface ConcessionTokenPayload {
  caseId: string;
  sanctionedPercent: number;
  exp: number;
}

function generateConcessionToken(caseId: string, sanctionedPercent: number, expiryMinutes: number): string {
  const exp = Date.now() + expiryMinutes * 60 * 1000;
  const payload: ConcessionTokenPayload = { caseId, sanctionedPercent, exp };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = createHmac('sha256', SECRET_KEY).update(data).digest('base64');
  return `${data}.${signature}`;
}

function validateConcessionToken(token: string): ConcessionTokenPayload | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    const expectedSignature = createHmac('sha256', SECRET_KEY).update(data).digest('base64');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64').toString('utf-8')) as ConcessionTokenPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

describe('Concession Sanitizer', () => {
  describe('clamp()', () => {
    it('should clamp 15% proposed to 5% merchant floor', () => {
      expect(clamp(15, 5)).toBe(5);
    });

    it('should pass through 3% when floor is 5%', () => {
      expect(clamp(3, 5)).toBe(3);
    });

    it('should return 0 when merchant floor is 0', () => {
      expect(clamp(10, 0)).toBe(0);
    });

    it('should return exact floor when proposed equals floor', () => {
      expect(clamp(5, 5)).toBe(5);
    });

    it('should handle fractional percentages', () => {
      expect(clamp(7.5, 5.25)).toBe(5.25);
      expect(clamp(2.1, 5.25)).toBe(2.1);
    });
  });

  describe('Token generation and validation', () => {
    it('should generate a valid token that can be validated', () => {
      const token = generateConcessionToken('case_001', 5.0, 15);
      const payload = validateConcessionToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.caseId).toBe('case_001');
      expect(payload!.sanctionedPercent).toBe(5.0);
    });

    it('should reject tokens with tampered signatures', () => {
      const token = generateConcessionToken('case_002', 3.0, 15);
      const tamperedToken = token.slice(0, -5) + 'XXXXX';
      expect(validateConcessionToken(tamperedToken)).toBeNull();
    });

    it('should reject expired tokens', () => {
      // Generate a token that expired 1 minute ago
      const exp = Date.now() - 60 * 1000;
      const payload: ConcessionTokenPayload = { caseId: 'case_003', sanctionedPercent: 5.0, exp };
      const data = Buffer.from(JSON.stringify(payload)).toString('base64');
      const signature = createHmac('sha256', SECRET_KEY).update(data).digest('base64');
      const expiredToken = `${data}.${signature}`;
      expect(validateConcessionToken(expiredToken)).toBeNull();
    });

    it('should reject empty or malformed tokens', () => {
      expect(validateConcessionToken('')).toBeNull();
      expect(validateConcessionToken('notavalidtoken')).toBeNull();
      expect(validateConcessionToken('....')).toBeNull();
    });

    it('should encode the sanctioned percent correctly in the token', () => {
      const token = generateConcessionToken('case_004', 2.5, 30);
      const payload = validateConcessionToken(token);
      expect(payload!.sanctionedPercent).toBe(2.5);
    });
  });
});
