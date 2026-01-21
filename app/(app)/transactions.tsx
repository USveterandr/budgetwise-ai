import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput, Alert, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, DashboardColors } from '../../constants/Colors';
import { useFinance } from '../../context/FinanceContext';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { ReceiptScanner } from '../../components/ReceiptScanner';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Housing', 'Utilities', 'Health', 'Entertainment', 'Salary', 'Business', 'Investment', 'Other'];

export default function TransactionsData() {
  const router = useRouter();
  const { transactions, deleteTransaction, refreshData, addTransaction, updateTransaction } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  // Date Filter State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Bulk Selection State
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
             try {
               await deleteTransaction(id);
             } catch (e) {
               Alert.alert("Error", "Failed to delete transaction");
             }
          }
        }
      ]
    );
  };

  const handleScanComplete = async (data: any) => {
    try {
      await addTransaction({
        description: data.merchant || 'Scanned Receipt',
        amount: Number(data.amount) || 0,
        category: data.category || 'Other',
        type: 'expense',
        date: data.date || new Date().toISOString(),
      });
      Alert.alert('Success', 'Receipt added successfully');
      setShowScanner(false);
      refreshData();
    } catch (e) {
      Alert.alert('Error', 'Failed to add receipt transaction');
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && t.date >= dateRange.start;
    }
    if (dateRange.end) {
      matchesDate = matchesDate && t.date <= dateRange.end;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Selection Handlers
  const toggleSelection = (id: string) => {
    if (!selectionMode) return;
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      if (newSelected.size === 0) setSelectionMode(false);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleLongPress = (id: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds(new Set([id]));
    }
  };

  const handleBulkCategorize = async (category: string) => {
    try {
      const promises = Array.from(selectedIds).map(id => 
        updateTransaction(id, { category })
      );
      await Promise.all(promises);
      Alert.alert('Success', `Updated ${selectedIds.size} transactions`);
      setSelectionMode(false);
      setSelectedIds(new Set());
      setShowCategoryModal(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to update transactions');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(filteredTransactions.map(t => t.id));
      setSelectedIds(allIds);
    }
  };

  const handleBulkDelete = () => {
    Alert.alert(
      "Delete Transactions",
      `Are you sure you want to delete ${selectedIds.size} transactions?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
             try {
               const promises = Array.from(selectedIds).map(id => deleteTransaction(id));
               await Promise.all(promises);
               Alert.alert("Success", "Transactions deleted");
               setSelectionMode(false);
               setSelectedIds(new Set());
             } catch (e) {
               Alert.alert("Error", "Failed to delete transactions");
             }
          }
        }
      ]
    );
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleExportCSV = async () => {
    try {
      const csvHeader = 'Date,Description,Category,Type,Amount\n';
      const csvRows = filteredTransactions.map(t => 
        `${t.date},"${t.description}","${t.category}",${t.type},${t.amount}`
      ).join('\n');
      const csvString = csvHeader + csvRows;

      const fileUri = FileSystem.documentDirectory + 'transactions.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvString);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Helvetica, sans-serif; padding: 20px; }
              h1 { text-align: center; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f2f2f2; color: #333; }
              tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>Transaction Report</h1>
            <table>
              <tr>
                <th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th>
              </tr>
              ${filteredTransactions.map(t => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td>${t.description}</td>
                  <td>${t.category}</td>
                  <td>${t.type}</td>
                  <td>$${t.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
          </body>
        </html>
      `;
      
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  const renderChart = () => {
    // Filter for expenses and group by date
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    
    if (expenses.length === 0) {
      return (
        <View style={styles.emptyChartState}>
          <Ionicons name="bar-chart-outline" size={48} color="#334155" />
          <Text style={styles.emptyText}>No spending data to display</Text>
        </View>
      );
    }

    const grouped = expenses.reduce((acc, t) => {
      const date = t.date.split('T')[0];
      acc[date] = (acc[date] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const sortedDates = Object.keys(grouped).sort();
    const data = sortedDates.map(date => ({ date, amount: grouped[date] }));
    const maxAmount = Math.max(...data.map(d => d.amount), 1); // Avoid divide by zero

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScroll}>
        {data.map((item) => (
          <View key={item.date} style={styles.chartBarContainer}>
            <View style={[styles.chartBar, { height: Math.max((item.amount / maxAmount) * 200, 4) }]} />
            <Text style={styles.chartLabel}>{new Date(item.date).getDate()}</Text>
            <Text style={styles.chartSubLabel}>{new Date(item.date).toLocaleString('default', { month: 'short' })}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {selectionMode ? `${selectedIds.size} Selected` : 'Transactions'}
          </Text>
          <View style={styles.headerActions}>
            {selectionMode ? (
              <>
                <TouchableOpacity onPress={handleSelectAll} style={styles.actionButton}>
                  <Ionicons name={selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0 ? "checkmark-done-circle" : "checkmark-done-circle-outline"} size={24} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={exitSelectionMode} style={styles.actionButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
            <TouchableOpacity onPress={() => setViewMode(prev => prev === 'list' ? 'chart' : 'list')} style={styles.actionButton}>
              <Ionicons name={viewMode === 'list' ? "stats-chart" : "list"} size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowScanner(!showScanner)} style={styles.actionButton}>
              <Ionicons name={showScanner ? "close" : "scan"} size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                Alert.alert('Export Transactions', 'Choose format', [
                    { text: 'CSV', onPress: handleExportCSV },
                    { text: 'PDF', onPress: handleExportPDF },
                    { text: 'Cancel', style: 'cancel' }
                ]);
            }} style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.actionButton}>
              <Ionicons name="calendar-outline" size={24} color={dateRange.start ? Colors.gold : Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/add-transaction')} style={styles.actionButton}>
              <Ionicons name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Search & Filter */}
        <View style={styles.filterContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, filterType === 'all' && styles.activeTab]} 
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.tabText, filterType === 'all' && styles.activeTabText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, filterType === 'income' && styles.activeTab]} 
              onPress={() => setFilterType('income')}
            >
              <Text style={[styles.tabText, filterType === 'income' && styles.activeTabText]}>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, filterType === 'expense' && styles.activeTab]} 
              onPress={() => setFilterType('expense')}
            >
              <Text style={[styles.tabText, filterType === 'expense' && styles.activeTabText]}>Expenses</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* List */}
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        >
          {showScanner && (
            <View style={styles.scannerContainer}>
              <ReceiptScanner onScanComplete={handleScanComplete} />
            </View>
          )}

          {viewMode === 'chart' ? (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Daily Spending Trend</Text>
              {renderChart()}
            </View>
          ) : (
            <View style={styles.transactionList}>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TransactionItem 
                    key={transaction.id} 
                    transaction={transaction} 
                    onDelete={handleDelete}
                    onPress={selectionMode ? toggleSelection : undefined}
                    onLongPress={handleLongPress}
                    selected={selectedIds.has(transaction.id)}
                    selectionMode={selectionMode}
                  />
                ))
              ) : (
                  <View style={styles.emptyState}>
                      <Ionicons name="receipt-outline" size={48} color="#334155" />
                      <Text style={styles.emptyText}>No transactions found</Text>
                  </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Summary Footer */}
        {!selectionMode && filteredTransactions.length > 0 && (
          <View style={styles.summaryFooter}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, { color: DashboardColors.income }]}>
                +${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryValue, { color: DashboardColors.expense }]}>
                -${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Net</Text>
              <Text style={[styles.summaryValue, { color: (totalIncome - totalExpense) >= 0 ? DashboardColors.income : DashboardColors.expense }]}>
                ${(totalIncome - totalExpense).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        )}

        {/* Bulk Action Bar */}
        {selectionMode && (
          <View style={styles.bulkActionBar}>
            <TouchableOpacity 
              style={styles.bulkBtn} 
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons name="pricetag-outline" size={20} color="#020617" />
              <Text style={styles.bulkBtnText}>Categorize</Text>
            </TouchableOpacity>
            
            <View style={styles.verticalDivider} />

            <TouchableOpacity 
              style={styles.bulkBtn} 
              onPress={handleBulkDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#B91C1C" />
              <Text style={[styles.bulkBtnText, { color: '#B91C1C' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Date Filter Modal */}
        <Modal visible={showFilterModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter by Date</Text>
              
              <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
              <TextInput 
                style={styles.input} 
                value={dateRange.start} 
                onChangeText={t => setDateRange(prev => ({...prev, start: t}))}
                placeholder="2024-01-01"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
              <TextInput 
                style={styles.input} 
                value={dateRange.end} 
                onChangeText={t => setDateRange(prev => ({...prev, end: t}))}
                placeholder="2024-12-31"
                placeholderTextColor="#64748B"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => {
                  setDateRange({ start: '', end: '' });
                  setShowFilterModal(false);
                }} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowFilterModal(false)} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Category Picker Modal */}
        <Modal visible={showCategoryModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '60%' }]}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <ScrollView>
                <View style={styles.catGrid}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity 
                      key={cat} 
                      style={styles.catChip}
                      onPress={() => handleBulkCategorize(cat)}
                    >
                      <Text style={styles.catText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)} style={[styles.cancelBtn, { marginTop: 20 }]}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  cancelText: {
    color: Colors.gold,
    fontWeight: 'bold',
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#FFF',
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  scannerContainer: {
    padding: 16,
  },
  transactionList: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#64748B',
    marginTop: 16,
    fontSize: 16,
  },
  bulkActionBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulkBtnText: {
    color: '#020617',
    fontWeight: 'bold',
    fontSize: 16,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 24,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 16, padding: 24 },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { color: '#94A3B8', marginBottom: 8, fontSize: 12, textTransform: 'uppercase' },
  input: { backgroundColor: '#0F172A', color: 'white', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#475569', borderRadius: 8 },
  saveBtn: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 8 },
  cancelBtnText: { color: '#94A3B8' },
  saveBtnText: { color: 'white', fontWeight: 'bold' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    backgroundColor: '#0F172A', 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  catText: {
    color: '#CBD5E1',
    fontWeight: '500'
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  summaryDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#334155',
    alignSelf: 'center',
  },
  chartContainer: {
    padding: 20,
  },
  chartTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chartScroll: {
    alignItems: 'flex-end',
    height: 250,
    paddingBottom: 10,
  },
  chartBarContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 30,
  },
  chartBar: {
    width: '100%',
    backgroundColor: DashboardColors.expense,
    borderRadius: 4,
    marginBottom: 8,
  },
  chartLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chartSubLabel: {
    color: '#94A3B8',
    fontSize: 10,
  },
  emptyChartState: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
});
