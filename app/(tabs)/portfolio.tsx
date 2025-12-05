import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { Investment } from '../../context/FinanceContext';
import { AddInvestmentModal } from '../../components/investments/AddInvestmentModal';
import { EditInvestmentModal } from '../../components/investments/EditInvestmentModal';

export default function PortfolioScreen() {
  const router = useRouter();
  const { investments } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  // Calculate portfolio metrics
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
  const currentValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
  const totalGainLoss = currentValue - totalInvested;
  const gainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const investmentTypes = [
    { type: 'stock', label: 'Stocks', icon: 'trending-up' },
    { type: 'etf', label: 'ETFs', icon: 'stats-chart' },
    { type: 'bond', label: 'Bonds', icon: 'bar-chart' },
    { type: 'crypto', label: 'Crypto', icon: 'logo-bitcoin' },
    { type: 'real_estate', label: 'Real Estate', icon: 'home' },
    { type: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
  ];

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Investment Portfolio</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
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
            <Text style={[styles.summaryValue, { color: currentValue >= totalInvested ? Colors.success : Colors.error }]}>
              ${currentValue.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Gain/Loss</Text>
            <Text style={[styles.summaryValue, { color: totalGainLoss >= 0 ? Colors.success : Colors.error }]}>
              ${totalGainLoss.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Return</Text>
            <Text style={[styles.summaryValue, { color: gainLossPercentage >= 0 ? Colors.success : Colors.error }]}>
              {gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%
            </Text>
          </View>
        </View>
      </Card>

      {/* Investment Types */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>By Asset Type</Text>
        </View>
        <View style={styles.typesGrid}>
          {investmentTypes.map((item, index) => {
            const stats = getTypeStats(item.type);
            return (
              <Card key={index} style={styles.typeCard}>
                <View style={styles.typeHeader}>
                  <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
                  <Text style={styles.typeLabel}>{item.label}</Text>
                </View>
                <Text style={styles.typeCount}>{stats.count} holdings</Text>
                <Text style={[styles.typeReturn, { color: stats.gainLoss >= 0 ? Colors.success : Colors.error }]}>
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
          <Text style={styles.sectionTitle}>Your Investments</Text>
        </View>
        {investments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="folder-open" size={48} color={DashboardColors.textSecondary} />
            <Text style={styles.emptyText}>No investments yet</Text>
            <Text style={styles.emptySubtext}>Add your first investment to get started</Text>
            <Button title="Add Investment" onPress={() => setShowAddModal(true)} style={{ marginTop: 16 }} />
          </Card>
        ) : (
          <ScrollView>
            {investments.map((investment) => (
              <InvestmentItem 
                key={investment.id} 
                investment={investment} 
                onEdit={() => handleEditInvestment(investment)} 
              />
            ))}
          </ScrollView>
        )}
      </View>

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
    </SafeAreaView>
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
          <Ionicons name="pencil" size={20} color={DashboardColors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.investmentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity</Text>
          <Text style={styles.detailValue}>{investment.quantity}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Avg. Price</Text>
          <Text style={styles.detailValue}>${investment.purchasePrice.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Current Price</Text>
          <Text style={styles.detailValue}>${investment.currentPrice.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.investmentPerformance}>
        <Text style={[styles.performanceValue, { color: gainLoss >= 0 ? Colors.success : Colors.error }]}>
          {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
        </Text>
        <Text style={[styles.performancePercent, { color: gainLoss >= 0 ? Colors.success : Colors.error }]}>
          ({gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DashboardColors.background, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: DashboardColors.text },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 14, color: DashboardColors.textSecondary, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700', color: DashboardColors.text },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: DashboardColors.text },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: { width: '48%', padding: 16 },
  typeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  typeLabel: { fontSize: 16, fontWeight: '600', color: DashboardColors.text, marginLeft: 8 },
  typeCount: { fontSize: 14, color: DashboardColors.textSecondary, marginBottom: 4 },
  typeReturn: { fontSize: 16, fontWeight: '700' },
  emptyCard: { alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 18, fontWeight: '600', color: DashboardColors.text, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: DashboardColors.textSecondary, marginTop: 8, textAlign: 'center' },
  investmentItem: { marginBottom: 12 },
  investmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  investmentName: { fontSize: 16, fontWeight: '700', color: DashboardColors.text },
  investmentSymbol: { fontSize: 14, color: DashboardColors.textSecondary, marginTop: 2 },
  editButton: { padding: 4 },
  investmentDetails: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  detailLabel: { fontSize: 14, color: DashboardColors.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '600', color: DashboardColors.text },
  investmentPerformance: { flexDirection: 'row', alignItems: 'center' },
  performanceValue: { fontSize: 16, fontWeight: '700', marginRight: 8 },
  performancePercent: { fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: DashboardColors.text },
  comingSoon: { fontSize: 18, fontWeight: '700', color: DashboardColors.text, textAlign: 'center', marginVertical: 20 },
  modalDescription: { fontSize: 16, color: DashboardColors.textSecondary, textAlign: 'center', lineHeight: 22 },
});