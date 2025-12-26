import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cloudflare } from '../app/lib/cloudflare';
import { auth } from '../firebase';
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

  const checkBudgetAlerts = async (uid: string, budgetsList: Budget[], idToken: string) => {
    for (const budget of budgetsList) {
      const percentage = (budget.spent / budget.limit) * 100;
      
      // Check for 80% alert
      if (percentage >= 80 && percentage < 100) {
        const notifications = await cloudflare.getNotifications(uid, idToken);
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
          }, idToken);
          
          sendLocalNotification(title, message);
        }
      }
      
      // Check for 100% alert
      if (percentage >= 100) {
        const notifications = await cloudflare.getNotifications(uid, idToken);
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
          }, idToken);
          
          sendLocalNotification(title, message);
        }
      }
    }
  };

  const refreshData = async (uid: string) => {
    console.log('Refreshing data for user:', uid);
    setUserId(uid);
    setLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        setLoading(false);
        return;
      }

      // Fetch user profile
      const profileData = await cloudflare.getProfile(uid, idToken);
      if (profileData && profileData.user_id) {
        setUserProfile({
          monthlyIncome: profileData.monthly_income || 0,
          savingsRate: profileData.savings_rate || 0,
          currency: profileData.currency || 'USD',
          bio: profileData.bio || '',
          businessIndustry: profileData.business_industry || 'General'
        } as any);
      }
      
      const txData = await cloudflare.getTransactions(uid, idToken);
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
      const budgetData = await cloudflare.getBudgets(uid, month, idToken);
      if (budgetData) {
        const updatedBudgets = budgetData.map((b: any) => ({ 
          id: b.id, 
          category: b.category, 
          limit: Number(b.budget_limit), 
          spent: Number(b.spent) 
        }));
        
        setBudgets(updatedBudgets);
        
        // Check for budget alerts
        await checkBudgetAlerts(uid, updatedBudgets, idToken);
      }
      
      const investmentData = await cloudflare.getInvestments(uid, idToken);
      if (investmentData) setInvestments(investmentData.map((i: any) => ({
        id: i.id,
        name: i.name,
        symbol: i.symbol,
        quantity: Number(i.quantity),
        purchasePrice: Number(i.purchase_price),
        costBasis: Number(i.purchase_price * i.quantity),
        currentPrice: Number(i.current_price),
        type: i.type
      })));
    } catch (e) { 
      console.error('Error refreshing data:', e); 
    } finally {
      setLoading(false);
    }
    console.log('Data refresh complete');
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;

    try {
      const data = await cloudflare.addTransaction({ 
        user_id: userId, 
        description: t.description, 
        amount: t.amount, 
        category: t.category, 
        type: t.type, 
        date: t.date 
      }, idToken);
      
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
    } catch (e) {
      console.error('Error adding transaction:', e);
    }
  };

  const deleteTransaction = async (id: string) => {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;

    try {
      const transaction = transactions.find(t => t.id === id);
      await cloudflare.deleteTransaction(id, idToken);
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
    } catch (e) {
      console.error('Error deleting transaction:', e);
    }
  };

  const updateBudget = async (id: string, spent: number) => {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;

    try {
      await cloudflare.updateBudget(id, spent, idToken);
      setBudgets(prev => prev.map(b => b.id === id ? { ...b, spent } : b));
    } catch (e) {
      console.error('Error updating budget:', e);
    }
  };

  const addBudget = async (b: Omit<Budget, 'id'> & { month: string }) => {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;

    try {
      const data = await cloudflare.addBudget({
        user_id: userId,
        category: b.category,
        budget_limit: b.limit,
        spent: b.spent,
        month: b.month
      }, idToken);
      
      if (data && data.success) {
        setBudgets(prev => [...prev, {
          id: data.id,
          category: b.category,
          limit: Number(b.limit),
          spent: Number(b.spent)
        }]);
      }
    } catch (e) {
      console.error('Error adding budget:', e);
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id'>) => {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;

    try {
      const data = await cloudflare.addInvestment({
        user_id: userId,
        name: investment.name,
        symbol: investment.symbol,
        quantity: investment.quantity,
        purchase_price: investment.purchasePrice || (investment.costBasis / investment.quantity),
        current_price: investment.currentPrice,
        purchase_date: new Date().toISOString(),
        type: investment.type
      }, idToken);
      
      if (data && data.success) {
        setInvestments(prev => [...prev, {
          id: data.id,
          ...investment,
          costBasis: Number(investment.costBasis)
        }]);
      }
    } catch (e) {
      console.error('Error adding investment:', e);
    }
  };

  const updateInvestment = async (id: string, investment: Partial<Investment>) => {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;

    try {
      const updates: any = {};
      if (investment.name !== undefined) updates.name = investment.name;
      if (investment.symbol !== undefined) updates.symbol = investment.symbol;
      if (investment.quantity !== undefined) updates.quantity = investment.quantity;
      if (investment.purchasePrice !== undefined) updates.purchase_price = investment.purchasePrice;
      else if (investment.costBasis !== undefined) updates.purchase_price = investment.costBasis / (investment.quantity || 1);
      if (investment.currentPrice !== undefined) updates.current_price = investment.currentPrice;
      if (investment.type !== undefined) updates.type = investment.type;

      await cloudflare.updateInvestment(id, updates, idToken);
      setInvestments(prev => prev.map(inv => inv.id === id ? { ...inv, ...investment } : inv));
    } catch (e) {
      console.error('Error updating investment:', e);
    }
  };

  const deleteInvestment = async (id: string) => {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;

    try {
      await cloudflare.deleteInvestment(id, idToken);
      setInvestments(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      console.error('Error deleting investment:', e);
    }
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