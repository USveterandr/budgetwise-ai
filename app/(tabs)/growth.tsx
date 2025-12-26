import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { useFinance } from '../../context/FinanceContext';

export default function GrowthHub() {
  const router = useRouter();
  const { investments } = useFinance();

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
  const currentValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
  const totalGainLoss = currentValue - totalInvested;

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
            <Text style={styles.title}>Growth</Text>
            <Text style={styles.subtitle}>Build your long-term wealth</Text>
          </View>

          <Card style={styles.portfolioCard}>
            <Text style={styles.label}>Portfolio Value</Text>
            <Text style={styles.value}>{formatCurrency(currentValue)}</Text>
            <View style={styles.gainContainer}>
              <Ionicons 
                name={totalGainLoss >= 0 ? 'trending-up' : 'trending-down'} 
                size={20} 
                color={totalGainLoss >= 0 ? Colors.success : Colors.error} 
              />
              <Text style={[styles.gainText, { color: totalGainLoss >= 0 ? Colors.success : Colors.error }]}>
                {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)} ({((totalGainLoss / (totalInvested || 1)) * 100).toFixed(2)}%)
              </Text>
            </View>
          </Card>

          <View style={styles.hubGrid}>
            <Card style={styles.hubCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="trending-up" size={32} color={Colors.primaryLight} />
              </View>
              <Text style={styles.hubTitle}>Portfolio</Text>
              <Text style={styles.hubDesc}>Monitor your stocks, crypto, and assets in real-time.</Text>
              <Button 
                title="View Holdings" 
                onPress={() => router.push('/(tabs)/portfolio')} 
                variant="dark"
                icon="pie-chart"
                style={styles.hubButton}
              />
            </Card>

            <Card style={styles.hubCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="construct" size={32} color="#F59E0B" />
              </View>
              <Text style={styles.hubTitle}>Strategy</Text>
              <Text style={styles.hubDesc}>Plan your financial future with smart goals.</Text>
              <Button 
                title="Open Planner" 
                onPress={() => router.push('/(tabs)/budget-planning')} 
                variant="dark"
                icon="calendar"
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
  portfolioCard: {
    padding: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  label: {
    fontSize: 14,
    color: '#60A5FA',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  value: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 12,
  },
  gainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gainText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
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
