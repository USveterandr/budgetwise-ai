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
  };

  if (!user) {
    return (
      <div className="budget-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You must be logged in to view budgets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-container">
      <div className="budget-header">
        <h1>Budget Management</h1>
        <p>Welcome, {user.firstName}! Manage your monthly budgets here.</p>
        <div className="budget-summary-cards">
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
