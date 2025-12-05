import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { SummaryCard } from '../../components/dashboard/SummaryCard';
import { BudgetProgress } from '../../components/dashboard/BudgetProgress';
import { InsightCard } from '../../components/dashboard/InsightCard';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { RecentTransactions } from '../../components/dashboard/RecentTransactions';
import { AddTransactionModal } from '../../components/AddTransactionModal';
import { EnhancedReceiptScanner } from '../../components/receipts/EnhancedReceiptScanner';
import { ReceiptData } from '../../utils/ocrUtils';
import { useReceiptScanner } from '../../hooks/useReceiptScanner';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { useNotification } from '../../context/NotificationContext';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { netWorth, monthlyIncome, monthlyExpenses, budgets, transactions, addTransaction, refreshData, loading } = useFinance();
  const { unreadCount } = useNotification();
  const [showAddModal, setShowAddModal] = useState(false);
  const { showScanner, setShowScanner, scannerTransaction, handleReceiptScan, handleScannerCancel } = useReceiptScanner();
  const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;

  useEffect(() => {
    if (user?.id) refreshData(user.id);
  }, [user?.id]);

  const summaryData = [
    { title: 'Net Worth', value: `$${netWorth.toLocaleString()}`, change: '+2.5%', changeType: 'positive' as const, icon: 'wallet' as const, iconColor: '#3B82F6' },
    { title: 'Income', value: `$${monthlyIncome.toLocaleString()}`, change: '+1.2%', changeType: 'positive' as const, icon: 'arrow-down' as const, iconColor: '#10B981' },
    { title: 'Expenses', value: `$${monthlyExpenses.toLocaleString()}`, change: '-0.8%', changeType: 'negative' as const, icon: 'arrow-up' as const, iconColor: '#EF4444' },
    { title: 'Savings', value: `${savingsRate}%`, change: '+3.1%', changeType: 'positive' as const, icon: 'trending-up' as const, iconColor: '#7C3AED' },
  ];

  const quickActions = [
    { icon: 'add-circle' as const, label: 'Add', color: Colors.primary, onPress: () => setShowAddModal(true) },
    { icon: 'swap-horizontal' as const, label: 'Transfer', color: '#3B82F6', onPress: () => {} },
    { icon: 'receipt' as const, label: 'Scan', color: '#10B981', onPress: () => setShowScanner(true) },
    { icon: 'trending-up' as const, label: 'Invest', color: '#7C3AED', onPress: () => router.push('/(tabs)/portfolio') },
    { icon: 'stats-chart' as const, label: 'Reports', color: '#F59E0B', onPress: () => router.push('/(tabs)/reports') },
  ];

  const handleAddTransaction = async (tx: { description: string; amount: number; category: string; type: 'income' | 'expense' }) => {
    await addTransaction({ ...tx, date: new Date().toISOString().split('T')[0] });
  };

  // Convert ReceiptData to the format expected by AddTransactionModal
  const convertedScannerTransaction = scannerTransaction ? {
    description: scannerTransaction.description,
    amount: scannerTransaction.amount,
    category: scannerTransaction.category,
    type: 'expense' as const
  } : undefined;

  if (loading) {
    return <SafeAreaView style={styles.container}><View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>Loading your data...</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View><Text style={styles.greeting}>Welcome back,</Text><Text style={styles.name}>{user?.name || 'User'}</Text></View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/(tabs)/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={DashboardColors.text} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount.toString()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <QuickActions actions={quickActions} />
        <View style={styles.summaryGrid}>{summaryData.map((item, i) => <SummaryCard key={i} {...item} />)}</View>
        <RecentTransactions transactions={transactions} onViewAll={() => router.push('/(tabs)/transactions')} />

        <Card style={styles.section}>
          <View style={styles.sectionHeader}><Ionicons name="pie-chart" size={20} color="#3B82F6" /><Text style={styles.sectionTitle}>Budget Overview</Text></View>
          {budgets.length > 0 ? budgets.slice(0, 3).map((b) => <BudgetProgress key={b.id} category={b.category} spent={b.spent} limit={b.limit} />) : <Text style={styles.emptyText}>No budgets set. Add your first budget!</Text>}
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}><Ionicons name="bulb" size={20} color="#7C3AED" /><Text style={styles.sectionTitle}>AI Insights</Text></View>
          <InsightCard title="Spending Alert" content="Track your expenses to get personalized insights." type="info" />
          <InsightCard title="Savings Tip" content="Set up budgets to monitor your spending habits." type="success" />
        </Card>
      </ScrollView>
      
      {/* Receipt Scanner Modal */}
      <Modal visible={showScanner} animationType="slide" onRequestClose={handleScannerCancel}>
        <EnhancedReceiptScanner 
          onScanComplete={handleReceiptScan} 
          onCancel={handleScannerCancel} 
        />
      </Modal>
      
      {/* Add Transaction Modal */}
      <AddTransactionModal 
        visible={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          handleScannerCancel();
        }} 
        onAdd={(tx) => {
          handleAddTransaction(tx);
          setShowAddModal(false);
        }}
        prefilledData={convertedScannerTransaction}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DashboardColors.background },
  scroll: { padding: 16 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: DashboardColors.textSecondary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 14, color: DashboardColors.textSecondary },
  name: { fontSize: 24, fontWeight: '700', color: DashboardColors.text },
  notifBtn: { position: 'relative', padding: 8 },
  notifBadge: { 
    position: 'absolute', 
    top: 4, 
    right: 4, 
    minWidth: 18, 
    height: 18, 
    borderRadius: 9, 
    backgroundColor: '#EF4444', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  notifBadgeText: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: '#FFFFFF'
  },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  section: { marginTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: DashboardColors.text, marginLeft: 10 },
  emptyText: { color: DashboardColors.textSecondary, textAlign: 'center', paddingVertical: 20 },
});