/**
 * Types for country and currency data
 */
interface Country {
  name: string;
  code: string;
  currency: Currency;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

/**
 * Static data for countries and their currencies
 */
export const COUNTRIES: Country[] = [
  {
    name: 'Afghanistan',
    code: 'AF',
    currency: { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' }
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    currency: { code: 'GBP', symbol: '£', name: 'British Pound' }
  },
  {
    name: 'United States',
    code: 'US',
    currency: { code: 'USD', symbol: '$', name: 'US Dollar' }
  },
  {
    name: 'Canada',
    code: 'CA',
    currency: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' }
  },
  {
    name: 'European Union',
    code: 'EU',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  },
  {
    name: 'Australia',
    code: 'AU',
    currency: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
  },
  {
    name: 'Nigeria',
    code: 'NG',
    currency: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' }
  },
  {
    name: 'South Africa',
    code: 'ZA',
    currency: { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
  },
  {
    name: 'Kenya',
    code: 'KE',
    currency: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' }
  },
  {
    name: 'Ghana',
    code: 'GH',
    currency: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' }
  }
];

/**
 * Currency formatting functions
 */

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
 * Helper function for USD formatting since it's the default currency
 * @param amount - The amount to format
 * @returns Formatted USD string
 */
export function formatUSD(amount: number): string {
  return formatCurrency(amount);
}

/**
 * Parses a currency string into a number
 * @param value - The currency string to parse
 * @returns The parsed number value
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and non-numeric characters except decimal point
  const numericValue = value.replace(/[^0-9.]/g, '');
  return parseFloat(numericValue) || 0;
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
    // Check if it has at most 2 decimal places
    Math.round(amount * 100) === amount * 100
  );
}

/**
 * Helper functions for getting currency information
 */

/**
 * Get currency information for a country
 * @param countryCode - The ISO country code
 * @returns Currency information or undefined if not found
 */
export function getCurrencyForCountry(countryCode: string): Currency | undefined {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country?.currency;
}

/**
 * Get currency symbol for a currency code
 * @param currencyCode - The ISO 4217 currency code
 * @returns Currency symbol or the code if not found
 */
export function getCurrencySymbol(currencyCode: string): string {
  const country = COUNTRIES.find(c => c.currency.code === currencyCode);
  return country?.currency.symbol || currencyCode;
}

/**
 * Date and time formatting functions
 */

/**
 * Formats a date into a localized string
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a date into a localized time string
 * @param date - The date to format
 * @returns Formatted time string
 */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a date into a localized date and time string
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}
