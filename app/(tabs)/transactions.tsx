import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { Button } from '../../components/ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { Investment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { EnhancedReceiptScanner } from '../../components/receipts/EnhancedReceiptScanner';
import { useReceiptScanner } from '../../hooks/useReceiptScanner';
import { LinearGradient } from 'expo-linear-gradient';

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
        icon: 'wallet'
      });
      setNewTx({ description: '', amount: '', category: 'Food', type: 'expense' });
      setModalVisible(false);
    }
  };

  const setType = (type: 'expense' | 'income') => {
    setNewTx({ ...newTx, type });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#13112B', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
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

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
        </View>

        <View style={styles.filters}>
          {(['all', 'income', 'expense'] as const).map(f => (
            <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterScroll} contentContainerStyle={{ paddingBottom: 10 }}>
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
          <Card style={{ marginBottom: 20 }}>
            {filteredTx.map(t => (
              <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} />
            ))}
            {filteredTx.length === 0 && <Text style={styles.empty}>No transactions found</Text>}
          </Card>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Receipt Scanner Modal */}
      <Modal visible={showScanner} animationType="slide" onRequestClose={handleScannerCancel}>
        <EnhancedReceiptScanner 
          onScanComplete={(data: any) => handleReceiptScan(data)} 
          onCancel={handleScannerCancel} 
        />
      </Modal>

      {/* Add Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Description" 
              placeholderTextColor="#64748B"
              value={newTx.description} 
              onChangeText={v => setNewTx({ ...newTx, description: v })} 
            />
            <TextInput 
              style={styles.input} 
              placeholder="Amount" 
              placeholderTextColor="#64748B"
              keyboardType="numeric" 
              value={newTx.amount} 
              onChangeText={v => setNewTx({ ...newTx, amount: v })} 
            />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 16, marginTop: 10 },
  title: { fontSize: 32, fontWeight: '800', color: '#F8FAFC', letterSpacing: -1 },
  buttonGroup: { flexDirection: 'row', gap: 10 },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  scanBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderRadius: 16, 
    marginBottom: 20,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: { marginRight: 10 },
  searchInput: { 
    flex: 1, 
    paddingVertical: 14, 
    fontSize: 16, 
    color: '#F8FAFC' 
  },
  filters: { flexDirection: 'row', marginBottom: 16, gap: 8, paddingHorizontal: 16 },
  filterBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  filterActive: { backgroundColor: 'rgba(124, 58, 237, 0.2)', borderColor: 'rgba(124, 58, 237, 0.3)' },
  filterText: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#A78BFA' },
  categoryFilterScroll: { marginBottom: 20, paddingLeft: 16 },
  categoryFilterBtn: { 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)'
  },
  categoryFilterActive: { backgroundColor: 'rgba(124, 58, 237, 0.2)', borderColor: 'rgba(124, 58, 237, 0.3)' },
  categoryFilterText: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  categoryFilterTextActive: { color: '#A78BFA' },
  empty: { textAlign: 'center', color: '#64748B', paddingVertical: 60, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1E293B', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 24, color: '#F8FAFC', textAlign: 'center' },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: 16, marginBottom: 16, fontSize: 16, color: '#F8FAFC', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeBtn: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  typeBtnActive: { backgroundColor: 'rgba(124, 58, 237, 0.2)', borderColor: 'rgba(124, 58, 237, 0.3)' },
  typeText: { fontWeight: '700', color: '#94A3B8' },
  typeTextActive: { color: '#A78BFA' },
  modalBtns: { flexDirection: 'row', gap: 12 },
});