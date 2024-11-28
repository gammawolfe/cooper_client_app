/**
 * Formats a number as currency with the specified currency code and locale.
 * @param amount - The amount to format
 * @param currencyCode - The ISO 4217 currency code (default: 'USD')
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parses a currency string back into a number.
 * @param currencyString - The currency string to parse
 * @returns The parsed number or null if invalid
 */
export function parseCurrency(currencyString: string): number | null {
  // Remove currency symbols, spaces, and commas
  const cleanString = currencyString.replace(/[^0-9.-]+/g, '');
  const number = parseFloat(cleanString);
  
  return isNaN(number) ? null : number;
}

/**
 * Validates if the amount is a valid currency value.
 * @param amount - The amount to validate
 * @returns True if valid, false otherwise
 */
export function isValidCurrencyAmount(amount: number): boolean {
  return (
    typeof amount === 'number' &&
    !isNaN(amount) &&
    isFinite(amount) &&
    amount >= 0 &&
    Number.isInteger(amount * 100) // Ensures no more than 2 decimal places
  );
}
