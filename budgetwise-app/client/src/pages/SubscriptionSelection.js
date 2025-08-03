import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaCheck, 
  FaCrown, 
  FaRocket, 
  FaBuilding, 
  FaChartLine,
  FaUsers,
  FaReceipt,
  FaCalculator,
  FaPiggyBank,
  FaShieldAlt,
  FaStar
} from 'react-icons/fa';
import './SubscriptionSelection.css';

const SubscriptionSelection = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('personal_plus');
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);

  const subscriptionTiers = {
    free: {
      name: 'Free',
      price: 0,
      annualPrice: 0,
      icon: <FaPiggyBank />,
      color: '#6B7280',
      popular: false,
      description: 'Perfect for getting started with budgeting',
      features: [
        'Basic budgeting tools',
        'Cash flow tracking',
        'Subscription management',
        'Mobile & web access',
        'Basic expense categorization',
        'Monthly spending reports'
      ],
      limitations: [
        'Limited to 3 budget categories',
        'Basic reporting only',
        'No investment tracking'
      ]
    },
    personal_plus: {
      name: 'Personal Plus',
      price: 6.97,
      annualPrice: 69.70, // ~2 months free
      icon: <FaChartLine />,
      color: '#3B82F6',
      popular: true,
      description: 'Comprehensive personal finance management',
      features: [
        'Everything in Free',
        'Net worth tracking',
        'Investment portfolio syncing',
        'Sankey flow diagrams',
        'Advanced budgeting categories',
        'Goal tracking & progress',
        'Bill reminders',
        'Export to CSV/PDF',
        'Priority email support'
      ],
      newFeatures: [
        'Smart spending insights',
        'Automated savings recommendations'
      ]
    },
    investor: {
      name: 'Investor',
      price: 15.97,
      annualPrice: 159.70, // ~2 months free
      icon: <FaRocket />,
      color: '#10B981',
      popular: false,
      description: 'Advanced tools for serious investors',
      features: [
        'Everything in Personal Plus',
        'Monte Carlo retirement simulator',
        'Stock option modeling',
        'Tax planning tools',
        'Portfolio rebalancing alerts',
        'Risk analysis dashboard',
        'Investment performance tracking',
        'Tax loss harvesting suggestions',
        'Advanced market insights'
      ],
      newFeatures: [
        'AI-powered investment recommendations',
        'Real-time market alerts'
      ]
    },
    business_pro_elite: {
      name: 'Business Pro Elite',
      price: 29.97,
      annualPrice: 299.70, // ~2 months free
      icon: <FaBuilding />,
      color: '#8B5CF6',
      popular: false,
      description: 'Complete financial solution for teams',
      features: [
        'Everything in Investor',
        'Team financial GPS (5 users)',
        'Magic Receipt AI',
        'Profit forecasting',
        'Employee spending controls',
        'Multi-entity management',
        'Advanced team permissions',
        'Expense approval workflows',
        'Custom reporting dashboard',
        'Priority phone support'
      ],
      newFeatures: [
        'AI-powered expense categorization',
        'Automated invoice processing'
      ]
    }
  };

  const handlePlanSelect = async (planKey) => {
    if (planKey === 'free') {
      // Handle free plan selection
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          planKey,
          isAnnual,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/subscription-selection?cancelled=true`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start subscription process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PricingCard = ({ planKey, plan }) => {
    const isSelected = selectedPlan === planKey;
    const currentPrice = isAnnual ? plan.annualPrice : plan.price;
    const monthlyPrice = isAnnual ? (plan.annualPrice / 12) : plan.price;
    const savings = isAnnual && plan.price > 0 ? ((plan.price * 12 - plan.annualPrice) / (plan.price * 12) * 100).toFixed(0) : 0;

    return (
      <motion.div
        className={`pricing-card ${isSelected ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
        style={{ borderColor: plan.color }}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedPlan(planKey)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {plan.popular && (
          <div className="popular-badge" style={{ backgroundColor: plan.color }}>
            <FaStar /> Most Popular
          </div>
        )}
        
        <div className="card-header">
          <div className="plan-icon" style={{ color: plan.color }}>
            {plan.icon}
          </div>
          <h3 className="plan-name">{plan.name}</h3>
          <p className="plan-description">{plan.description}</p>
        </div>

        <div className="pricing-section">
          {plan.price === 0 ? (
            <div className="price-display">
              <span className="price">Free</span>
            </div>
          ) : (
            <div className="price-display">
              <span className="price">
                ${monthlyPrice.toFixed(2)}
                <span className="period">/month</span>
              </span>
              {isAnnual && savings > 0 && (
                <div className="savings-badge">
                  Save {savings}%
                </div>
              )}
              {isAnnual && (
                <div className="annual-note">
                  Billed annually (${currentPrice.toFixed(2)})
                </div>
              )}
            </div>
          )}
        </div>

        <div className="features-section">
          <ul className="features-list">
            {plan.features.map((feature, index) => (
              <li key={index} className="feature-item">
                <FaCheck className="check-icon" style={{ color: plan.color }} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {plan.newFeatures && plan.newFeatures.length > 0 && (
            <div className="new-features">
              <h4>🆕 New Features</h4>
              <ul>
                {plan.newFeatures.map((feature, index) => (
                  <li key={index} className="new-feature-item">
                    <FaStar className="star-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plan.limitations && (
            <div className="limitations">
              <h4>Limitations</h4>
              <ul>
                {plan.limitations.map((limitation, index) => (
                  <li key={index} className="limitation-item">
                    {limitation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          className={`select-plan-btn ${isSelected ? 'selected' : ''}`}
          style={{ 
            backgroundColor: isSelected ? plan.color : 'transparent',
            borderColor: plan.color,
            color: isSelected ? 'white' : plan.color
          }}
          onClick={(e) => {
            e.stopPropagation();
            handlePlanSelect(planKey);
          }}
          disabled={loading}
        >
          {loading && selectedPlan === planKey ? (
            'Processing...'
          ) : planKey === 'free' ? (
            'Get Started Free'
          ) : (
            `Start ${isAnnual ? '14-Day' : '14-Day'} Free Trial`
          )}
        </button>
      </motion.div>
    );
  };

  return (
    <div className="subscription-selection">
      <div className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>
            <FaCrown className="crown-icon" />
            Choose Your Financial Journey
          </h1>
          <p className="hero-subtitle">
            The most comprehensive personal finance app available. 
            Start with our free tier or unlock advanced features with premium plans.
          </p>
          
          <div className="value-props">
            <div className="value-prop">
              <FaShieldAlt />
              <span>All-in-one finance hub</span>
            </div>
            <div className="value-prop">
              <FaReceipt />
              <span>No wallet access needed</span>
            </div>
            <div className="value-prop">
              <FaCalculator />
              <span>Proactive AI guidance</span>
            </div>
            <div className="value-prop">
              <FaUsers />
              <span>Built for couples & businesses</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pricing-toggle">
        <div className="toggle-container">
          <span className={!isAnnual ? 'active' : ''}>Monthly</span>
          <button
            className={`toggle-switch ${isAnnual ? 'annual' : 'monthly'}`}
            onClick={() => setIsAnnual(!isAnnual)}
          >
            <div className="toggle-slider"></div>
          </button>
          <span className={isAnnual ? 'active' : ''}>
            Annual
            <span className="save-badge">Save up to 17%</span>
          </span>
        </div>
      </div>

      <div className="pricing-grid">
        {Object.entries(subscriptionTiers).map(([planKey, plan]) => (
          <PricingCard key={planKey} planKey={planKey} plan={plan} />
        ))}
      </div>

      <div className="features-comparison">
        <motion.div 
          className="comparison-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Platform Features</h2>
          <p>Available on iOS, Android, Web (MacOS/PC)</p>
        </motion.div>

        <div className="platform-features">
          <div className="feature-category">
            <h3>🎯 Core Features</h3>
            <ul>
              <li>Cross-platform synchronization</li>
              <li>Bank-level security encryption</li>
              <li>Real-time data updates</li>
              <li>Offline mode support</li>
              <li>Multi-currency support</li>
            </ul>
          </div>

          <div className="feature-category">
            <h3>🤖 AI-Powered Insights</h3>
            <ul>
              <li>Smart spending pattern recognition</li>
              <li>Personalized saving recommendations</li>
              <li>Automated expense categorization</li>
              <li>Predictive budget alerts</li>
              <li>Investment opportunity detection</li>
            </ul>
          </div>

          <div className="feature-category">
            <h3>🔒 Security & Privacy</h3>
            <ul>
              <li>256-bit SSL encryption</li>
              <li>Two-factor authentication</li>
              <li>Read-only bank connections</li>
              <li>GDPR compliant</li>
              <li>No data selling policy</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I change plans anytime?</h4>
            <p>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.</p>
          </div>
          <div className="faq-item">
            <h4>Is my financial data secure?</h4>
            <p>Absolutely. We use bank-level 256-bit SSL encryption and never store your banking credentials. We're read-only and GDPR compliant.</p>
          </div>
          <div className="faq-item">
            <h4>What's included in the free trial?</h4>
            <p>All premium features are available during your 14-day free trial. No credit card required for the Free tier.</p>
          </div>
          <div className="faq-item">
            <h4>Do you offer refunds?</h4>
            <p>Yes, we offer a 30-day money-back guarantee for all paid plans. Cancel anytime during your first month for a full refund.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2>Ready to Transform Your Finances?</h2>
          <p>Join thousands of users who have taken control of their financial future with BudgetWise.</p>
          <button 
            className="cta-button"
            onClick={() => handlePlanSelect('personal_plus')}
            disabled={loading}
          >
            Start Your Free Trial Today
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionSelection;