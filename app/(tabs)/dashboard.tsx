/import React, { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { BudgetVisualization, BudgetCategory } from '../../components/BudgetVisualization';
import { IncomeTracker, IncomeSource } from '../../components/IncomeTracker';

export default function DashboardScreen() {
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { id: '1', name: 'Housing', budget: 2000, actual: 2000, color: '#6366f1' },
    { id: '2', name: 'Food & Dining', budget: 600, actual: 750, color: '#ec4899' },
    { id: '3', name: 'Transportation', budget: 400, actual: 320, color: '#14b8a6' },
  ]);

  const [incomes, setIncomes] = useState<IncomeSource[]>([
    { id: '1', source: 'Primary Salary', amount: 5000, date: new Date().toISOString().split('T')[0] },
  ]);

  const handleAddIncome = (newIncome: Omit<IncomeSource, 'id'>) => {
    setIncomes(prev => [{ ...newIncome, id: Math.random().toString() }, ...prev]);
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(inc => inc.id !== id));
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 px-4 pt-6">
      <Text className="text-2xl font-bold text-slate-900 mb-6">Financial Overview</Text>
      
      <IncomeTracker 
        incomes={incomes} 
        onAddIncome={handleAddIncome} 
        onDeleteIncome={handleDeleteIncome} 
      />
      
      <BudgetVisualization categories={categories} />
      
      <View className="h-10" /> {/* Bottom padding */}
    </ScrollView>
  );
}