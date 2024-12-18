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
  }, {
    name: 'Aland Islands',
    code: 'AX',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  }, {
    name: 'Albania',
    code: 'AL',
    currency: { code: 'ALL', symbol: 'Lek', name: 'Albanian Lek' }
  }, {
    name: 'Algeria',
    code: 'DZ',
    currency: { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' }
  }, {
    name: 'Andorra',
    code: 'AD',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  }, {
    name: 'Angola',
    code: 'AO',
    currency: { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza' }
  }, {
    name: 'Anguilla',
    code: 'AI',
    currency: { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar' }
  }, {
    name: 'Antigua and Barbuda',
    code: 'AG',
    currency: { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar' }
  }, {
    name: 'Argentina',
    code: 'AR',
    currency: { code: 'ARS', symbol: '$', name: 'Argentine Peso' }
  }, {
    name: 'Armenia',
    code: 'AM',
    currency: { code: 'AMD', symbol: '֏', name: 'Armenian Dram' }
  }, {
    name: 'Aruba',
    code: 'AW',
    currency: { code: 'AWG', symbol: 'ƒ', name: 'Aruban Florin' }
  }, {
    name: 'Austria',
    code: 'AT',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  }, {
    name: 'Azerbaijan',
    code: 'AZ',
    currency: { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' }
  },
  {
    name: 'Bahamas',
    code: 'BS',
    currency: { code: 'BSD', symbol: '$', name: 'Bahamian Dollar' }
  }, {
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
  }, {
    name: 'Niger',
    code: 'NE',
    currency: { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' }
  }, {
    name: 'Netherlands',
    code: 'NL',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  }, {
    name: 'New Zealand',
    code: 'NZ',
    currency: { code: 'NZD', symbol: '$', name: 'New Zealand Dollar' }
  }, {
    name: 'Nicaragua',
    code: 'NI',
    currency: { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Cordoba' }
  }, {
    name: 'Netherlands Antilles',
    code: 'AN',
    currency: { code: 'ANG', symbol: 'ƒ', name: 'Netherlands Antillean Guilder' }
  }, {
    name: 'Norway',
    code: 'NO',
    currency: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' }
  }, {
    name: 'Panama',
    code: 'PA',
    currency: { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa' }
  }, {
    name: 'Peru',
    code: 'PE',
    currency: { code: 'PEN', symbol: 'S/.', name: 'Peruvian Sol' }
  }, {
    name: 'Philippines',
    code: 'PH',
    currency: { code: 'PHP', symbol: '₱', name: 'Philippine Peso' }
  }, {
    name: 'Poland',
    code: 'PL',
    currency: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' }
  }, {
    name: 'Portugal',
    code: 'PT',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  }, {
    name: 'Qatar',
    code: 'QA',
    currency: { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Rial' }
  }, {
    name: 'Romania',
    code: 'RO',
    currency: { code: 'RON', symbol: 'lei', name: 'Romanian Leu' }
  }, {
    name: 'Russia',
    code: 'RU',
    currency: { code: 'RUB', symbol: '₽', name: 'Russian Ruble' }
  }, {
    name: 'Saudi Arabia',
    code: 'SA',
    currency: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' }
  }, {
    name: 'Serbia',
    code: 'RS',
    currency: { code: 'RSD', symbol: 'Дин.', name: 'Serbian Dinar' }
  }, {
    name: 'Singapore',
    code: 'SG',
    currency: { code: 'SGD', symbol: '$', name: 'Singapore Dollar' }
  }, {
    name: 'Slovakia',
    code: 'SK',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  }, {
    name: 'Slovenia',
    code: 'SI',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  }, {
    name: 'South Korea',
    code: 'KR',
    currency: { code: 'KRW', symbol: '₩', name: 'South Korean Won' }
  }, {
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
  },
  {
    name: 'Tanzania',
    code: 'TZ',
    currency: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' }
  },
  {
    name: 'Uganda',
    code: 'UG',
    currency: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' }
  },
  {
    name: 'Malawi',
    code: 'MW',
    currency: { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' }
  },
  {
    name: 'Zimbabwe',
    code: 'ZW',
    currency: { code: 'ZWL', symbol: 'Z$', name: 'Zimbabwean Dollar' }
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

// Get unique currency codes from COUNTRIES
export const getAvailableCurrencies = (): string[] => {
  const uniqueCurrencies = new Set(COUNTRIES.map(country => country.currency.code));
  return Array.from(uniqueCurrencies).sort();
};

// Get currency details by code
export const getCurrencyDetails = (code: string): Currency | undefined => {
  return COUNTRIES.find(country => country.currency.code === code)?.currency;
};

// List of supported currencies in the app
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

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
