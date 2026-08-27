/**
 * Temporal Entity Parser
 * Extracts dates from natural Hinglish/English speech.
 * Validates against PTP_MAX_DAYS (30 day) boundary.
 * 
 * Reference: AI_Strategy.md §4.2, Validation.md EDGE-03
 */

export interface TemporalEntity {
  timestamp: Date;
  amount?: number;
  method?: string;
  confidence: number;
}

export function parseTemporalEntity(text: string): TemporalEntity | null {
  // Very simplistic regex-based mock implementation for hackathon demonstration
  // Real implementation would use NLP model or LLM
  
  const lowerText = text.toLowerCase();
  const now = new Date();
  let timestamp = new Date(now);
  
  if (lowerText.includes('tomorrow') || lowerText.includes('kal')) {
    timestamp.setDate(now.getDate() + 1);
  } else if (lowerText.includes('day after tomorrow') || lowerText.includes('parso')) {
    timestamp.setDate(now.getDate() + 2);
  } else if (lowerText.match(/(\d+)\s*din mein/)) {
    const days = parseInt(lowerText.match(/(\d+)\s*din mein/)?.[1] || '0', 10);
    timestamp.setDate(now.getDate() + days);
  } else {
    // Default to 1 day if not matched
    timestamp.setDate(now.getDate() + 1);
  }

  // Set time to 11 AM if not specified
  timestamp.setHours(11, 0, 0, 0);

  return {
    timestamp,
    confidence: 0.85
  };
}

export function validatePTPDate(date: Date): { valid: boolean; reason?: string } {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);

  if (diffDays < 0) {
    return { valid: false, reason: 'Date is in the past' };
  }
  
  if (diffDays > 30) {
    return { valid: false, reason: 'Date exceeds 30-day maximum policy' };
  }
  
  if (diffDays > 14) {
    // This is valid but should trigger a warning/negotiation in the voice agent
    return { valid: true, reason: 'Date is >14 days, consider closer commitment' };
  }

  return { valid: true };
}
