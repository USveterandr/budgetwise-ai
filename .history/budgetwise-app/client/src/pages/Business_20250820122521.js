import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import './Business.css';

function Business() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const [userTier, setUserTier] = useState('Free'); // Default to Free tier

  useEffect(() => {
      // In a real app, you might redirect to a subscription page or login
    } else {
      const firstName = localStorage.getItem('userFirstName') || 'User';
      const tier = localStorage.getItem('userTier') || 'Free';
      setUserName(firstName);
      setUserTier(tier);
    }
  }, []);

  // Mock data for business features
  const businessMetrics = [
    { name: 'Monthly Revenue', value: '$45,230', change: '+12.5%', icon: '💰', trend: 'up' },
    { name: 'Total Expenses', value: '$28,150', change: '-3.2%', icon: '💸', trend: 'down' },
    { name: 'Net Profit', value: '$17,080', change: '+28.1%', icon: '📈', trend: 'up' },
    { name: 'Cash Flow', value: '$8,920', change: '+5.7%', icon: '💵', trend: 'up' },
  ];

  const recentTransactions = [
    { id: 1, description: 'Payment from Client A', amount: '$5,000.00', date: '2024-02-10', type: 'income' },
    { id: 2, description: 'Office Rent (Feb)', amount: '$2,500.00', date: '2024-02-08', type: 'expense' },
    { id: 3, description: 'Software Subscription', amount: '$299.00', date: '2024-02-05', type: 'expense' },
    { id: 4, description: 'Consulting Fee - Project X', amount: '$3,200.00', date: '2024-02-03', type: 'income' },
    { id: 5, description: 'Marketing Campaign', amount: '$1,500.00', date: '2024-02-01', type: 'expense' },
  ];

  const upcomingInvoices = [
    { id: 1, client: 'Client B', amount: '$7,500.00', dueDate: '2024-02-20', status: 'Pending' },
    { id: 2, client: 'Client C', amount: '$4,200.00', dueDate: '2024-02-25', status: 'Draft' },
  ];

  const taxSummary = {
    estimatedQ1Tax: '$4,270.00',
    lastYearTax: '$3,850.00',
    change: '+10.9%',
  };

  // Check if user is Pro tier
  if (userTier !== 'Pro') {
    return (
      <div className="business-access-denied">
        <div className="denied-content">
          <h1>Access Restricted</h1>
          <p>This is a Pro tier feature. Please upgrade to access the Business Dashboard.</p>
          <div className="upgrade-prompt">
            <button className="upgrade-button">Upgrade to Pro</button>
            <p>or <a href="/dashboard">Go back to Dashboard</a></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="business-container">
      <div className="business-header">
        <h1>Business Dashboard</h1>
        <p>Welcome back, {userName}! Here's an overview of your business finances.</p>
      </div>

      <div className="business-metrics-grid">
        {businessMetrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">{metric.icon}</span>
              <h3>{metric.name}</h3>
            </div>
            <p className="metric-value">{metric.value}</p>
            <p className={`metric-change ${metric.trend === 'up' ? 'positive' : 'negative'}`}>
              {metric.change}
            </p>
          </div>
        ))}
      </div>

      <div className="business-content-grid">
        <div className="business-section">
          <h2>Recent Transactions</h2>
          <div className="transactions-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                <div className="transaction-info">
                  <h4>{transaction.description}</h4>
                  <p className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <p className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}{transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="business-section">
          <h2>Upcoming Invoices</h2>
          <div className="invoices-list">
            {upcomingInvoices.map((invoice) => (
              <div key={invoice.id} className="invoice-item">
                <div className="invoice-info">
                  <h4>{invoice.client}</h4>
                  <p className="invoice-due">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="invoice-amount-status">
                  <p className="invoice-amount">{invoice.amount}</p>
                  <span className={`invoice-status ${invoice.status.toLowerCase()}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
            <button className="add-invoice-btn">+ Create New Invoice</button>
          </div>
        </div>

        <div className="business-section">
          <h2>Estimated Tax</h2>
          <div className="tax-summary-card">
            <div className="tax-item">
              <h3>Estimated Q1 Tax</h3>
              <p className="tax-amount">{taxSummary.estimatedQ1Tax}</p>
            </div>
            <div className="tax-item">
              <h3>Last Year Q1 Tax</h3>
              <p className="tax-amount">{taxSummary.lastYearTax}</p>
            </div>
            <div className="tax-item">
              <h3>Year-over-Year Change</h3>
              <p className={`tax-change ${taxSummary.change.startsWith('+') ? 'positive' : 'negative'}`}>
                {taxSummary.change}
              </p>
            </div>
          </div>
          <button className="view-tax-details-btn">View Tax Details</button>
        </div>

        <div className="business-section">
          <h2>Business Insights</h2>
          <div className="insights-list">
            <div className="insight-item">
              <h3>Revenue Trend</h3>
              <p>Your revenue has increased by 12.5% compared to last month. Keep up the great work!</p>
            </div>
            <div className="insight-item">
              <h3>Expense Alert</h3>
              <p>Marketing expenses are 20% higher than average. Consider reviewing your campaigns.</p>
            </div>
            <div className="insight-item">
              <h3>Cash Flow Forecast</h3>
              <p>Based on current trends, your cash flow is expected to remain positive for the next 3 months.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Business;
