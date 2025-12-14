import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Transaction, Budget, Investment } from '../../context/FinanceContext';

interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  category: 'spending' | 'saving' | 'investment' | 'budget' | 'debt';
  priority: 'high' | 'medium' | 'low';
  action?: string;
}

export default function AIInsightsScreen() {
  const { user } = useAuth();
  const { transactions, budgets, investments, monthlyIncome, monthlyExpenses } = useFinance();
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeFinancialData();
  }, [transactions, budgets, investments, monthlyIncome, monthlyExpenses]);

  const analyzeFinancialData = async () => {
    if (!user) return;
    
    setLoading(true);
    const newInsights: FinancialInsight[] = [];
    
    // Basic insights for all users
    if (monthlyExpenses > monthlyIncome * 0.8) {
      newInsights.push({
        id: '1',
        title: 'High Expense Ratio',
        description: 'Your expenses are nearing your income. Consider reviewing your spending habits.',
        category: 'spending',
        priority: 'high',
        action: 'Review Budget'
      });
    }
    
    if (budgets.some(b => b.spent > b.limit)) {
      newInsights.push({
        id: '2',
        title: 'Budget Exceeded',
        description: 'You\'ve exceeded one or more budget categories. Immediate attention is recommended.',
        category: 'budget',
        priority: 'high',
        action: 'Adjust Budget'
      });
    }
    
    // Advanced AI insights based on spending patterns
    if (transactions.length > 0) {
      // Analyze spending trends
      const weeklySpending: Record<string, number> = {};
      for (const tx of transactions) {
        if (tx.type === 'expense') {
          const week = new Date(tx.date).toISOString().split('T')[0].substring(0, 7); // Simplified week grouping
          weeklySpending[week] = (weeklySpending[week] || 0) + tx.amount;
        }
      }
      
      const weeks = Object.keys(weeklySpending);
      if (weeks.length > 2) {
        const recentWeek = weeks[weeks.length - 1];
        const previousWeek = weeks[weeks.length - 2];
        const trend = ((weeklySpending[recentWeek] - weeklySpending[previousWeek]) / weeklySpending[previousWeek]) * 100;
        
        if (trend > 10) {
          newInsights.push({
            id: 'spending-trend',
            title: 'Increasing Spending Trend',
            description: `Your spending has increased by ${trend.toFixed(1)}% compared to last week. Consider reviewing your recent purchases.`,
            category: 'spending',
            priority: 'high',
            action: 'Analyze Trends'
          });
        }
      }
      
      // Category-based insights
      const categoryTotals: Record<string, number> = {};
      for (const tx of transactions) {
        if (tx.type === 'expense') {
          categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
        }
      }
      
      const highestCategory = Object.keys(categoryTotals).reduce((a, b) => 
        categoryTotals[a] > categoryTotals[b] ? a : b
      );
      
      if (categoryTotals[highestCategory] > monthlyExpenses * 0.3) {
        newInsights.push({
          id: 'category-dominance',
          title: 'High Spending in One Category',
          description: `${highestCategory} accounts for ${(categoryTotals[highestCategory] / monthlyExpenses * 100).toFixed(1)}% of your total spending. Consider setting a specific budget for this category.`,
          category: 'budget',
          priority: 'medium',
          action: 'Set Category Budget'
        });
      }
    }
    
    // Budget insights
    for (const budget of budgets) {
      const percentage = (budget.spent / budget.limit) * 100;
      if (percentage > 90) {
        newInsights.push({
          id: `budget-${budget.id}`,
          title: 'Budget Threshold Exceeded',
          description: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. Consider reducing spending in this category.`,
          category: 'budget',
          priority: 'high',
          action: 'Adjust Budget'
        });
      } else if (percentage > 70) {
        newInsights.push({
          id: `budget-${budget.id}-warning`,
          title: 'Budget Nearing Limit',
          description: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. Monitor your spending closely.`,
          category: 'budget',
          priority: 'medium'
        });
      }
    }
    
    // Investment insights (Advanced AI)
    if (investments.length > 0) {
      const totalInvested = investments.reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
      const currentValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
      const totalGainLoss = currentValue - totalInvested;
      const gainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
      
      if (gainLossPercentage < -5) {
        newInsights.push({
          id: 'investment-loss',
          title: 'Portfolio Underperforming',
          description: `Your investment portfolio is down ${Math.abs(gainLossPercentage).toFixed(1)}%. Consider rebalancing or reviewing your asset allocation.`,
          category: 'investment',
          priority: 'high',
          action: 'Review Portfolio'
        });
      } else if (gainLossPercentage > 10) {
        newInsights.push({
          id: 'investment-gain',
          title: 'Portfolio Performing Well',
          description: `Great job! Your investments are up ${gainLossPercentage.toFixed(1)}%. Consider taking some profits or reinvesting gains.`,
          category: 'investment',
          priority: 'medium',
          action: 'Rebalance Portfolio'
        });
      }
      
      // Diversification analysis
      const investmentTypes: Record<string, number> = {};
      for (const inv of investments) {
        investmentTypes[inv.type] = (investmentTypes[inv.type] || 0) + (inv.quantity * inv.currentPrice);
      }
      
      const totalValue = Object.values(investmentTypes).reduce((a, b) => a + b, 0);
      const stockAllocation = (investmentTypes['stock'] || 0) / totalValue;
      
      if (stockAllocation > 0.8) {
        newInsights.push({
          id: 'diversification-warning',
          title: 'Low Portfolio Diversification',
          description: `${(stockAllocation * 100).toFixed(1)}% of your portfolio is in stocks. Consider diversifying into bonds or other asset classes to reduce risk.`,
          category: 'investment',
          priority: 'medium',
          action: 'Diversify Holdings'
        });
      }
    } else if (user?.plan === 'Starter') {
      newInsights.push({
        id: '3',
        title: 'Opportunity for Investment',
        description: 'Consider investing to grow your wealth. Even small amounts can compound significantly over time.',
        category: 'investment',
        priority: 'medium',
        action: 'Explore Investments'
      });
    }
    
    // Generic insights based on transaction patterns
    const recentTransactions = transactions.slice(0, 10);
    const diningOutCount = recentTransactions.filter(t => 
      t.category.toLowerCase().includes('food') || 
      t.category.toLowerCase().includes('restaurant')
    ).length;
    
    if (diningOutCount > 5) {
      newInsights.push({
        id: '4',
        title: 'Frequent Dining Out',
        description: 'You\'ve dined out frequently recently. Cooking at home more often could save you significant money.',
        category: 'spending',
        priority: 'medium',
        action: 'Track Food Expenses'
      });
    }
    
    // Tax preparation assistance insight
    const monthsWithTransactions = [...new Set(transactions.map(t => t.date.substring(0, 7)))];
    if (monthsWithTransactions.length >= 12) {
      newInsights.push({
        id: 'tax-preparation',
        title: 'Tax Preparation Assistance Available',
        description: 'With a full year of transactions recorded, our tax preparation tools can help you maximize deductions and prepare for filing season.',
        category: 'budget',
        priority: 'medium',
        action: 'Prepare Taxes'
      });
    }
    
    setInsights(newInsights);
    setLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spending': return 'card';
      case 'saving': return 'cash';
      case 'investment': return 'trending-up';
      case 'budget': return 'pie-chart';
      case 'debt': return 'alert-circle';
      default: return 'information-circle';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'spending': return Colors.error;
      case 'saving': return Colors.success;
      case 'investment': return Colors.primary;
      case 'budget': return Colors.warning;
      case 'debt': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: '#FEE2E2', text: '#991B1B' };
      case 'medium': return { bg: '#FEF3C7', text: '#92400E' };
      case 'low': return { bg: '#DBEAFE', text: '#1E40AF' };
      default: return { bg: '#E5E7EB', text: '#374151' };
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>AI Financial Insights</Text>
            <Text style={styles.subtitle}>Personalized recommendations powered by artificial intelligence</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Analyzing your financial data...</Text>
            </View>
          ) : insights.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No insights available at the moment. Continue using the app to generate personalized recommendations.</Text>
            </Card>
          ) : (
            <View style={styles.insightsContainer}>
              {insights.map((insight) => (
                <Card key={insight.id} style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <View style={[styles.categoryIcon, { backgroundColor: `${getCategoryColor(insight.category)}20` }]}>
                      <Ionicons 
                        name={getCategoryIcon(insight.category) as any} 
                        size={20} 
                        color={getCategoryColor(insight.category)} 
                      />
                    </View>
                    <View style={styles.insightTitleContainer}>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(insight.priority).bg }]}>
                        <Text style={[styles.priorityText, { color: getPriorityColor(insight.priority).text }]}>
                          {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                  {insight.action && (
                    <View style={styles.actionContainer}>
                      <Text style={styles.actionText}>{insight.action}</Text>
                      <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  insightsContainer: {
    marginBottom: 20,
  },
  insightCard: {
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  insightDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});