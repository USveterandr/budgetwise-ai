import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import './DashboardSettings.css';

const DashboardSettings = () => {
  const { userPrefs, updateUserPrefs } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('layout');

  const dashboardViews = [
    { id: 'cashflow', name: 'Cash Flow', description: 'Focus on budgeting and spending' },
    { id: 'networth', name: 'Net Worth', description: 'Track assets and liabilities' },
    { id: 'sankey', name: 'Sankey Diagram', description: 'Visual money flow between categories' },
    { id: 'hybrid', name: 'Hybrid View', description: 'Combination of key metrics' }
  ];

  const widgetOptions = [
    { id: 'spending', name: 'Spending Breakdown', default: true },
    { id: 'bills', name: 'Upcoming Bills', default: true },
    { id: 'goals', name: 'Goals Progress', default: true },
    { id: 'investments', name: 'Investments', default: false },
    { id: 'subscriptions', name: 'Subscriptions', default: false },
    { id: 'alerts', name: 'Financial Alerts', default: true }
  ];

  const handleViewChange = (viewId) => {
    updateUserPrefs({ dashboardView: viewId });
  };

  const toggleWidget = (widgetId) => {
    const currentWidgets = userPrefs.dashboardWidgets || [];
    const newWidgets = currentWidgets.includes(widgetId)
      ? currentWidgets.filter(id => id !== widgetId)
      : [...currentWidgets, widgetId];
    updateUserPrefs({ dashboardWidgets: newWidgets });
  };

  return (
    <div className="dashboard-settings">
      <div className="settings-tabs">
        <button 
          className={activeTab === 'layout' ? 'active' : ''}
          onClick={() => setActiveTab('layout')}
        >
          Layout
        </button>
        <button 
          className={activeTab === 'widgets' ? 'active' : ''}
          onClick={() => setActiveTab('widgets')}
        >
          Widgets
        </button>
      </div>

      {activeTab === 'layout' && (
        <div className="view-options">
          <h3>Default Dashboard View</h3>
          <p>Choose how your dashboard looks when you first open the app</p>
          <div className="view-grid">
            {dashboardViews.map(view => (
              <div 
                key={view.id}
                className={`view-card ${userPrefs.dashboardView === view.id ? 'selected' : ''}`}
                onClick={() => handleViewChange(view.id)}
              >
                <h4>{view.name}</h4>
                <p>{view.description}</p>
                <div className="view-preview">
                  <div className={`preview-${view.id}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'widgets' && (
        <div className="widget-options">
          <h3>Dashboard Widgets</h3>
          <p>Select which widgets to display on your dashboard</p>
          <div className="widget-list">
            {widgetOptions.map(widget => {
              const isActive = (userPrefs.dashboardWidgets || []).includes(widget.id) || widget.default;
              return (
                <div key={widget.id} className="widget-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleWidget(widget.id)}
                      disabled={widget.default}
                    />
                    <span>{widget.name}</span>
                    {widget.default && <span className="default-tag">Default</span>}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSettings;
