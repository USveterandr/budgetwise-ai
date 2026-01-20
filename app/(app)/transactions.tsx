import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useFinance } from '../../context/FinanceContext';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { ReceiptScanner } from '../../components/ReceiptScanner';

export default function TransactionsData() {
  const router = useRouter();
  const { transactions, deleteTransaction, refreshData, addTransaction } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

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
    return matchesSearch && matchesType;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Transactions</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowScanner(!showScanner)} style={styles.actionButton}>
              <Ionicons name={showScanner ? "close" : "scan"} size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/add-transaction')} style={styles.actionButton}>
              <Ionicons name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
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

          <View style={styles.transactionList}>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={transaction} 
                  onDelete={handleDelete}
                />
              ))
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={48} color="#334155" />
                    <Text style={styles.emptyText}>No transactions found</Text>
                </View>
            )}
          </View>
        </ScrollView>
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
  }
});
