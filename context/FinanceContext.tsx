import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cloudflare } from '../app/lib/cloudflare';
import { tokenCache } from '../utils/tokenCache';
import { useAuth } from '../AuthContext';
import { Transaction, Budget, Investment, UserProfile, IncomeSource } from '../types';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  investments: Investment[];
  userProfile: UserProfile;
  loading: boolean;
  refreshData: () => Promise<void>;
  addTransaction: (transaction: Partial<Transaction>) => Promise<any>;
  deleteTransaction: (id: string) => Promise<any>;
  addBudget: (budget: Partial<Budget> & { month?: string }) => Promise<any>;
  updateBudget: (id: string, spent: number) => Promise<any>;
  addInvestment: (investment: Partial<Investment>) => Promise<any>;
  monthlyIncome: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile: authUserProfile } = useAuth() as any;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Local user profile state that merges auth profile with detailed financial data
  const [financeProfile, setFinanceProfile] = useState<UserProfile>({
    monthlyIncome: 0,
    savingsRate: 0,
    currency: 'USD',
    incomeSources: [],
    businessIndustry: 'General'
  });

  const fetchFinanceData = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const token = await tokenCache.getToken("budgetwise_jwt_token");
      if (!token) return;

      // Fetch all data in parallel
      const [txData, budgetData, investData] = await Promise.all([
        cloudflare.getTransactions(currentUser.uid, token),
        cloudflare.getBudgets(currentUser.uid, 'current', token),
        cloudflare.getInvestments(currentUser.uid, token)
      ]);

      if (Array.isArray(txData)) setTransactions(txData);
      if (Array.isArray(budgetData)) setBudgets(budgetData);
      if (Array.isArray(investData)) setInvestments(investData);

      // Sync profile data from AuthContext if available
      if (authUserProfile) {
          setFinanceProfile(prev => ({
              ...prev,
              monthlyIncome: authUserProfile.monthly_income || prev.monthlyIncome,
              savingsRate: authUserProfile.savings_rate || prev.savingsRate,
              currency: authUserProfile.currency || prev.currency,
              businessIndustry: authUserProfile.business_industry || prev.businessIndustry,
              incomeSources: authUserProfile.income_sources ? (typeof authUserProfile.income_sources === 'string' ? JSON.parse(authUserProfile.income_sources) : authUserProfile.income_sources) : prev.incomeSources
          }));
      }

    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, authUserProfile]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const addTransaction = async (transaction: Partial<Transaction>) => {
    try {
      const token = await tokenCache.getToken("budgetwise_jwt_token");
      if (!token) throw new Error("No token");
      
      const result = await cloudflare.addTransaction({
          ...transaction,
          userId: currentUser.uid
      }, token);
      
      // Optimistic update or refresh
      await fetchFinanceData();
      return result;
    } catch (error) {
      console.error('Add transaction error:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const token = await tokenCache.getToken("budgetwise_jwt_token");
      if (!token) throw new Error("No token");

      const result = await cloudflare.deleteTransaction(id, token);
      
      // Optimistic update
      setTransactions(prev => prev.filter(t => t.id !== id));
      return result;
    } catch (error) {
       console.error('Delete transaction error:', error);
       throw error;
    }
  };

  const addBudget = async (budget: Partial<Budget> & { month?: string }) => {
    try {
      const token = await tokenCache.getToken("budgetwise_jwt_token");
      if (!token) throw new Error("No token");
      
      const result = await cloudflare.addBudget({
          ...budget,
          userId: currentUser.uid
      }, token);
      
      await fetchFinanceData();
      return result;
    } catch (error) {
      console.error('Add budget error:', error);
      throw error;
    }
  };

  const updateBudget = async (id: string, spent: number) => {
    try {
      const token = await tokenCache.getToken("budgetwise_jwt_token");
      if (!token) throw new Error("No token");
      
      const result = await cloudflare.updateBudget(id, spent, token);
      
      setBudgets(prev => prev.map(b => b.id === id ? { ...b, spent } : b));
      return result;
    } catch (error) {
      console.error('Update budget error:', error);
      throw error;
    }
  };

  const addInvestment = async (investment: Partial<Investment>) => {
    try {
      const token = await tokenCache.getToken("budgetwise_jwt_token");
      if (!token) throw new Error("No token");
      
      const result = await cloudflare.addInvestment({
          ...investment,
          userId: currentUser.uid
      }, token);
      
      await fetchFinanceData();
      return result;
    } catch (error) {
      console.error('Add investment error:', error);
      throw error;
    }
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      budgets,
      investments,
      userProfile: financeProfile,
      loading,
      refreshData: fetchFinanceData,
      addTransaction,
      deleteTransaction,
      addBudget,
      updateBudget,
      addInvestment,
      monthlyIncome: financeProfile.monthlyIncome
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
