import { RazorpayClient } from './client.js';

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id: string;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string;
  captured: boolean;
  description: string;
  card_id: string;
  bank: string;
  wallet: string;
  vpa: string;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee: number;
  tax: number;
  error_code: string;
  error_description: string;
  error_source: string;
  error_step: string;
  error_reason: string;
  acquirer_data: Record<string, any>;
  created_at: number;
}

export interface PaymentFailureInfo {
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
}

/**
 * Wraps razorpay.payments.fetch()
 */
export async function fetchPayment(client: RazorpayClient, paymentId: string): Promise<RazorpayPayment> {
  try {
    const payment = await client.raw.payments.fetch(paymentId);
    return payment as unknown as RazorpayPayment;
  } catch (error) {
    throw new Error(`Failed to fetch payment ${paymentId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Wraps razorpay.orders.fetchPayments()
 */
export async function fetchPaymentsByOrder(client: RazorpayClient, orderId: string): Promise<RazorpayPayment[]> {
  try {
    const payments = await client.raw.orders.fetchPayments(orderId);
    return payments.items as unknown as RazorpayPayment[];
  } catch (error) {
    throw new Error(`Failed to fetch payments for order ${orderId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extracts error_code, error_description, error_source, error_step, error_reason from a payment entity
 */
export function getFailureReason(payment: RazorpayPayment): PaymentFailureInfo {
  return {
    error_code: payment.error_code || null,
    error_description: payment.error_description || null,
    error_source: payment.error_source || null,
    error_step: payment.error_step || null,
    error_reason: payment.error_reason || null,
  };
}
