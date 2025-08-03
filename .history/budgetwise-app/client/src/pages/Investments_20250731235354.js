import React, { useState, useEffect } from 'react';
import './Investments.css'; // We will create this CSS file next

function Investments() {
  const [userName, setUserName] = useState('User');
  const [userTier, setUserTier] = useState('Free'); // Default to Free tier

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      console.log("No token found, redirect might be needed from App.js");
    } else {
      const firstName = localStorage.getItem('userFirstName') || 'User';
      const tier = localStorage.getItem('userTier') || 'Free';
      setUserName(firstName);
      setUserTier(tier);
    }
  }, []);

  // Mock data for investments
  const portfolioSummary = {
    totalValue: 25000.75,
    totalGainLoss: 3250.50,
    totalGainLossPercentage: 14.9,
  };

  const investmentHoldings = [
    { name: 'Apple Inc. (AAPL)', shares: 10, avgCost: 150.00, currentPrice: 175.25, value: 1752.50, gainLoss: 252.50, gainLossPercentage: 16.67, type: 'Stock', icon: '🍎' },
    { name: 'Microsoft Corp. (MSFT)', shares: 5, avgCost: 250.00, currentPrice: 310.75, value: 1553.75, gainLoss: 303.75, gainLossPercentage: 24.30, type: 'Stock', icon: '💻' },
    { name: 'Vanguard S&P 500 ETF (VOO)', shares: 20, avgCost: 350.00, currentPrice: 410.50, value: 8210.00, gainLoss: 1210.00, gainLossPercentage: 17.29, type: 'ETF', icon: '📈' },
    { name: 'US Treasury Bond 10Y', shares: 1, avgCost: 10000.00, currentPrice: 10250.00, value: 10250.00, gainLoss: 250.00, gainLossPercentage: 2.50, type: 'Bond', icon: '🏛️' },
    { name: 'Bitcoin (BTC)', shares: 0.5, avgCost: 30000.00, currentPrice: 42000.00, value: 21000.00, gainLoss: 6000.00, gainLossPercentage: 40.00, type: 'Crypto', icon: '₿' },
    { name: 'Ethereum (ETH)', shares: 5, avgCost: 1800.00, currentPrice: 2200.00, value: 11000.00, gainLoss: 2000.00, gainLossPercentage: 22.22, type: 'Crypto', icon: 'Ξ' },
  ];

  const totalInvested = investmentHoldings.reduce((sum, inv) => sum + (inv.shares * inv.avgCost), 0);
  const currentValue = investmentHoldings.reduce((sum, inv) => sum + inv.value, 0);
  const totalGainLossAmount = currentValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLossAmount / totalInvested) * 100 : 0;

  return (
    <div className="investments-container">
      <div className="investments-header">
        <h1>Investment Portfolio</h1>
        <p>Welcome, {userName}! Track your investment performance here.</p>
        
        <div className="portfolio-summary-card">
          <div className="summary-item">
            <h3>Total Invested</h3>
            <p className="amount">${totalInvested.toFixed(2)}</p>
          </div>
          <div className="summary-item">
            <h3>Current Value</h3>
            <p className={`amount ${totalGainLossAmount >= 0 ? 'positive' : 'negative'}`}>
              ${currentValue.toFixed(2)}
            </p>
          </div>
          <div className="summary-item">
            <h3>Total Gain/Loss</h3>
            <p className={`amount ${totalGainLossAmount >= 0 ? 'positive' : 'negative'}`}>
              {totalGainLossAmount >= 0 ? '+' : ''}{totalGainLossAmount.toFixed(2)} ({totalGainLossPercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      <div className="holdings-section">
        <h2>Your Holdings</h2>
        <div className="holdings-table-container">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Shares</th>
                <th>Avg. Cost</th>
                <th>Current Price</th>
                <th>Value</th>
                <th>Gain/Loss</th>
                <th>% Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {investmentHoldings.map((holding, index) => {
                const gainLossAmount = holding.value - (holding.shares * holding.avgCost);
                const gainLossPercent = ((holding.currentPrice - holding.avgCost) / holding.avgCost) * 100;
                return (
                  <tr key={index} className="holding-row">
                    <td className="asset-info">
                      <span className="asset-icon">{holding.icon}</span>
                      <span className="asset-name">{holding.name}</span>
                    </td>
                    <td className="asset-type">{holding.type}</td>
                    <td>{holding.shares}</td>
                    <td>${holding.avgCost.toFixed(2)}</td>
                    <td>${holding.currentPrice.toFixed(2)}</td>
                    <td className="value">${holding.value.toFixed(2)}</td>
                    <td className={`gain-loss ${gainLossAmount >= 0 ? 'positive' : 'negative'}`}>
                      {gainLossAmount >= 0 ? '+' : ''}{gainLossAmount.toFixed(2)}
                    </td>
                    <td className={`gain-loss ${gainLossPercent >= 0 ? 'positive' : 'negative'}`}>
                      {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {userTier === 'Pro' && (
        <div className="pro-features-investments">
          <h2>Pro Investment Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <h3>Portfolio Diversification</h3>
              <p>Your portfolio is 60% stocks, 20% crypto, 15% ETFs, and 5% bonds. Consider rebalancing.</p>
            </div>
            <div className="insight-card">
              <h3>Market Analysis</h3>
              <p>S&P 500 is showing strong momentum. Tech stocks are leading gains.</p>
            </div>
            <div className="insight-card">
              <h3>Risk Assessment</h3>
              <p>Your portfolio risk level is 'Moderate-High'. Consider adding more bonds for stability.</p>
            </div>
            <div className="insight-card">
              <h3>AI Trading Suggestions</h3>
              <p>Opportunity to buy into renewable energy ETFs based on trend analysis.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Investments;
