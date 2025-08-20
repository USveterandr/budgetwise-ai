import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const TransactionContext = createContext();

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from your API
      // const response = await api.get('/transactions');
      // For now, we'll use mock data
      const mockTransactions = [
        { id: 1, description: 'Grocery Store', amount: 85.32, date: '2023-06-15', category: 'Food & Dining', type: 'expense' },
        { id: 2, description: 'Salary Deposit', amount: 3500.00, date: '2023-06-01', category: 'Income', type: 'income' },
