import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { useFinance } from '../../context/FinanceContext';
import { presentPaywall } from '../../services/paywall';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Housing', 'Utilities', 'Health', 'Entertainment', 'Salary', 'Business', 'Investment', 'Other'];

export default function BudgetScreen() {
    const { currentUser } = useAuth() as any;
    const { budgets, transactions, loading, addBudget } = useFinance();
    const isPro = (currentUser as any)?.subscription_status === 'active' || (currentUser as any)?.isPro;
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    
    // Form State
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
    const [limit, setLimit] = useState('');

    useFocusEffect(
        useCallback(() => {
            // fetchData is handled by FinanceContext automatically
        }, [])
    );

    const handleSaveBudget = async () => {
        if (!limit) return Alert.alert('Error', 'Please enter a limit');
        
        try {
            await addBudget({
                category: selectedCategory,
                limit: parseFloat(limit) // Changed from budget_limit to limit to match the interface
            });
            
            setModalVisible(false);
            setLimit('');
            // Data refresh is handled by FinanceContext automatically
        } catch (e) {
            console.error('Budget save error:', e);
            Alert.alert('Error', 'Failed to save budget');
        }
    };

    const getSpentForCategory = (cat: string) => {
        return transactions
            .filter(t => t.type === 'expense' && t.category === cat)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    };

    const getTotalBudget = () => budgets.reduce((sum, b) => sum + b.limit, 0);
    const getTotalSpent = () => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const getOnTrackCount = () => budgets.filter(b => getSpentForCategory(b.category) <= b.limit * 0.9).length;

    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const today = new Date().getDate();
    const daysLeft = Math.max(daysInMonth - today, 1);
    const remaining = Math.max(totalBudget - totalSpent, 0);
    const safePerDay = remaining / daysLeft;

    const spendByCategory = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
        acc[cat] = transactions
            .filter(t => t.type === 'expense' && t.category === cat)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return acc;
    }, {});

    const recommendedBudgets = Object.entries(spendByCategory)
        .filter(([cat, spent]) => spent > 0 && !budgets.find(b => b.category === cat))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, spent]) => ({ cat, suggested: Math.ceil(spent * 1.2) }));

    const totalBudget = getTotalBudget();
    const totalSpent = getTotalSpent();
    const progressPct = Math.min((totalSpent / (totalBudget || 1)) * 100, 100);
    const onTrack = getOnTrackCount();
    const streakLabel = onTrack === budgets.length && budgets.length > 0 ? 'On-track streak!' : 'Keep pushing';

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
                <View style={styles.banner}>
                    <Text style={styles.bannerTitle}>Budget smarter, win rewards.</Text>
                    <Text style={styles.bannerSubtitle}>Stay under your limits to build a streak and unlock badges.</Text>
                </View>

                {!isPro && (
                    <TouchableOpacity style={styles.upgradeCard} onPress={presentPaywall}>
                        <View style={styles.upgradeRow}>
                            <View>
                                <Text style={styles.upgradeTitle}>Unlock Pro budgeting alerts</Text>
                                <Text style={styles.upgradeSubtitle}>Get category alerts and auto-recommendations based on your spend.</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={18} color={Colors.gold} />
                        </View>
                    </TouchableOpacity>
                )}

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Monthly Budget</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryValue}>${totalBudget.toLocaleString()}</Text>
                        <View style={styles.streakPill}>
                            <Ionicons name="flame" size={14} color="#0B1224" />
                            <Text style={styles.streakText}>{streakLabel}</Text>
                        </View>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
                    </View>
                    <Text style={styles.spentText}>${totalSpent.toLocaleString()} spent so far</Text>

                    <View style={styles.safeRow}>
                        <View style={styles.safeCol}>
                            <Text style={styles.safeLabel}>Remaining</Text>
                            <Text style={styles.safeValue}>${remaining.toLocaleString()}</Text>
                        </View>
                        <View style={styles.safeCol}>
                            <Text style={styles.safeLabel}>Safe per day</Text>
                            <Text style={styles.safeValue}>${safePerDay.toFixed(0)}</Text>
                        </View>
                        <View style={styles.safeCol}>
                            <Text style={styles.safeLabel}>Days left</Text>
                            <Text style={styles.safeValue}>{daysLeft}</Text>
                        </View>
                    </View>

                    <View style={styles.badgeRow}>
                        <View style={styles.badgePill}>
                            <Ionicons name="trophy" size={14} color={Colors.gold} />
                            <Text style={styles.badgeText}>{onTrack}/{Math.max(budgets.length, 1)} on track</Text>
                        </View>
                        <View style={styles.badgePillAlt}>
                            <Ionicons name="sparkles" size={14} color="#0F172A" />
                            <Text style={styles.badgeTextAlt}>{progressPct <= 80 ? 'Great pace' : progressPct <= 100 ? 'Watch your spend' : 'Over budget'}</Text>
                        </View>
                    </View>
                </View>

                {loading ? <ActivityIndicator color={Colors.gold} style={{marginTop: 50}} /> : (
                    <View style={styles.budgetList}>
                        {budgets.map(budget => {
                            const spent = getSpentForCategory(budget.category);
                            const percent = Math.min((spent / budget.limit) * 100, 100);
                            const isOver = spent > budget.limit;

                            return (
                                <View key={budget.id} style={styles.budgetItem}>
                                    <View style={styles.budgetHeader}>
                                        <Text style={styles.budgetCat}>{budget.category}</Text>
                                        <Text style={[styles.budgetAmount, isOver && { color: '#EF4444' }]}>
                                            ${spent.toLocaleString()} / ${budget.limit.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.trackBg}>
                                        <View style={[
                                            styles.trackFill, 
                                            { 
                                                width: `${percent}%`,
                                                backgroundColor: percent >= 90 ? '#EF4444' : percent >= 70 ? '#FBBF24' : Colors.gold 
                                            }
                                        ]} />
                                    </View>
                                </View>
                            );
                        })}
                        {budgets.length === 0 && (
                            <View style={styles.emptyCard}>
                                <Ionicons name="wallet-outline" size={48} color="#334155" />
                                <Text style={styles.emptyTitle}>No budgets yet</Text>
                                <Text style={styles.emptyText}>Add your first budget category to start tracking your expenses</Text>
                            </View>
                        )}

                        {recommendedBudgets.length > 0 && (
                            <View style={styles.recoCard}>
                                <View style={styles.recoHeader}>
                                    <Text style={styles.recoTitle}>Quick start from recent spend</Text>
                                    <Ionicons name="bulb" size={16} color={Colors.gold} />
                                </View>
                                <View style={styles.recoRow}>
                                    {recommendedBudgets.map(({ cat, suggested }) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={styles.recoChip}
                                            onPress={() => {
                                                setSelectedCategory(cat);
                                                setLimit(String(suggested));
                                                setModalVisible(true);
                                            }}
                                        >
                                            <Text style={styles.recoCat}>{cat}</Text>
                                            <Text style={styles.recoAmt}>Suggest ${suggested.toLocaleString()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Floating action button */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={26} color="#0F172A" />
            </TouchableOpacity>

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
    
    banner: { marginBottom: 24, paddingHorizontal: 4 },
    bannerTitle: { color: Colors.gold, fontSize: 15, fontWeight: '800', letterSpacing: 0.4, marginBottom: 6 },
    bannerSubtitle: { color: '#94A3B8', fontSize: 14, lineHeight: 22 },

    summaryCard: { padding: 24, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    summaryLabel: { color: '#94A3B8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    summaryValue: { color: Colors.gold, fontSize: 36, fontWeight: 'bold' },
    streakPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    streakText: { color: '#0B1224', fontWeight: '700', fontSize: 12 },
    progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
    progressBarFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: 4 },
    spentText: { color: '#CBD5E1', fontSize: 12 },
    safeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    safeCol: { flex: 1 },
    safeLabel: { color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 },
    safeValue: { color: 'white', fontSize: 16, fontWeight: '700', marginTop: 2 },
    badgeRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
    badgePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)' },
    badgePillAlt: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: Colors.gold },
    badgeText: { color: '#E2E8F0', fontWeight: '600', fontSize: 12 },
    badgeTextAlt: { color: '#0F172A', fontWeight: '700', fontSize: 12 },

    upgradeCard: { marginBottom: 16, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)' },
    upgradeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    upgradeTitle: { color: 'white', fontWeight: '700', fontSize: 15 },
    upgradeSubtitle: { color: '#94A3B8', marginTop: 6, maxWidth: '90%' },

    budgetList: { gap: 16 },
    budgetItem: { marginBottom: 16 },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    budgetCat: { color: 'white', fontWeight: 'bold' },
    budgetAmount: { color: '#94A3B8' },
    trackBg: { height: 6, backgroundColor: '#1E293B', borderRadius: 3 },
    trackFill: { height: '100%', borderRadius: 3 },
    emptyCard: { marginTop: 24, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
    emptyTitle: { color: 'white', fontWeight: '700', fontSize: 16, marginTop: 12, marginBottom: 6 },
    emptyText: { color: '#94A3B8', textAlign: 'center' },
    recoCard: { marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', gap: 12 },
    recoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    recoTitle: { color: 'white', fontWeight: '700' },
    recoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    recoChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: '#0B1224', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    recoCat: { color: Colors.gold, fontWeight: '700' },
    recoAmt: { color: '#CBD5E1', fontSize: 12, marginTop: 4 },

    fab: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },

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
