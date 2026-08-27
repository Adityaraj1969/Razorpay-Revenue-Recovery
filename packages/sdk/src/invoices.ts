import { RazorpayClient } from './client.js';

export interface InvoiceLineItem {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  quantity: number;
}

export interface InvoiceInfo {
  id: string;
  entity: string;
  receipt: string;
  invoice_number: string;
  customer_id: string;
  customer_details: {
    id: string;
    name: string;
    email: string;
    contact: string;
  };
  order_id: string;
  line_items: InvoiceLineItem[];
  payment_id: string;
  status: string;
  expire_by: number;
  issued_at: number;
  paid_at: number;
  cancelled_at: number;
  expired_at: number;
  sms_status: string;
  email_status: string;
  date: number;
  terms: string;
  partial_payment: boolean;
  gross_amount: number;
  tax_amount: number;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  description: string;
  notes: Record<string, string>;
  short_url: string;
  created_at: number;
}

export interface CreateInvoiceOptions {
  type: string;
  description?: string;
  customer: {
    name: string;
    contact: string;
    email: string;
    billing_address?: any;
    shipping_address?: any;
  };
  line_items: InvoiceLineItem[];
  sms_notify?: boolean;
  email_notify?: boolean;
  draft?: string;
  date?: number;
  expire_by?: number;
  receipt?: string;
  notes?: Record<string, string>;
}

/**
 * Wraps razorpay.invoices.fetch()
 */
export async function fetchInvoice(client: RazorpayClient, invoiceId: string): Promise<InvoiceInfo> {
  try {
    const invoice = await client.raw.invoices.fetch(invoiceId);
    return invoice as unknown as InvoiceInfo;
  } catch (error) {
    throw new Error(`Failed to fetch invoice ${invoiceId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * List invoices past due
 * Wraps razorpay.invoices.all()
 */
export async function fetchOverdueInvoices(client: RazorpayClient, merchantId: string, daysOverdue: number): Promise<InvoiceInfo[]> {
  try {
    const allInvoices = await client.raw.invoices.all();
    return (allInvoices.items as unknown as InvoiceInfo[]).filter(inv => inv.status !== 'paid');
  } catch (error) {
    throw new Error(`Failed to fetch overdue invoices: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a new invoice
 * Wraps razorpay.invoices.create()
 */
export async function issueInvoice(client: RazorpayClient, options: CreateInvoiceOptions): Promise<InvoiceInfo> {
  try {
    const invoice = await client.raw.invoices.create(options as any);
    return invoice as unknown as InvoiceInfo;
  } catch (error) {
    throw new Error(`Failed to issue invoice: ${error instanceof Error ? error.message : String(error)}`);
  }
}
