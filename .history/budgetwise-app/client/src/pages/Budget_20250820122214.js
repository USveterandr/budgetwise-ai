import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import './Budget.css';

function Budget() {
  const { user } = useAuth();
  const { budgets, getTotalAllocated, getTotalSpent } = useBudget();
  const [userTier, setUserTier] = useState('Free'); // Default to Free tier

  useEffect(() => {
    const tier = localStorage.getItem('userTier') || 'Free';
    setUserTier(tier);
  }, []);

  const totalAllocated = getTotalAllocated();
  const totalSpent = getTotalSpent();
  const remaining = totalAllocated - totalSpent;

  const getSpentPercentage = (allocated, spent) => {
    return allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
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
        <h1>Budget Management</h1>
        <p>Welcome, {userName}! Manage your monthly budgets here.</p>
        <div className="budget-summary-cards">
          <div className="summary-card">
            <h3>Total Allocated</h3>
            <p className="amount">${totalAllocated.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Spent</h3>
            <p className={`amount ${totalSpent > totalAllocated ? 'negative' : ''}`}>${totalSpent.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Remaining</h3>
            <p className={`amount ${remaining < 0 ? 'negative' : 'positive'}`}>${remaining.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="budget-categories">
        <h2>Budget Categories</h2>
        <div className="categories-grid">
          {budgetCategories.map((category, index) => {
            const spentPercentage = getSpentPercentage(category.allocated, category.spent);
            const isOverspent = category.spent > category.allocated;
            return (
              <div key={index} className={`budget-category-card ${isOverspent ? 'overspent' : ''}`}>
                <div className="category-header">
                  <span className="category-icon">{category.icon}</span>
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    <p>${category.spent.toFixed(2)} of ${category.allocated.toFixed(2)}</p>
                  </div>
                </div>
                <div className="category-progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${spentPercentage}%` }}
                  ></div>
                </div>
                <div className="category-footer">
                  <span className={`spent-percentage ${isOverspent ? 'negative' : ''}`}>
                    {spentPercentage.toFixed(1)}%
                  </span>
                  <span className={`remaining-amount ${isOverspent ? 'negative' : 'positive'}`}>
                    ${Math.abs(category.allocated - category.spent).toFixed(2)} {isOverspent ? 'over' : 'left'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {userTier === 'Pro' && (
        <div className="pro-features-budget">
          <h2>Pro Budget Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <h3>Spending Trends</h3>
              <p>Your food spending has increased by 15% compared to last month.</p>
            </div>
            <div className="insight-card">
              <h3>AI Recommendations</h3>
              <p>Consider reducing dining out to save an estimated $50/month.</p>
            </div>
            <div className="insight-card">
              <h3>Upcoming Expenses</h3>
              <p>Car insurance due next week. Budget $120 for this.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budget;
