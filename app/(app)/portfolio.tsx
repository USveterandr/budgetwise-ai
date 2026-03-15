import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../AuthContext'; // Using the main AuthContext
import { useFinance } from '../../context/FinanceContext';
import { Investment } from '../../types';

const { width } = Dimensions.get('window');

export default function PortfolioScreen() {
  const router = useRouter();
  const { investments, loading } = useFinance();
  const { userProfile } = useAuth() as any;
  const [showAddModal, setShowAddModal] = useState(false);

  // Calculate portfolio metrics
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
  const currentValue = investments.reduce((sum, inv) => sum + (inv.quantity * (inv.currentPrice || inv.purchasePrice)), 0);
  const totalGainLoss = currentValue - totalInvested;
  const gainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const calculateDiversificationScore = () => {
    if (investments.length === 0) return 0;
    const typeDistribution: Record<string, number> = {};
    investments.forEach(inv => {
      typeDistribution[inv.type] = (typeDistribution[inv.type] || 0) + (inv.quantity * (inv.currentPrice || inv.purchasePrice));
    });
    const totalValue = Object.values(typeDistribution).reduce((a, b) => a + b, 0);
    const percentages = Object.values(typeDistribution).map(val => val / totalValue);
    const entropy = -percentages.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);
    const maxEntropy = Math.log2(Math.max(2, Object.keys(typeDistribution).length));
    return Math.min(100, Math.round((entropy / maxEntropy) * 100));
  };

  const diversificationScore = calculateDiversificationScore();

  const investmentTypes = [
    { type: 'stock', label: 'Stocks', icon: 'trending-up-outline' },
    { type: 'etf', label: 'ETFs', icon: 'layers-outline' },
    { type: 'crypto', label: 'Crypto', icon: 'logo-bitcoin' },
    { type: 'real_estate', label: 'Property', icon: 'home-outline' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Luxury Background */}
      <LinearGradient colors={['#09090b', '#1c1917', '#000000']} style={StyleSheet.absoluteFill} />
      <View style={[styles.orb, styles.orb1]} />
      
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.gold} />
            </TouchableOpacity>
            <Text style={styles.title}>Asset Portfolio</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert('Premium Feature', 'Investment management is part of the Professional plan.')}>
              <Ionicons name="add" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          {/* Luxury Summary Card */}
          <View style={styles.card}>
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.15)', 'rgba(0,0,0,0.4)']}
              style={styles.cardGradient}
            >
              <Text style={styles.summaryLabel}>Total Net Liquidity</Text>
              <Text style={styles.summaryValue}>
                {userProfile?.currency || '$'}{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              
              <View style={styles.gainRow}>
                <Ionicons 
                  name={totalGainLoss >= 0 ? "trending-up" : "trending-down"} 
                  size={16} 
                  color={totalGainLoss >= 0 ? '#10B981' : '#EF4444'} 
                />
                <Text style={[styles.gainText, { color: totalGainLoss >= 0 ? '#10B981' : '#EF4444' }]}>
                  {totalGainLoss >= 0 ? '+' : ''}${Math.abs(totalGainLoss).toFixed(2)} ({gainLossPercentage.toFixed(2)}%)
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.scoreSection}>
                <View style={styles.scoreLabelRow}>
                  <Text style={styles.scoreLabel}>Diversification Index</Text>
                  <Text style={styles.scoreValue}>{diversificationScore}/100</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${diversificationScore}%` }]} />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Allocation Grid */}
          <Text style={styles.sectionTitle}>Strategic Allocation</Text>
          <View style={styles.grid}>
            {investmentTypes.map((item) => (
              <View key={item.type} style={styles.gridItem}>
                <View style={styles.gridIcon}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.gold} />
                </View>
                <Text style={styles.gridLabel}>{item.label}</Text>
                <Text style={styles.gridValue}>0.0%</Text>
              </View>
            ))}
          </View>

          {/* Holdings List */}
          <View style={styles.holdingsHeader}>
            <Text style={styles.sectionTitle}>Holdings</Text>
            <TouchableOpacity>
              <Text style={styles.filterText}>Sort by Value</Text>
            </TouchableOpacity>
          </View>

          {investments.length > 0 ? (
            investments.map((inv) => (
              <View key={inv.id} style={styles.holdingItem}>
                <View style={styles.holdingInfo}>
                  <Text style={styles.holdingName}>{inv.name}</Text>
                  <Text style={styles.holdingSymbol}>{inv.symbol} • {inv.quantity} shares</Text>
                </View>
                <View style={styles.holdingPrice}>
                  <Text style={styles.priceValue}>${(inv.quantity * (inv.currentPrice || inv.purchasePrice)).toFixed(2)}</Text>
                  <Text style={[styles.priceChange, { color: (inv.currentPrice >= inv.purchasePrice) ? '#10B981' : '#EF4444' }]}>
                    {((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="documents-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No assets detected in your current portfolio.</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  center: { justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 0 : 40 },
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.15 },
  orb1: { width: 400, height: 400, backgroundColor: Colors.gold, top: -150, right: -100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: Colors.white, letterSpacing: 0.5 },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gold, justifyContent: 'center', alignItems: 'center' },

  card: { borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(20, 20, 23, 0.6)', marginBottom: 32 },
  cardGradient: { padding: 32 },
  summaryLabel: { fontSize: 13, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  summaryValue: { fontSize: 36, fontWeight: '300', color: Colors.gold, marginBottom: 12 },
  gainRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gainText: { fontSize: 14, fontWeight: '600' },
  
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 24 },
  
  scoreSection: { gap: 12 },
  scoreLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scoreLabel: { fontSize: 13, color: Colors.textMuted },
  scoreValue: { fontSize: 14, color: Colors.platinum, fontWeight: '600' },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: 3 },

  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  gridItem: { width: (width - 60) / 2, padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  gridIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  gridLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  gridValue: { fontSize: 18, fontWeight: '600', color: Colors.white },

  holdingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  filterText: { color: Colors.gold, fontSize: 12, fontWeight: '600' },

  holdingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  holdingName: { fontSize: 16, fontWeight: '600', color: Colors.white, marginBottom: 4 },
  holdingSymbol: { fontSize: 12, color: Colors.textMuted },
  holdingPrice: { alignItems: 'flex-end' },
  priceValue: { fontSize: 16, color: Colors.white, fontWeight: '600', marginBottom: 4 },
  priceChange: { fontSize: 12, fontWeight: '600' },

  emptyState: { alignItems: 'center', padding: 40, gap: 16 },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 }
});
