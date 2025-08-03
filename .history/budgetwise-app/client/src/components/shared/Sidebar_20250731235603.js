import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css'; // We will create this CSS file next

function Sidebar() {
  const [userName, setUserName] = useState('User');
  const [userTier, setUserTier] = useState('Free'); // Default to Free tier
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      const firstName = localStorage.getItem('userFirstName') || 'User';
      const tier = localStorage.getItem('userTier') || 'Free';
      setUserName(firstName);
      setUserTier(tier);
    }
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Budget', icon: '📝', path: '/budget' },
    { name: 'Investments', icon: '📈', path: '/investments' },
    { name: 'Subscriptions', icon: '🔄', path: '/subscriptions' },
    { name: 'Business', icon: '💼', path: '/business', proOnly: true }, // Pro tier only
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          {!isCollapsed && <span className="app-logo">💰</span>}
          {!isCollapsed && <span className="app-name">BudgetWise AI</span>}
        </div>
        <button 
          className="collapse-toggle" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? '>' : '<'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => {
            if (item.proOnly && userTier !== 'Pro') {
              return null; // Don't render Pro items for Free tier users
            }
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => isCollapsed && setIsCollapsed(false)} // Expand on mobile click
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && <span className="nav-text">{item.name}</span>}
                  {item.proOnly && !isCollapsed && (
                    <span className="pro-badge">Pro</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <p className="user-name">{userName}</p>
              <p className={`user-tier ${userTier.toLowerCase()}`}>
                {userTier} Tier
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="upgrade-cta">
            {userTier === 'Free' && (
              <Link to="/subscription-selection" className="upgrade-button">
                Upgrade to Pro
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
