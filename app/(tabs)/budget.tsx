import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

export default function BudgetScreen() {
  const { budgets, addBudget } = useFinance();
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remaining = totalBudget - totalSpent;

  const getCategoryIcon = (cat: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      Housing: 'home', Food: 'restaurant', Transportation: 'car', Entertainment: 'game-controller', Utilities: 'flash',
      Healthcare: 'medical', Education: 'school', Shopping: 'cart', Travel: 'airplane', Personal: 'person'
    };
    return icons[cat] || 'wallet';
  };

  const handleAddBudget = async () => {
    if (!newCategory.trim() || !newLimit.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    const limit = Number.parseFloat(newLimit);
    if (Number.isNaN(limit) || limit <= 0) {
      Alert.alert('Error', 'Please enter a valid budget limit');
      return;
    }
    
    // Check if category already exists
    if (budgets.some(b => b.category.toLowerCase() === newCategory.toLowerCase())) {
      Alert.alert('Error', 'A budget for this category already exists');
      return;
    }
    
    try {
      await addBudget({
        category: newCategory,
        limit: limit,
        spent: 0,
        month: new Date().toISOString().slice(0, 7) // Current month
      });
      setNewCategory('');
      setNewLimit('');
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add budget. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget</Text>
          <TouchableOpacity style={styles.monthPicker}>
            <Text style={styles.monthText}>{selectedMonth}</Text>
            <Ionicons name="chevron-down" size={16} color={DashboardColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Budget</Text>
              <Text style={styles.summaryValue}>${totalBudget.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Spent</Text>
              <Text style={[styles.summaryValue, styles.spent]}>${totalSpent.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text style={[styles.summaryValue, styles.remaining]}>${remaining.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round((totalSpent / totalBudget) * 100)}% used</Text>
          </View>
          <TouchableOpacity 
            style={styles.addBudgetButton} 
            onPress={() => {
              if (user?.plan === 'Starter' && budgets.length >= 5) {
                Alert.alert(
                  'Budget Limit Reached', 
                  'Upgrade to Professional plan to create more custom budgets.', 
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Upgrade', onPress: () => {} }
                  ]
                );
              } else {
                setShowAddModal(true);
              }
            }}
          >
            <Ionicons name="add" size={16} color="#FFF" />
            <Text style={styles.addBudgetButtonText}>Add Category</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitle}>Categories</Text>
        {budgets.map(budget => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOver = percentage > 100;
          return (
            <Card key={budget.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: isOver ? '#FEE2E2' : '#EFF6FF' }]}>
                    <Ionicons name={getCategoryIcon(budget.category)} size={20} color={isOver ? '#EF4444' : '#3B82F6'} />
                  </View>
                  <View>
                    <Text style={styles.categoryName}>{budget.category}</Text>
                    <Text style={styles.categoryAmounts}>${budget.spent} of ${budget.limit}</Text>
                  </View>
                </View>
                <Text style={[styles.categoryPercent, isOver && styles.overBudget]}>{Math.round(percentage)}%</Text>
              </View>
              <View style={styles.categoryProgress}>
                <View style={[styles.categoryProgressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: isOver ? '#EF4444' : '#3B82F6' }]} />
              </View>
            </Card>
          );
        })}
      </ScrollView>
      
      {/* Add Budget Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Budget Category</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={DashboardColors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Category name (e.g., Groceries, Entertainment)"
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <TextInput
              style={styles.input}
              placeholder="Monthly budget limit"
              value={newLimit}
              onChangeText={setNewLimit}
              keyboardType="numeric"
            />
            <Button title="Add Budget" onPress={handleAddBudget} style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DashboardColors.background },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: DashboardColors.text },
  monthPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: DashboardColors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  monthText: { fontSize: 14, color: DashboardColors.text, marginRight: 4 },
  summaryCard: { marginBottom: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: DashboardColors.textSecondary, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700', color: DashboardColors.text },
  spent: { color: '#EF4444' },
  remaining: { color: '#10B981' },
  divider: { width: 1, backgroundColor: DashboardColors.border },
  progressContainer: { alignItems: 'center' },
  progressBg: { width: '100%', height: 8, backgroundColor: DashboardColors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  progressText: { fontSize: 12, color: DashboardColors.textSecondary, marginTop: 8 },
  addBudgetButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: Colors.primary, 
    borderRadius: 8, 
    paddingVertical: 10,
    marginTop: 16
  },
  addBudgetButtonText: { 
    color: '#FFF', 
    fontWeight: '600', 
    marginLeft: 8 
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: DashboardColors.text, marginBottom: 12 },
  categoryCard: { marginBottom: 12 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  categoryLeft: { flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  categoryName: { fontSize: 15, fontWeight: '600', color: DashboardColors.text },
  categoryAmounts: { fontSize: 13, color: DashboardColors.textSecondary, marginTop: 2 },
  categoryPercent: { fontSize: 16, fontWeight: '700', color: '#3B82F6' },
  overBudget: { color: '#EF4444' },
  categoryProgress: { height: 6, backgroundColor: DashboardColors.border, borderRadius: 3, overflow: 'hidden' },
  categoryProgressFill: { height: '100%', borderRadius: 3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '80%', maxWidth: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: DashboardColors.text },
  input: { 
    borderWidth: 1, 
    borderColor: DashboardColors.border, 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16,
    fontSize: 16
  },
});
