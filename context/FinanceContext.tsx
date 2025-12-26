import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cloudflare } from '../app/lib/cloudflare';
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
      const profileData = await cloudflare.getProfile(uid);
      if (profileData && profileData.user_id) {
        setUserProfile({
          monthlyIncome: profileData.monthly_income || 0,
          savingsRate: profileData.savings_rate || 0,
          currency: profileData.currency || 'USD',
          bio: profileData.bio || '',
          business_industry: profileData.business_industry || 'General'
        } as any);
      }
      
      const txData = await cloudflare.getTransactions(uid);
      if (txData) setTransactions(txData.map((t: any) => ({ 
        id: t.id, 
        description: t.description, 
        amount: Number(t.amount), 
        category: t.category, 
        date: t.date, 
        type: t.type, 
        icon: t.category === 'Food' ? 'restaurant' : t.category === 'Transport' ? 'car' : t.category === 'Utilities' ? 'zap' : t.category === 'Entertainment' ? 'film' : t.category === 'Shopping' ? 'shopping-cart' : 'wallet' 
      })));
      
      const month = new Date().toISOString().slice(0, 7);
      const budgetData = await cloudflare.getBudgets(uid, month);
      if (budgetData) {
        const updatedBudgets = budgetData.map((b: any) => ({ 
          id: b.id, 
          category: b.category, 
          limit: Number(b.budget_limit), 
          spent: Number(b.spent) 
        }));
        
        setBudgets(updatedBudgets);
        
        // Check for budget alerts
        checkBudgetAlerts(uid, updatedBudgets);
      }
      
      const investmentData = await cloudflare.getInvestments(uid);
      if (investmentData) setInvestments(investmentData.map((i: any) => ({
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
        const notifications = await cloudflare.getNotifications(uid);
        const existing80Alert = notifications?.filter((n: any) => 
          n.category === 'budget_alert' && 
          n.title.includes(budget.category) && 
          n.title.includes('80%') &&
          n.created_at.split('T')[0] === new Date().toISOString().split('T')[0]
        );
        
        if (!existing80Alert || existing80Alert.length === 0) {
          const title = `Budget Alert: ${budget.category}`;
          const message = `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. Limit: $${budget.limit.toFixed(2)}, Spent: $${budget.spent.toFixed(2)}`;
          
          await cloudflare.addNotification({
            user_id: uid,
            title,
            message,
            category: 'budget_alert',
            read: false
          });
          
          sendLocalNotification(title, message);
        }
      }
      
      // Check for 100% alert
      if (percentage >= 100) {
        const notifications = await cloudflare.getNotifications(uid);
        const existing100Alert = notifications?.filter((n: any) => 
          n.category === 'budget_alert' && 
          n.title.includes(budget.category) && 
          n.title.includes('100%') &&
          n.created_at.split('T')[0] === new Date().toISOString().split('T')[0]
        );
        
        if (!existing100Alert || existing100Alert.length === 0) {
          const title = `Budget Alert: ${budget.category}`;
          const message = `You've exceeded your ${budget.category} budget! Limit: $${budget.limit.toFixed(2)}, Spent: $${budget.spent.toFixed(2)}`;
          
          await cloudflare.addNotification({
            user_id: uid,
            title,
            message,
            category: 'budget_alert',
            read: false
          });
          
          sendLocalNotification(title, message);
        }
      }
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    const data = await cloudflare.addTransaction({ 
      user_id: userId, 
      description: t.description, 
      amount: t.amount, 
      category: t.category, 
      type: t.type, 
      date: t.date 
    });
    
    if (data && data.success) {
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
    const transaction = transactions.find(t => t.id === id);
    await cloudflare.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    
    // Adjust budget spent amount if this was an expense
    if (transaction && transaction.type === 'expense') {
      const budget = budgets.find(b => b.category === transaction.category);
      if (budget) {
        const newSpent = budget.spent - transaction.amount;
        await updateBudget(budget.id, newSpent);
        await refreshData(userId);
      }
    }
  };

  const updateBudget = async (id: string, spent: number) => {
    await cloudflare.updateBudget(id, spent);
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, spent } : b));
  };

  const addBudget = async (b: Omit<Budget, 'id'> & { month: string }) => {
    const data = await cloudflare.addBudget({
      user_id: userId,
      category: b.category,
      budget_limit: b.limit,
      spent: b.spent,
      month: b.month
    });
    
    if (data && data.success) {
      setBudgets(prev => [...prev, {
        id: data.id,
        category: b.category,
        limit: Number(b.limit),
        spent: Number(b.spent)
      }]);
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id'>) => {
    const data = await cloudflare.addInvestment({
      user_id: userId,
      name: investment.name,
      symbol: investment.symbol,
      quantity: investment.quantity,
      purchase_price: investment.costBasis / investment.quantity,
      current_price: investment.currentPrice,
      purchase_date: new Date().toISOString(),
      type: investment.type
    });
    
    if (data && data.success) {
      setInvestments(prev => [...prev, {
        id: data.id,
        ...investment,
        costBasis: Number(investment.costBasis)
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

    await cloudflare.updateInvestment(id, updates);
    
    setInvestments(prev => prev.map(inv => inv.id === id ? { ...inv, ...investment } : inv));
  };

  const deleteInvestment = async (id: string) => {
    await cloudflare.deleteInvestment(id);
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