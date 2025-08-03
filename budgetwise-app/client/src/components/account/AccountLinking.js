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
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      if (success) {
        onLinkComplete(providerId);
      } else {
        setError(`Failed to link ${providerId} account. Please try again.`);
      }
    } catch (err) {
      setError('An error occurred during account linking.');
      console.error(err);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="account-linking-container">
      <h2>Link Your Financial Accounts</h2>
      <p className="subtitle">Connect your accounts to get a complete financial picture</p>
      
      {error && <div className="error-message">{error}</div>}

      <div className="providers-grid">
        {providers.map(provider => (
          <div 
            key={provider.id}
            className={`provider-card ${selectedProvider === provider.id ? 'selected' : ''}`}
            onClick={() => setSelectedProvider(provider.id)}
          >
            <div className="provider-icon">{provider.icon}</div>
            <h3>{provider.name}</h3>
            <p>{provider.description}</p>
            <button 
              className="link-button"
              onClick={(e) => {
                e.stopPropagation();
                handleLinkAccount(provider.id);
              }}
              disabled={isLinking}
            >
              {isLinking && selectedProvider === provider.id ? 'Linking...' : 'Link Account'}
            </button>
          </div>
        ))}
      </div>

      <div className="security-note">
        <p>🔒 Your data is encrypted and secure. We use read-only access and never store your banking credentials.</p>
      </div>
    </div>
  );
};

export default AccountLinking;
