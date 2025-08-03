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

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Simulate API call for signup
    // In a real application, you would fetch to your backend auth endpoint
    console.log('Signing up with:', { firstName, lastName, email, password });

    // Simulate successful signup and token storage
    try {
      // Replace with actual API call
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ firstName, lastName, email, password }),
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   localStorage.setItem('userToken', data.token);
      //   navigate('/dashboard'); // Or to a verification page
      // } else {
      //   setError(data.message || 'Signup failed');
      // }

      // --- Simulation ---
      // Simulate a successful signup for any non-empty, matching credentials
      localStorage.setItem('userToken', 'fake-jwt-token-new-user');
      console.log('Signup successful, redirecting to dashboard.');
      navigate('/dashboard');
      // --- End Simulation ---

    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
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
