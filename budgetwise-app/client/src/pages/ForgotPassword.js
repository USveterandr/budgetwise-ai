import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    // Simulate API call to send password reset link
    console.log('Sending password reset link to:', email);
    setMessage(`If an account with the email ${email} exists, a password reset link has been sent.`);
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2>Forgot Password</h2>
        <p>Enter your email address below and we'll send you a link to reset your password.</p>
        <form onSubmit={handleSubmit} className="login-form">
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
          {message && <p className="message">{message}</p>}
          <button type="submit" className="login-button">Send Reset Link</button>
        </form>
        <div className="login-footer">
          <p>Remember your password? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
