// Type definition for D1Database (simplified version)
interface D1Database {
  prepare(query: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean; meta: Record<string, unknown> }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] | null; meta: Record<string, unknown> }>;
    };
  };
}

// Type definitions for our database entities
export interface User {
  id: string;
  email: string;
  name: string;
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

// Database utility functions
export class Database {
  private db: D1Database;

  constructor(d1: D1Database) {
    this.db = d1;
  }

  // User operations
  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const result = await this.db.prepare(
      'INSERT INTO users (id, email, name, plan, is_admin, email_verified, trial_ends_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      user.email,
      user.name,
      user.plan,
      user.is_admin,
      user.email_verified,
      user.trial_ends_at,
      now,
      now
    ).run();
    
    if (!result.success) {
      throw new Error('Failed to create user');
    }
    
    return {
      id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      is_admin: user.is_admin,
      email_verified: user.email_verified,
      trial_ends_at: user.trial_ends_at,
      created_at: now,
      updated_at: now
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(id).first<User>();
    
    return result || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first<User>();
    
    return result || null;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    
    if (fields.length === 0) {
      return this.getUserById(id);
    }
    
    values.push(new Date().toISOString()); // updated_at
    values.push(id);
    
    const result = await this.db.prepare(
      `UPDATE users SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`
    ).bind(...values).run();
    
    if (!result.success) {
      throw new Error('Failed to update user');
    }
    
    return this.getUserById(id);
  }

  // Transaction operations
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const result = await this.db.prepare(
      'INSERT INTO transactions (id, user_id, date, description, category, amount, type, receipt_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      transaction.user_id,
      transaction.date,
      transaction.description,
      transaction.category,
      transaction.amount,
      transaction.type,
      transaction.receipt_url,
      now,
      now
    ).run();
    
    if (!result.success) {
      throw new Error('Failed to create transaction');
    }
    
    return {
      id,
      user_id: transaction.user_id,
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      type: transaction.type,
      receipt_url: transaction.receipt_url,
      created_at: now,
      updated_at: now
    };
  }

  async getTransactionsByUser(userId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    const result = await this.db.prepare(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT ? OFFSET ?'
    ).bind(userId, limit, offset).all<Transaction>();
    
    return result.results || [];
  }

  // Budget operations
  async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'spent_amount'>): Promise<Budget> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const result = await this.db.prepare(
      'INSERT INTO budgets (id, user_id, category, limit_amount, spent_amount, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      budget.user_id,
      budget.category,
      budget.limit_amount,
      0, // spent_amount
      budget.start_date,
      budget.end_date,
      now,
      now
    ).run();
    
    if (!result.success) {
      throw new Error('Failed to create budget');
    }
    
    return {
      id,
      user_id: budget.user_id,
      category: budget.category,
      limit_amount: budget.limit_amount,
      spent_amount: 0,
      start_date: budget.start_date,
      end_date: budget.end_date,
      created_at: now,
      updated_at: now
    };
  }

  async getBudgetsByUser(userId: string): Promise<Budget[]> {
    const result = await this.db.prepare(
      'SELECT * FROM budgets WHERE user_id = ?'
    ).bind(userId).all<Budget>();
    
    return result.results || [];
  }

  // Investment operations
  async createInvestment(investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>): Promise<Investment> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const result = await this.db.prepare(
      'INSERT INTO investments (id, user_id, asset_name, symbol, shares, purchase_price, current_price, value, profit_loss, purchase_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      investment.user_id,
      investment.asset_name,
      investment.symbol,
      investment.shares,
      investment.purchase_price,
      investment.current_price,
      investment.value,
      investment.profit_loss,
      investment.purchase_date,
      now,
      now
    ).run();
    
    if (!result.success) {
      throw new Error('Failed to create investment');
    }
    
    return {
      id,
      user_id: investment.user_id,
      asset_name: investment.asset_name,
      symbol: investment.symbol,
      shares: investment.shares,
      purchase_price: investment.purchase_price,
      current_price: investment.current_price,
      value: investment.value,
      profit_loss: investment.profit_loss,
      purchase_date: investment.purchase_date,
      created_at: now,
      updated_at: now
    };
  }

  async getInvestmentsByUser(userId: string): Promise<Investment[]> {
    const result = await this.db.prepare(
      'SELECT * FROM investments WHERE user_id = ?'
    ).bind(userId).all<Investment>();
    
    return result.results || [];
  }

  // Subscription operations
  async createSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const result = await this.db.prepare(
      'INSERT INTO subscriptions (id, user_id, name, amount, frequency, next_payment_date, auto_renew, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      subscription.user_id,
      subscription.name,
      subscription.amount,
      subscription.frequency,
      subscription.next_payment_date,
      subscription.auto_renew,
      subscription.category,
      now,
      now
    ).run();
    
    if (!result.success) {
      throw new Error('Failed to create subscription');
    }
    
    return {
      id,
      user_id: subscription.user_id,
      name: subscription.name,
      amount: subscription.amount,
      frequency: subscription.frequency,
      next_payment_date: subscription.next_payment_date,
      auto_renew: subscription.auto_renew,
      category: subscription.category,
      created_at: now,
      updated_at: now
    };
  }

  async getSubscriptionsByUser(userId: string): Promise<Subscription[]> {
    const result = await this.db.prepare(
      'SELECT * FROM subscriptions WHERE user_id = ?'
    ).bind(userId).all<Subscription>();
    
    return result.results || [];
  }

  // Consultation operations
  async createConsultation(consultation: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Promise<Consultation> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const result = await this.db.prepare(
      'INSERT INTO consultations (id, user_id, advisor_name, scheduled_at, duration_minutes, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      consultation.user_id,
      consultation.advisor_name,
      consultation.scheduled_at,
      consultation.duration_minutes,
      consultation.status,
      consultation.notes,
      now,
      now
    ).run();
    
    if (!result.success) {
      throw new Error('Failed to create consultation');
    }
    
    return {
      id,
      user_id: consultation.user_id,
      advisor_name: consultation.advisor_name,
      scheduled_at: consultation.scheduled_at,
      duration_minutes: consultation.duration_minutes,
      status: consultation.status,
      notes: consultation.notes,
      created_at: now,
      updated_at: now
    };
  }

  async getConsultationsByUser(userId: string): Promise<Consultation[]> {
    const result = await this.db.prepare(
      'SELECT * FROM consultations WHERE user_id = ? ORDER BY scheduled_at DESC'
    ).bind(userId).all<Consultation>();
    
    return result.results || [];
  }

  // Receipt operations
  async createReceipt(receipt: Omit<Receipt, 'id' | 'uploaded_at'>): Promise<Receipt> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const result = await this.db.prepare(
      'INSERT INTO receipts (id, user_id, transaction_id, file_key, file_url, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      receipt.user_id,
      receipt.transaction_id,
      receipt.file_key,
      receipt.file_url,
      now
    ).run();
    
    if (!result.success) {
      throw new Error('Failed to create receipt');
    }
    
    return {
      id,
      user_id: receipt.user_id,
      transaction_id: receipt.transaction_id,
      file_key: receipt.file_key,
      file_url: receipt.file_url,
      uploaded_at: now
    };
  }

  async getReceiptsByUser(userId: string): Promise<Receipt[]> {
    const result = await this.db.prepare(
      'SELECT * FROM receipts WHERE user_id = ?'
    ).bind(userId).all<Receipt>();
    
    return result.results || [];
  }

  // Category operations
  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const result = await this.db.prepare(
      'INSERT INTO categories (id, user_id, name, type, color, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      category.user_id,
      category.name,
      category.type,
      category.color,
      category.icon,
      now,
      now
    ).run();
    
    if (!result.success) {
      throw new Error('Failed to create category');
    }
    
    return {
      id,
      user_id: category.user_id,
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      created_at: now,
      updated_at: now
    };
  }

  async getCategoriesByUser(userId: string): Promise<Category[]> {
    const result = await this.db.prepare(
      'SELECT * FROM categories WHERE user_id = ?'
    ).bind(userId).all<Category>();
    
    return result.results || [];
  }
}