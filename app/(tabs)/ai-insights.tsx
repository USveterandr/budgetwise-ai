import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';

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
    generateInsights();
  }, [transactions, budgets, investments, monthlyIncome, monthlyExpenses]);

  const generateInsights = async () => {
    setLoading(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would be an API call to an AI service
    const newInsights: FinancialInsight[] = [];
    
    // Spending insights
    const spendingRatio = monthlyExpenses / monthlyIncome;
    if (spendingRatio > 0.8) {
      newInsights.push({
        id: '1',
        title: 'High Spending Ratio',
        description: `You're spending ${(spendingRatio * 100).toFixed(0)}% of your income. Consider reviewing your expenses to find areas for reduction.`,
        category: 'spending',
        priority: 'high',
        action: 'Review Transactions'
      });
    }
    
    // Savings insights
    const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome;
    if (savingsRate < 0.2) {
      newInsights.push({
        id: '2',
        title: 'Low Savings Rate',
        description: `Your savings rate is ${(savingsRate * 100).toFixed(1)}%. Financial experts recommend saving at least 20% of your income.`,
        category: 'saving',
        priority: 'medium',
        action: 'Adjust Budget'
      });
    }
    
    // Budget insights
    budgets.forEach(budget => {
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
    });
    
    // Investment insights
    if (investments.length === 0 && user?.plan !== 'Free') {
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