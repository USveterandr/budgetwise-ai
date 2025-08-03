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
          <h1 className="hypnotic-title">Unlock Financial Freedom with BudgetWise AI!</h1>
          <p className="clickbait-subtitle">
            Tired of overspending? Our AI-powered app is your secret weapon to save money, 
            track expenses effortlessly, and achieve your financial dreams FAST!
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
