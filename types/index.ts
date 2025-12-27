// Unified types for the BudgetWise application

// Transaction types
export interface TransactionItem {
  name: string;
  price: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  icon: string;
  items?: TransactionItem[];
  rawText?: string;
}

// Investment types
export interface Investment {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number; // Price per share/unit at purchase
  costBasis: number; // Total cost to acquire (quantity * purchasePrice)
  currentPrice: number; // Price per share/unit now
  type: 'stock' | 'crypto' | 'bond' | 'etf' | 'real_estate' | 'other';
}

// Chat Message types
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Subscription types
export interface Subscription {
  id: string;
  name: string;
  cost: number;
  frequency: 'Monthly' | 'Yearly';
  nextBilling: string;
  logo: string;
}

// Budget types
export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'warning' | 'alert' | 'info';
}

// Subscription Tier types
export type SubscriptionTier = 'individual' | 'family' | 'business' | 'enterprise';

// User types
export interface User {
  id?: string;
  email: string;
  passwordHash?: string; // Optional for OAuth users
  name: string;
  plan?: 'Starter' | 'Professional' | 'Business' | 'Enterprise';
  emailVerified?: boolean;
  resetToken?: string;
  resetTokenExpiry?: number;
  isPro?: boolean;
  subscriptionTier?: SubscriptionTier;
  billingCycle?: 'monthly' | 'yearly';
  trialEndsAt?: number; // Timestamp
  provider?: 'email' | 'google' | 'apple';
  onboardingComplete?: boolean;
}

// Goal types
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

// Income Source types
export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
}

// User Profile types
export interface UserProfile {
  photoUrl?: string;
  bio?: string;
  monthlyIncome: number;
  incomeSources?: IncomeSource[];
  savingsRate: number; // percentage 0-100
  currency: string;
  businessIndustry?: string;
}

// User Data types
export interface UserData {
  transactions: Transaction[];
  investments: Investment[];
  subscriptions: Subscription[];
  budgets: Budget[];
  notifications: Notification[];
  goals: Goal[];
  userProfile: UserProfile;
}

// App View enum
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  INVESTMENTS = 'INVESTMENTS',
  ADVISOR = 'ADVISOR',
  CONSULTATION = 'CONSULTATION',
  BUDGETS = 'BUDGETS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  SCANNER = 'SCANNER',
  PROFILE = 'PROFILE'
}

// Gemini service types
export interface ReceiptData {
  merchant: string;
  date: string;
  amount: number;
  category: string;
  items: { name: string; price: number }[];
  rawText: string;
}

export interface BudgetCategory {
  category: string;
  limit: number;
}

// Subscription plan types
export interface SubscriptionPlan {
  name: 'Starter' | 'Professional' | 'Business' | 'Enterprise';
  price: number;
  period: 'month' | 'year';
  features: string[];
  limits: {
    accounts: number;
    receiptsPerMonth: number;
    investments: number;
    aiInsights: boolean;
    prioritySupport: boolean;
    familySharing: boolean;
    maxDevices: number;
  };
}