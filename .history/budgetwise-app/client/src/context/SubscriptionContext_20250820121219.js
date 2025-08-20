import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SubscriptionContext = createContext();

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from your API
      // const response = await api.get('/subscriptions');
      // For now, we'll use mock data
      const mockSubscriptions = [
        { id: 1, name: 'Netflix', category: 'Entertainment', price: 15.99, nextBillingDate: '2024-02-15', icon: '🎬', status: 'Active' },
        { id: 2, name: 'Spotify Premium', category: 'Music', price: 9.99, nextBillingDate: '2024-02-20', icon: '🎵', status: 'Active' },
        { id: 3, name: 'Adobe Creative Cloud', category: 'Software', price: 52.99, nextBillingDate: '2024-03-01', icon: '🎨', status: 'Active' },
        { id: 4, name: 'Amazon Prime', category: 'Shopping', price: 14.99, nextBillingDate: '2024-02-28', icon: '📦', status: 'Active' },
        { id: 5, name: 'Gym Membership (Planet Fitness)', category: 'Health & Fitness', price: 10.00, nextBillingDate: '2024-03-05', icon: '💪', status: 'Active' },
        { id: 6, name: 'Microsoft 365 Personal', category: 'Software', price: 6.99, nextBillingDate: '2024-04-10', icon: '💼', status: 'Cancelled' }
      ];
      setSubscriptions(mockSubscriptions);
    } catch (err) {
      setError('Failed to fetch subscriptions');
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSubscription = async (subscriptionData) => {
    try {
      // In a real app, this would POST to your API
      // const response = await api.post('/subscriptions', subscriptionData);
      // For now, we'll simulate adding to the list
      const newSubscription = {
        id: subscriptions.length + 1,
        ...subscriptionData
      };
      setSubscriptions(prev => [...prev, newSubscription]);
      return newSubscription;
    } catch (err) {
      setError('Failed to add subscription');
      console.error('Error adding subscription:', err);
      throw err;
    }
  };

  const updateSubscription = async (subscriptionId, updateData) => {
    try {
      // In a real app, this would PUT to your API
      // const response = await api.put(`/subscriptions/${subscriptionId}`, updateData);
      // For now, we'll simulate updating in the list
      setSubscriptions(prev => 
        prev.map(s => s.id === subscriptionId ? { ...s, ...updateData } : s)
      );
    } catch (err) {
      setError('Failed to update subscription');
      console.error('Error updating subscription:', err);
      throw err;
    }
  };

  const deleteSubscription = async (subscriptionId) => {
    try {
      // In a real app, this would DELETE from your API
      // await api.delete(`/subscriptions/${subscriptionId}`);
      // For now, we'll simulate deleting from the list
      setSubscriptions(prev => prev.filter(s => s.id !== subscriptionId));
    } catch (err) {
      setError('Failed to delete subscription');
