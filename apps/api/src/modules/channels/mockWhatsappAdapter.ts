/**
 * Mock WhatsApp Adapter — Batch Simulation Transport
 * Used during RevRecover-1000 batch evaluation to preserve Meta sandbox quota.
 * Logs all message dispatches without making real API calls.
 * Settlement verification still uses REAL Razorpay webhooks.
 * 
 * Reference: Evaluation.md §1.1
 */

import type { ExecutionResult } from './executionMesh.js';

export async function sendRecoveryMessage(
  phone: string,
  paymentLinkUrl: string,
  customerName: string,
  amount: number,
  orderId: string,
  reason: string
): Promise<ExecutionResult> {
  console.log(`[MOCK WHATSAPP] Sending recovery to ${phone}: link=${paymentLinkUrl}`);
  
  // Simulate network delay
  await new Promise(res => setTimeout(res, 100 + Math.random() * 400));

  return {
    success: true,
    channel: 'whatsapp_mock',
    actionCode: 'A2',
    deliveryStatus: 'sent',
    payloadSent: { phone, type: 'recovery_1click', link: paymentLinkUrl },
    costPaise: 0n
  };
}

export async function sendReminderSoft(
  phone: string,
  customerName: string,
  amount: number,
  orderId: string
): Promise<ExecutionResult> {
  console.log(`[MOCK WHATSAPP] Sending soft reminder to ${phone}`);
  await new Promise(res => setTimeout(res, 100 + Math.random() * 400));
  return {
    success: true,
    channel: 'whatsapp_mock',
    actionCode: 'A3',
    deliveryStatus: 'sent',
    costPaise: 0n
  };
}

export async function sendCardUpdateLink(
  phone: string,
  customerName: string,
  updateUrl: string
): Promise<ExecutionResult> {
  console.log(`[MOCK WHATSAPP] Sending card update to ${phone}`);
  await new Promise(res => setTimeout(res, 100 + Math.random() * 400));
  return {
    success: true,
    channel: 'whatsapp_mock',
    actionCode: 'A7',
    deliveryStatus: 'sent',
    costPaise: 0n
  };
}

export async function sendPTPConfirmation(
  phone: string,
  customerName: string,
  ptpDate: string,
  virtualAccountDetails: string
): Promise<ExecutionResult> {
  console.log(`[MOCK WHATSAPP] Sending PTP confirmation to ${phone}`);
  await new Promise(res => setTimeout(res, 100 + Math.random() * 400));
  return {
    success: true,
    channel: 'whatsapp_mock',
    actionCode: 'A2',
    deliveryStatus: 'sent',
    costPaise: 0n
  };
}
