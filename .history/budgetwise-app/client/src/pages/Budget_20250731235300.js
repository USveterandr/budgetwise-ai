import React, { useState, useEffect } from 'react';
import './Budget.css'; // We will create this CSS file next

function Budget() {
  const [userName, setUserName] = useState('User');
  const [userTier, setUserTier] = useState('Free'); // Default to Free tier

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      // Redirect to login if not authenticated, though App.js should handle this
      // For now, we assume App.js handles routing and auth checks
      console.log("No token found, redirect might be needed from App.js");
    } else {
      const firstName = localStorage.getItem('userFirstName') || 'User';
      const tier = localStorage.getItem('userTier') || 'Free';
      setUserName(firstName);
      setUserTier(tier);
    }
  }, []);

  // Mock data for budgets
  const budgetCategories = [
    { name: 'Housing', allocated: 1200, spent: 1150, icon: '🏠' },
    { name: 'Food & Dining', allocated: 400, spent: 320, icon: '🍔' },
    { name: 'Transportation', allocated: 300, spent: 280, icon: '🚗' },
    { name: 'Entertainment', allocated: 150, spent: 90, icon: '🎬' },
    { name: 'Utilities', allocated: 200, spent: 195, icon: '💡' },
    { name: 'Healthcare', allocated: 100, spent: 50, icon: '🏥' },
    { name: 'Shopping', allocated: 250, spent: 300, icon: '🛍️' }, // Overspent
    { name: 'Personal Care', allocated: 75, spent: 60, icon: '💅' },
    { name: 'Education', allocated: 150, spent: 150, icon: '📚' },
    { name: 'Savings & Debt', allocated: 500, spent: 500, icon: '🏦' },
  ];

  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalAllocated - totalSpent;

  const getSpentPercentage = (allocated, spent) => {
    return allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
  };

  return (
    <div className="budget-container">
      <div className="budget-header">
