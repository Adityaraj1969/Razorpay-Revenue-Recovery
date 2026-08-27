/**
 * System constants
 */
export const TRAI_QUIET_HOURS_START = '21:00';
export const TRAI_QUIET_HOURS_END = '09:00';
export const MERCHANT_OPERATING_START = '09:00';
export const MERCHANT_OPERATING_END = '19:00';

export const MAX_VOICE_ATTEMPTS = 2;
export const MAX_WHATSAPP_MESSAGES = 3;
export const MAX_DUNNING_EMAILS = 4;
export const MAX_MANDATE_RETRIES = 3;

export const VOICE_COOLDOWN_HOURS = 24;
export const WHATSAPP_COOLDOWN_HOURS = 12;
export const EMAIL_COOLDOWN_HOURS = 48;

export const BANK_DEGRADATION_THRESHOLD = 0.30;
export const BANK_RECOVERY_THRESHOLD = 0.90;
export const BANK_SLIDING_WINDOW_SIZE = 50;
export const BANK_SLIDING_WINDOW_TTL = 300;

export const LOW_CONFIDENCE_THRESHOLD = 0.70;

export const HIGH_VALUE_INVOICE_THRESHOLD_PAISE = 20000000; // ₹2,00,000

export const CHECKOUT_ABANDONMENT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export const PTP_REMINDER_HOURS_BEFORE = 2;
export const PTP_MAX_DAYS = 30;

export const LOCK_TTL_MS = 30000;
export const DEDUP_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const TOKEN_BUCKET_RPM = 14;

export const HARD_STOP_TARGET_MS = 64;
export const WEBRTC_DROP_TARGET_MS = 85;

export const HOLDOUT_CONTROL_RATIO = 0.10;
