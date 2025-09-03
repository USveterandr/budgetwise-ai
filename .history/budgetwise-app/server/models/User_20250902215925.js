const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Profile Information
  profilePicture: {
    type: String,
    default: null
  },
  phoneNumber: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  
  // Subscription Information
  subscriptionTier: {
    type: String,
    enum: ['free', 'personal_plus', 'investor', 'business_pro_elite'],
    default: 'free'
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
    default: 'inactive'
  },
  subscriptionStartDate: {
    type: Date,
    default: null
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  trialEndDate: {
    type: Date,
    default: null
  },
  
  // Financial Information
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL']
  },
  monthlyIncome: {
    type: Number,
    default: 0
  },
  financialGoals: [{
    type: {
      type: String,
      enum: ['emergency_fund', 'retirement', 'house', 'vacation', 'debt_payoff', 'investment', 'other']
    },
    name: String,
    targetAmount: Number,
    currentAmount: {
      type: Number,
      default: 0
    },
    targetDate: Date,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  }],
  
  // Business Information (for Business Pro Elite)
  businessName: {
    type: String,
    default: null
  },
  businessType: {
    type: String,
    default: null
  },
  teamMembers: [{
    email: String,
    role: {
      type: String,
      enum: ['admin', 'manager', 'employee', 'viewer'],
      default: 'employee'
    },
    permissions: {
      viewBudgets: { type: Boolean, default: true },
      editBudgets: { type: Boolean, default: false },
      viewReports: { type: Boolean, default: true },
      manageExpenses: { type: Boolean, default: false },
      approveExpenses: { type: Boolean, default: false }
    },
    spendingLimit: {
      type: Number,
      default: 0
    },
    addedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // App Preferences
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de']
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto']
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      investmentUpdates: { type: Boolean, default: true },
      subscriptionReminders: { type: Boolean, default: true }
    },
    privacy: {
      shareData: { type: Boolean, default: false },
      analytics: { type: Boolean, default: true }
    }
  },
  
  // Feature Access Tracking
  featureUsage: {
    lastLogin: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 0 },
    budgetCreated: { type: Boolean, default: false },
    investmentLinked: { type: Boolean, default: false },
    subscriptionAdded: { type: Boolean, default: false },
    receiptScanned: { type: Boolean, default: false },
    reportGenerated: { type: Boolean, default: false }
  },
  
  // AI Preferences
  aiPreferences: {
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    },
    investmentExperience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    financialPriority: {
      type: String,
      enum: ['saving', 'investing', 'debt_reduction', 'budgeting'],
      default: 'budgeting'
    }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ stripeCustomerId: 1 });
userSchema.index({ subscriptionTier: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('[Auth Debug] Comparing passwords for user:', this.email);
  console.log('[Auth Debug] Stored hash:', this.password);
  console.log('[Auth Debug] Candidate password:', candidatePassword);
  
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('[Auth Debug] Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('[Auth Error] Password comparison failed:', error);
    return false;
  }
};

// Check if user has access to feature based on subscription tier
userSchema.methods.hasFeatureAccess = function(feature) {
  const featureMap = {
    // Free tier features
    basic_budgeting: ['free', 'personal_plus', 'investor', 'business_pro_elite'],
    cash_flow_tracking: ['free', 'personal_plus', 'investor', 'business_pro_elite'],
    subscription_management: ['free', 'personal_plus', 'investor', 'business_pro_elite'],
    
    // Personal Plus features
    net_worth_tracking: ['personal_plus', 'investor', 'business_pro_elite'],
    investment_syncing: ['personal_plus', 'investor', 'business_pro_elite'],
    sankey_diagrams: ['personal_plus', 'investor', 'business_pro_elite'],
    
    // Investor features
    monte_carlo_simulator: ['investor', 'business_pro_elite'],
    stock_option_modeling: ['investor', 'business_pro_elite'],
    tax_planning: ['investor', 'business_pro_elite'],
    
    // Business Pro Elite features
    team_financial_gps: ['business_pro_elite'],
    magic_receipt_ai: ['business_pro_elite'],
    profit_forecasting: ['business_pro_elite'],
    employee_spending_controls: ['business_pro_elite'],
    team_management: ['business_pro_elite']
  };
  
  return featureMap[feature] && featureMap[feature].includes(this.subscriptionTier);
};

// Get subscription tier display name
userSchema.methods.getSubscriptionDisplayName = function() {
  const displayNames = {
    free: 'Free',
    personal_plus: 'Personal Plus',
    investor: 'Investor',
    business_pro_elite: 'Business Pro Elite'
  };
  
  return displayNames[this.subscriptionTier] || 'Free';
};

// Check if subscription is active
userSchema.methods.isSubscriptionActive = function() {
  if (this.subscriptionTier === 'free') return true;
  
  return this.subscriptionStatus === 'active' || 
         this.subscriptionStatus === 'trialing';
};

module.exports = mongoose.model('User', userSchema);