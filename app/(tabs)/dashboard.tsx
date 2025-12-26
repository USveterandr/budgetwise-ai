import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { transactions, investments, netWorth, monthlyIncome, monthlyExpenses } = useFinance();
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    // Get last 5 transactions
    const recent = [...transactions].slice(0, 5);
    setRecentTransactions(recent);
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcome}>Welcome back,</Text>
              <Text style={styles.username}>{user?.name || user?.email || 'User'}</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
              <Ionicons name="person-circle" size={36} color={Colors.primaryLight} />
            </TouchableOpacity>
          </View>

          {/* Financial Overview Card */}
          <Card style={styles.mainOverviewCard}>
            <LinearGradient 
              colors={['rgba(124, 58, 237, 0.2)', 'rgba(79, 70, 229, 0.2)']} 
              style={StyleSheet.absoluteFill} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.mainOverviewLabel}>Total Net Worth</Text>
            <Text style={styles.mainOverviewValue}>{formatCurrency(netWorth)}</Text>
            
            <View style={styles.overviewStats}>
              <View style={styles.overviewStatItem}>
                <Ionicons name="arrow-down-circle" size={16} color={Colors.success} />
                <Text style={styles.overviewStatValue}>{formatCurrency(monthlyIncome)}</Text>
              </View>
              <View style={styles.overviewStatItem}>
                <Ionicons name="arrow-up-circle" size={16} color={Colors.error} />
                <Text style={styles.overviewStatValue}>{formatCurrency(monthlyExpenses)}</Text>
              </View>
            </View>
          </Card>

          {/* Quick Actions - Simple & Large */}
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}
              onPress={() => router.push('/(tabs)/receipts')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="camera" size={32} color={Colors.primaryLight} />
              </View>
              <Text style={styles.actionButtonText}>Scan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}
              onPress={() => router.push('/(tabs)/ai-advisor')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="sparkles" size={32} color="#10B981" />
              </View>
              <Text style={styles.actionButtonText}>AI Advice</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}
              onPress={() => router.push('/(tabs)/finance')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="add-circle" size={32} color="#3B82F6" />
              </View>
              <Text style={styles.actionButtonText}>Activity</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Activity Summary */}
          <Card style={styles.summaryCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/finance')}>
                <Ionicons name="chevron-forward" size={20} color={Colors.primaryLight} />
              </TouchableOpacity>
            </View>
            
            {recentTransactions.length === 0 ? (
              <Text style={styles.emptyText}>No recent activity</Text>
            ) : (
              recentTransactions.slice(0, 3).map((transaction) => (
                <View key={transaction.id} style={styles.simpleTransactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.itemDescription} numberOfLines={1}>{transaction.description}</Text>
                    <Text style={styles.itemCategory}>{transaction.category}</Text>
                  </View>
                  <Text style={[styles.itemAmount, transaction.type === 'income' ? styles.incomeText : styles.expenseText]}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))
            )}
          </Card>

          {/* Portfolio Pulse */}
          <Card style={styles.summaryCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Investment Growth</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/growth')}>
                <Ionicons name="chevron-forward" size={20} color={Colors.primaryLight} />
              </TouchableOpacity>
            </View>
            <View style={styles.growthContainer}>
              <View>
                <Text style={styles.growthLabel}>Portfolio Value</Text>
                <Text style={styles.growthValue}>
                  {formatCurrency(investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0))}
                </Text>
              </View>
              <View style={styles.growthBadge}>
                <Ionicons name="trending-up" size={14} color={Colors.success} />
                <Text style={styles.growthPercentage}>+4.2%</Text>
              </View>
            </View>
          </Card>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scroll: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  welcome: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  username: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  profileButton: {
    padding: 4,
  },
  mainOverviewCard: {
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 0,
    borderRadius: 24,
  },
  mainOverviewLabel: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  mainOverviewValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 20,
  },
  overviewStats: {
    flexDirection: 'row',
    gap: 16,
  },
  overviewStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  overviewStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    height: 120, // Taller buttons for prominence
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  summaryCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  simpleTransactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  itemCategory: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  incomeText: { color: Colors.success },
  expenseText: { color: Colors.error },
  growthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  growthLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '600',
  },
  growthValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  growthPercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});