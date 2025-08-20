import React, { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import SubscriptionManager from './SubscriptionManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch the current admin user data
    const userData = JSON.parse(localStorage.getItem('userData')) || {
      id: 'admin_1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: 'admin'
    };
    setUser(userData);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'subscriptions':
        return <SubscriptionManager />;
      default:
        return <UserManagement />;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>
        <p>You do not have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-user-info">
          <span>Welcome, {user.firstName} {user.lastName}</span>
        </div>
      </header>

      <div className="admin-content">
        <nav className="admin-sidebar">
          <ul>
            <li className={activeTab === 'users' ? 'active' : ''}>
              <button onClick={() => setActiveTab('users')}>
                User Management
              </button>
            </li>
            <li className={activeTab === 'subscriptions' ? 'active' : ''}>
              <button onClick={() => setActiveTab('subscriptions')}>
                Subscription Management
              </button>
            </li>
            <li>
              <button>System Settings</button>
            </li>
            <li>
              <button>Reports & Analytics</button>
            </li>
          </ul>
        </nav>

        <main className="admin-main">
          {renderTabContent()}
        </main>
