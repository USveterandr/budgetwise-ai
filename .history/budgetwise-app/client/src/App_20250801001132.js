import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Budget from './pages/Budget';
import Investments from './pages/Investments';
import Subscriptions from './pages/Subscriptions';
import Business from './pages/Business';
import Sidebar from './components/shared/Sidebar';
import LanguageSwitcher from './components/shared/LanguageSwitcher';
import English from './pages/English';
import Spanish from './pages/Spanish';
import French from './pages/French';
import German from './pages/German';
import './App.css'; // We will create this CSS file next

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsAuthenticated(!!token);
  }, [location.pathname]); // Re-check on path change (e.g., after login)

  const showSidebar = isAuthenticated && !['/', '/login', '/onboarding', '/subscription-selection'].includes(location.pathname);

  return (
    <Router>
      <div className="App">
        {showSidebar && <Sidebar />}
        <header className="App-header">
          <h1>BudgetWise AI</h1>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/onboarding">Onboarding</Link></li>
            </ul>
          </nav>
          <div className="language-switcher-container">
            <LanguageSwitcher />
          </div>
        </header>
        <main className={`main-content ${showSidebar ? 'with-sidebar' : ''}`}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/budget" element={isAuthenticated ? <Budget /> : <Landing />} />
            <Route path="/investments" element={isAuthenticated ? <Investments /> : <Landing />} />
            <Route path="/subscriptions" element={isAuthenticated ? <Subscriptions /> : <Landing />} />
            <Route path="/business" element={isAuthenticated ? <Business /> : <Landing />} />
            <Route path="/subscription-selection" element={<SubscriptionSelection />} /> {/* Placeholder for now */}
            <Route path="/en" element={<English />} />
            <Route path="/es" element={<Spanish />} />
            <Route path="/fr" element={<French />} />
            <Route path="/de" element={<German />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Placeholder component for subscription selection page
function SubscriptionSelection() {
  return (
    <div className="subscription-selection-container">
      <h1>Choose Your Plan</h1>
      <p>Subscription selection page coming soon!</p>
      <Link to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}

export default App;
