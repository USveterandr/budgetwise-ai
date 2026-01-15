import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useAuth } from '../../AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { cloudflare } from '../lib/cloudflare';
import { tokenCache } from '../../utils/tokenCache';
import { Svg, Circle, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function AnalyzeScreen() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        try {
            const token = await tokenCache.getToken("budgetwise_jwt_token");
            if (token && currentUser?.uid) {
                const data = await cloudflare.getTransactions(currentUser.uid, token);
                setTransactions(data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getAnalysis = () => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const total = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const byCategory: Record<string, number> = {};
        expenses.forEach(t => {
            byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount);
        });

        const sortedCats = Object.entries(byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount]) => ({
                cat,
                amount,
                percent: total ? (amount / total) * 100 : 0
            }));

        return { total, sortedCats };
    };

    const { total, sortedCats } = getAnalysis();

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#020617', '#0f172a']} style={StyleSheet.absoluteFill} />
            
            <View style={styles.header}>
                 <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                 </TouchableOpacity>
                 <Text style={styles.title}>Financial Analysis</Text>
                 <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                
                {loading ? <ActivityIndicator color={Colors.gold} style={{marginTop: 50}} /> : (
                    <>
                        <View style={styles.overviewCard}>
                             <Text style={styles.label}>Total Expenses (This Month)</Text>
                             <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
                        </View>

                        <Text style={styles.sectionTitle}>Spending Breakdown</Text>
                        
                        <View style={styles.breakdownList}>
                             {sortedCats.map((item, index) => (
                                 <View key={item.cat} style={styles.catRow}>
                                     <View style={styles.catInfo}>
                                         <View style={[styles.dot, { backgroundColor: getCategoryColor(index) }]} />
                                         <View>
                                            <Text style={styles.catName}>{item.cat}</Text>
                                            <Text style={styles.catPercent}>{item.percent.toFixed(1)}%</Text>
                                         </View>
                                     </View>
                                     <Text style={styles.catAmount}>${item.amount.toLocaleString()}</Text>
                                     
                                     {/* Simple Bar */}
                                     <View style={styles.barBg}>
                                         <View style={[styles.barFill, { width: `${item.percent}%`, backgroundColor: getCategoryColor(index) }]} />
                                     </View>
                                 </View>
                             ))}
                             {sortedCats.length === 0 && (
                                 <Text style={styles.emptyText}>No spending data available.</Text>
                             )}
                        </View>
                    </>
                )}

            </ScrollView>
        </View>
    );
}

function getCategoryColor(index: number) {
    const colors = [Colors.gold, '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return colors[index % colors.length];
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', marginBottom: 20 },
    backBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
    title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    
    overviewCard: { alignItems: 'center', padding: 30, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 100, alignSelf: 'center', width: 200, height: 200, justifyContent: 'center', borderWidth: 1, borderColor: Colors.gold, marginBottom: 40, shadowColor: Colors.gold, shadowOpacity: 0.2, shadowRadius: 20 },
    label: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginBottom: 8 },
    totalValue: { color: 'white', fontSize: 28, fontWeight: 'bold' },

    sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    breakdownList: { gap: 20 },
    catRow: { marginBottom: 16 },
    catInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    catName: { color: 'white', fontWeight: '600' },
    catPercent: { color: '#94A3B8', fontSize: 12 },
    catAmount: { position: 'absolute', right: 0, top: 0, color: 'white', fontWeight: 'bold' },
    barBg: { height: 6, backgroundColor: '#1E293B', borderRadius: 3, marginTop: 8 },
    barFill: { height: '100%', borderRadius: 3 },
    emptyText: { color: '#64748B', textAlign: 'center' }
});
