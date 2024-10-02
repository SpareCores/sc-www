
export interface CurrencyOption {
  name: string;
  slug: string;
  symbol: string;
}

export const availableCurrencies: CurrencyOption[] = [
  {name: 'US dollar', slug: 'USD', symbol: '$'},
  {name: 'Euro', slug: 'EUR', symbol: '€'},
  {name: 'British Pound', slug: 'GBP', symbol: '£'},
  {name: 'Swedish Krona', slug: 'SEK', symbol: 'kr'},
  {name: 'Danish Krone', slug: 'DKK', symbol: 'kr'},
  {name: 'Norwegian Krone', slug: 'NOK', symbol: 'kr'},
  {name: 'Swiss Franc', slug: 'CHF', symbol: 'CHF'},
  {name: 'Australian Dollar', slug: 'AUD', symbol: '$'},
  {name: 'Canadian Dollar', slug: 'CAD', symbol: '$'},
  {name: 'Japanese Yen', slug: 'JPY', symbol: '¥'},
  {name: 'Chinese Yuan', slug: 'CNY', symbol: '¥'},
  {name: 'Indian Rupee', slug: 'INR', symbol: '₹'},
  {name: 'Brazilian Real', slug: 'BRL', symbol: 'R$'},
  {name: 'South African Rand', slug: 'ZAR', symbol: 'R'},
];
