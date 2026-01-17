import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useFinance } from '../context/FinanceContext';
import { geminiService } from '../services/geminiService';

interface BudgetCategory {
  id?: string;
  category: string;
  limit: number;
  spent: number;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

export function BudgetPlanning() {
  const { budgets, updateBudget, addBudget, monthlyIncome, userProfile } = useFinance();
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [industry, setIndustry] = useState(userProfile.businessIndustry || 'General');
  const [currency, setCurrency] = useState(userProfile.currency || 'USD');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', limit: '' });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState<number>(0);

  useEffect(() => {
    // Convert finance context budgets to our local format
    const formattedBudgets = budgets.map(budget => ({
      id: budget.id,
      category: budget.category,
      limit: budget.limit,
      spent: budget.spent
    }));
    setBudgetCategories(formattedBudgets);
    
    // Mock goals for demonstration
    setGoals([
      {
        id: '1',
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 2500,
        deadline: '2024-12-31',
        icon: '🏥',
        color: '#22C55E'
      },
      {
        id: '2',
        name: 'New Car',
        targetAmount: 35000,
        currentAmount: 5000,
        deadline: '2025-06-30',
        icon: '🚗',
        color: '#FACC15'
      }
    ]);
  }, [budgets]);

  const handleUpdateBudget = async (category: string, newLimit: number) => {
    const budget = budgetCategories.find(b => b.category === category);
    if (budget && budget.id) {
      await updateBudget(budget.id, budget.spent);
      setBudgetCategories(prev => 
        prev.map(b => b.category === category ? { ...b, limit: newLimit } : b)
      );
    }
  };

  const handleAddBudget = async (newCategory: string, limit: number) => {
    if (!newCategory.trim()) return;
    
    const month = new Date().toISOString().slice(0, 7);
    await addBudget({
      category: newCategory,
      limit: limit,
      spent: 0,
      month
    });
    
    setBudgetCategories(prev => [
      ...prev,
      { category: newCategory, limit, spent: 0 }
    ]);
  };

  const handleGenerateBudget = async () => {
    if (monthlyIncome <= 0) {
      Alert.alert('Error', 'Please set your monthly income first');
      return;
    }
    
    setIsGenerating(true);
    try {
      const suggestedBudgets = await geminiService.generateBudgetPlan(industry, monthlyIncome, currency);
      
      if (suggestedBudgets.length > 0) {
        // Update existing budgets or add new ones
        const updatedBudgets = [...budgetCategories];
        
        for (const suggestion of suggestedBudgets) {
          const existingIndex = updatedBudgets.findIndex(b => b.category === suggestion.category);
          if (existingIndex >= 0) {
            updatedBudgets[existingIndex].limit = suggestion.limit;
          } else {
            updatedBudgets.push({
              category: suggestion.category,
              limit: suggestion.limit,
              spent: 0
            });
          }
        }
        
        setBudgetCategories(updatedBudgets);
        Alert.alert('Success', 'Budget suggestions generated successfully!');
      } else {
        Alert.alert('Info', 'Could not generate budget suggestions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating budget:', error);
      Alert.alert('Error', 'Failed to generate budget suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getBudgetProgress = (spent: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min(100, (spent / limit) * 100);
  };

  const getBudgetColor = (progress: number) => {
    if (progress >= 100) return Colors.error;
    if (progress >= 80) return Colors.warning;
    return Colors.success;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const totalBudget = budgetCategories.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = budgetCategories.reduce((sum, budget) => sum + budget.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Planning</Text>
        <Text style={styles.subtitle}>Manage your spending and reach your financial goals</Text>
      </View>

      {/* Budget Overview */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Budget Overview</Text>
        <View style={styles.budgetOverview}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Total Budget</Text>
            <Text style={styles.budgetAmount}>{formatCurrency(totalBudget)}</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Total Spent</Text>
            <Text style={[styles.budgetAmount, { color: Colors.error }]}>{formatCurrency(totalSpent)}</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[styles.budgetAmount, { color: remaining >= 0 ? Colors.success : Colors.error }]}>{formatCurrency(remaining)}</Text>
          </View>
        </View>
      </View>

      {/* AI Budget Generator */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Budget Suggestions</Text>
        <Text style={styles.cardDescription}>Let AI generate a personalized budget based on your industry</Text>
        
        <View style={styles.industrySelector}>
          <Text style={styles.label}>Industry:</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity style={styles.pickerButton}>
              <Text style={styles.pickerText}>{industry}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]} 
          onPress={handleGenerateBudget}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.generateButtonText}>Generating...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={16} color="#FFF" />
              <Text style={styles.generateButtonText}>Generate Budget Plan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Budget Categories */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Budget Categories</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        {budgetCategories.map((budget, index) => {
          const progress = getBudgetProgress(budget.spent, budget.limit);
          const color = getBudgetColor(progress);
          
          return (
            <View key={index} style={styles.budgetCategory}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{budget.category}</Text>
                <Text style={styles.categoryAmount}>
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}% used</Text>
            </View>
          );
        })}
      </View>

      {/* Financial Goals */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Financial Goals</Text>
          <TouchableOpacity>
            <Ionicons name="add" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        {goals.map(goal => {
          const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          
          return (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalName}>{goal.name}</Text>
                  <Text style={styles.goalAmount}>
                    {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                  </Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: goal.color }]} />
              </View>
              <Text style={styles.progressText}>Deadline: {new Date(goal.deadline).toLocaleDateString()}</Text>
            </View>
          );
        })}
      </View>

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Budget</Text>
            
            <Text style={styles.inputLabel}>Category Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Groceries"
              placeholderTextColor="#64748B"
              value={newBudget.category}
              onChangeText={(text) => setNewBudget(prev => ({ ...prev, category: text }))}
            />
            
            <Text style={styles.inputLabel}>Monthly Limit</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
              value={newBudget.limit}
              onChangeText={(text) => setNewBudget(prev => ({ ...prev, limit: text }))}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewBudget({ category: '', limit: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={async () => {
                   if (!newBudget.category || !newBudget.limit) {
                     Alert.alert('Error', 'Please fill in all fields');
                     return;
                   }
                   await handleAddBudget(newBudget.category, parseFloat(newBudget.limit));
                   setNewBudget({ category: '', limit: '' });
                   setShowAddModal(false);
                }}
              >
                <Text style={styles.saveButtonText}>Save Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
  },
  budgetOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  industrySelector: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#FFF',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetCategory: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  categoryAmount: {
    fontSize: 14,
    color: '#94A3B8',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  goalItem: {
    marginBottom: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 14,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center'
  },
  inputLabel: {
    color: '#94A3B8',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#475569'
  },
  saveButton: {
    backgroundColor: Colors.primary
  },
  cancelButtonText: {
    color: '#CBD5E1',
    fontWeight: '600'
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600'
  }
});