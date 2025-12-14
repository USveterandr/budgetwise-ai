import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors } from '../../constants/Colors';
import { Transaction } from '../../context/FinanceContext';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll: () => void;
}

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Income: 'cash',
  Housing: 'home',
  Food: 'restaurant',
  Transportation: 'car',
  Entertainment: 'game-controller',
  Utilities: 'flash',
  Education: 'school',
  Travel: 'airplane',
  Insurance: 'shield-checkmark',
  Investments: 'trending-up',
  Gifts: 'gift',
  'Personal Care': 'person-circle',
  Subscriptions: 'calendar',
  Charity: 'heart',
  Business: 'briefcase',
  Other: 'wallet',
  Shopping: 'cart',
  Health: 'medkit',
};

export function RecentTransactions({ transactions, onViewAll }: RecentTransactionsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Transactions</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      {transactions.slice(0, 4).map((t) => {
        const icon = categoryIcons[t.category] || 'wallet';
        const isIncome = t.type === 'income';
        return (
          <View key={t.id} style={styles.item}>
            <View style={[styles.iconContainer, isIncome ? styles.incomeIcon : styles.expenseIcon]}>
              <Ionicons name={icon} size={18} color={isIncome ? '#10B981' : '#EF4444'} />
            </View>
            <View style={styles.details}>
              <Text style={styles.description}>{t.description}</Text>
              <Text style={styles.category}>{t.category}</Text>
            </View>
            <Text style={[styles.amount, isIncome ? styles.incomeText : styles.expenseText]}>
              {isIncome ? '+' : '-'}${t.amount.toLocaleString()}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DashboardColors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: DashboardColors.text,
  },
  viewAll: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '500',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DashboardColors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeIcon: { backgroundColor: '#ECFDF5' },
  expenseIcon: { backgroundColor: '#FEF2F2' },
  details: { flex: 1, marginLeft: 12 },
  description: { fontSize: 14, fontWeight: '500', color: DashboardColors.text },
  category: { fontSize: 12, color: DashboardColors.textSecondary, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '600' },
  incomeText: { color: '#10B981' },
  expenseText: { color: '#EF4444' },
});