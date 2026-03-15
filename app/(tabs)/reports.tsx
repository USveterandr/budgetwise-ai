import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { transactions, monthlyIncome, monthlyExpenses } = useFinance();
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const totalExpenses = categoryData.reduce((s, c) => s + c.value, 0);

  const colors = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  const monthlyData = [
    { month: 'Jul', income: 8200, expenses: 5100 },
    { month: 'Aug', income: 8300, expenses: 5300 },
    { month: 'Sep', income: 8400, expenses: 4900 },
    { month: 'Oct', income: 8500, expenses: 5200 },
    { month: 'Nov', income: 8600, expenses: 5400 },
    { month: 'Dec', income: monthlyIncome, expenses: monthlyExpenses },
  ];

  const maxValue = Math.max(...monthlyData.flatMap(d => [d.income, d.expenses]));

  const handleExportReport = () => {
    // Check if user is on Business plan or higher
    const eligiblePlans = ['Business', 'Enterprise'];
    if (!user || !eligiblePlans.includes(user.plan)) {
      Alert.alert(
        'Upgrade Required',
        'Advanced reporting & analytics are only available on Business and Enterprise plans. Please upgrade your subscription.',
        [{ text: 'Upgrade', onPress: () => {} }] // Would navigate to subscription page
      );
      return;
    }

    Alert.alert(
      'Export Report',
      'Choose export format:',
      [
        { text: 'PDF', onPress: () => console.log('Export as PDF') },
        { text: 'Excel', onPress: () => console.log('Export as Excel') },
        { text: 'CSV', onPress: () => console.log('Export as CSV') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleScheduleReport = () => {
    // Check if user is on Business plan or higher
    const eligiblePlans = ['Business', 'Enterprise'];
    if (!user || !eligiblePlans.includes(user.plan)) {
      Alert.alert(
        'Upgrade Required',
        'Scheduled reports are only available on Business and Enterprise plans. Please upgrade your subscription.',
        [{ text: 'Upgrade', onPress: () => {} }] // Would navigate to subscription page
      );
      return;
    }

    Alert.alert(
      'Schedule Report',
      'Choose frequency:',
      [
        { text: 'Daily', onPress: () => console.log('Schedule daily report') },
        { text: 'Weekly', onPress: () => console.log('Schedule weekly report') },
        { text: 'Monthly', onPress: () => console.log('Schedule monthly report') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Reports</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleScheduleReport}>
              <Ionicons name="time" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleExportReport}>
              <Ionicons name="download" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.periodTabs}>
          {(['week', 'month', 'year'] as const).map(p => (
            <TouchableOpacity key={p} style={[styles.periodTab, period === p && styles.periodTabActive]} onPress={() => setPeriod(p)}>
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Income vs Expenses</Text>
          <View style={styles.barChart}>
            {monthlyData.map((d, i) => (
              <View key={i} style={styles.barGroup}>
                <View style={styles.bars}>
                  <View style={[styles.bar, styles.incomeBar, { height: (d.income / maxValue) * 120 }]} />
                  <View style={[styles.bar, styles.expenseBar, { height: (d.expenses / maxValue) * 120 }]} />
                </View>
                <Text style={styles.barLabel}>{d.month}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#10B981' }]} /><Text style={styles.legendText}>Income</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} /><Text style={styles.legendText}>Expenses</Text></View>
          </View>
        </Card>

        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Spending Breakdown</Text>
          <View style={styles.pieContainer}>
            <View style={styles.pieLegend}>
              {categoryData.map((cat, i) => (
                <View key={cat.name} style={styles.pieItem}>
                  <View style={[styles.pieColor, { backgroundColor: colors[i % colors.length] }]} />
                  <View style={styles.pieInfo}>
                    <Text style={styles.pieName}>{cat.name}</Text>
                    <Text style={styles.pieValue}>${cat.value.toLocaleString()} ({Math.round((cat.value / totalExpenses) * 100)}%)</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Monthly Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}><Text style={styles.summaryLabel}>Total Income</Text><Text style={[styles.summaryValue, styles.income]}>${monthlyIncome.toLocaleString()}</Text></View>
            <View style={styles.summaryItem}><Text style={styles.summaryLabel}>Total Expenses</Text><Text style={[styles.summaryValue, styles.expense]}>${monthlyExpenses.toLocaleString()}</Text></View>
            <View style={styles.summaryItem}><Text style={styles.summaryLabel}>Net Savings</Text><Text style={[styles.summaryValue, styles.savings]}>${(monthlyIncome - monthlyExpenses).toLocaleString()}</Text></View>
          </View>
        </Card>

        {user && ['Business', 'Enterprise'].includes(user.plan) && (
          <Card style={styles.advancedCard}>
            <Text style={styles.cardTitle}>Advanced Analytics</Text>
            <Text style={styles.advancedDescription}>
              As a Business or Enterprise user, you have access to advanced analytics features.
            </Text>
            <View style={styles.advancedFeatures}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                <Text style={styles.featureText}>Trend analysis</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                <Text style={styles.featureText}>Forecasting models</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                <Text style={styles.featureText}>Custom reporting periods</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                <Text style={styles.featureText}>Departmental breakdowns</Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DashboardColors.background },
  scroll: { padding: 16 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  title: { fontSize: 24, fontWeight: '700', color: DashboardColors.text },
  actions: { flexDirection: 'row' },
  actionButton: { 
    marginLeft: 16, 
    padding: 8, 
    backgroundColor: DashboardColors.surface, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DashboardColors.border
  },
  periodTabs: { flexDirection: 'row', backgroundColor: DashboardColors.surface, borderRadius: 12, padding: 4, marginBottom: 20 },
  periodTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  periodTabActive: { backgroundColor: Colors.primary },
  periodText: { fontWeight: '600', color: DashboardColors.textSecondary },
  periodTextActive: { color: '#FFF' },
  chartCard: { marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: DashboardColors.text, marginBottom: 16 },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, marginBottom: 12 },
  barGroup: { alignItems: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  bar: { width: 16, borderRadius: 4 },
  incomeBar: { backgroundColor: '#10B981' },
  expenseBar: { backgroundColor: '#EF4444' },
  barLabel: { fontSize: 11, color: DashboardColors.textSecondary, marginTop: 6 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: DashboardColors.textSecondary },
  pieContainer: { paddingVertical: 8 },
  pieLegend: { gap: 12 },
  pieItem: { flexDirection: 'row', alignItems: 'center' },
  pieColor: { width: 16, height: 16, borderRadius: 4, marginRight: 12 },
  pieInfo: { flex: 1 },
  pieName: { fontSize: 14, fontWeight: '500', color: DashboardColors.text },
  pieValue: { fontSize: 13, color: DashboardColors.textSecondary },
  summaryCard: { marginBottom: 20 },
  summaryRow: { gap: 16 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: DashboardColors.border },
  summaryLabel: { fontSize: 14, color: DashboardColors.textSecondary },
  summaryValue: { fontSize: 16, fontWeight: '600' },
  income: { color: '#10B981' },
  expense: { color: '#EF4444' },
  savings: { color: '#7C3AED' },
  advancedCard: { marginBottom: 20 },
  advancedDescription: { 
    fontSize: 14, 
    color: DashboardColors.textSecondary, 
    marginBottom: 16,
    lineHeight: 20
  },
  advancedFeatures: { gap: 12 },
  featureItem: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  featureText: { 
    fontSize: 14, 
    color: DashboardColors.text,
    marginLeft: 8
  }
});