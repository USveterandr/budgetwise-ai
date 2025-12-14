import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, getSubscriptionPlans } = useAuth();
  const { transactions, budgets, investments, netWorth, monthlyIncome, monthlyExpenses } = useFinance();
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  const plans = getSubscriptionPlans();
  const currentPlan = plans.find(plan => plan.name === user?.plan) || plans[0];

  useEffect(() => {
    // Get last 5 transactions
    const recent = [...transactions].slice(0, 5);
    setRecentTransactions(recent);
  }, [transactions]);

  const getBudgetProgress = (budget: any) => {
    if (budget.limit === 0) return 0;
    return Math.min(100, (budget.spent / budget.limit) * 100);
  };

  const getBudgetColor = (progress: number) => {
    if (progress >= 100) return Colors.error;
    if (progress >= 80) return Colors.warning;
    return Colors.success;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleUpgradePress = () => {
    router.push('/(tabs)/subscription');
  };

  const renderFeatureHighlight = (icon: string, title: string, description: string) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon as any} size={20} color="#FFF" />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.username}>{user?.name || user?.email || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/settings')}>
            <Ionicons name="person-circle" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Plan Banner */}
        <Card style={styles.planBanner}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>{currentPlan.name} Plan</Text>
              <Text style={styles.planPrice}>${currentPlan.price}/{currentPlan.period}</Text>
            </View>
            <Button 
              title={currentPlan.name === 'Enterprise' ? "Max Plan" : "Upgrade"} 
              variant={currentPlan.name === 'Enterprise' ? "outline" : "primary"} 
              size="small"
              onPress={handleUpgradePress}
              disabled={currentPlan.name === 'Enterprise'}
            />
          </View>
          
          {currentPlan.name === 'Business' && (
            <View style={styles.planFeatures}>
              {renderFeatureHighlight("people", "Team Collaboration", "Work with up to 10 team members")}
              {renderFeatureHighlight("bar-chart", "Advanced Analytics", "Detailed financial insights")}
              {renderFeatureHighlight("code", "API Access", "Integrate with your systems")}
            </View>
          )}
        </Card>

        {/* Financial Overview */}
        <View style={styles.overviewGrid}>
          <Card style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Net Worth</Text>
            <Text style={styles.overviewValue}>{formatCurrency(netWorth)}</Text>
            <View style={styles.trendPositive}>
              <Ionicons name="arrow-up" size={12} color={Colors.success} />
              <Text style={styles.trendText}>2.5%</Text>
            </View>
          </Card>
          
          <Card style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Monthly Income</Text>
            <Text style={styles.overviewValue}>{formatCurrency(monthlyIncome)}</Text>
            <View style={styles.trendPositive}>
              <Ionicons name="arrow-up" size={12} color={Colors.success} />
              <Text style={styles.trendText}>5.2%</Text>
            </View>
          </Card>
          
          <Card style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Monthly Expenses</Text>
            <Text style={styles.overviewValue}>{formatCurrency(monthlyExpenses)}</Text>
            <View style={styles.trendNegative}>
              <Ionicons name="arrow-down" size={12} color={Colors.error} />
              <Text style={styles.trendText}>1.8%</Text>
            </View>
          </Card>
        </View>

        {/* Budgets Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budgets</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/budget')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {budgets.length === 0 ? (
            <Text style={styles.emptyText}>No budgets set up yet</Text>
          ) : (
            budgets.slice(0, 3).map((budget) => {
              const progress = getBudgetProgress(budget);
              const color = getBudgetColor(progress);
              
              return (
                <View key={budget.id} style={styles.budgetItem}>
                  <View style={styles.budgetHeader}>
                    <Text style={styles.budgetCategory}>{budget.category}</Text>
                    <Text style={styles.budgetAmount}>
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.progressText}>{Math.round(progress)}% used</Text>
                </View>
              );
            })
          )}
        </Card>

        {/* Recent Transactions */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet</Text>
          ) : (
            recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Ionicons 
                    name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'} 
                    size={16} 
                    color={transaction.type === 'income' ? Colors.success : Colors.error} 
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                </View>
                <Text style={[styles.transactionAmount, transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount]}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
          )}
        </Card>

        {/* Investments */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Investments</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/portfolio')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {investments.length === 0 ? (
            <Text style={styles.emptyText}>No investments yet</Text>
          ) : (
            <View>
              <Text style={styles.investmentsSummary}>
                {investments.length} assets • Total value: {formatCurrency(
                  investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0)
                )}
              </Text>
              {investments.slice(0, 3).map((investment) => (
                <View key={investment.id} style={styles.investmentItem}>
                  <View style={styles.investmentHeader}>
                    <Text style={styles.investmentName}>{investment.name}</Text>
                    <Text style={styles.investmentValue}>
                      {formatCurrency(investment.quantity * investment.currentPrice)}
                    </Text>
                  </View>
                  <Text style={styles.investmentSymbol}>{investment.symbol}</Text>
                  <View style={styles.investmentChange}>
                    <Text style={styles.investmentQuantity}>
                      {investment.quantity} shares
                    </Text>
                    <Text style={styles.investmentGain}>
                      +{formatCurrency((investment.currentPrice - investment.purchasePrice) * investment.quantity)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DashboardColors.background,
  },
  scroll: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcome: {
    fontSize: 16,
    color: DashboardColors.textSecondary,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: DashboardColors.text,
  },
  profileButton: {
    padding: 4,
  },
  planBanner: {
    backgroundColor: Colors.primary,
    marginBottom: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  planPrice: {
    fontSize: 16,
    color: '#F0F0F0',
    marginTop: 4,
  },
  planFeatures: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: '#F0F0F0',
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  overviewCard: {
    flex: 1,
    padding: 16,
  },
  overviewLabel: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: '700',
    color: DashboardColors.text,
    marginBottom: 8,
  },
  trendPositive: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendNegative: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: DashboardColors.textSecondary,
    marginLeft: 4,
  },
  sectionCard: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DashboardColors.text,
  },
  viewAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  budgetItem: {
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: DashboardColors.text,
  },
  budgetAmount: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: DashboardColors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    color: DashboardColors.textSecondary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DashboardColors.border,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DashboardColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: DashboardColors.text,
  },
  transactionCategory: {
    fontSize: 12,
    color: DashboardColors.textSecondary,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  incomeAmount: {
    color: Colors.success,
  },
  expenseAmount: {
    color: Colors.error,
  },
  investmentsSummary: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
    marginBottom: 16,
  },
  investmentItem: {
    marginBottom: 16,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  investmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: DashboardColors.text,
  },
  investmentValue: {
    fontSize: 14,
    fontWeight: '700',
    color: DashboardColors.text,
  },
  investmentSymbol: {
    fontSize: 12,
    color: DashboardColors.textSecondary,
    marginBottom: 8,
  },
  investmentChange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  investmentQuantity: {
    fontSize: 12,
    color: DashboardColors.textSecondary,
  },
  investmentGain: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
});