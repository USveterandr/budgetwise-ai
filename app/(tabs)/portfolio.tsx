import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { Investment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AddInvestmentModal } from '../../components/investments/AddInvestmentModal';
import { EditInvestmentModal } from '../../components/investments/EditInvestmentModal';

export default function PortfolioScreen() {
  const router = useRouter();
  const { investments } = useFinance();
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showLimitReached, setShowLimitReached] = useState(false);

  // Calculate portfolio metrics
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
  const currentValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
  const totalGainLoss = currentValue - totalInvested;
  const gainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
  
  // Calculate diversification score (0-100)
  const calculateDiversificationScore = () => {
    if (investments.length === 0) return 0;
    
    const typeDistribution: Record<string, number> = {};
    investments.forEach(inv => {
      typeDistribution[inv.type] = (typeDistribution[inv.type] || 0) + 
        (inv.quantity * inv.currentPrice);
    });
    
    const totalValue = Object.values(typeDistribution).reduce((a, b) => a + b, 0);
    const percentages = Object.values(typeDistribution).map(val => val / totalValue);
    
    // Higher entropy means better diversification
    const entropy = -percentages.reduce((sum, p) => sum + (p * Math.log2(p)), 0);
    const maxEntropy = Math.log2(Object.keys(typeDistribution).length);
    
    return maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 100) : 100;
  };
  
  // Determine investment limit based on user plan
  const getInvestmentLimit = () => {
    switch (user?.plan) {
      case 'Starter':
        return 5;
      case 'Professional':
        return 20;
      case 'Business':
        return Infinity;
      case 'Enterprise':
        return Infinity;
      default:
        return 5;
    }
  };
  
  const investmentLimit = getInvestmentLimit();
  const reachedLimit = investments.length >= investmentLimit && user?.plan === 'Starter';

  const investmentTypes = [
    { type: 'stock', label: 'Stocks', icon: 'trending-up' },
    { type: 'etf', label: 'ETFs', icon: 'stats-chart' },
    { type: 'bond', label: 'Bonds', icon: 'bar-chart' },
    { type: 'crypto', label: 'Crypto', icon: 'logo-bitcoin' },
    { type: 'real_estate', label: 'Real Estate', icon: 'home' },
    { type: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
  ];
  
  const diversificationScore = calculateDiversificationScore();

  const getTypeStats = (type: string) => {
    const filtered = investments.filter(inv => inv.type === type);
    const invested = filtered.reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
    const current = filtered.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
    const gainLoss = current - invested;
    const percentage = invested > 0 ? (gainLoss / invested) * 100 : 0;
    
    return { count: filtered.length, invested, current, gainLoss, percentage };
  };

  const handleEditInvestment = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowEditModal(true);
  };

  const handleInvestmentUpdated = () => {
    // Refresh or update the UI as needed
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#13112B', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Portfolio</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => {
                if (reachedLimit) {
                  setShowLimitReached(true);
                } else {
                  setShowAddModal(true);
                }
              }}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Portfolio Summary */}
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Invested</Text>
                <Text style={styles.summaryValue}>${totalInvested.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Current Value</Text>
                <Text style={[styles.summaryValue, { color: currentValue >= totalInvested ? '#10B981' : '#EF4444' }]}>
                  ${currentValue.toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Gain/Loss</Text>
                <Text style={[styles.summaryValue, { color: totalGainLoss >= 0 ? '#10B981' : '#EF4444' }]}>
                  {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Return</Text>
                <Text style={[styles.summaryValue, { color: gainLossPercentage >= 0 ? '#10B981' : '#EF4444' }]}>
                  {gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%
                </Text>
              </View>
            </View>
            <View style={styles.diversificationRow}>
              <Text style={styles.diversificationLabel}>Diversification Score</Text>
              <View style={styles.scoreContainer}>
                <View style={styles.scoreBarBackground}>
                  <View style={[styles.scoreBarFill, { width: `${diversificationScore}%`, backgroundColor: diversificationScore > 70 ? '#10B981' : diversificationScore > 40 ? '#F59E0B' : '#EF4444' }]} />
                </View>
                <Text style={styles.scoreText}>{diversificationScore}/100</Text>
              </View>
            </View>
            {user?.plan === 'Starter' && (
              <View style={styles.limitInfo}>
                <Text style={styles.limitText}>
                  {investments.length} of {investmentLimit} slots used
                </Text>
                {reachedLimit && (
                  <TouchableOpacity onPress={() => router.push('/(tabs)/subscription')}>
                    <Text style={styles.upgradeText}>
                      Upgrade for more investment tracking
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Card>

          {/* Investment Types */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Asset Types</Text>
            </View>
            <View style={styles.typesGrid}>
              {investmentTypes.map((item) => {
                const stats = getTypeStats(item.type);
                return (
                  <Card key={item.type} style={styles.typeCard}>
                    <View style={styles.typeHeader}>
                      <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                      <Text style={styles.typeLabel}>{item.label}</Text>
                    </View>
                    <Text style={styles.typeCount}>{stats.count} holdings</Text>
                    <Text style={[styles.typeReturn, { color: stats.gainLoss >= 0 ? '#10B981' : '#EF4444' }]}>
                      {stats.gainLoss >= 0 ? '+' : ''}${stats.gainLoss.toFixed(2)}
                    </Text>
                  </Card>
                );
              })}
            </View>
          </View>

          {/* Investments List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Holdings</Text>
              <TouchableOpacity style={styles.filterButton} onPress={() => Alert.alert('Sort Options', 'Choose sorting method')}>
                <Ionicons name="funnel" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            {investments.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="folder-open" size={48} color="#475569" />
                <Text style={styles.emptyText}>No investments yet</Text>
                <Text style={styles.emptySubtext}>Add your first investment to get started</Text>
                <Button 
                  title="Add Investment" 
                  onPress={() => reachedLimit ? setShowLimitReached(true) : setShowAddModal(true)} 
                  style={{ marginTop: 24, width: '100%' }} 
                />
              </Card>
            ) : (
              <View>
                {investments.map((investment) => (
                  <InvestmentItem 
                    key={investment.id} 
                    investment={investment} 
                    onEdit={() => handleEditInvestment(investment)} 
                  />
                ))}
              </View>
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Add Investment Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <AddInvestmentModal 
          visible={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          onAdd={handleInvestmentUpdated} 
        />
      </Modal>

      {/* Edit Investment Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        {selectedInvestment && (
          <EditInvestmentModal 
            visible={showEditModal} 
            onClose={() => setShowEditModal(false)} 
            investment={selectedInvestment}
            onUpdate={handleInvestmentUpdated} 
          />
        )}
      </Modal>
      
      {/* Limit Reached Modal */}
      <Modal visible={showLimitReached} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Limit Reached</Text>
              <TouchableOpacity onPress={() => setShowLimitReached(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>
              You've reached the maximum number of investments for your Starter plan. 
              Upgrade to Professional plan to track more holdings.
            </Text>
            <Button 
              title="Upgrade to Pro" 
              onPress={() => {
                setShowLimitReached(false);
                router.push('/(tabs)/subscription');
              }} 
              style={{ marginTop: 32 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InvestmentItem({ investment, onEdit }: { investment: Investment; onEdit: () => void }) {
  const gainLoss = (investment.currentPrice - investment.purchasePrice) * investment.quantity;
  const gainLossPercentage = ((investment.currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100;
  
  return (
    <Card style={styles.investmentItem}>
      <View style={styles.investmentHeader}>
        <View>
          <Text style={styles.investmentName}>{investment.name}</Text>
          <Text style={styles.investmentSymbol}>{investment.symbol}</Text>
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.investmentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity</Text>
          <Text style={styles.detailValue}>{investment.quantity}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.detailValue}>${investment.currentPrice.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.investmentPerformance}>
        <View>
          <Text style={styles.detailLabel}>Holding Value</Text>
          <Text style={styles.detailValue}>${(investment.quantity * investment.currentPrice).toFixed(2)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.performanceValue, { color: gainLoss >= 0 ? '#10B981' : '#EF4444' }]}>
            {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
          </Text>
          <Text style={[styles.performancePercent, { color: gainLoss >= 0 ? '#10B981' : '#EF4444' }]}>
            {gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingVertical: 10 },
  title: { fontSize: 30, fontWeight: '800', color: '#F8FAFC', letterSpacing: -1 },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  summaryCard: { marginBottom: 32, padding: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 13, color: '#94A3B8', marginBottom: 6, fontWeight: '500' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1.5 },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: { width: '48%', padding: 16, minHeight: 120, justifyContent: 'space-between' },
  typeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  typeLabel: { fontSize: 15, fontWeight: '700', color: '#F1F5F9', marginLeft: 10 },
  typeCount: { fontSize: 13, color: '#64748B', marginBottom: 6, fontWeight: '500' },
  typeReturn: { fontSize: 16, fontWeight: '800' },
  emptyCard: { alignItems: 'center', padding: 40, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#F8FAFC', marginTop: 20 },
  emptySubtext: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  investmentItem: { marginBottom: 16, padding: 16 },
  investmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  investmentName: { fontSize: 17, fontWeight: '800', color: '#F8FAFC', letterSpacing: -0.3 },
  investmentSymbol: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '600' },
  editButton: { padding: 4 },
  investmentDetails: { marginBottom: 16, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#F1F5F9' },
  investmentPerformance: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)' },
  performanceValue: { fontSize: 18, fontWeight: '800' },
  performancePercent: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  limitInfo: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)' },
  limitText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  upgradeText: { fontSize: 13, color: '#A78BFA', marginTop: 6, fontWeight: '700' },
  diversificationRow: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)' },
  diversificationLabel: { fontSize: 13, color: '#94A3B8', marginBottom: 12, fontWeight: '500' },
  scoreContainer: { flexDirection: 'row', alignItems: 'center' },
  scoreBarBackground: { flex: 1, height: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  scoreText: { fontSize: 14, fontWeight: '800', color: '#F8FAFC', marginLeft: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 32, padding: 32, width: '90%', maxWidth: 450, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#F8FAFC' },
  modalText: { fontSize: 16, color: '#94A3B8', textAlign: 'center', lineHeight: 24, marginTop: 10 },
  filterButton: { padding: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 10 },
});
