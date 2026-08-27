/**
 * Dynamic Payment Link Generator
 * Creates single-use, expiring Razorpay Payment Links for recovery.
 * 
 * Reference: Design.md §5, AI_Strategy.md §6
 */

import { randomUUID } from 'node:crypto';

interface LinkOptions {
  amountPaise: number;
  customerPhone?: string;
  customerEmail?: string;
  referenceId: string;
  expiresInMinutes: number;
  isB2B?: boolean;
}

export async function generateRecoveryLink(options: LinkOptions) {
  // In a real implementation, we would use Razorpay SDK here
  // e.g., razorpay.paymentLink.create(...)

  const linkId = `plink_${randomUUID().substring(0, 10)}`;
  const shortUrl = `https://rzp.io/i/${linkId}`;
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + options.expiresInMinutes);

  return {
    shortUrl,
    linkId,
    expiresAt: expiresAt.toISOString()
  };
}

export async function generateConcessionLink(options: LinkOptions, proposedDiscountPercent: number, merchantFloorPercent: number) {
  const actualDiscount = Math.min(proposedDiscountPercent, merchantFloorPercent);
  const discountedAmount = Math.floor(options.amountPaise * (1 - actualDiscount / 100));

  const link = await generateRecoveryLink({
    ...options,
    amountPaise: discountedAmount
  });

  return {
    ...link,
    actualDiscountPercent: actualDiscount,
    originalAmountPaise: options.amountPaise,
    discountedAmountPaise: discountedAmount
  };
}
