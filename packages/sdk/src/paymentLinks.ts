import { RazorpayClient } from './client.js';

export interface CreatePaymentLinkOptions {
  amount: number;
  currency?: string;
  description: string;
  customer: {
    contact: string;
    email: string;
    name?: string;
  };
  expire_by?: number;
  reference_id?: string;
  callback_url?: string;
  notify?: {
    sms: boolean;
    email: boolean;
  };
  notes?: Record<string, string>;
}

export interface PaymentLinkResponse {
  id: string;
  short_url: string;
  status: string;
  amount: number;
  currency: string;
  created_at: number;
  expire_by: number;
}

/**
 * Creates a dynamic Razorpay Payment Link
 * Wraps razorpay.paymentLink.create()
 */
export async function createPaymentLink(client: RazorpayClient, options: CreatePaymentLinkOptions): Promise<PaymentLinkResponse> {
  try {
    const payload = {
      amount: options.amount,
      currency: options.currency || 'INR',
      description: options.description,
      customer: options.customer,
      expire_by: options.expire_by || Math.floor(Date.now() / 1000) + 15 * 60, // Default 15 minutes
      reference_id: options.reference_id,
      notify: options.notify || { sms: true, email: true },
      reminder_enable: true,
      notes: options.notes,
      callback_url: options.callback_url,
      callback_method: 'get',
    };
    
    // Using any for razorpay's internal types which might not be perfectly aligned in the generic DefinitelyTyped package
    const link = await (client.raw as any).paymentLink.create(payload);
    return link as PaymentLinkResponse;
  } catch (error) {
    throw new Error(`Failed to create payment link: ${error instanceof Error ? error.message : String(error)}`);
  }
}
