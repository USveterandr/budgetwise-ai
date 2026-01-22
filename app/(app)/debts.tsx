import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../AuthContext';
import { Debt } from '../../types';

function formatCurrency(value: number, currency: string) {
  const amount = Number.isFinite(value) ? value : 0;
  return `${currency || '$'}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function simulateAvalanche(debts: Debt[], extraPayment: number) {
  const plan = debts
    .map(d => ({ ...d }))
    .sort((a, b) => (b.interest_rate || 0) - (a.interest_rate || 0));

  let months = 0;
  let totalInterest = 0;
  const maxMonths = 600; // safety stop

  while (plan.length > 0 && months < maxMonths) {
    months += 1;

    // Apply interest then payments
    for (let i = plan.length - 1; i >= 0; i -= 1) {
      const debt = plan[i];
      const rate = (debt.interest_rate || 0) / 100 / 12;
      const interest = debt.balance * rate;
      debt.balance += interest;
      totalInterest += interest;

      const basePayment = debt.min_payment || 0;
      const snowballBoost = i === 0 ? extraPayment : 0;
      const payment = Math.max(basePayment + snowballBoost, 0);
      if (payment <= 0) {
        return { months: Infinity, interestPaid: totalInterest };
      }

      debt.balance = Math.max(0, debt.balance - payment);
      if (debt.balance <= 0.01) {
        plan.splice(i, 1);
        extraPayment += basePayment; // roll freed minimum into next debt
      }
    }
  }

  return { months: plan.length === 0 ? months : Infinity, interestPaid: totalInterest };
}

export default function DebtsScreen() {
  const router = useRouter();
  const { debts, refreshData, addDebt, updateDebt, deleteDebt } = useFinance();
  const { userProfile } = useAuth() as any;
  const currency = userProfile?.currency || '$';
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [extraPayment, setExtraPayment] = useState('50');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [newDebt, setNewDebt] = useState({
    name: '',
    balance: '',
    interest_rate: '',
    min_payment: '',
    due_date: '',
    target_date: ''
  });

  const totalBalance = useMemo(() => debts.reduce((sum, d) => sum + (d.balance || 0), 0), [debts]);
  const monthlyMinimum = useMemo(() => debts.reduce((sum, d) => sum + (d.min_payment || 0), 0), [debts]);
  const avgApr = useMemo(() => {
    if (totalBalance === 0) return 0;
    const weighted = debts.reduce((sum, d) => sum + (d.balance || 0) * (d.interest_rate || 0), 0);
    return weighted / totalBalance;
  }, [debts, totalBalance]);

  const nextDue = useMemo(() => {
    const withDue = debts.filter(d => d.due_date);
    if (withDue.length === 0) return null;
    return withDue.sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))[0];
  }, [debts]);

  const payoffPlan = useMemo(() => {
    const extra = parseFloat(extraPayment) || 0;
    const result = simulateAvalanche(debts, Math.max(0, extra));
    const highestApr = debts.slice().sort((a, b) => (b.interest_rate || 0) - (a.interest_rate || 0))[0];
    const smallestBalance = debts.slice().sort((a, b) => (a.balance || 0) - (b.balance || 0))[0];
    return { result, highestApr, smallestBalance };
  }, [debts, extraPayment]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleAddDebt = async () => {
    const balance = parseFloat(newDebt.balance);
    if (!newDebt.name || Number.isNaN(balance)) {
      Alert.alert('Missing info', 'Name and balance are required');
      return;
    }

    try {
      await addDebt({
        name: newDebt.name,
        balance,
        interest_rate: parseFloat(newDebt.interest_rate) || 0,
        min_payment: parseFloat(newDebt.min_payment) || 0,
        due_date: newDebt.due_date || null,
        target_date: newDebt.target_date || null
      });
      setShowAddModal(false);
      setNewDebt({ name: '', balance: '', interest_rate: '', min_payment: '', due_date: '', target_date: '' });
    } catch (e) {
      Alert.alert('Error', 'Could not save debt');
    }
  };

  const handleDelete = (debt: Debt) => {
    Alert.alert('Delete debt', `Remove ${debt.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteDebt(debt.id);
          } catch (e) {
            Alert.alert('Error', 'Could not delete debt');
          }
        } }
    ]);
  };

  const openPaymentModal = (debt: Debt) => {
    setSelectedDebt(debt);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedDebt) return;
    const amount = parseFloat(paymentAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a payment greater than 0');
      return;
    }

    const newBalance = Math.max(0, (selectedDebt.balance || 0) - amount);
    try {
      await updateDebt(selectedDebt.id, { balance: newBalance });
      setShowPaymentModal(false);
      setSelectedDebt(null);
      setPaymentAmount('');
    } catch (e) {
      Alert.alert('Error', 'Could not record payment');
    }
  };

  const renderDebtCard = (debt: Debt) => (
    <View key={debt.id} style={styles.debtCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.debtName}>{debt.name}</Text>
          <Text style={styles.debtMeta}>APR {(debt.interest_rate || 0).toFixed(2)}% · Min {formatCurrency(debt.min_payment || 0, currency)}</Text>
          {debt.due_date && <Text style={styles.debtMeta}>Due {debt.due_date}</Text>}
        </View>
        <Text style={styles.debtBalance}>{formatCurrency(debt.balance || 0, currency)}</Text>
      </View>

      <View style={styles.debtActions}>
        <TouchableOpacity style={styles.actionPill} onPress={() => openPaymentModal(debt)}>
          <Ionicons name="card-outline" size={16} color={Colors.gold} />
          <Text style={styles.actionPillText}>Log payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionPill, { borderColor: Colors.error }]} onPress={() => handleDelete(debt)}>
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
          <Text style={[styles.actionPillText, { color: Colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const payoffMonths = payoffPlan.result.months === Infinity ? 'Add payments to project' : `${payoffPlan.result.months} mo`;
  const projectedInterest = payoffPlan.result.months === Infinity ? '--' : formatCurrency(payoffPlan.result.interestPaid, currency);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.gold} />
        </TouchableOpacity>
        <Text style={styles.title}>Debts</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.iconButton}>
          <Ionicons name="add-circle" size={26} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalBalance, currency)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Min / mo</Text>
            <Text style={styles.summaryValue}>{formatCurrency(monthlyMinimum, currency)}</Text>
          </View>
        </View>

        <View style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Debt Plan</Text>
            <View style={styles.pill}>
              <Ionicons name="shield-checkmark-outline" size={14} color={Colors.gold} />
              <Text style={styles.pillText}>{avgApr.toFixed(1)}% avg APR</Text>
            </View>
          </View>

          {nextDue ? (
            <Text style={styles.cardSubtext}>Next payment · {nextDue.name} on {nextDue.due_date}</Text>
          ) : (
            <Text style={styles.cardSubtext}>Add due dates to stay ahead of bills</Text>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Extra toward debt (optional)"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={extraPayment}
              onChangeText={setExtraPayment}
            />
            <View style={styles.inputSuffix}><Text style={styles.inputSuffixText}>{currency}</Text></View>
          </View>

          <View style={styles.planRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planLabel}>Avalanche payoff</Text>
              <Text style={styles.planValue}>{payoffMonths}</Text>
              <Text style={styles.planHint}>Projected interest {projectedInterest}</Text>
            </View>
            {payoffPlan.highestApr && (
              <View style={[styles.pill, { backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}>
                <Ionicons name="flame-outline" size={16} color={Colors.gold} />
                <Text style={styles.pillText}>Prioritize {payoffPlan.highestApr.name}</Text>
              </View>
            )}
          </View>

          {payoffPlan.smallestBalance && (
            <View style={styles.planTip}>
              <Ionicons name="sparkles-outline" size={16} color={Colors.primary} />
              <Text style={styles.planTipText}>Snowball start: knock out {payoffPlan.smallestBalance.name} (${(payoffPlan.smallestBalance.balance || 0).toFixed(0)}) for a quick win.</Text>
            </View>
          )}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>All debts</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.secondaryButton}>
            <Ionicons name="add" size={14} color={Colors.gold} />
            <Text style={styles.secondaryButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {debts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No debts yet. Add your loans, cards, or balances to see payoff guidance.</Text>
          </View>
        ) : (
          debts.map(renderDebtCard)
        )}
      </ScrollView>

      {/* Add Debt Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add debt</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Name (e.g., Visa, Auto Loan)"
              placeholderTextColor={Colors.textMuted}
              value={newDebt.name}
              onChangeText={(t) => setNewDebt(prev => ({ ...prev, name: t }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Balance"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={newDebt.balance}
              onChangeText={(t) => setNewDebt(prev => ({ ...prev, balance: t }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="APR (%)"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={newDebt.interest_rate}
              onChangeText={(t) => setNewDebt(prev => ({ ...prev, interest_rate: t }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Min payment per month"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={newDebt.min_payment}
              onChangeText={(t) => setNewDebt(prev => ({ ...prev, min_payment: t }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Due date (YYYY-MM-DD)"
              placeholderTextColor={Colors.textMuted}
              value={newDebt.due_date}
              onChangeText={(t) => setNewDebt(prev => ({ ...prev, due_date: t }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Target payoff date (optional)"
              placeholderTextColor={Colors.textMuted}
              value={newDebt.target_date}
              onChangeText={(t) => setNewDebt(prev => ({ ...prev, target_date: t }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddDebt}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log payment</Text>
            {selectedDebt && <Text style={styles.modalSubtitle}>{selectedDebt.name}</Text>}
            <TextInput
              style={styles.modalInput}
              placeholder="Amount"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPaymentModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handlePayment}>
                <Text style={styles.saveText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  iconButton: { padding: 8 },
  title: { color: Colors.white, fontSize: 20, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, gap: 12, marginTop: 8 },
  summaryCard: { flex: 1, backgroundColor: Colors.surface, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: Colors.border },
  summaryLabel: { color: Colors.textMuted, fontSize: 12, marginBottom: 6 },
  summaryValue: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  glassCard: { marginHorizontal: 20, marginTop: 16, backgroundColor: Colors.cardBg, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  cardSubtext: { color: Colors.textMuted, fontSize: 13, marginBottom: 12 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: { flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: 12, padding: 12, color: Colors.white, borderWidth: 1, borderColor: Colors.border },
  inputSuffix: { position: 'absolute', right: 12 },
  inputSuffixText: { color: Colors.textMuted, fontWeight: '600' },
  planRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 6 },
  planLabel: { color: Colors.textMuted, fontSize: 13 },
  planValue: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  planHint: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  planTip: { flexDirection: 'row', gap: 8, backgroundColor: 'rgba(139, 92, 246, 0.08)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginTop: 10 },
  planTipText: { color: Colors.white, flex: 1, lineHeight: 18 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 18, marginBottom: 8 },
  sectionTitle: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  secondaryButtonText: { color: Colors.white, fontWeight: '600' },
  emptyState: { marginHorizontal: 20, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center', gap: 10 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  debtCard: { marginHorizontal: 20, marginBottom: 12, padding: 14, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  debtName: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  debtMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  debtBalance: { color: Colors.gold, fontSize: 17, fontWeight: '700' },
  debtActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  actionPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Colors.gold + '33' },
  actionPillText: { color: Colors.white, fontWeight: '600', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
  modalTitle: { color: Colors.white, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalSubtitle: { color: Colors.textMuted, marginBottom: 8 },
  modalInput: { backgroundColor: Colors.surfaceLight, borderRadius: 12, padding: 12, color: Colors.white, borderWidth: 1, borderColor: Colors.border, marginTop: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 14 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  cancelText: { color: Colors.textMuted, fontWeight: '600' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.gold, borderRadius: 12 },
  saveText: { color: Colors.black, fontWeight: '700' },
});
