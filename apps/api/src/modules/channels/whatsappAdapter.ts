/**
 * WhatsApp 1-Click Recovery Agent
 * Sends interactive WhatsApp templates with dynamic Razorpay payment links.
 * Uses Meta Cloud API Sandbox for hackathon (1,000 conversations/month).
 * 
 * Reference: UI_UX_design.md §5.1, Architecture.md §5
 */

import { config } from '../../config/index.js';
import type { ExecutionResult } from './executionMesh.js';

export async function sendRecoveryMessage(
  phone: string,
  paymentLinkUrl: string,
  customerName: string,
  amount: number,
  orderId: string,
  reason: string
): Promise<ExecutionResult> {
  const url = `https://graph.facebook.com/v21.0/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: 'recovery_1click',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: amount.toString() },
            { type: 'text', text: orderId },
            { type: 'text', text: reason },
            { type: 'text', text: paymentLinkUrl }
          ]
        }
      ]
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${await response.text()}`);
    }

    return {
      success: true,
      channel: 'whatsapp',
      actionCode: 'A2',
      deliveryStatus: 'sent',
      payloadSent: payload,
      costPaise: 50n // approx 50 paise
    };
  } catch (error) {
    return {
      success: false,
      channel: 'whatsapp',
      actionCode: 'A2',
      deliveryStatus: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      costPaise: 0n
    };
  }
}

export async function sendReminderSoft(
  phone: string,
  customerName: string,
  amount: number,
  orderId: string
): Promise<ExecutionResult> {
  // Mock implementation for soft reminder
  return {
    success: true,
    channel: 'whatsapp',
    actionCode: 'A3',
    deliveryStatus: 'sent',
    costPaise: 50n
  };
}

export async function sendCardUpdateLink(
  phone: string,
  customerName: string,
  updateUrl: string
): Promise<ExecutionResult> {
  // Mock implementation for card update link
  return {
    success: true,
    channel: 'whatsapp',
    actionCode: 'A7',
    deliveryStatus: 'sent',
    costPaise: 50n
  };
}

export async function sendPTPConfirmation(
  phone: string,
  customerName: string,
  ptpDate: string,
  virtualAccountDetails: string
): Promise<ExecutionResult> {
  return {
    success: true,
    channel: 'whatsapp',
    actionCode: 'A2', // Adjust action code based on actual spec
    deliveryStatus: 'sent',
    costPaise: 50n
  };
}
