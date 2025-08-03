import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Placeholder components for dashboard features
const BudgetOverview = () => {
  const budgetData = {
    totalBudget: 2500,
    spent: 1200,
    remaining: 1300,
    categories: [
      { name: 'Food & Dining', spent: 400, limit: 500 },
      { name: 'Transportation', spent: 200, limit: 300 },
      { name: 'Entertainment', spent: 150, limit: 200 },
      { name: 'Utilities', spent: 250, limit: 400 },
      { name: 'Shopping', spent: 200, limit: 300 },
    ],
  };

  return (
    <div className="budget-overview-card">
      <h3>Budget Overview</h3>
      <div className="budget-summary">
        <p>Total Budget: <span>${budgetData.totalBudget.toFixed(2)}</span></p>
        <p>Spent: <span>${budgetData.spent.toFixed(2)}</span></p>
        <p>Remaining: <span>${budgetData.remaining.toFixed(2)}</span></p>
      </div>
      <div className="category-breakdown">
        {budgetData.categories.map((category, index) => (
          <div key={index} className="category-item">
            <span>{category.name}</span>
            <div className="category-bar">
              <div
                className="category-spent"
                style={{ width: `${(category.spent / category.limit) * 100}%` }}
              ></div>
            </div>
            <span>${category.spent.toFixed(2)} / ${category.limit.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpenseTracker = () => {
  const expenses = [
    { id: 1, name: 'Grocery Shopping', category: 'Food & Dining', amount: 85.50, date: '2023-10-26' },
    { id: 2, name: 'Gas Station', category: 'Transportation', amount: 45.00, date: '2023-10-25' },
    { id: 3, name: 'Netflix Subscription', category: 'Entertainment', amount: 15.99, date: '2023-10-24' },
    { id: 4, name: 'Electricity Bill', category: 'Utilities', amount: 120.75, date: '2023-10-23' },
  ];

  return (
    <div className="expense-tracker-card">
      <h3>Recent Expenses</h3>
      <button className="add-expense-btn">+ Add Expense</button>
      <div className="expenses-list">
        {expenses.map((expense) => (
          <div key={expense.id} className="expense-item">
            <div className="expense-details">
              <span className="expense-name">{expense.name}</span>
              <span className="expense-category">{expense.category}</span>
            </div>
            <div className="expense-amount-date">
              <span className="expense-amount">${expense.amount.toFixed(2)}</span>
              <span className="expense-date">{expense.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FinancialReports = () => {
  return (
    <div className="financial-reports-card">
      <h3>Financial Reports</h3>
      <p>View detailed reports on your spending habits, income vs. expenses, and financial goals.</p>
      <div className="report-buttons">
        <button className="report-btn">Monthly Summary</button>
        <button className="report-btn">Category Breakdown</button>
        <button className="report-btn">Goal Progress</button>
      </div>
    </div>
  );
};

function Dashboard() {
  const [userName, setUserName] = useState('User');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching user data or token validation
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
    } else {
      // Simulate getting user name from token or API
      // For now, just using a placeholder
      const firstName = localStorage.getItem('userFirstName') || 'User';
      setUserName(firstName);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userFirstName'); // Clear any other user data
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Welcome, {userName}!</h1>
          <p>Here's your financial snapshot for this month.</p>
        </div>
        <div className="header-right">
          <Link to="/onboarding" className="nav-button">Settings</Link>
          <button onClick={handleLogout} className="nav-button logout-button">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <BudgetOverview />
          <ExpenseTracker />
          <FinancialReports />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
