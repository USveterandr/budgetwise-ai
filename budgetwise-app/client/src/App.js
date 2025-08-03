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
import SubscriptionSelection from './pages/SubscriptionSelection';
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
    <div className="App">
      {showSidebar && <Sidebar />}
      <header className="nav">
        <div className="container">
          <h1>BudgetWise</h1>
          <nav>
            <ul>
              <li><Link to="/" className="nav-link">Home</Link></li>
              <li><Link to="/login" className="nav-link">Login</Link></li>
              <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
              <li><Link to="/onboarding" className="nav-link">Onboarding</Link></li>
              <li><Link to="/budget" className="nav-link">Budget</Link></li>
              <li><Link to="/investments" className="nav-link">Investments</Link></li>
              <li><Link to="/subscriptions" className="nav-link">Subscriptions</Link></li>
              <li><Link to="/business" className="nav-link">Business</Link></li>
            </ul>
          </nav>
        </div>
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
          <Route path="/subscription-selection" element={<SubscriptionSelection />} />
          <Route path="/en" element={<English />} />
          <Route path="/es" element={<Spanish />} />
          <Route path="/fr" element={<French />} />
          <Route path="/de" element={<German />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
