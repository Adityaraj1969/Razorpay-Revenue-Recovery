import { RazorpayClient } from './client.js';

export interface SubscriptionInfo {
  id: string;
  entity: string;
  plan_id: string;
  status: string;
  current_start: number;
  current_end: number;
  ended_at: number;
  quantity: number;
  notes: Record<string, string>;
  charge_at: number;
  start_at: number;
  end_at: number;
  auth_attempts: number;
  total_count: number;
  paid_count: number;
  customer_notify: boolean;
  created_at: number;
  expire_by: number;
  short_url: string;
  has_scheduled_changes: boolean;
  change_scheduled_at: number;
  source: string;
}

/**
 * Wraps razorpay.subscriptions.fetch()
 */
export async function fetchSubscription(client: RazorpayClient, subscriptionId: string): Promise<SubscriptionInfo> {
  try {
    const subscription = await client.raw.subscriptions.fetch(subscriptionId);
    return subscription as unknown as SubscriptionInfo;
  } catch (error) {
    throw new Error(`Failed to fetch subscription ${subscriptionId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Triggers a mandate retry charge
 */
export async function retryCharge(client: RazorpayClient, subscriptionId: string): Promise<any> {
  try {
    // Assuming there's a charge creation endpoint or retry available 
    throw new Error("Not fully implemented: retryCharge mapping depends on Razorpay's specific mandate retry endpoints.");
  } catch (error) {
    throw new Error(`Failed to retry charge for subscription ${subscriptionId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Cancels subscription
 * Wraps razorpay.subscriptions.cancel()
 */
export async function cancelSubscription(client: RazorpayClient, subscriptionId: string, cancelAtCycleEnd: boolean): Promise<SubscriptionInfo> {
  try {
    const subscription = await client.raw.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);
    return subscription as unknown as SubscriptionInfo;
  } catch (error) {
    throw new Error(`Failed to cancel subscription ${subscriptionId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
