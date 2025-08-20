import api from './api';

class CurrencyService {
  static async getExchangeRates(baseCurrency = 'USD') {
    try {
      const response = await api.get(`/currency/rates?base=${baseCurrency}`);
      return response.rates;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      throw error;
    }
  }

  static async convertCurrency(amount, fromCurrency, toCurrency) {
    try {
      const response = await api.get(`/currency/convert?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
      return response.convertedAmount;
    } catch (error) {
      console.error('Failed to convert currency:', error);
      throw error;
    }
  }

  static async getSupportedCurrencies() {
    try {
      const response = await api.get('/currency/supported');
      return response.currencies;
    } catch (error) {
      console.error('Failed to fetch supported currencies:', error);
      throw error;
    }
  }

  static formatCurrency(amount, currencyCode) {
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
  }
}

export default CurrencyService;