import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscriptions } from '../context/SubscriptionContext';
import './Subscriptions.css';

function Subscriptions() {
  const { user } = useAuth();
  const { subscriptions, getActiveSubscriptions, getTotalMonthlyCost } = useSubscriptions();
  const [userTier, setUserTier] = useState('Free'); // Default to Free tier

  useEffect(() => {
    const tier = localStorage.getItem('userTier') || 'Free';
    setUserTier(tier);
  }, []);

  const activeSubscriptions = getActiveSubscriptions();
  const totalMonthlyCost = getTotalMonthlyCost();
  const yearlyProjection = totalMonthlyCost * 12;

  const categories = ['All', 'Entertainment', 'Music', 'Software', 'Shopping', 'Health & Fitness', 'Education'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredSubscriptions = selectedCategory === 'All' 
    ? subscriptions 
    : subscriptions.filter(sub => sub.category === selectedCategory);

  if (!user) {
    return (
      <div className="subscriptions-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You must be logged in to view subscriptions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subscriptions-container">
      <div className="subscriptions-header">
        <h1>Subscription Manager</h1>
        <p>Welcome, {user.firstName}! Keep track of your recurring expenses.</p>
        
        <div className="subscriptions-summary-card">
          <div className="summary-item">
            <h3>Active Subscriptions</h3>
            <p className="amount">{activeSubscriptions.length}</p>
          </div>
          <div className="summary-item">
            <h3>Monthly Cost</h3>
            <p className="amount">${totalMonthlyCost.toFixed(2)}</p>
          </div>
          <div className="summary-item">
            <h3>Yearly Projection</h3>
            <p className="amount">${yearlyProjection.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="subscriptions-filters">
        <h2>Filter by Category</h2>
        <div className="category-filters">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="subscriptions-list">
        <h2>Your Subscriptions</h2>
        <div className="subscriptions-grid">
          {filteredSubscriptions.map((subscription) => (
            <div key={subscription.id} className={`subscription-card ${subscription.status.toLowerCase()}`}>
              <div className="subscription-header">
                <span className="subscription-icon">{subscription.icon || '💳'}</span>
                <div className="subscription-info">
                  <h3>{subscription.name}</h3>
                  <p className="subscription-category">{subscription.category}</p>
                </div>
                <span className={`subscription-status ${subscription.status.toLowerCase()}`}>
                  {subscription.status}
                </span>
                  <p className="subscription-category">{subscription.category}</p>
                </div>
                <span className={`subscription-status ${subscription.status.toLowerCase()}`}>
                  {subscription.status}
                </span>
              </div>
              <div className="subscription-details">
                <div className="detail-row">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">${subscription.price.toFixed(2)}/month</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Next Billing:</span>
                  <span className="detail-value">{new Date(subscription.nextBillingDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="subscription-actions">
                {subscription.status === 'Active' ? (
                  <button className="action-button cancel-btn">Cancel</button>
                ) : (
                  <button className="action-button reactivate-btn">Reactivate</button>
                )}
                <button className="action-button manage-btn">Manage</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {userTier === 'Pro' && (
        <div className="pro-features-subscriptions">
          <h2>Pro Subscription Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <h3>Unused Subscriptions</h3>
              <p>You haven't used "Adobe Creative Cloud" in 60 days. Consider cancelling to save $52.99/month.</p>
            </div>
            <div className="insight-card">
              <h3>Cost Optimization</h3>
              <p>Switching to annual plans for Netflix and Spotify could save you $35.87 this year.</p>
            </div>
            <div className="insight-card">
              <h3>Category Spending</h3>
              <p>You spend $31.98/month on Entertainment. This is 40% of your total subscription cost.</p>
            </div>
            <div className="insight-card">
              <h3>Renewal Alerts</h3>
              <p>3 subscriptions are due for renewal in the next 7 days. Review them now.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subscriptions;
