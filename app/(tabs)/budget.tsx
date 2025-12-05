import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { useFinance } from '../../context/FinanceContext';

export default function BudgetScreen() {
  const { budgets, monthlyExpenses } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState('December 2025');
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  const getCategoryIcon = (cat: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      Housing: 'home', Food: 'restaurant', Transportation: 'car', Entertainment: 'game-controller', Utilities: 'flash',
    };
    return icons[cat] || 'wallet';
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
});
