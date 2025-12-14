import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../app/lib/supabase';
import { NotificationContext } from './NotificationContext';
import { Transaction, Budget, Investment, UserProfile } from '../types';

// Types are now imported from ../types

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  investments: Investment[];
  userProfile: UserProfile;
  loading: boolean;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudget: (id: string, spent: number) => Promise<void>;
  addBudget: (b: Omit<Budget, 'id'> & { month: string }) => Promise<void>;
  refreshData: (userId: string) => Promise<void>;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  addInvestment: (investment: Omit<Investment, 'id'>) => Promise<void>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    monthlyIncome: 0,
    savingsRate: 0,
    currency: 'USD',
    bio: '',
    businessIndustry: 'General'
  });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const notificationContext = useContext(NotificationContext);

  console.log('FinanceProvider initialized');

  // Helper function to safely send notifications
  const sendLocalNotification = async (title: string, body: string) => {
    if (notificationContext) {
      try {
        await notificationContext.sendLocalNotification(title, body);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  };

  const refreshData = async (uid: string) => {
    console.log('Refreshing data for user:', uid);
    setUserId(uid);
    setLoading(true);
    try {
      // Fetch user profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', uid).single();
      if (profileData) {
        setUserProfile({
          monthlyIncome: profileData.monthly_income || 0,
          savingsRate: profileData.savings_rate || 0,
          currency: profileData.currency || 'USD',
          bio: profileData.bio || '',
          businessIndustry: profileData.business_industry || 'General'
        });
      }
      
      const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', uid).order('date', { ascending: false });
      if (txData) setTransactions(txData.map(t => ({ id: t.id, description: t.description, amount: Number(t.amount), category: t.category, date: t.date, type: t.type, icon: t.category === 'Food' ? 'restaurant' : t.category === 'Transport' ? 'car' : t.category === 'Utilities' ? 'zap' : t.category === 'Entertainment' ? 'film' : t.category === 'Shopping' ? 'shopping-cart' : 'wallet' })));
      
      const month = new Date().toISOString().slice(0, 7);
      const { data: budgetData } = await supabase.from('budgets').select('*').eq('user_id', uid).eq('month', month);
      if (budgetData) {
        const updatedBudgets = budgetData.map(b => ({ 
          id: b.id, 
          category: b.category, 
          limit: Number(b.budget_limit), 
          spent: Number(b.spent) 
        }));
        
        setBudgets(updatedBudgets);
        
        // Check for budget alerts
        checkBudgetAlerts(uid, updatedBudgets);
      }
      
      const { data: investmentData } = await supabase.from('investments').select('*').eq('user_id', uid);
      if (investmentData) setInvestments(investmentData.map(i => ({
        id: i.id,
        name: i.name,
        symbol: i.symbol,
        quantity: Number(i.quantity),
        costBasis: Number(i.purchase_price * i.quantity),
        currentPrice: Number(i.current_price),
        type: i.type
      })));
    } catch (e) { console.error(e); }
    setLoading(false);
    console.log('Data refresh complete');
  };

  const checkBudgetAlerts = async (uid: string, budgets: Budget[]) => {
    for (const budget of budgets) {
      const percentage = (budget.spent / budget.limit) * 100;
      
      // Check for 80% alert
      if (percentage >= 80 && percentage < 100) {
        // Check if we've already sent this alert
        const { data: existing80Alert } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', uid)
          .eq('category', 'budget_alert')
          .ilike('title', `%${budget.category}%80%`)
          .gte('created_at', new Date().toISOString().split('T')[0]);
        
        if (!existing80Alert || existing80Alert.length === 0) {
          // Send 80% alert
          const title = `Budget Alert: ${budget.category}`;
          const message = `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. Limit: $${budget.limit.toFixed(2)}, Spent: $${budget.spent.toFixed(2)}`;
          
          // Save to notifications table
          await supabase.from('notifications').insert({
            user_id: uid,
            title,
            message,
            category: 'budget_alert',
            read: false
          });
          
          // Send local notification
          sendLocalNotification(title, message);
        }
      }
      
      // Check for 100% alert
      if (percentage >= 100) {
        // Check if we've already sent this alert
        const { data: existing100Alert } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', uid)
          .eq('category', 'budget_alert')
          .ilike('title', `%${budget.category}%100%`)
          .gte('created_at', new Date().toISOString().split('T')[0]);
        
        if (!existing100Alert || existing100Alert.length === 0) {
          // Send 100% alert
          const title = `Budget Alert: ${budget.category}`;
          const message = `You've exceeded your ${budget.category} budget! Limit: $${budget.limit.toFixed(2)}, Spent: $${budget.spent.toFixed(2)}`;
          
          // Save to notifications table
          await supabase.from('notifications').insert({
            user_id: uid,
            title,
            message,
            category: 'budget_alert',
            read: false
          });
          
          // Send local notification
          sendLocalNotification(title, message);
        }
      }
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    const { data, error } = await supabase.from('transactions').insert({ user_id: userId, description: t.description, amount: t.amount, category: t.category, type: t.type, date: t.date }).select().single();
    if (data && !error) {
      setTransactions(prev => [{ id: data.id, ...t }, ...prev]);
      
      // Update budget spent amount if this is an expense
      if (t.type === 'expense') {
        const budget = budgets.find(b => b.category === t.category);
        if (budget) {
          const newSpent = budget.spent + t.amount;
          await updateBudget(budget.id, newSpent);
          
          // Refresh data to trigger budget alerts
          await refreshData(userId);
        }
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    // Get the transaction to adjust budget
    const transaction = transactions.find(t => t.id === id);
    
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    
    // Adjust budget spent amount if this was an expense
    if (transaction && transaction.type === 'expense') {
      const budget = budgets.find(b => b.category === transaction.category);
      if (budget) {
        const newSpent = budget.spent - transaction.amount;
        await updateBudget(budget.id, newSpent);
        
        // Refresh data to trigger budget alerts
        await refreshData(userId);
      }
    }
  };

  const updateBudget = async (id: string, spent: number) => {
    await supabase.from('budgets').update({ spent, updated_at: new Date().toISOString() }).eq('id', id);
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, spent } : b));
  };

  const addBudget = async (b: Omit<Budget, 'id'> & { month: string }) => {
    const { data, error } = await supabase.from('budgets').insert({
      user_id: userId,
      category: b.category,
      budget_limit: b.limit,
      spent: b.spent,
      month: b.month
    }).select().single();
    
    if (data && !error) {
      setBudgets(prev => [...prev, {
        id: data.id,
        category: data.category,
        limit: Number(data.budget_limit),
        spent: Number(data.spent)
      }]);
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id'>) => {
    const { data, error } = await supabase.from('investments').insert({
      user_id: userId,
      name: investment.name,
      symbol: investment.symbol,
      quantity: investment.quantity,
      purchase_price: investment.costBasis / investment.quantity,
      current_price: investment.currentPrice,
      purchase_date: new Date().toISOString(),
      type: investment.type
    }).select().single();
    
    if (data && !error) {
      setInvestments(prev => [...prev, {
        id: data.id,
        name: data.name,
        symbol: data.symbol,
        quantity: Number(data.quantity),
        costBasis: Number(data.purchase_price * data.quantity),
        currentPrice: Number(data.current_price),
        type: data.type
      }]);
    }
  };

  const updateInvestment = async (id: string, investment: Partial<Investment>) => {
    const updates: any = {};
    if (investment.name !== undefined) updates.name = investment.name;
    if (investment.symbol !== undefined) updates.symbol = investment.symbol;
    if (investment.quantity !== undefined) updates.quantity = investment.quantity;
    if (investment.costBasis !== undefined) updates.purchase_price = investment.costBasis / (investment.quantity || 1);
    if (investment.currentPrice !== undefined) updates.current_price = investment.currentPrice;
    if (investment.type !== undefined) updates.type = investment.type;

    await supabase.from('investments').update(updates).eq('id', id);
    
    setInvestments(prev => prev.map(inv => inv.id === id ? { ...inv, ...investment } : inv));
  };

  const deleteInvestment = async (id: string) => {
    await supabase.from('investments').delete().eq('id', id);
    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  const monthlyIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthlyExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  // Calculate investment value for net worth
  const investmentValue = investments.reduce((sum, investment) => sum + (investment.quantity * investment.currentPrice), 0);
  const netWorth = 125000 + monthlyIncome - monthlyExpenses + investmentValue;

  console.log('FinanceProvider rendering with data:', { transactions: transactions.length, budgets: budgets.length, investments: investments.length });

  return (
    <FinanceContext.Provider value={{ 
      transactions, 
      budgets, 
      investments,
      userProfile,
      loading, 
      addTransaction, 
      deleteTransaction, 
      updateBudget, 
      addBudget,
      refreshData, 
      netWorth, 
      monthlyIncome, 
      monthlyExpenses,
      addInvestment,
      updateInvestment,
      deleteInvestment
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
}