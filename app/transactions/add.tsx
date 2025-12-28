import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { useFinance } from '../../context/FinanceContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addTransaction } = useFinance();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.category) {
      setCategory(params.category as string);
    }
  }, [params.category]);

  const handleSave = async () => {
    if (!description || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await addTransaction({
        description,
        amount: parseFloat(amount),
        category,
        type,
        date: new Date().toISOString(),
      });
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.background, '#1E1B4B']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaViewWrapper>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Add {category !== 'General' ? category : 'Transaction'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.form}>
            
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive, { backgroundColor: type === 'expense' ? Colors.error : 'rgba(255,255,255,0.05)' }]} 
                onPress={() => setType('expense')}
              >
                <Ionicons name="arrow-up" size={20} color={Colors.text} />
                <Text style={styles.typeText}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, type === 'income' && styles.typeBtnActive, { backgroundColor: type === 'income' ? Colors.success : 'rgba(255,255,255,0.05)' }]} 
                onPress={() => setType('income')}
              >
                <Ionicons name="arrow-down" size={20} color={Colors.text} />
                <Text style={styles.typeText}>Income</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            <Input 
              label="Description" 
              placeholder="What is this for?" 
              value={description} 
              onChangeText={setDescription}
              variant="dark"
            />

            <Input 
              label="Category" 
              placeholder="Category" 
              value={category} 
              onChangeText={setCategory}
              variant="dark"
            />

            <Button 
              title="Save Transaction" 
              onPress={handleSave} 
              loading={loading}
              size="large"
              style={{ marginTop: 24 }}
            />

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaViewWrapper>
    </View>
  );
}

// Helper to handle SafeAreaView on iOS/Android
function SafeAreaViewWrapper({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 40 : 60 }}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  form: { padding: 24 },
  typeSelector: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16 },
  typeBtnActive: { transform: [{ scale: 1.02 }] },
  typeText: { color: Colors.text, fontWeight: '700', fontSize: 16 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  currencySymbol: { fontSize: 40, fontWeight: '700', color: Colors.textSecondary, marginRight: 4 },
  amountInput: { fontSize: 56, fontWeight: '900', color: Colors.text, minWidth: 100, textAlign: 'center' },
});
