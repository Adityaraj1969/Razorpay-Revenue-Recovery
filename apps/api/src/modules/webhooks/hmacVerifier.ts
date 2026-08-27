import crypto from 'node:crypto';

export function verifyRazorpaySignature(rawBody: string, signature: string, secret: string): boolean {
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
