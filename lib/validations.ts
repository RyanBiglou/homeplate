/**
 * LEGAL: "catering" is prohibited in MEHKO listings.
 * Check all text fields before saving cook listings.
 */
export function containsCateringWord(text: string): boolean {
  return /\bcatering\b/i.test(text);
}

export function validateListingText(text: string): {
  valid: boolean;
  reason?: string;
} {
  if (containsCateringWord(text)) {
    return {
      valid: false,
      reason:
        'MEHKO regulations prohibit the use of the word "catering" in listings',
    };
  }
  return { valid: true };
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function parsePriceToCents(dollars: string): number {
  const parsed = parseFloat(dollars);
  if (isNaN(parsed) || parsed <= 0) return 0;
  return Math.round(parsed * 100);
}
