interface Country {
  name: string;
  code: string;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
}

export const COUNTRIES: Country[] = [
  {
    name: 'Afghanistan',
    code: 'AF',
    currency: { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' }
  },
  {
    name: 'Albania',
    code: 'AL',
    currency: { code: 'ALL', symbol: 'L', name: 'Albanian Lek' }
  },
  {
    name: 'Algeria',
    code: 'DZ',
    currency: { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' }
  },
  {
    name: 'Argentina',
    code: 'AR',
    currency: { code: 'ARS', symbol: '$', name: 'Argentine Peso' }
  },
  {
    name: 'Australia',
    code: 'AU',
    currency: { code: 'AUD', symbol: '$', name: 'Australian Dollar' }
  },
  {
    name: 'Austria',
    code: 'AT',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  },
  {
    name: 'Bahrain',
    code: 'BH',
    currency: { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' }
  },
  {
    name: 'Bangladesh',
    code: 'BD',
    currency: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' }
  },
  {
    name: 'Belgium',
    code: 'BE',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  },
  {
    name: 'Bolivia',
    code: 'BO',
    currency: { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano' }
  },
  {
    name: 'Brazil',
    code: 'BR',
    currency: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' }
  },
  {
    name: 'Canada',
    code: 'CA',
    currency: { code: 'CAD', symbol: '$', name: 'Canadian Dollar' }
  },
  {
    name: 'Chile',
    code: 'CL',
    currency: { code: 'CLP', symbol: '$', name: 'Chilean Peso' }
  },
  {
    name: 'China',
    code: 'CN',
    currency: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
  },
  {
    name: 'Colombia',
    code: 'CO',
    currency: { code: 'COP', symbol: '$', name: 'Colombian Peso' }
  },
  {
    name: 'Costa Rica',
    code: 'CR',
    currency: { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón' }
  },
  {
    name: 'Dominican Republic',
    code: 'DO',
    currency: { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso' }
  },
  {
    name: 'Ecuador',
    code: 'EC',
    currency: { code: 'USD', symbol: '$', name: 'US Dollar' }
  },
  {
    name: 'Egypt',
    code: 'EG',
    currency: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' }
  },
  {
    name: 'France',
    code: 'FR',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  },
  {
    name: 'Ghana',
    code: 'GH',
    currency: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' }
  },
  {
    name: 'Germany',
    code: 'DE',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  },
  {
    name: 'Greece',
    code: 'GR',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  },
  {
    name: 'Guatemala',
    code: 'GT',
    currency: { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' }
  },
  {
    name: 'India',
    code: 'IN',
    currency: { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  },
  {
    name: 'Indonesia',
    code: 'ID',
    currency: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' }
  },
  {
    name: 'Iran',
    code: 'IR',
    currency: { code: 'IRR', symbol: '﷼', name: 'Iranian Rial' }
  },
  {
    name: 'Iraq',
    code: 'IQ',
    currency: { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar' }
  },
  {
    name: 'Ireland',
    code: 'IE',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  },
  {
    name: 'Italy',
    code: 'IT',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  },
  {
    name: 'Japan',
    code: 'JP',
    currency: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
  },
  {
    name: 'Kazakhstan',
    code: 'KZ',
    currency: { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' }
  },
  {
    name: 'Kenya',
    code: 'KE',
    currency: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' }
  },
  {
    name: 'Kuwait',
    code: 'KW',
    currency: { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' }
  },
  {
    name: 'Kyrgyzstan',
    code: 'KG',
    currency: { code: 'KGS', symbol: 'с', name: 'Kyrgystani Som' }
  },
  {
    name: 'Mexico',
    code: 'MX',
    currency: { code: 'MXN', symbol: '$', name: 'Mexican Peso' }
  },
  {
    name: 'Netherlands',
    code: 'NL',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  },
  {
    name: 'New Zealand',
    code: 'NZ',
    currency: { code: 'NZD', symbol: '$', name: 'New Zealand Dollar' }
  },
  {
    name: 'Nigeria',
    code: 'NG',
    currency: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' }
  },
  {
    name: 'Norway',
    code: 'NO',
    currency: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' }
  },
  {
    name: 'Oman',
    code: 'OM',
    currency: { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' }
  },
  {
    name: 'Pakistan',
    code: 'PK',
    currency: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' }
  },
  {
    name: 'Panama',
    code: 'PA',
    currency: { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa' }
  },
  {
    name: 'Paraguay',
    code: 'PY',
    currency: { code: 'PYG', symbol: '₲', name: 'Paraguayan Guarani' }
  },
  {
    name: 'Peru',
    code: 'PE',
    currency: { code: 'PEN', symbol: 'S/.', name: 'Peruvian Sol' }
  },
  {
    name: 'Philippines',
    code: 'PH',
    currency: { code: 'PHP', symbol: '₱', name: 'Philippine Peso' }
  },
  {
    name: 'Poland',
    code: 'PL',
    currency: { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' }
  },
  {
    name: 'Portugal',
    code: 'PT',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  },
  {
    name: 'Qatar',
    code: 'QA',
    currency: { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' }
  },
  {
    name: 'Russia',
    code: 'RU',
    currency: { code: 'RUB', symbol: '₽', name: 'Russian Ruble' }
  },
  {
    name: 'Rwanda',
    code: 'RW',
    currency: { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' }
  },
  {
    name: 'Saudi Arabia',
    code: 'SA',
    currency: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' }
  },
  {
    name: 'Singapore',
    code: 'SG',
    currency: { code: 'SGD', symbol: '$', name: 'Singapore Dollar' }
  },
  {
    name: 'South Africa',
    code: 'ZA',
    currency: { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
  },
  {
    name: 'South Korea',
    code: 'KR',
    currency: { code: 'KRW', symbol: '₩', name: 'South Korean Won' }
  },
  {
    name: 'Spain',
    code: 'ES',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' }
  },
  {
    name: 'Sri Lanka',
    code: 'LK',
    currency: { code: 'LKR', symbol: '₨', name: 'Sri Lankan Rupee' }
  },
  {
    name: 'Sweden',
    code: 'SE',
    currency: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' }
  },
  {
    name: 'Switzerland',
    code: 'CH',
    currency: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' }
  },
  {
    name: 'Syria',
    code: 'SY',
    currency: { code: 'SYP', symbol: '£S', name: 'Syrian Pound' }
  },
  {
    name: 'Tajikistan',
    code: 'TJ',
    currency: { code: 'TJS', symbol: 'ЅМ', name: 'Tajikistani Somoni' }
  },
  {
    name: 'Tanzania',
    code: 'TZ',
    currency: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' }
  },
  {
    name: 'Thailand',
    code: 'TH',
    currency: { code: 'THB', symbol: '฿', name: 'Thai Baht' }
  },
  {
    name: 'Turkey',
    code: 'TR',
    currency: { code: 'TRY', symbol: '₺', name: 'Turkish Lira' }
  },
  {
    name: 'Uganda',
    code: 'UG',
    currency: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' }
  },
  {
    name: 'Ukraine',
    code: 'UA',
    currency: { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' }
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    currency: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' }
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
    name: 'Uruguay',
    code: 'UY',
    currency: { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' }
  },
  {
    name: 'Uzbekistan',
    code: 'UZ',
    currency: { code: 'UZS', symbol: 'лв', name: 'Uzbekistani Som' }
  },
  {
    name: 'Venezuela',
    code: 'VE',
    currency: { code: 'VES', symbol: 'Bs.', name: 'Venezuelan Bolívar' }
  },
  {
    name: 'Vietnam',
    code: 'VN',
    currency: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' }
  },
  {
    name: 'Yemen',
    code: 'YE',
    currency: { code: 'YER', symbol: '﷼', name: 'Yemeni Rial' }
  }
];
