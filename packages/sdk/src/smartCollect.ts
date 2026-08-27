import { RazorpayClient } from './client.js';
import { fetchPayment } from './payments.js';

export interface CreateVirtualAccountOptions {
  receivers: {
    types: string[];
  };
  description?: string;
  customer_id?: string;
  close_by?: number;
  notes?: Record<string, string>;
  amount_expected?: number;
}

export interface VirtualAccountInfo {
  id: string;
  entity: string;
  status: string;
  description: string;
  amount_expected: number;
  amount_paid: number;
  customer_id: string;
  receivers: {
    entity: string;
    reference: string;
    short_name: string;
    notes: Record<string, string>;
    routing: boolean;
    bank_account?: {
      account_number: string;
      ifsc: string;
      bank_name: string;
      name: string;
    };
  }[];
  close_by: number;
  closed_at: number;
  created_at: number;
}

/**
 * Creates a Razorpay Virtual Account for B2B collections
 * Wraps razorpay.virtualAccounts.create()
 */
export async function createVirtualAccount(client: RazorpayClient, options: CreateVirtualAccountOptions): Promise<VirtualAccountInfo> {
  try {
    const va = await client.raw.virtualAccounts.create(options as any);
    return va as unknown as VirtualAccountInfo;
  } catch (error) {
    throw new Error(`Failed to create virtual account: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetch VA details
 * Wraps razorpay.virtualAccounts.fetch()
 */
export async function fetchVirtualAccount(client: RazorpayClient, vaId: string): Promise<VirtualAccountInfo> {
  try {
    const va = await client.raw.virtualAccounts.fetch(vaId);
    return va as unknown as VirtualAccountInfo;
  } catch (error) {
    throw new Error(`Failed to fetch virtual account ${vaId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if a payment matches the expected VA amount
 */
export async function reconcilePayment(client: RazorpayClient, vaId: string, paymentId: string): Promise<boolean> {
  try {
    const [va, payment] = await Promise.all([
      fetchVirtualAccount(client, vaId),
      fetchPayment(client, paymentId)
    ]);
    
    return va.amount_expected === payment.amount;
  } catch (error) {
    throw new Error(`Failed to reconcile payment ${paymentId} for VA ${vaId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
