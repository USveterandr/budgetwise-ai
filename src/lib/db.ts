// Type definitions for our database entities
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  plan: string;
  is_admin: boolean;
  email_verified: boolean;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  asset_name: string;
  symbol: string;
  shares: number;
  purchase_price: number;
  current_price: number;
  value: number;
  profit_loss: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  next_payment_date: string;
  auto_renew: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  user_id: string;
  advisor_name: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: string;
  user_id: string;
  transaction_id: string | null;
  file_key: string;
  file_url: string;
  uploaded_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryRule {
  id: string;
  user_id: string;
  description: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

// Database utility functions
export class Database {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_DATABASE_WORKER_URL || 'http://localhost:8787';
  }

  // User operations
  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: `user_${Date.now()}`,
          ...user
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Return the created user
        return {
          id: result.user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          is_admin: user.is_admin,
          email_verified: user.email_verified,
          trial_ends_at: user.trial_ends_at,
          created_at: result.user.created_at,
          updated_at: result.user.updated_at
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async login(email: string, password: string): Promise<{ user: User, token: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error logging in:', error);
      return null;
    }
  }

  async getUserById(_userId: string): Promise<User | null> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return null as this isn't implemented in the worker
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(email)}`);
      const result = await response.json();
      
      if (result.success && result.user) {
        return result.user;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async updateUser(_userId: string, _userUpdates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return null as this isn't implemented in the worker
      return null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Transaction operations
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction | null> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });

      const result = await response.json();
      
      if (result.success) {
        return result.transaction;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  async getTransactionsByUser(userId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/user/${userId}?limit=${limit}&offset=${offset}`);
      const result = await response.json();
      
      if (result.success) {
        return result.transactions;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async updateTransaction(_id: string, _updates: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<Transaction | null> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(_updates),
      });

      const result = await response.json();
      
      if (result.success) {
        return result.transaction;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
  }

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      return result.success || false;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  }

  // Budget operations
  async createBudget(_newBudget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'spent_amount'>): Promise<Budget | null> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return null as this isn't implemented in the worker
      return null;
    } catch (error) {
      console.error('Error creating budget:', error);
      return null;
    }
  }

  async getBudgetsByUser(_budgetUserId: string): Promise<Budget[]> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return empty array as this isn't implemented in the worker
      return [];
    } catch (error) {
      console.error('Error getting budgets:', error);
      return [];
    }
  }

  // Investment operations
  async createInvestment(_newInvestment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>): Promise<Investment | null> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return null as this isn't implemented in the worker
      return null;
    } catch (error) {
      console.error('Error creating investment:', error);
      return null;
    }
  }

  async getInvestmentsByUser(_investmentUserId: string): Promise<Investment[]> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return empty array as this isn't implemented in the worker
      return [];
    } catch (error) {
      console.error('Error getting investments:', error);
      return [];
    }
  }

  // Subscription operations
  async createSubscription(_newSubscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription | null> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return null as this isn't implemented in the worker
      return null;
    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  }

  async getSubscriptionsByUser(_subscriptionUserId: string): Promise<Subscription[]> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return empty array as this isn't implemented in the worker
      return [];
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  }

  // Consultation operations
  async createConsultation(_newConsultation: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Promise<Consultation | null> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return null as this isn't implemented in the worker
      return null;
    } catch (error) {
      console.error('Error creating consultation:', error);
      return null;
    }
  }

  async getConsultationsByUser(_consultationUserId: string): Promise<Consultation[]> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return empty array as this isn't implemented in the worker
      return [];
    } catch (error) {
      console.error('Error getting consultations:', error);
      return [];
    }
  }

  // Receipt operations
  async createReceipt(_newReceipt: Omit<Receipt, 'id' | 'created_at' | 'updated_at'>): Promise<Receipt | null> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return null as this isn't implemented in the worker
      return null;
    } catch (error) {
      console.error('Error creating receipt:', error);
      return null;
    }
  }

  async getReceiptsByUser(_receiptUserId: string): Promise<Receipt[]> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return empty array as this isn't implemented in the worker
      return [];
    } catch (error) {
      console.error('Error getting receipts:', error);
      return [];
    }
  }

  // Category operations
  async createCategory(_newCategory: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return null as this isn't implemented in the worker
      return null;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }

  async getCategoriesByUser(_categoryUserId: string): Promise<Category[]> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return empty array as this isn't implemented in the worker
      return [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Category rule operations
  async createCategoryRule(_newCategoryRule: Omit<CategoryRule, 'id' | 'created_at' | 'updated_at'>): Promise<CategoryRule | null> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return null as this isn't implemented in the worker
      return null;
    } catch (error) {
      console.error('Error creating category rule:', error);
      return null;
    }
  }

  async getCategoryRulesByUser(_categoryRuleUserId: string): Promise<CategoryRule[]> {
    try {
      // This would require a specific endpoint in the worker
      // For now, we'll return empty array as this isn't implemented in the worker
      return [];
    } catch (error) {
      console.error('Error getting category rules:', error);
      return [];
    }
  }
}

export const db = new Database();

export default db;
