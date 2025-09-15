/**
 * 가격 관련 유틸리티 함수들
 */

export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY';

export const formatPrice = (
  amount: number,
  currency: Currency = 'KRW',
  locale = 'ko-KR'
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
  });
  
  return formatter.format(amount);
};

export const formatNumber = (
  number: number,
  locale = 'ko-KR',
  options: Intl.NumberFormatOptions = {}
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  });
  
  return formatter.format(number);
};

export const abbreviateNumber = (number: number, locale = 'ko-KR'): string => {
  if (number < 1000) return number.toString();
  
  const units = locale === 'ko-KR' 
    ? [
        { value: 1e8, symbol: '억' },
        { value: 1e4, symbol: '만' },
        { value: 1e3, symbol: '천' },
      ]
    : [
        { value: 1e9, symbol: 'B' },
        { value: 1e6, symbol: 'M' },
        { value: 1e3, symbol: 'K' },
      ];
  
  for (const unit of units) {
    if (number >= unit.value) {
      const value = number / unit.value;
      return `${value % 1 === 0 ? value : value.toFixed(1)}${unit.symbol}`;
    }
  }
  
  return number.toString();
};

export const calculateDiscount = (originalPrice: number, discountedPrice: number): {
  amount: number;
  percentage: number;
} => {
  const amount = originalPrice - discountedPrice;
  const percentage = (amount / originalPrice) * 100;
  
  return {
    amount,
    percentage: Math.round(percentage),
  };
};

export const calculateTax = (amount: number, taxRate: number): {
  taxAmount: number;
  totalAmount: number;
} => {
  const taxAmount = amount * (taxRate / 100);
  const totalAmount = amount + taxAmount;
  
  return {
    taxAmount,
    totalAmount,
  };
};

export const parsePriceString = (priceString: string): number | null => {
  const cleaned = priceString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: number
): number => {
  if (fromCurrency === toCurrency) return amount;
  return amount * exchangeRate;
};

