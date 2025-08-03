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

  return (
    <div className="onboarding-container">
      <div className="onboarding-form-wrapper">
        <h2>Sign Up for BudgetWise AI</h2>
        <p>Join us today and take the first step towards financial freedom!</p>
        <form onSubmit={handleSignup} className="onboarding-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="signup-button">Create Account</button>
        </form>
        <div className="onboarding-footer">
          <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
