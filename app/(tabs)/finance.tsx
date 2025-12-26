import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { useFinance } from '../../context/FinanceContext';

export default function FinanceHub() {
  const router = useRouter();
  const { netWorth, monthlyIncome, monthlyExpenses } = useFinance();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#13112B', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Finance</Text>
            <Text style={styles.subtitle}>Manage your cash flow and budgets</Text>
          </View>

          <Card style={styles.netWorthCard}>
            <Text style={styles.label}>Total Net Worth</Text>
            <Text style={styles.value}>{formatCurrency(netWorth)}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Monthly Income</Text>
                <Text style={[styles.statValue, { color: Colors.success }]}>{formatCurrency(monthlyIncome)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Monthly Expenses</Text>
                <Text style={[styles.statValue, { color: Colors.error }]}>{formatCurrency(monthlyExpenses)}</Text>
              </View>
            </View>
          </Card>

          <View style={styles.hubGrid}>
            <Card style={styles.hubCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="swap-horizontal" size={32} color={Colors.primaryLight} />
              </View>
              <Text style={styles.hubTitle}>Transactions</Text>
              <Text style={styles.hubDesc}>Track every dollar coming in and out.</Text>
              <Button 
                title="View History" 
                onPress={() => router.push('/(tabs)/transactions')} 
                variant="dark"
                icon="list"
                style={styles.hubButton}
              />
            </Card>

            <Card style={styles.hubCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="pie-chart" size={32} color="#10B981" />
              </View>
              <Text style={styles.hubTitle}>Budgets</Text>
              <Text style={styles.hubDesc}>Set limits and stay on track this month.</Text>
              <Button 
                title="Manage Budgets" 
                onPress={() => router.push('/(tabs)/budget')} 
                variant="dark"
                icon="options"
                style={styles.hubButton}
              />
            </Card>
          </View>

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
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 4,
  },
  netWorthCard: {
    padding: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  label: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  value: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  hubGrid: {
    gap: 16,
  },
  hubCard: {
    padding: 24,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  hubTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  hubDesc: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 20,
  },
  hubButton: {
    width: '100%',
  },
});
