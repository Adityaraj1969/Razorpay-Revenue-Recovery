import { ChannelType } from '@revloop/shared-types';

/**
 * Regulatory Enforcer — Statutory Compliance Gate
 * Enforces TRAI quiet hours, RBI fair practices, NPCI mandate windows.
 * 
 * Reference: Rules.md §3
 */

/**
 * Checks if current time is within TRAI quiet hours (21:00-09:00 IST)
 * and merchant's operating window (e.g., 09:00-19:00).
 */
export function isWithinOperatingHours(merchantWindowStart = '09:00', merchantWindowEnd = '19:00', timezone = 'Asia/Kolkata'): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const timeString = formatter.format(now);
  const hour = parseInt(timeString.split(':')[0], 10);
  const minute = parseInt(timeString.split(':')[1], 10);
  
  const currentMinutes = hour * 60 + minute;
  
  // TRAI rules: no calls between 21:00 and 09:00
  if (hour >= 21 || hour < 9) {
    return false;
  }
  
  const parseWindow = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  
  const startMins = parseWindow(merchantWindowStart);
  const endMins = parseWindow(merchantWindowEnd);
  
  return currentMinutes >= startMins && currentMinutes <= endMins;
}

/**
 * Checks if current time is within NPCI non-peak clearing windows (06:00-09:30 or 18:00-21:00 IST)
 */
export function isWithinNPCINonPeakWindow(): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const timeString = formatter.format(now);
  const hour = parseInt(timeString.split(':')[0], 10);
  const minute = parseInt(timeString.split(':')[1], 10);
  
  const currentMinutes = hour * 60 + minute;
  
  const window1Start = 6 * 60; // 06:00
  const window1End = 9 * 60 + 30; // 09:30
  
  const window2Start = 18 * 60; // 18:00
  const window2End = 21 * 60; // 21:00
  
  return (currentMinutes >= window1Start && currentMinutes <= window1End) ||
         (currentMinutes >= window2Start && currentMinutes <= window2End);
}

/**
 * Verifies mandatory cooldown between attempts (24h voice, 12h WhatsApp, 48h email)
 */
export async function checkCooldownPeriod(caseId: string, channel: ChannelType, lastAttemptAt: Date | null): Promise<boolean> {
  if (!lastAttemptAt) return true;
  
  const now = Date.now();
  const lastAttempt = lastAttemptAt.getTime();
  const diffHours = (now - lastAttempt) / (1000 * 60 * 60);
  
  switch (channel) {
    case ChannelType.VOICE:
      return diffHours >= 24;
    case ChannelType.WHATSAPP:
      return diffHours >= 12;
    case ChannelType.EMAIL:
      return diffHours >= 48;
    case ChannelType.RETRY:
      return diffHours >= 24;
    default:
      return true;
  }
}

/**
 * Checks 24h pre-debit notification was sent
 */
export async function validatePreDebitNotification(subscriptionId: string, preDebitSentAt: Date | null): Promise<boolean> {
  if (!preDebitSentAt) return false;
  
  const now = Date.now();
  const sentTime = preDebitSentAt.getTime();
  const diffHours = (now - sentTime) / (1000 * 60 * 60);
  
  // Notification should have been sent at least 24 hours ago
  return diffHours >= 24;
}

/**
 * Returns the next allowed datetime for the given channel
 */
export function getNextAllowedWindow(channel: ChannelType, lastAttemptAt: Date | null): Date {
  const now = new Date();
  if (!lastAttemptAt) {
    return now; 
  }
  
  const cooldownHours = channel === ChannelType.VOICE ? 24 : 
                        channel === ChannelType.WHATSAPP ? 12 : 
                        channel === ChannelType.EMAIL ? 48 : 24;
                        
  const nextTime = new Date(lastAttemptAt.getTime() + cooldownHours * 60 * 60 * 1000);
  return nextTime > now ? nextTime : now;
}
