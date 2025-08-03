import React, { useState, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import './BudgetManager.css';

const BudgetManager = () => {
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudget();
  const [activeCategory, setActiveCategory] = useState('all');
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });

  const categories = [
    { id: 'housing', name: 'Housing' },
    { id: 'food', name: 'Food' },
    { id: 'transportation', name: 'Transportation' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'utilities', name: 'Utilities' },
    { id: 'health', name: 'Health' },
    { id: 'savings', name: 'Savings' },
    { id: 'other', name: 'Other' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.amount) return;
    
    addBudget({
      ...newBudget,
      amount: parseFloat(newBudget.amount),
      spent: 0,
      remaining: parseFloat(newBudget.amount)
    });
    
    setNewBudget({ category: '', amount: '', period: 'monthly' });
  };

  const filteredBudgets = activeCategory === 'all' 
    ? budgets 
    : budgets.filter(b => b.category === activeCategory);

  return (
    <div className="budget-manager">
      <div className="budget-header">
        <h2>Budget Management</h2>
        <div className="category-filter">
          <select 
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="budget-form">
        <h3>Add New Budget</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            <select
              value={newBudget.category}
              onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label>Period</label>
            <select
              value={newBudget.period}
              onChange={(e) => setNewBudget({...newBudget, period: e.target.value})}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <button type="submit" className="add-button">
            Add Budget
          </button>
        </form>
      </div>

      <div className="budget-list">
        <h3>Your Budgets</h3>
        {filteredBudgets.length === 0 ? (
          <p className="no-budgets">No budgets found. Add one to get started!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Budgeted</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Period</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBudgets.map(budget => (
                <tr key={budget.id}>
                  <td>{categories.find(c => c.id === budget.category)?.name || budget.category}</td>
                  <td>${budget.amount.toFixed(2)}</td>
                  <td>${budget.spent.toFixed(2)}</td>
