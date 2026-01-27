import { SubscriptionPlan, SubscriptionTier } from '../types';

// Comprehensive 4-tier subscription plans with 7-day trial for all plans
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  individual: {
    id: 'individual',
    name: 'Basic',
    price: {
      monthly: 4.97,
      yearly: 3.97 // $47.64 annually (20% savings)
    },
    period: 'month',
    popular: true,
    features: [
      '7-day free trial on all plans',
      'Basic budgeting tools',
      'Track up to 10 accounts',
      'Manual transaction entry',
      'Basic spending insights',
      'Email support',
      'Export data to CSV'
    ],
    limits: {
      accounts: 10,
      receiptsPerMonth: 25,
      investments: 5,
      aiInsights: false,
      prioritySupport: false,
      familySharing: false,
      maxDevices: 2
    }
  },
  
  family: {
    id: 'family',
    name: 'Starter',
    price: {
      monthly: 9.99,
      yearly: 7.99 // $95.88 annually (20% savings)
    },
    period: 'month',
    features: [
      '7-day free trial on all plans',
      'All Basic features',
      'Unlimited accounts',
      'Receipt scanning (100/month)',
      'Automated transaction categorization',
      'Basic AI financial insights',
      'Export data to CSV',
      'Priority email support'
    ],
    limits: {
      accounts: Infinity,
      receiptsPerMonth: 100,
      investments: 10,
      aiInsights: true,
      prioritySupport: true,
      familySharing: false,
      maxDevices: 3
    }
  },
  
  business: {
    id: 'business',
    name: 'Professional',
    price: {
      monthly: 19.99,
      yearly: 15.99 // $191.88 annually (20% savings)
    },
    period: 'month',
    features: [
      '7-day free trial on all plans',
      'All Starter features',
      'Family sharing (up to 5 members)',
      'Joint account management',
      'Advanced AI advisor',
      'Investment portfolio tracking',
      'Bill reminder system',
      'Financial goal planning',
      'Priority chat support',
      'Tax document organization'
    ],
    limits: {
      accounts: Infinity,
      receiptsPerMonth: 500,
      investments: 50,
      aiInsights: true,
      prioritySupport: true,
      familySharing: true,
      maxDevices: 10,
      taxOptimization: true
    }
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Business',
    price: {
      monthly: 39.99,
      yearly: 31.99 // $383.88 annually (20% savings)
    },
    period: 'month',
    features: [
      '7-day free trial on all plans',
      'All Professional features',
      'Business expense tracking',
      'Multi-currency support',
      'Team collaboration (up to 20 users)',
      'Custom reporting dashboards',
      'API access for integrations',
      'Dedicated account manager',
      '24/7 premium support',
      'White-label options',
      'Advanced security features'
    ],
    limits: {
      accounts: Infinity,
      receiptsPerMonth: 2000,
      investments: 200,
      aiInsights: true,
      prioritySupport: true,
      familySharing: true,
      maxDevices: 50,
      taxOptimization: true,
      wealthManagement: true
    }
  },
  
  premium: {
    id: 'premium',
    name: 'Enterprise',
    price: {
      monthly: 99.99,
      yearly: 79.99 // $959.88 annually (20% savings)
    },
    period: 'month',
    highlight: true,
    features: [
      '7-day free trial on all plans',
      'All Business features',
      'Unlimited everything',
      'Human financial consultation (2 hours/month)',
      'Custom AI model training',
      'Enterprise-grade security',
      'SLA guarantees',
      'Personal financial advisor',
      'Tax strategy & optimization',
      'Wealth management services',
      'Exclusive member events',
      'Early access to new features'
    ],
    limits: {
      accounts: Infinity,
      receiptsPerMonth: Infinity,
      investments: Infinity,
      aiInsights: true,
      prioritySupport: true,
      familySharing: true,
      maxDevices: Infinity,
      humanConsultationHours: 2,
      taxOptimization: true,
      wealthManagement: true
    }
  }
};

// Get plan by tier
export const getPlanByTier = (tier: SubscriptionTier): SubscriptionPlan => {
  return SUBSCRIPTION_PLANS[tier];
};

// Get current user's plan
export const getCurrentPlan = (userTier: SubscriptionTier = 'free'): SubscriptionPlan => {
  return SUBSCRIPTION_PLANS[userTier] || SUBSCRIPTION_PLANS.free;
};

// Calculate annual savings
export const calculateAnnualSavings = (plan: SubscriptionPlan): number => {
  const monthlyCost = plan.price.monthly * 12;
  const yearlyCost = plan.price.yearly * 12;
  return monthlyCost - yearlyCost;
};

// Get all available plans
export const getAllPlans = (): SubscriptionPlan[] => {
  return Object.values(SUBSCRIPTION_PLANS);
};

// Check if user is in trial period
export const isInTrial = (trialEndDate?: number): boolean => {
  if (!trialEndDate) return false;
  return Date.now() < trialEndDate;
};

// Check if trial has expired
export const isTrialExpired = (trialEndDate?: number): boolean => {
  if (!trialEndDate) return false;
  return Date.now() >= trialEndDate;
};

// Get trial end date (7 days from now)
export const getTrialEndDate = (): number => {
  const now = Date.now();
  return now + (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
};

// Format trial remaining time
export const formatTrialTimeRemaining = (trialEndDate: number): string => {
  const now = Date.now();
  const diff = trialEndDate - now;
  
  if (diff <= 0) return 'Trial expired';
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  } else {
    return 'Less than 1 hour remaining';
  }
};

// Get days since trial expiration
export const getDaysSinceExpiration = (trialEndDate?: number): number => {
  if (!trialEndDate || Date.now() < trialEndDate) return 0;
  const diff = Date.now() - trialEndDate;
  return Math.floor(diff / (24 * 60 * 60 * 1000));
};

// Check if user should see trial expiration reminder
export const shouldShowTrialReminder = (trialEndDate?: number): boolean => {
  if (!trialEndDate) return false;
  
  const now = Date.now();
  const daysSinceExpiration = getDaysSinceExpiration(trialEndDate);
  
  // Show reminder if trial expired within last 7 days
  return now >= trialEndDate && daysSinceExpiration <= 7;
};

// Get upgrade path suggestions
export const getUpgradeSuggestions = (currentTier: SubscriptionTier): SubscriptionPlan[] => {
  const tiers: SubscriptionTier[] = ['individual', 'family', 'business', 'enterprise', 'premium'];
  const currentIndex = tiers.indexOf(currentTier);
  return tiers.slice(currentIndex + 1).map(tier => SUBSCRIPTION_PLANS[tier]);
};

// Get trial expiration message based on days since expiration
export const getTrialExpirationMessage = (trialEndDate?: number): string => {
  if (!trialEndDate) return '';
  
  const daysSinceExpiration = getDaysSinceExpiration(trialEndDate);
  
  if (daysSinceExpiration <= 0) return '';
  
  if (daysSinceExpiration === 1) {
    return 'Your free trial ended yesterday. Continue enjoying premium features by subscribing today!';
  } else if (daysSinceExpiration <= 3) {
    return `Your free trial ended ${daysSinceExpiration} days ago. Don't lose access to your premium features!`; 
  } else {
    return `Your free trial ended ${daysSinceExpiration} days ago. Subscribe now to continue using all features.`;
  }
};

// Get trial encouragement message
export const getTrialEncouragementMessage = (trialEndDate?: number): string => {
  if (!trialEndDate) return '';
  
  const daysRemaining = Math.ceil((trialEndDate - Date.now()) / (24 * 60 * 60 * 1000));
  
  if (daysRemaining > 3) {
    return `Enjoy your free trial! ${daysRemaining} days remaining to explore all features.`;
  } else if (daysRemaining > 0) {
    return `Trial ending soon! Only ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left to experience the full benefits.`;
  } else {
    return getTrialExpirationMessage(trialEndDate);
  }
};

// Format price for display
export const formatPrice = (price: number, period: 'monthly' | 'yearly'): string => {
  return `$${price.toFixed(2)}/${period === 'monthly' ? 'mo' : 'yr'}`;
};

// Get billing cycle options
export const getBillingOptions = (plan: SubscriptionPlan) => {
  return [
    { 
      label: 'Monthly', 
      value: 'monthly', 
      price: plan.price.monthly,
      display: formatPrice(plan.price.monthly, 'monthly')
    },
    { 
      label: 'Yearly', 
      value: 'yearly', 
      price: plan.price.yearly,
      display: formatPrice(plan.price.yearly, 'yearly'),
      savings: calculateAnnualSavings(plan)
    }
  ];
};