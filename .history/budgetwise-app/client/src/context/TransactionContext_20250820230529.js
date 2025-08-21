import React, { createContext, useContext, useState, useEffect } from 'react';

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
        { id: 3, description: 'Gas Station', amount: 45.67, date: '2023-06-10', category: 'Transportation', type: 'expense' },
        { id: 4, description: 'Netflix Subscription', amount: 15.99, date: '2023-06-05', category: 'Entertainment', type: 'expense' },
        { id: 5, description: 'Freelance Work', amount: 1200.00, date: '2023-06-20', category: 'Income', type: 'income' }
      ];
      setTransactions(mockTransactions);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      // In a real app, this would POST to your API
      // const response = await api.post('/transactions', transactionData);
      // For now, we'll simulate adding to the list
      const newTransaction = {
        id: transactions.length + 1,
        ...transactionData,
        date: new Date().toISOString().split('T')[0]
      };
      setTransactions(prev => [...prev, newTransaction]);
      return newTransaction;
    } catch (err) {
      setError('Failed to add transaction');
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      // In a real app, this would DELETE from your API
      // await api.delete(`/transactions/${transactionId}`);
      // For now, we'll simulate deleting from the list
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } catch (err) {
      setError('Failed to delete transaction');
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (transactionId, updateData) => {
    try {
      // In a real app, this would PUT to your API
      // const response = await api.put(`/transactions/${transactionId}`, updateData);
      // For now, we'll simulate updating in the list
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? { ...t, ...updateData } : t)
      );
    } catch (err) {
      setError('Failed to update transaction');
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const value = {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};