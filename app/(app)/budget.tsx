import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { cloudflare } from '../lib/cloudflare';
import { tokenCache } from '../../utils/tokenCache';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Housing', 'Utilities', 'Health', 'Entertainment', 'Salary', 'Business', 'Investment', 'Other'];

export default function BudgetScreen() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [budgets, setBudgets] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    
    // Form State
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
    const [limit, setLimit] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        try {
            const token = await tokenCache.getToken("budgetwise_jwt_token");
            if (token && currentUser?.uid) {
                const [budgetData, txData] = await Promise.all([
                    cloudflare.getBudgets(currentUser.uid, 'current', token), // 'current' ignored by backend for now but good for future
                    cloudflare.getTransactions(currentUser.uid, token)
                ]);
                setBudgets(budgetData || []);
                setTransactions(txData || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBudget = async () => {
        if (!limit) return Alert.alert('Error', 'Please enter a limit');
        
        try {
            const token = await tokenCache.getToken("budgetwise_jwt_token");
            if (token) {
                await cloudflare.addBudget({
                    category: selectedCategory,
                    budget_limit: parseFloat(limit)
                }, token);
                
                setModalVisible(false);
                setLimit('');
                fetchData(); // Refresh
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to save budget');
        }
    };

    const getSpentForCategory = (cat: string) => {
        return transactions
            .filter(t => t.type === 'expense' && t.category === cat)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    };

    const getTotalBudget = () => budgets.reduce((sum, b) => sum + b.budget_limit, 0);
    const getTotalSpent = () => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#020617', '#0f172a']} style={StyleSheet.absoluteFill} />
            
            <View style={styles.header}>
                 <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                 </TouchableOpacity>
                 <Text style={styles.title}>Budget Planner</Text>
                 <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
                    <Ionicons name="add" size={24} color={Colors.gold} />
                 </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginBottom: 24, paddingHorizontal: 4 }}>
                    <Text style={{ color: Colors.gold, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
                        Budgeting Tools Coming Soon
                    </Text>
                    <Text style={{ color: '#94A3B8', fontSize: 14, lineHeight: 22 }}>
                        Set limits for categories and track your spending against them.
                    </Text>
                </View>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Monthly Budget</Text>
                    <Text style={styles.summaryValue}>${getTotalBudget().toLocaleString()}</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${Math.min((getTotalSpent() / (getTotalBudget() || 1)) * 100, 100)}%` }]} />
                    </View>
                    <Text style={styles.spentText}>${getTotalSpent().toLocaleString()} spent so far</Text>
                </View>

                {loading ? <ActivityIndicator color={Colors.gold} style={{marginTop: 50}} /> : (
                    <View style={styles.budgetList}>
                        {budgets.map(budget => {
                            const spent = getSpentForCategory(budget.category);
                            const percent = Math.min((spent / budget.budget_limit) * 100, 100);
                            const isOver = spent > budget.budget_limit;

                            return (
                                <View key={budget.id} style={styles.budgetItem}>
                                    <View style={styles.budgetHeader}>
                                        <Text style={styles.budgetCat}>{budget.category}</Text>
                                        <Text style={[styles.budgetAmount, isOver && { color: '#EF4444' }]}>
                                            ${spent.toLocaleString()} / ${budget.budget_limit.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.trackBg}>
                                        <View style={[
                                            styles.trackFill, 
                                            { width: `${percent}%`, backgroundColor: isOver ? '#EF4444' : Colors.gold }
                                        ]} />
                                    </View>
                                </View>
                            );
                        })}
                        {budgets.length === 0 && (
                            <Text style={styles.emptyText}>No budgets set. Tap + to add one.</Text>
                        )}
                    </View>
                )}
            </ScrollView>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Budget</Text>
                        
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.catRow}>
                             {CATEGORIES.map(cat => (
                                 <TouchableOpacity 
                                    key={cat} 
                                    style={[styles.catChip, selectedCategory === cat && styles.activeCat]}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <Text style={[styles.catText, selectedCategory === cat && styles.activeCatText]}>{cat}</Text>
                                 </TouchableOpacity>
                             ))}
                        </View>

                        <Text style={styles.label}>Monthly Limit</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="$0.00"
                            placeholderTextColor="#64748B"
                            keyboardType="decimal-pad"
                            value={limit}
                            onChangeText={setLimit}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSaveBudget} style={styles.saveBtn}>
                                <Text style={styles.saveText}>Save Budget</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', marginBottom: 20 },
    backBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
    addBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderWidth: 1, borderColor: Colors.gold },
    title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    content: { paddingHorizontal: 20 },
    
    summaryCard: { padding: 24, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    summaryLabel: { color: '#94A3B8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    summaryValue: { color: Colors.gold, fontSize: 36, fontWeight: 'bold', marginBottom: 16 },
    progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
    progressBarFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: 4 },
    spentText: { color: '#CBD5E1', fontSize: 12 },

    budgetList: { gap: 16 },
    budgetItem: { marginBottom: 16 },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    budgetCat: { color: 'white', fontWeight: 'bold' },
    budgetAmount: { color: '#94A3B8' },
    trackBg: { height: 6, backgroundColor: '#1E293B', borderRadius: 3 },
    trackFill: { height: '100%', borderRadius: 3 },
    emptyText: { color: '#64748B', textAlign: 'center', marginTop: 40 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
    modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
    label: { color: '#94A3B8', marginBottom: 12, fontSize: 12, textTransform: 'uppercase' },
    catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
    activeCat: { backgroundColor: Colors.gold, borderColor: Colors.gold },
    catText: { color: '#CBD5E1', fontSize: 12 },
    activeCatText: { color: '#020617', fontWeight: 'bold' },
    input: { backgroundColor: '#0F172A', color: 'white', padding: 16, borderRadius: 12, fontSize: 18, marginBottom: 32, borderWidth: 1, borderColor: '#334155' },
    modalActions: { flexDirection: 'row', gap: 16 },
    cancelBtn: { flex: 1, padding: 16, alignItems: 'center' },
    saveBtn: { flex: 1, backgroundColor: Colors.gold, padding: 16, borderRadius: 12, alignItems: 'center' },
    cancelText: { color: '#94A3B8' },
    saveText: { color: '#020617', fontWeight: 'bold' }
});
