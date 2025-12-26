import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function BudgetScreen() {
  const router = useRouter();
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
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#13112B', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Budget</Text>
            <View style={styles.monthPicker}>
              <Text style={styles.monthText}>{selectedMonth}</Text>
              <Ionicons name="chevron-down" size={16} color="#94A3B8" />
            </View>
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
                      { text: 'Upgrade', onPress: () => router.push('/(tabs)/subscription') }
                    ]
                  );
                } else {
                  setShowAddModal(true);
                }
              }}
            >
              <Ionicons name="add" size={18} color="#FFF" />
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
                    <View style={[styles.categoryIcon, { backgroundColor: isOver ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)' }]}>
                      <Ionicons name={getCategoryIcon(budget.category)} size={20} color={isOver ? '#EF4444' : '#3B82F6'} />
                    </View>
                    <View>
                      <Text style={styles.categoryName}>{budget.category}</Text>
                      <Text style={styles.categoryAmounts}>${budget.spent} of ${budget.limit}</Text>
                    </View>
                  </View>
                  <Text style={[styles.categoryPercent, { color: isOver ? '#EF4444' : '#3B82F6' }]}>{Math.round(percentage)}%</Text>
                </View>
                <View style={styles.categoryProgress}>
                  <View style={[styles.categoryProgressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: isOver ? '#EF4444' : '#3B82F6' }]} />
                </View>
              </Card>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
      
      {/* Add Budget Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Category</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Category name"
              placeholderTextColor="#64748B"
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <TextInput
              style={styles.input}
              placeholder="Monthly limit"
              placeholderTextColor="#64748B"
              value={newLimit}
              onChangeText={setNewLimit}
              keyboardType="numeric"
            />
            <Button title="Create Budget" onPress={handleAddBudget} style={{ marginTop: 24 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingVertical: 10 },
  title: { fontSize: 32, fontWeight: '800', color: '#F8FAFC', letterSpacing: -1 },
  monthPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  monthText: { fontSize: 14, fontWeight: '600', color: '#F1F5F9', marginRight: 6 },
  summaryCard: { marginBottom: 32, padding: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: '#94A3B8', marginBottom: 6, fontWeight: '500' },
  summaryValue: { fontSize: 22, fontWeight: '800', color: '#F8FAFC' },
  spent: { color: '#EF4444' },
  remaining: { color: '#10B981' },
  divider: { width: 1, height: '80%', backgroundColor: 'rgba(255, 255, 255, 0.1)', alignSelf: 'center' },
  progressContainer: { alignItems: 'center' },
  progressBg: { width: '100%', height: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 5 },
  progressText: { fontSize: 13, color: '#94A3B8', marginTop: 10, fontWeight: '600' },
  addBudgetButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.1)', 
    borderRadius: 12, 
    paddingVertical: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)'
  },
  addBudgetButtonText: { 
    color: '#A78BFA', 
    fontWeight: '700', 
    marginLeft: 8,
    fontSize: 14
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5 },
  categoryCard: { marginBottom: 16, padding: 16 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  categoryLeft: { flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  categoryName: { fontSize: 16, fontWeight: '700', color: '#F1F5F9' },
  categoryAmounts: { fontSize: 13, color: '#94A3B8', marginTop: 4, fontWeight: '500' },
  categoryPercent: { fontSize: 18, fontWeight: '800' },
  categoryProgress: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 4, overflow: 'hidden' },
  categoryProgressFill: { height: '100%', borderRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 32, padding: 32, width: '90%', maxWidth: 450, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#F8FAFC' },
  input: { 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    fontSize: 16,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
});
