import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { Button } from '../../components/ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { EnhancedReceiptScanner } from '../../components/receipts/EnhancedReceiptScanner';
import { useReceiptScanner } from '../../hooks/useReceiptScanner';

export default function TransactionsScreen() {
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  const [modalVisible, setModalVisible] = useState(false);
  const { showScanner, setShowScanner, scannerTransaction, handleReceiptScan, handleScannerCancel } = useReceiptScanner();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newTx, setNewTx] = useState({ description: '', amount: '', category: 'Food', type: 'expense' as 'expense' | 'income' });

  // Get unique categories from transactions
  const categories = ['all', ...Array.from(new Set(transactions.map(t => t.category)))];

  // Apply filters and search
  const filteredTx = transactions.filter(t => {
    // Type filter
    if (filter !== 'all' && t.type !== filter) return false;
    
    // Category filter
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    
    // Search filter
    if (searchQuery && 
        !t.description.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !t.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  // Update form fields when scannerTransaction changes
  useEffect(() => {
    if (scannerTransaction) {
      setNewTx({
        description: scannerTransaction.description,
        amount: scannerTransaction.amount.toString(),
        category: scannerTransaction.category,
        type: 'expense'
      });
      setModalVisible(true);
    }
  }, [scannerTransaction]);

  const handleAdd = () => {
    if (newTx.description && newTx.amount) {
      addTransaction({
        description: newTx.description,
        amount: parseFloat(newTx.amount),
        category: newTx.category,
        type: newTx.type,
        date: new Date().toISOString().split('T')[0],
      });
      setNewTx({ description: '', amount: '', category: 'Food', type: 'expense' });
      setModalVisible(false);
    }
  };

  const setType = (type: 'expense' | 'income') => {
    setNewTx({ ...newTx, type });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScanner(true)}>
            <Ionicons name="receipt" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={DashboardColors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={DashboardColors.textSecondary}
        />
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {(['all', 'income', 'expense'] as const).map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterScroll}>
        {categories.map(cat => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.categoryFilterBtn, categoryFilter === cat && styles.categoryFilterActive]} 
            onPress={() => setCategoryFilter(cat)}
          >
            <Text style={[styles.categoryFilterText, categoryFilter === cat && styles.categoryFilterTextActive]}>
              {cat === 'all' ? 'All Categories' : cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          {filteredTx.map(t => (
            <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} />
          ))}
          {filteredTx.length === 0 && <Text style={styles.empty}>No transactions found</Text>}
        </Card>
      </ScrollView>

      {/* Receipt Scanner Modal */}
      <Modal visible={showScanner} animationType="slide" onRequestClose={handleScannerCancel}>
        <EnhancedReceiptScanner 
          onScanComplete={handleReceiptScan} 
          onCancel={handleScannerCancel} 
        />
      </Modal>

      {/* Add Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <TextInput style={styles.input} placeholder="Description" value={newTx.description} onChangeText={v => setNewTx({ ...newTx, description: v })} />
            <TextInput style={styles.input} placeholder="Amount" keyboardType="numeric" value={newTx.amount} onChangeText={v => setNewTx({ ...newTx, amount: v })} />
            <View style={styles.typeRow}>
              <TouchableOpacity 
                style={[styles.typeBtn, newTx.type === 'expense' && styles.typeBtnActive]} 
                onPress={() => setType('expense')}
              >
                <Text style={[styles.typeText, newTx.type === 'expense' && styles.typeTextActive]}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, newTx.type === 'income' && styles.typeBtnActive]} 
                onPress={() => setType('income')}
              >
                <Text style={[styles.typeText, newTx.type === 'income' && styles.typeTextActive]}>Income</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBtns}>
              <Button title="Cancel" variant="outline" onPress={() => {
                setModalVisible(false);
                handleScannerCancel();
              }} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Add" onPress={handleAdd} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DashboardColors.background, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: DashboardColors.text },
  buttonGroup: { flexDirection: 'row', gap: 10 },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  scanBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: DashboardColors.surface, 
    borderRadius: 12, 
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { 
    flex: 1, 
    paddingVertical: 14, 
    fontSize: 16, 
    color: DashboardColors.text 
  },
  filters: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: DashboardColors.surface },
  filterActive: { backgroundColor: Colors.primary },
  filterText: { color: DashboardColors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: '#FFF' },
  categoryFilterScroll: { marginBottom: 16 },
  categoryFilterBtn: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: DashboardColors.surface, 
    marginRight: 8 
  },
  categoryFilterActive: { backgroundColor: Colors.primary },
  categoryFilterText: { color: DashboardColors.textSecondary, fontWeight: '500' },
  categoryFilterTextActive: { color: '#FFF' },
  empty: { textAlign: 'center', color: DashboardColors.textSecondary, paddingVertical: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, color: DashboardColors.text },
  input: { borderWidth: 1, borderColor: DashboardColors.border, borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: DashboardColors.border, alignItems: 'center' },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { fontWeight: '600', color: DashboardColors.textSecondary },
  typeTextActive: { color: '#FFF' },
  modalBtns: { flexDirection: 'row' },
});