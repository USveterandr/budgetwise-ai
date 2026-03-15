import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Plus, DollarSign, Trash2 } from 'lucide-react-native';

export interface IncomeSource {
  id: string;
  source: string;
  amount: number;
  date: string;
}

interface IncomeTrackerProps {
  incomes: IncomeSource[];
  onAddIncome: (income: Omit<IncomeSource, 'id'>) => void;
  onDeleteIncome: (id: string) => void;
}

export function IncomeTracker({ incomes, onAddIncome, onDeleteIncome }: IncomeTrackerProps) {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

  const handleSubmit = () => {
    if (!source || !amount) return;
    
    onAddIncome({
      source,
      amount: parseFloat(amount),
      date
    });
    
    setSource('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsAdding(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-lg font-semibold text-slate-900">Income Sources</Text>
          <Text className="text-sm text-slate-500">
            Total Income: <Text className="font-semibold text-emerald-600">{formatCurrency(totalIncome)}</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsAdding(!isAdding)}
          className="flex-row items-center bg-emerald-50 px-4 py-2 rounded-full"
        >
          <Plus size={16} color="#059669" />
          <Text className="text-emerald-600 text-sm font-medium ml-2">Add</Text>
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <Text className="text-sm font-medium text-slate-700 mb-1">Source</Text>
          <TextInput
            value={source}
            onChangeText={setSource}
            placeholder="e.g. Salary, Freelance"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white mb-4"
          />

          <Text className="text-sm font-medium text-slate-700 mb-1">Amount</Text>
          <View className="relative justify-center mb-4">
            <View className="absolute left-3 z-10">
              <DollarSign size={16} color="#94a3b8" />
            </View>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
          </View>

          <View className="flex-row justify-end mt-2">
            <TouchableOpacity
              onPress={() => setIsAdding(false)}
              className="px-4 py-2 mr-2 rounded-lg"
            >
              <Text className="text-sm font-medium text-slate-600">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="px-4 py-2 bg-emerald-600 rounded-lg"
            >
              <Text className="text-sm font-medium text-white">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="space-y-3">
        {incomes.length === 0 ? (
          <Text className="text-center text-slate-500 py-4">No income sources added yet.</Text>
        ) : (
          incomes.map((income) => (
            <View key={income.id} className="flex-row items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                  <DollarSign size={20} color="#059669" />
                </View>
                <View>
                  <Text className="font-medium text-slate-900">{income.source}</Text>
                  <Text className="text-sm text-slate-500">{new Date(income.date).toLocaleDateString()}</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Text className="font-semibold text-emerald-600 mr-4">+{formatCurrency(income.amount)}</Text>
                <TouchableOpacity onPress={() => onDeleteIncome(income.id)} className="p-2">
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
