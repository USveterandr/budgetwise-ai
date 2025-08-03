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
