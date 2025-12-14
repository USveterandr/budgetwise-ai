import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors } from '../../constants/Colors';
import { Transaction } from '../../context/FinanceContext';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Income: 'cash',
  Housing: 'home',
  Food: 'restaurant',
  Transportation: 'car',
  Entertainment: 'game-controller',
  Utilities: 'flash',
  Shopping: 'cart',
  Health: 'medkit',
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
};

export function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const icon = categoryIcons[transaction.category] || 'wallet';
  const isIncome = transaction.type === 'income';

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, isIncome ? styles.incomeIcon : styles.expenseIcon]}>
        <Ionicons name={icon} size={20} color={isIncome ? DashboardColors.income : DashboardColors.expense} />
      </View>
      <View style={styles.details}>
        <Text style={styles.description}>{transaction.description}</Text>
        <Text style={styles.category}>{transaction.category} • {transaction.date}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, isIncome ? styles.incomeText : styles.expenseText]}>
          {isIncome ? '+' : '-'}${transaction.amount.toLocaleString()}
        </Text>
        <TouchableOpacity onPress={() => onDelete(transaction.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={DashboardColors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: DashboardColors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeIcon: { backgroundColor: '#ECFDF5' },
  expenseIcon: { backgroundColor: '#FEF2F2' },
  details: { flex: 1, marginLeft: 12 },
  description: { fontSize: 15, fontWeight: '500', color: DashboardColors.text },
  category: { fontSize: 13, color: DashboardColors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '600' },
  incomeText: { color: DashboardColors.income },
  expenseText: { color: DashboardColors.expense },
  deleteBtn: { marginTop: 4, padding: 4 },
});