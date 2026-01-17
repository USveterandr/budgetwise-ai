import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';

interface AddInvestmentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export function AddInvestmentModal({ visible, onClose, onAdd }: AddInvestmentModalProps) {
  const { addInvestment } = useFinance();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('stock');

  const handleAdd = async () => {
    if (!name || !symbol || !quantity || !purchasePrice || !currentPrice) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addInvestment({
        name,
        symbol,
        quantity: parseFloat(quantity),
        purchasePrice: parseFloat(purchasePrice),
        currentPrice: parseFloat(currentPrice),
        purchaseDate,
        type: type as any,
      });
      
      // Reset form
      setName('');
      setSymbol('');
      setQuantity('');
      setPurchasePrice('');
      setCurrentPrice('');
      setType('stock');
      
      onAdd();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add investment');
    }
  };

  const investmentTypes = [
    { value: 'stock', label: 'Stock' },
    { value: 'etf', label: 'ETF' },
    { value: 'bond', label: 'Bond' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Investment</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={DashboardColors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Text style={styles.label}>Investment Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Apple Inc."
              value={name}
              onChangeText={setName}
              placeholderTextColor={DashboardColors.textSecondary}
            />

            <Text style={styles.label}>Symbol/Ticker *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., AAPL"
              value={symbol}
              onChangeText={setSymbol}
              placeholderTextColor={DashboardColors.textSecondary}
            />

            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              placeholderTextColor={DashboardColors.textSecondary}
            />

            <Text style={styles.label}>Purchase Price ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 150.00"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="decimal-pad"
              placeholderTextColor={DashboardColors.textSecondary}
            />

            <Text style={styles.label}>Current Price ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 175.50"
              value={currentPrice}
              onChangeText={setCurrentPrice}
              keyboardType="decimal-pad"
              placeholderTextColor={DashboardColors.textSecondary}
            />

            <Text style={styles.label}>Purchase Date</Text>
            <TextInput
              style={styles.input}
              value={purchaseDate}
              onChangeText={setPurchaseDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={DashboardColors.textSecondary}
            />

            <Text style={styles.label}>Investment Type</Text>
            <View style={styles.typeContainer}>
              {investmentTypes.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.typeButton,
                    type === item.value && styles.typeButtonSelected,
                  ]}
                  onPress={() => setType(item.value)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === item.value && styles.typeButtonTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttons}>
          <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
          <Button title="Add Investment" onPress={handleAdd} style={{ flex: 1 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: DashboardColors.text },
  form: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: DashboardColors.text, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: DashboardColors.border, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16, color: DashboardColors.text },
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: DashboardColors.border },
  typeButtonSelected: { backgroundColor: Colors.primary },
  typeButtonText: { fontWeight: '500', color: DashboardColors.textSecondary },
  typeButtonTextSelected: { color: '#FFF' },
  buttons: { flexDirection: 'row' },
});