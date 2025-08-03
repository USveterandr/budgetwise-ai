import React, { useState, useEffect } from 'react';
import './Subscriptions.css'; // We will create this CSS file next

function Subscriptions() {
  const [userName, setUserName] = useState('User');
  const [userTier, setUserTier] = useState('Free'); // Default to Free tier

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      console.log("No token found, redirect might be needed from App.js");
    } else {
      const firstName = localStorage.getItem('userFirstName') || 'User';
      const tier = localStorage.getItem('userTier') || 'Free';
      setUserName(firstName);
      setUserTier(tier);
    }
  }, []);

  // Mock data for subscriptions
  const subscriptions = [
    { id: 1, name: 'Netflix', category: 'Entertainment', price: 15.99, nextBillingDate: '2024-02-15', icon: '🎬', status: 'Active' },
    { id: 2, name: 'Spotify Premium', category: 'Music', price: 9.99, nextBillingDate: '2024-02-20', icon: '🎵', status: 'Active' },
    { id: 3, name: 'Adobe Creative Cloud', category: 'Software', price: 52.99, nextBillingDate: '2024-03-01', icon: '🎨', status: 'Active' },
    { id: 4, name: 'Amazon Prime', category: 'Shopping', price: 14.99, nextBillingDate: '2024-02-28', icon: '📦', status: 'Active' },
    { id: 5, name: 'Gym Membership (Planet Fitness)', category: 'Health & Fitness', price: 10.00, nextBillingDate: '2024-03-05', icon: '💪', status: 'Active' },
    { id: 6, name: 'Microsoft 365 Personal', category: 'Software', price: 6.99, nextBillingDate: '2024-04-10', icon: '💼', status: 'Cancelled' }, // Example of cancelled
    { id: 7, name: 'Disney+', category: 'Entertainment', price: 7.99, nextBillingDate: '2024-03-10', icon: '🏰', status: 'Active' },
    { id: 8, name: 'Duolingo Plus', category: 'Education', price: 6.99, nextBillingDate: '2024-02-25', icon: '🌍', status: 'Active' },
  ];

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active');
  const totalMonthlyCost = activeSubscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const yearlyProjection = totalMonthlyCost * 12;

  const categories = ['All', 'Entertainment', 'Music', 'Software', 'Shopping', 'Health & Fitness', 'Education'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredSubscriptions = selectedCategory === 'All' 
    ? subscriptions 
    : subscriptions.filter(sub => sub.category === selectedCategory);

  return (
    <div className="subscriptions-container">
      <div className="subscriptions-header">
        <h1>Subscription Manager</h1>
        <p>Welcome, {userName}! Keep track of your recurring expenses.</p>
        
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
