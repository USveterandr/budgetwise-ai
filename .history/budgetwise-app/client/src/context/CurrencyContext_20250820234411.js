import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({});

  // Default exchange rates for demonstration
  const defaultExchangeRates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.25,
    CAD: 1.25,
    AUD: 1.35
  };

  useEffect(() => {
    // Load saved currency preference from localStorage
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    
    // Set default exchange rates
    setExchangeRates(defaultExchangeRates);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultExchangeRates]);

  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  const convertAmount = (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / (exchangeRates[fromCurrency] || 1);
    const convertedAmount = amountInUSD * (exchangeRates[toCurrency] || 1);
    
    return convertedAmount;
  };

  const formatCurrency = (amount, currencyCode = currency) => {
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

  const value = {
    currency,
    exchangeRates,
    updateCurrency,
    convertAmount,
    formatCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};