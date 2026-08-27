import Razorpay from 'razorpay';

/**
 * Wrapper for the Razorpay Node.js SDK for test mode.
 */
export class RazorpayClient {
  public readonly raw: Razorpay;

  constructor(keyId: string, keySecret: string) {
    this.raw = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
}
