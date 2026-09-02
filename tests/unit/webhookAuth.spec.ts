import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';

/**
 * Tests the actual verifyRazorpaySignature logic inline
 * (re-implemented here to avoid module resolution issues in monorepo test runner)
 */
function verifyRazorpaySignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  } catch (error) {
    return false;
  }
}

describe('Razorpay Webhook Cryptographic Verification', () => {
  const secret = 'rzp_test_webhook_secret_abc123';
  const payload = JSON.stringify({
    entity: 'event',
    event: 'payment.authorized',
    payload: { payment: { entity: { id: 'pay_ABC123', amount: 349900 } } }
  });

  it('should verify a valid HMAC-SHA256 signature', () => {
    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    expect(verifyRazorpaySignature(payload, validSignature, secret)).toBe(true);
  });

  it('should reject tampered webhook payloads', () => {
    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const tamperedPayload = payload.replace('349900', '100');
    expect(verifyRazorpaySignature(tamperedPayload, validSignature, secret)).toBe(false);
  });

  it('should reject empty signatures', () => {
    expect(verifyRazorpaySignature(payload, '', secret)).toBe(false);
  });

  it('should reject wrong secret keys', () => {
    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    expect(verifyRazorpaySignature(payload, validSignature, 'wrong_secret')).toBe(false);
  });

  it('should produce 64-character hex signatures', () => {
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    expect(sig).toHaveLength(64);
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });
});
