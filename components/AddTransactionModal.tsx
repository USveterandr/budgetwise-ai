import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../constants/Colors';
import { Button } from './ui/Button';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (transaction: { description: string; amount: number; category: string; type: 'income' | 'expense' }) => void;
  prefilledData?: { description: string; amount: number; category: string; type: 'income' | 'expense' };
}

// Expanded categories with subcategories for better organization
const categories = [
  'Food',
  'Housing',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Health',
  'Income',
  'Education',
  'Travel',
  'Insurance',
  'Investments',
  'Gifts',
  'Personal Care',
  'Subscriptions',
  'Charity',
  'Business',
  'Other'
];

// Smart categorization keywords
const categoryKeywords: Record<string, string[]> = {
  'Food': ['restaurant', 'cafe', 'grocery', 'food', 'meal', 'dining', 'coffee', 'lunch', 'dinner', 'breakfast'],
  'Housing': ['rent', 'mortgage', 'property', 'home', 'apartment', 'house', 'real estate'],
  'Transportation': ['gas', 'fuel', 'car', 'uber', 'taxi', 'bus', 'train', 'flight', 'parking', 'toll'],
  'Entertainment': ['movie', 'concert', 'game', 'streaming', 'netflix', 'spotify', 'ticket'],
  'Utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'wifi', 'utility'],
  'Shopping': ['clothing', 'electronics', 'amazon', 'store', 'mall', 'purchase'],
  'Health': ['doctor', 'hospital', 'medicine', 'pharmacy', 'insurance', 'dentist', 'gym'],
  'Education': ['school', 'college', 'university', 'tuition', 'book', 'course'],
  'Travel': ['hotel', 'airbnb', 'vacation', 'trip', 'tour', 'flight'],
  'Insurance': ['insurance', 'premium', 'policy'],
  'Investments': ['stock', 'bond', 'mutual fund', 'etf', 'dividend'],
  'Subscriptions': ['subscription', 'membership', 'monthly fee'],
  'Personal Care': ['haircut', 'salon', 'spa', 'cosmetics'],
  'Business': ['business', 'office', 'equipment', 'software'],
};

export function AddTransactionModal({ visible, onClose, onAdd, prefilledData }: AddTransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  // Update form fields when prefilledData changes
  useEffect(() => {
    if (prefilledData) {
      setDescription(prefilledData.description);
      setAmount(prefilledData.amount.toString());
      setCategory(prefilledData.category);
      setType(prefilledData.type);
    } else {
      // Reset to defaults when there's no prefilled data
      setDescription('');
      setAmount('');
      setCategory('Food');
      setType('expense');
    }
  }, [prefilledData, visible]); // Also reset when modal visibility changes

  // Smart categorization based on description
  useEffect(() => {
    if (description) {
      const lowerDesc = description.toLowerCase();
      
      // Check each category for matching keywords
      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerDesc.includes(keyword))) {
          setCategory(cat);
          break;
        }
      }
    }
  }, [description]);

  const handleAdd = () => {
    if (description && amount) {
      onAdd({ description, amount: parseFloat(amount), category, type });
      // Don't reset here - let the parent component handle resetting
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Transaction</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={DashboardColors.text} />
            </TouchableOpacity>
          </View>

          <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} placeholderTextColor={DashboardColors.textSecondary} />
          <TextInput style={styles.input} placeholder="Amount" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholderTextColor={DashboardColors.textSecondary} />

          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            {(['expense', 'income'] as const).map(t => (
              <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeBtnActive]} onPress={() => setType(t)}>
                <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(c => (
              <TouchableOpacity key={c} style={[styles.categoryBtn, category === c && styles.categoryBtnActive]} onPress={() => setCategory(c)}>
                <Text style={[styles.categoryText, category === c && styles.categoryTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.buttons}>
            <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
            <Button title="Add" onPress={handleAdd} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: DashboardColors.text },
  input: { borderWidth: 1, borderColor: DashboardColors.border, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16, color: DashboardColors.text },
  label: { fontSize: 14, fontWeight: '600', color: DashboardColors.text, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: DashboardColors.border, alignItems: 'center' },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { fontWeight: '600', color: DashboardColors.textSecondary },
  typeTextActive: { color: '#FFF' },
  categoryScroll: { marginBottom: 20 },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: DashboardColors.border, marginRight: 8 },
  categoryBtnActive: { backgroundColor: Colors.primary },
  categoryText: { fontWeight: '500', color: DashboardColors.textSecondary },
  categoryTextActive: { color: '#FFF' },
  buttons: { flexDirection: 'row' },
});