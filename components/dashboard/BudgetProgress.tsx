import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardColors } from '../../constants/Colors';

interface BudgetProgressProps {
  category: string;
  spent: number;
  limit: number;
}

export function BudgetProgress({ category, spent, limit }: BudgetProgressProps) {
  const percentage = Math.min((spent / limit) * 100, 100);
  const isOverBudget = spent > limit;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.amounts}>
          ${spent.toLocaleString()} of ${limit.toLocaleString()}
        </Text>
      </View>
      <View style={styles.progressBg}>
        <View 
          style={[
            styles.progressFill,
            { width: `${percentage}%` },
            isOverBudget && styles.overBudget
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
    color: DashboardColors.text,
  },
  amounts: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
  },
  progressBg: {
    height: 8,
    backgroundColor: DashboardColors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  overBudget: {
    backgroundColor: DashboardColors.expense,
  },
});
