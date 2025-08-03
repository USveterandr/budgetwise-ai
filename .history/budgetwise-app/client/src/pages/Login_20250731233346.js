import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // We will create this file next

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Simulate API call for login
    // In a real application, you would fetch to your backend auth endpoint
    console.log('Logging in with:', { email, password });

    // Simulate successful login and token storage
    try {
      // Replace with actual API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   localStorage.setItem('userToken', data.token);
      //   navigate('/dashboard');
      // } else {
      //   setError(data.message || 'Login failed');
      // }

      // --- Simulation ---
      if (email === 'test@example.com' && password === 'password') {
        localStorage.setItem('userToken', 'fake-jwt-token');
        navigate('/dashboard');
      } else {
        setError('Invalid email or password.');
      }
      // --- End Simulation ---

    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2>Login to BudgetWise AI</h2>
        <p>Welcome back! Please enter your details to continue.</p>
        <form onSubmit={handleLogin} className="login-form">
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
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Sign In</button>
        </form>
        <div className="login-footer">
          <p>Don't have an account? <Link to="/onboarding">Sign up</Link></p>
          <p><Link to="/forgot-password">Forgot password?</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
