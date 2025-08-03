import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  const [isNewUser, setIsNewUser] = useState(true);

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      setIsNewUser(false);
    } else {
      setIsNewUser(true);
    }
  }, []);

  return (
    <div className="landing-container fade-in-up" style={{minHeight: '100vh', padding: '4rem 2rem'}}>
      {isNewUser ? (
        <div className="new-user-landing text-center p-4">
          <h1>BudgetWise AI</h1>
          <p className="mb-4">Your AI-powered financial companion</p>
          <div className="cta-buttons mb-4">
            <a href="https://apps.apple.com/app/budgetwise-ai/id123456789" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Download for iOS
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.budgetwise.ai" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Get it on Android
            </a>
          </div>
          <button className="btn-secondary" onClick={() => setIsNewUser(false)}>
            Register Now
          </button>
        </div>
      ) : (
        <div className="returning-user-landing text-center p-4">
          <h1>Welcome Back!</h1>
          <p className="mb-4">Sign in to continue</p>
          <div className="auth-options">
            <button className="btn-primary mb-4">Continue with Google</button>
            <button className="btn-primary mb-4">Continue with Facebook</button>
            <button className="btn-primary mb-4">Continue with Apple</button>
            <Link to="/login" className="btn-secondary">
              Sign in with Email
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;