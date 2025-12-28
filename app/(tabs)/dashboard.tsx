import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { transactions, netWorth, monthlyIncome, monthlyExpenses } = useFinance();
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  const INDUSTRY_INSIGHTS: Record<string, string> = {
    "Plumber": "Track material costs and billable hours separately to maximize margins.",
    "Electrician": "Monitor copper prices and bulk buy materials when rates are low.",
    "Truck Driver": "Track fuel efficiency and maintenance to reduce operating costs.",
    "Real Estate Agent": "Set aside taxes from every commission check immediately.",
    "Software Developer": "Invest in automation tools to increase your billable output.",
    "Restaurant Owner": "Watch food cost percentage daily to minimize waste.",
    "Retail Store": "Analyze foot traffic to optimize staffing schedules.",
    "Construction": "Track project milestones to manage cash flow gaps.",
    "Consultant": "Focus on recurring revenue to stabilize monthly income.",
    "Landscaping": "Build a cash reserve in peak months for the off-season.",
    "Auto Mechanic": "Upsell preventative maintenance to increase ticket value.",
    "Other": "Focus on building a strong financial foundation."
  };

  const industryInsight = user?.businessIndustry ? INDUSTRY_INSIGHTS[user.businessIndustry] : null;

  useEffect(() => {
    const recent = [...transactions].slice(0, 3);
    setRecentTransactions(recent);
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0, // Simplified for hypnotic look
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.background, '#1E1B4B', Colors.background]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Hypnotic Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcome}>Welcome home,</Text>
              <Text style={styles.username}>
                {user?.name?.split(' ')[0] || 'Visionary'}
                {user?.businessIndustry && user.businessIndustry !== 'Other' ? ` | ${user.businessIndustry}` : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Hero Net Worth Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(6, 182, 212, 0.3)']}
              style={styles.heroGlow}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.heroLabel}>Unified Capital</Text>
            <Text style={styles.heroValue}>{formatCurrency(netWorth)}</Text>
            
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatLabel}>Income</Text>
                <Text style={styles.heroStatValue}>{formatCurrency(monthlyIncome)}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatLabel}>Burn</Text>
                <Text style={[styles.heroStatValue, { color: Colors.error }]}>{formatCurrency(monthlyExpenses)}</Text>
              </View>
            </View>
          </View>

          {/* Industry Insight */}
          {industryInsight && (
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <Card style={{ padding: 16, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="bulb" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
                  <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 14 }}>
                    {user?.businessIndustry} Insight
                  </Text>
                </View>
                <Text style={{ color: '#E2E8F0', fontSize: 14, lineHeight: 20 }}>
                  {industryInsight}
                </Text>
              </Card>
            </View>
          )}

          {/* Quick Hub Access */}
          <View style={styles.hubAperture}>
            <Text style={styles.sectionTitle}>Strategic Aperture</Text>
            <TouchableOpacity 
              style={styles.apertureItem}
              onPress={() => router.push('/(tabs)/strategy')}
            >
              <Card style={styles.apertureCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.apertureContent}>
                  <View style={styles.apertureInfo}>
                    <Text style={styles.apertureTitle}>Strategy Hub</Text>
                    <Text style={styles.apertureSubtitle}>Analyze growth & finance</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
                </View>
              </Card>
            </TouchableOpacity>
          </View>

          {/* Liquid Activity List */}
          <View style={styles.liquidSection}>
            <Text style={styles.sectionTitle}>Liquid Flow</Text>
            <Card style={styles.liquidCard}>
              {recentTransactions.length === 0 ? (
                <Text style={styles.emptyText}>No recent flows detected</Text>
              ) : (
                recentTransactions.map((tx) => (
                  <View key={tx.id} style={styles.flowItem}>
                    <View style={styles.flowIcon}>
                      <Ionicons 
                        name={tx.type === 'income' ? 'arrow-down' : 'arrow-up'} 
                        size={18} 
                        color={tx.type === 'income' ? Colors.success : Colors.error} 
                      />
                    </View>
                    <View style={styles.flowInfo}>
                      <Text style={styles.flowDesc} numberOfLines={1}>{tx.description}</Text>
                      <Text style={styles.flowMeta}>{tx.category}</Text>
                    </View>
                    <Text style={[styles.flowAmount, { color: tx.type === 'income' ? Colors.success : Colors.text }]}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </Text>
                  </View>
                ))
              )}
            </Card>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 24, paddingTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  welcome: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
  username: { fontSize: 32, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  notificationBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center' },
  heroSection: { height: 220, borderRadius: 32, padding: 32, justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(15, 23, 42, 0.4)', marginBottom: 32 },
  heroGlow: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },
  heroLabel: { fontSize: 13, fontWeight: '800', color: Colors.primaryLight, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  heroValue: { fontSize: 48, fontWeight: '900', color: Colors.text, letterSpacing: -1.5, marginBottom: 24 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  heroStatItem: { gap: 2 },
  heroStatLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  heroStatValue: { fontSize: 16, fontWeight: '800', color: Colors.success },
  heroStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
  hubAperture: { marginBottom: 32 },
  apertureItem: { height: 100 },
  apertureCard: { flex: 1, borderRadius: 24, padding: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  apertureContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  apertureTitle: { fontSize: 20, fontWeight: '900', color: Colors.text },
  apertureInfo: { flex: 1 },
  apertureSubtitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginTop: 2 },
  liquidSection: { marginBottom: 20 },
  liquidCard: { padding: 8, borderRadius: 28, backgroundColor: 'rgba(15, 23, 42, 0.3)' },
  flowItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  flowIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.03)', alignItems: 'center', justifyContent: 'center' },
  flowInfo: { flex: 1 },
  flowDesc: { fontSize: 15, fontWeight: '700', color: Colors.text },
  flowMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  flowAmount: { fontSize: 16, fontWeight: '800' },
  emptyText: { textAlign: 'center', color: Colors.textMuted, padding: 32, fontStyle: 'italic' },
});