import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const [isNewUser, setIsNewUser] = useState(true); // Default to new user

  useEffect(() => {
    // Simulate checking if a user is registered.
    // In a real app, this would involve checking for a token in localStorage
    // or making an API call to a backend endpoint.
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      setIsNewUser(false);
    } else {
      setIsNewUser(true);
    }
  }, []);

  return (
    <div className="landing-container">
      {isNewUser ? (
        <div className="new-user-landing">
          <h1 className="hypnotic-title">BudgetWise: The Ultimate All-in-One Financial App</h1>
          <p className="clickbait-subtitle">
            The most comprehensive personal finance app available. Manage your budget, 
            investments, subscriptions, and business finances all in one place, 
            with proactive AI guidance and no wallet access needed for crypto.
          </p>
          <div className="app-showcase">
            {/* Placeholder for an image or video of the app */}
            <img src={`${process.env.PUBLIC_URL}/assets/budgetwiseai-logo.png`} alt="BudgetWise AI App Preview" className="app-preview-image" />
          </div>
          <div className="cta-buttons">
            <a href="https://apple.com" target="_blank" rel="noopener noreferrer" className="cta-button download-button">
              Download for iOS
            </a>
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="cta-button download-button">
              Get it on Android
            </a>
            <button className="cta-button buy-button">
              Buy Premium Now - Unlock All Features!
            </button>
          </div>
          <p className="testimonial">
            "BudgetWise AI changed my life! I saved $5,000 in 3 months!" - Alex R.
          </p>
          <div className="subscription-tiers">
            <h2>Choose Your Plan</h2>
            <div className="tier-cards">
              <div className="tier-card free-tier">
                <h3>Free Tier</h3>
                <p className="price">$0</p>
                <ul>
                  <li>Basic budgeting</li>
                  <li>Cash flow tracking</li>
                  <li>Subscription management</li>
                </ul>
                <button className="tier-button">Get Started</button>
              </div>
              <div className="tier-card personal-plus">
                <h3>Personal Plus</h3>
                <p className="price">$6.97/month</p>
                <ul>
                  <li>Everything in Free</li>
                  <li>Net worth tracking</li>
                  <li>Investment portfolio syncing</li>
                  <li>Sankey diagrams</li>
                </ul>
                <button className="tier-button">Upgrade</button>
              </div>
              <div className="tier-card investor">
                <h3>Investor</h3>
                <p className="price">$15.97/month</p>
                <ul>
                  <li>Everything in Personal Plus</li>
                  <li>Monte Carlo retirement simulator</li>
                  <li>Stock option modeling</li>
                  <li>Tax planning</li>
                </ul>
                <button className="tier-button">Upgrade</button>
              </div>
              <div className="tier-card business-pro-elite">
                <h3>Business Pro Elite</h3>
                <p className="price">$29.97/month</p>
                <ul>
                  <li>Everything in Investor</li>
                  <li>Team financial GPS (5 users)</li>
                  <li>Magic Receipt AI</li>
                  <li>Profit forecasting</li>
                  <li>Employee spending controls</li>
                </ul>
                <button className="tier-button">Upgrade</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="returning-user-landing">
          <h1 className="welcome-title">Welcome Back to BudgetWise AI!</h1>
          <p className="welcome-subtitle">
            Ready to take control of your finances today?
          </p>
          <div className="auth-options">
            <Link to="/dashboard" className="auth-button dashboard-button">
              Go to Dashboard
            </Link>
            <Link to="/login" className="auth-button login-button">
              Login to Another Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
