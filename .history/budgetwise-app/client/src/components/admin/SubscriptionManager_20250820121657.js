import React, { useState, useEffect } from 'react';
import './SubscriptionManager.css';

const SubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock subscription data
  const mockSubscriptions = [
    { id: 1, userId: 1, userName: 'John Doe', plan: 'Personal Plus', status: 'active', startDate: '2023-01-15', endDate: '2024-01-15', amount: 6.97, currency: 'USD', paymentMethod: 'Credit Card' },
    { id: 2, userId: 2, userName: 'Jane Smith', plan: 'Investor', status: 'active', startDate: '2023-03-20', endDate: '2024-03-20', amount: 15.97, currency: 'USD', paymentMethod: 'PayPal' },
    { id: 3, userId: 3, userName: 'Robert Johnson', plan: 'Free', status: 'expired', startDate: '2023-02-10', endDate: '2023-05-10', amount: 0, currency: 'USD', paymentMethod: 'N/A' },
    { id: 4, userId: 4, userName: 'Emily Williams', plan: 'Business Pro Elite', status: 'active', startDate: '2023-01-05', endDate: '2024-01-05', amount: 29.97, currency: 'USD', paymentMethod: 'Credit Card' },
    { id: 5, userId: 5, userName: 'Michael Brown', plan: 'Personal Plus', status: 'cancelled', startDate: '2023-04-12', endDate: '2023-07-12', amount: 6.97, currency: 'USD', paymentMethod: 'Bank Transfer' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSubscriptions(mockSubscriptions);
      setLoading(false);
    }, 500);
  }, []);

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEditSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setShowEditModal(true);
  };

  const handleCancelSubscription = (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, status: 'cancelled' }
          : sub
      ));
    }
  };

  const handleExtendSubscription = (subscriptionId) => {
    setSubscriptions(subscriptions.map(sub => {
      if (sub.id === subscriptionId) {
        const newEndDate = new Date(sub.endDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        return { ...sub, endDate: newEndDate.toISOString().split('T')[0] };
      }
      return sub;
    }));
  };

  const handleSaveSubscription = (updatedSubscription) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === updatedSubscription.id ? updatedSubscription : sub
    ));
    setShowEditModal(false);
    setSelectedSubscription(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'expired': return 'status-expired';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading subscriptions...</div>;
  }

  return (
    <div className="subscription-manager">
      <div className="subscription-manager-header">
        <h2>Subscription Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button className="btn-primary">Add New Subscription</button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total Subscriptions</h3>
          <p className="stat-value">{subscriptions.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Subscriptions</h3>
          <p className="stat-value">{subscriptions.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="stat-card">
          <h3>Monthly Revenue</h3>
          <p className="stat-value">
            {formatCurrency(
              subscriptions
                .filter(s => s.status === 'active')
                .reduce((sum, sub) => sum + sub.amount, 0),
              'USD'
            )}
          </p>
        </div>
      </div>

      <div className="subscriptions-table-container">
        <table className="subscriptions-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map(subscription => (
              <tr key={subscription.id}>
                <td>{subscription.userName}</td>
                <td>{subscription.plan}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(subscription.status)}`}>
                    {subscription.status}
                  </span>
                </td>
                <td>{subscription.startDate}</td>
                <td>{subscription.endDate}</td>
                <td>{formatCurrency(subscription.amount, subscription.currency)}</td>
                <td>{subscription.paymentMethod}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditSubscription(subscription)}
                    >
                      Edit
                    </button>
                    {subscription.status === 'active' && (
                      <button 
                        className="btn-cancel"
                        onClick={() => handleCancelSubscription(subscription.id)}
                      >
                        Cancel
                      </button>
                    )}
                    {subscription.status === 'active' && (
                      <button 
                        className="btn-extend"
                        onClick={() => handleExtendSubscription(subscription.id)}
                      >
                        Extend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

