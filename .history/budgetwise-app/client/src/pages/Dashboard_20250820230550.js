import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useBudget } from '../context/BudgetContext';
import { useSubscriptions } from '../context/SubscriptionContext';
import './Dashboard.css';

// Placeholder components for dashboard features
const CashFlow = ({ transactions }) => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netFlow = income - expenses;

  return (
    <div className="cash-flow-card">
      <h3>Cash Flow</h3>
      <div className="cash-flow-summary">
        <p>Income: <span className="positive">+${income.toFixed(2)}</span></p>
        <p>Expenses: <span className="negative">-${expenses.toFixed(2)}</span></p>
        <p>Net Flow: <span className={`net-flow ${netFlow >= 0 ? 'positive' : 'negative'}`}>
          {netFlow >= 0 ? '+' : ''}${netFlow.toFixed(2)}
        </span></p>
      </div>
    </div>
  );
};

const NetWorth = () => {
  const netWorthData = {
    totalAssets: 125000,
    totalLiabilities: 25000,
    netWorthValue: 100000,
  };

  return (
    <div className="net-worth-card">
      <h3>Net Worth</h3>
      <div className="net-worth-summary">
        <p>Total Assets: <span className="positive">+${netWorthData.totalAssets.toFixed(2)}</span></p>
        <p>Total Liabilities: <span className="negative">-${netWorthData.totalLiabilities.toFixed(2)}</span></p>
        <p>Net Worth: <span className="positive">+${netWorthData.netWorthValue.toFixed(2)}</span></p>
      </div>
    </div>
  );
};

const FinancialHealthScore = () => {
  const scoreData = {
    score: 78,
    maxScore: 100,
    factors: [
      { name: 'Savings Rate', status: 'Good', value: '20%' },
      { name: 'Debt-to-Income', status: 'Fair', value: '35%' },
      { name: 'Emergency Fund', status: 'Excellent', value: '6 months' },
    ],
  };

  return (
    <div className="financial-health-card">
      <h3>Financial Health Score</h3>
      <div className="score-display">
        <span className="score-number">{scoreData.score}</span>
        <span className="score-max">/{scoreData.maxScore}</span>
      </div>
      <div className="score-factors">
        {scoreData.factors.map((factor, index) => (
          <div key={index} className="factor-item">
            <span>{factor.name}:</span>
            <span className={`factor-status ${factor.status.toLowerCase()}`}>{factor.status}</span>
            <span>{factor.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BudgetOverview = ({ budgets }) => {
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <div className="budget-overview-card">
      <h3>Budget Management</h3>
      <div className="budget-summary">
        <p>Total Budget: <span>${totalBudget.toFixed(2)}</span></p>
        <p>Spent: <span>${totalSpent.toFixed(2)}</span></p>
        <p>Remaining: <span>${remaining.toFixed(2)}</span></p>
      </div>
      <div className="category-breakdown">
        {budgets.map((budget, index) => (
          <div key={index} className="category-item">
            <span>{budget.category}</span>
            <div className="category-bar">
              <div
                className="category-spent"
                style={{ width: `${(budget.spent / budget.amount) * 100}%` }}
              ></div>
            </div>
            <span>${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const InvestmentTracking = () => {
  const investments = [
    { name: 'Apple Inc. (AAPL)', value: 15000, change: '+2.5%' },
    { name: 'Tesla Inc. (TSLA)', value: 10000, change: '-1.2%' },
    { name: 'S&P 500 ETF (SPY)', value: 25000, change: '+0.8%' },
    { name: 'Bitcoin (BTC)', value: 8000, change: '+5.0%' },
  ];

  const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
  const totalChange = investments.reduce((sum, inv) => sum + parseFloat(inv.change), 0) / investments.length;

  return (
    <div className="investment-tracking-card">
      <h3>Investment Tracking</h3>
      <div className="portfolio-summary">
        <p>Total Portfolio Value: <span className="positive">${totalValue.toFixed(2)}</span></p>
        <p>Average Change: <span className={`net-flow ${totalChange >= 0 ? 'positive' : 'negative'}`}>
          {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
        </span></p>
      </div>
      <div className="investments-list">
        {investments.map((investment, index) => (
          <div key={index} className="investment-item">
            <span className="investment-name">{investment.name}</span>
            <div className="investment-details">
              <span className="investment-value">${investment.value.toFixed(2)}</span>
              <span className={`investment-change ${investment.change.startsWith('+') ? 'positive' : 'negative'}`}>
                {investment.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SubscriptionManager = ({ subscriptions }) => {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active');
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => sum + sub.price, 0);

  return (
    <div className="subscription-manager-card">
      <h3>Subscription Manager</h3>
      <div className="subscription-summary">
        <p>Total Monthly: <span className="negative">${totalMonthly.toFixed(2)}</span></p>
      </div>
      <div className="subscriptions-list">
        {activeSubscriptions.slice(0, 4).map((sub, index) => (
          <div key={index} className="subscription-item">
            <div className="subscription-details">
              <span className="subscription-name">{sub.name}</span>
              <span className="subscription-category">{sub.category}</span>
            </div>
            <div className="subscription-price-date">
              <span className="subscription-price">${sub.price.toFixed(2)}</span>
              <span className="subscription-date">{sub.nextBillingDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AccountIntegration = () => {
  const accounts = [
    { name: 'Chase Checking', type: 'Bank', balance: 5230.75, status: 'Connected' },
    { name: 'Fidelity Investments', type: 'Investment', balance: 58000.00, status: 'Connected' },
    { name: 'Coinbase Wallet', type: 'Crypto', balance: 2.5, status: 'Partially Connected' },
    { name: 'Add New Account', type: 'Action', balance: null, status: 'Connect' },
  ];

  return (
    <div className="account-integration-card">
      <h3>Account Integration</h3>
      <div className="accounts-list">
        {accounts.map((account, index) => (
          <div key={index} className={`account-item ${account.type === 'Action' ? 'action-item' : ''}`}>
            <div className="account-details">
              <span className="account-name">{account.name}</span>
              <span className="account-type">{account.type}</span>
            </div>
            <div className="account-status-balance">
              {account.balance !== null ? (
                <span className="account-balance">${account.balance.toFixed(2)}</span>
              ) : null}
              <span className={`account-status ${account.status.toLowerCase().replace(' ', '-')}`}>
                {account.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function Dashboard() {
  const { user, logout } = useAuth();
  const { transactions } = useTransactions();
  const { budgets } = useBudget();
  const { subscriptions } = useSubscriptions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Welcome, {user ? user.firstName : 'User'}!</h1>
          <p>Here's your financial snapshot for this month.</p>
        </div>
        <div className="header-right">
          <Link to="/onboarding" className="nav-button">Settings</Link>
          <button onClick={handleLogout} className="nav-button logout-button">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <CashFlow transactions={transactions} />
          <NetWorth />
          <FinancialHealthScore />
          <BudgetOverview budgets={budgets} />
          <InvestmentTracking />
          <SubscriptionManager subscriptions={subscriptions} />
          <AccountIntegration />
          {/* Placeholder for Business Tools (Pro feature) */}
          <div className="business-tools-card pro-feature-card">
            <h3>Business Tools</h3>
            <p>Advanced team management and expense tracking for Pro users.</p>
            <button className="upgrade-btn">Upgrade to Pro</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
