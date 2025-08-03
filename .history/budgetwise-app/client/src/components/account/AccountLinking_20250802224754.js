import React, { useState } from 'react';
import './AccountLinking.css';

const AccountLinking = ({ onLinkComplete }) => {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState('');

  const providers = [
    {
      id: 'bank',
      name: 'Bank Account',
      description: 'Connect your checking/savings accounts',
      icon: '🏦'
    },
    {
      id: 'credit',
      name: 'Credit Card',
      description: 'Link your credit cards',
      icon: '💳'
    },
    {
      id: 'investment',
      name: 'Investment Account',
      description: 'Connect brokerage/retirement accounts',
      icon: '📈'
    },
    {
      id: 'crypto',
      name: 'Crypto Wallet',
      description: 'Link your cryptocurrency wallets',
      icon: '₿'
    }
  ];

  const handleLinkAccount = async (providerId) => {
    setIsLinking(true);
    setError('');
    
    try {
      // Simulate API call to link account
      console.log(`Linking ${providerId} account...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would be the response from your backend
