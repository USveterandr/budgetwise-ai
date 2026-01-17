import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Button } from '../ui/Button';
import { useFinance, Investment } from '../../context/FinanceContext';

interface EditInvestmentModalProps {
  visible: boolean;
  onClose: () => void;
  investment: Investment;
  onUpdate: () => void;
}

export function EditInvestmentModal({ visible, onClose, investment, onUpdate }: EditInvestmentModalProps) {
  const { updateInvestment, deleteInvestment } = useFinance();
  const [name, setName] = useState(investment.name);
  const [symbol, setSymbol] = useState(investment.symbol);
  const [quantity, setQuantity] = useState(investment.quantity.toString());
  const [purchasePrice, setPurchasePrice] = useState(investment.purchasePrice.toString());
  const [currentPrice, setCurrentPrice] = useState(investment.currentPrice.toString());
  const [purchaseDate, setPurchaseDate] = useState(investment.purchaseDate);
  const [type, setType] = useState(investment.type);

  useEffect(() => {
    setName(investment.name);
    setSymbol(investment.symbol);
    setQuantity(investment.quantity.toString());
    setPurchasePrice(investment.purchasePrice.toString());
    setCurrentPrice(investment.currentPrice.toString());
    setPurchaseDate(investment.purchaseDate);
    setType(investment.type);
  }, [investment]);

  const handleUpdate = async () => {
    if (!name || !symbol || !quantity || !purchasePrice || !currentPrice) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await updateInvestment(investment.id, {
        name,
        symbol,
        quantity: Number.parseFloat(quantity),
        purchasePrice: Number.parseFloat(purchasePrice),
        currentPrice: Number.parseFloat(currentPrice),
        purchaseDate,
        type,
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update investment:', error);
      Alert.alert('Error', 'Failed to update investment');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Investment',
      `Are you sure you want to delete ${investment.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInvestment(investment.id);
              onUpdate();
              onClose();
            } catch (error) {
              console.error('Failed to delete investment:', error);
              Alert.alert('Error', 'Failed to delete investment');
            }
          },
        },
      ]
    );
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
          <Text style={styles.title}>Edit Investment</Text>
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
                  onPress={() => setType(item.value as any)}
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
          <Button title="Delete" variant="outline" onPress={handleDelete} style={{ flex: 1, marginRight: 8, borderColor: Colors.error }} />
          <Button title="Update Investment" onPress={handleUpdate} style={{ flex: 1 }} />
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