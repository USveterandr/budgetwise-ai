import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const BudgetContext = createContext();

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from your API
      // const response = await api.get('/budgets');
      // For now, we'll use mock data
      const mockBudgets = [
        { id: 1, category: 'Housing', amount: 1200, spent: 1150 },
        { id: 2, category: 'Food & Dining', amount: 400, spent: 320 },
        { id: 3, category: 'Transportation', amount: 300, spent: 280 },
        { id: 4, category: 'Entertainment', amount: 150, spent: 90 },
        { id: 5, category: 'Utilities', amount: 200, spent: 195 },
        { id: 6, category: 'Healthcare', amount: 100, spent: 50 },
        { id: 7, category: 'Shopping', amount: 250, spent: 300 },
        { id: 8, category: 'Personal Care', amount: 75, spent: 60 },
        { id: 9, category: 'Education', amount: 150, spent: 150 },
        { id: 10, category: 'Savings & Debt', amount: 500, spent: 500 }
      ];
      setBudgets(mockBudgets);
    } catch (err) {
      setError('Failed to fetch budgets');
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const addBudget = async (budgetData) => {
    try {
      // In a real app, this would POST to your API
      // const response = await api.post('/budgets', budgetData);
      // For now, we'll simulate adding to the list
      const newBudget = {
        id: budgets.length + 1,
        ...budgetData
      };
      setBudgets(prev => [...prev, newBudget]);
      return newBudget;
    } catch (err) {
      setError('Failed to add budget');
      console.error('Error adding budget:', err);
      throw err;
    }
  };

  const updateBudget = async (budgetId, updateData) => {
    try {
      // In a real app, this would PUT to your API
      // const response = await api.put(`/budgets/${budgetId}`, updateData);
      // For now, we'll simulate updating in the list
      setBudgets(prev => 
