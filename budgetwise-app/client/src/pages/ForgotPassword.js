import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Password reset link sent to your email!');
  };

  return (
    <div className="landing-container fade-in-up" style={{minHeight: '100vh', padding: '4rem 2rem'}}>
      <div className="text-center p-4">
        <h1>Reset Password</h1>
        <p className="mb-4">Enter your email to receive a reset link</p>
        <form onSubmit={handleSubmit} className="card" style={{maxWidth: '400px', margin: '0 auto'}}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button type="submit" className="btn-primary mt-4">
            Send Reset Link
          </button>
          {message && <p className="mt-4">{message}</p>}
        </form>
        <Link to="/login" className="btn-secondary mt-4">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;