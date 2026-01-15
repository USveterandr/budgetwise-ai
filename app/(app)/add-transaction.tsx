import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { cloudflare } from '../../app/lib/cloudflare';
import { tokenCache } from '../../utils/tokenCache';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Housing', 'Utilities', 'Health', 'Entertainment', 'Salary', 'Business', 'Investment', 'Other'];

export default function AddTransaction() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const handleSave = async () => {
    console.log('[AddTransaction] Attempting save...');
    if (!amount || !description) {
      if (Platform.OS === 'web') {
        alert('Please fill in amount and description');
      } else {
        Alert.alert('Missing Fields', 'Please fill in amount and description');
      }
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      if (Platform.OS === 'web') {
         alert('Invalid amount. Please enter a number.');
      } else {
         Alert.alert('Error', 'Invalid amount. Please enter a number.');
      }
      return;
    }

    setLoading(true);
    try {
      const token = await tokenCache.getToken("budgetwise_jwt_token");
      if (!token) {
        console.error('[AddTransaction] No token found');
        throw new Error('Not authenticated. Please log in again.');
      }

      console.log('[AddTransaction] Sending data:', {
        amount: numAmount, description, category, type
      });

      const result = await cloudflare.addTransaction({
        amount: numAmount,
        description,
        category,
        type,
        date: new Date().toISOString()
      }, token);

      console.log('[AddTransaction] Success:', result);

      if (Platform.OS === 'web') {
        // Use a short timeout to let the UI update or just standard alert then move
        alert('Transaction added!');
        router.replace('/dashboard');
      } else {
        Alert.alert('Success', 'Transaction added successfully', [
            { text: 'OK', onPress: () => router.replace('/dashboard') }
        ]);
      }
      
    } catch (error: any) {
      console.error('[AddTransaction] Error:', error);
      const msg = error.message || 'Failed to save transaction';
      if (Platform.OS === 'web') {
         alert(`Error: ${msg}`);
      } else {
         Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Transaction</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Type Toggle */}
        <View style={styles.typeContainer}>
            <TouchableOpacity 
                style={[styles.typeBtn, type === 'expense' && styles.activeExpense]} 
                onPress={() => setType('expense')}
            >
                <Text style={[styles.typeText, type === 'expense' && styles.activeTypeText]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.typeBtn, type === 'income' && styles.activeIncome]} 
                onPress={() => setType('income')}
            >
                <Text style={[styles.typeText, type === 'income' && styles.activeTypeText]}>Income</Text>
            </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.input}
                placeholder="What is this for?"
                placeholderTextColor="#64748B"
                value={description}
                onChangeText={setDescription}
            />
        </View>

        {/* Categories */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
                {CATEGORIES.map(cat => (
                    <TouchableOpacity 
                        key={cat} 
                        style={[styles.catChip, category === cat && styles.activeCatChip]}
                        onPress={() => setCategory(cat)}
                    >
                        <Text style={[styles.catText, category === cat && styles.activeCatText]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Save Transaction</Text>}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 20 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  
  content: { padding: 20, paddingBottom: 50 },
  
  typeContainer: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 12, padding: 4, marginBottom: 24 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  activeExpense: { backgroundColor: '#EF4444' },
  activeIncome: { backgroundColor: '#10B981' },
  typeText: { color: '#94A3B8', fontWeight: '600' },
  activeTypeText: { color: 'white' },

  inputGroup: { marginBottom: 24 },
  label: { color: '#94A3B8', marginBottom: 8, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#1E293B', color: 'white', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#334155' },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  activeCatChip: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  catText: { color: '#CBD5E1' },
  activeCatText: { color: '#020617', fontWeight: 'bold' },

  saveBtn: { backgroundColor: '#D4AF37', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#020617', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});
