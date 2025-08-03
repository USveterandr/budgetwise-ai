import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './Onboarding.css';
import onboardingSteps from '../utils/onboardingSteps';

function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    financialGoals: {
      emergencyFund: false,
      monthlyBudgetStyle: '',
      investmentPriority: ''
    },
    linkedAccounts: []
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateCurrentStep = () => {
    setError('');
    switch(currentStep) {
      case 0: // Account creation
        if (!formData.firstName || !formData.lastName || !formData.email || 
            !formData.password || !formData.confirmPassword) {
          setError('Please fill in all fields.');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long.');
          return false;
        }
        return true;
      case 1: // Account linking
        if (formData.linkedAccounts.length === 0) {
          setError('Please link at least one account.');
          return false;
        }
        return true;
      case 2: // Goal setup
        if (!formData.financialGoals.monthlyBudgetStyle) {
          setError('Please select a budgeting style.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      try {
        localStorage.setItem('userToken', 'fake-jwt-token-new-user');
        localStorage.setItem('userData', JSON.stringify(formData));
        navigate('/dashboard');
      } catch (err) {
        setError('An error occurred. Please try again.');
        console.error(err);
      }
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log(credentialResponse);
    // In a real app, you would verify the credential with your backend
    localStorage.setItem('userToken', 'google-auth-token');
    navigate('/account-linking');
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleAccountLink = (accountType) => {
    setFormData(prev => ({
      ...prev,
      linkedAccounts: [...prev.linkedAccounts, accountType]
    }));
  };

  const renderStep = () => {
    switch(currentStep) {
      case 0: // Account creation
        return (
          <>
            <h2>Create Your Account</h2>
            <p>Join us today and take the first step towards financial freedom!</p>
            <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="onboarding-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Create a password"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="auth-options">
                <button type="submit" className="signup-button">Continue</button>
                <div className="divider">or</div>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                />
              </div>
            </form>
          </>
        );
      case 1: // Account linking
        return (
          <>
            <h2>Link Your Accounts</h2>
            <p>Connect your financial accounts to get started</p>
            <div className="account-linking-options">
              <button onClick={() => handleAccountLink('bank')} className="account-button">
                Bank Account
              </button>
              <button onClick={() => handleAccountLink('credit')} className="account-button">
                Credit Card
              </button>
              <button onClick={() => handleAccountLink('investment')} className="account-button">
                Investment Account
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="step-buttons">
              <button onClick={handlePrevStep} className="back-button">Back</button>
              <button onClick={handleNextStep} className="next-button">Continue</button>
            </div>
          </>
        );
      case 2: // Goal setup
        return (
          <>
            <h2>Set Your Financial Goals</h2>
            <p>Help us personalize your experience</p>
            <div className="goal-options">
              <label>
                <input
                  type="checkbox"
                  checked={formData.financialGoals.emergencyFund}
                  onChange={(e) => setFormData({
                    ...formData,
                    financialGoals: {
                      ...formData.financialGoals,
                      emergencyFund: e.target.checked
                    }
                  })}
                />
                Build an emergency fund
              </label>
              <div className="budget-style">
                <h4>Budgeting Style:</h4>
                <select
                  value={formData.financialGoals.monthlyBudgetStyle}
                  onChange={(e) => setFormData({
                    ...formData,
                    financialGoals: {
                      ...formData.financialGoals,
                      monthlyBudgetStyle: e.target.value
                    }
                  })}
                >
                  <option value="">Select a style</option>
                  <option value="50/30/20">50/30/20 Budget</option>
                  <option value="zero-based">Zero-Based Budget</option>
                  <option value="envelope">Envelope System</option>
                </select>
              </div>
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="step-buttons">
              <button onClick={handlePrevStep} className="back-button">Back</button>
              <button onClick={handleSubmit} className="submit-button">Complete Setup</button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-form-wrapper">
        <div className="progress-bar">
