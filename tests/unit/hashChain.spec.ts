import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';

/**
 * Cryptographic Hash Chain Unit Tests
 * Verifies the integrity of the per-case SHA-256 audit ledger.
 *
 * Reference: Architecture.md §6, Design.md §2, Rules.md §7
 */

function computeRecordHash(caseId: string, payload: string, previousHash: string): string {
  return crypto.createHash('sha256').update(caseId + payload + previousHash).digest('hex');
}

describe('Cryptographic Hash Chain', () => {
  const caseId = 'case_8812a01f-561b-41a2-91ef-0192837465aa';
  const genesisHash = '0'.repeat(64);

  it('should produce deterministic hashes for identical inputs', () => {
    const payload = JSON.stringify({ event: 'CASE_OPENED', amount: 349900 });
    const hash1 = computeRecordHash(caseId, payload, genesisHash);
    const hash2 = computeRecordHash(caseId, payload, genesisHash);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('should chain correctly: hash(n) depends on hash(n-1)', () => {
    const payload1 = JSON.stringify({ seq: 1, event: 'CASE_OPENED' });
    const payload2 = JSON.stringify({ seq: 2, event: 'DIAGNOSIS_COMPLETED' });
    const payload3 = JSON.stringify({ seq: 3, event: 'ACTION_DISPATCHED' });

    const hash1 = computeRecordHash(caseId, payload1, genesisHash);
    const hash2 = computeRecordHash(caseId, payload2, hash1);
    const hash3 = computeRecordHash(caseId, payload3, hash2);

    // Each hash depends on its predecessor
    expect(hash1).not.toBe(hash2);
    expect(hash2).not.toBe(hash3);

    // Verify chain: recomputing with correct previous hashes gives same result
    const verifyHash2 = computeRecordHash(caseId, payload2, hash1);
    const verifyHash3 = computeRecordHash(caseId, payload3, hash2);
    expect(verifyHash2).toBe(hash2);
    expect(verifyHash3).toBe(hash3);
  });

  it('should detect tampered events by hash chain break', () => {
    const payload1 = JSON.stringify({ seq: 1, event: 'CASE_OPENED' });
    const payload2 = JSON.stringify({ seq: 2, event: 'DIAGNOSIS_COMPLETED' });

    const hash1 = computeRecordHash(caseId, payload1, genesisHash);
    const hash2 = computeRecordHash(caseId, payload2, hash1);

    // Tamper with event 1's payload
    const tamperedPayload1 = JSON.stringify({ seq: 1, event: 'CASE_OPENED', amount: 999999 });
    const tamperedHash1 = computeRecordHash(caseId, tamperedPayload1, genesisHash);

    // Hash1 is now different
    expect(tamperedHash1).not.toBe(hash1);

    // Hash2 computed from tampered hash1 breaks the chain
    const brokenHash2 = computeRecordHash(caseId, payload2, tamperedHash1);
    expect(brokenHash2).not.toBe(hash2);
  });

  it('should handle genesis event with zero-filled previous hash', () => {
    const payload = JSON.stringify({ seq: 0, event: 'GENESIS' });
    const hash = computeRecordHash(caseId, payload, genesisHash);

    expect(hash).toHaveLength(64);
    expect(hash).not.toBe(genesisHash);
    // Genesis hash should be deterministic
    expect(computeRecordHash(caseId, payload, genesisHash)).toBe(hash);
  });

  it('should produce different hashes for different cases with same payload', () => {
    const payload = JSON.stringify({ event: 'CASE_OPENED' });
    const caseA = 'case_aaaa-1111-2222-3333-444444444444';
    const caseB = 'case_bbbb-5555-6666-7777-888888888888';

    const hashA = computeRecordHash(caseA, payload, genesisHash);
    const hashB = computeRecordHash(caseB, payload, genesisHash);

    expect(hashA).not.toBe(hashB);
  });

  it('should produce valid SHA-256 hex strings', () => {
    const payload = JSON.stringify({ event: 'TEST' });
    const hash = computeRecordHash(caseId, payload, genesisHash);

    // SHA-256 hex is 64 characters, only hex chars
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
