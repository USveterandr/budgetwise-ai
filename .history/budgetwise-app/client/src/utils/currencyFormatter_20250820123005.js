// currencyFormatter.js

export const formatCurrency = (amount, currencyCode = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting if currency code is invalid
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

export const formatCurrencyCompact = (amount, currencyCode = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting if currency code is invalid
    return `${currencyCode} ${amount.toFixed(0)}`;
  }
};

export const formatPercentage = (value, decimals = 2) => {
  return `${value.toFixed(decimals)}%`;
};

export const formatChange = (value, decimals = 2) => {
  const formatted = value.toFixed(decimals);
  return value >= 0 ? `+${formatted}` : formatted;
};