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
