import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

interface IncomeSource {
  id: string;
  name: string;
  amount: number;
}

interface UserProfile {
  monthlyIncome: number;
  savingsRate: number;
  currency: string;
  bio: string;
  businessIndustry?: string;
}

export function Profile() {
  const { user, upgradePlan, getSubscriptionPlans } = useAuth();
  const { investments } = useFinance();
  const [profile, setProfile] = useState<UserProfile>({
    monthlyIncome: 5000,
    savingsRate: 20,
    currency: 'USD',
    bio: 'Building financial freedom step by step.',
    businessIndustry: 'General'
  });
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 2500,
      deadline: '2024-12-31',
      icon: '🏥',
      color: '#22C55E'
    },
    {
      id: '2',
      name: 'New Car',
      targetAmount: 35000,
      currentAmount: 5000,
      deadline: '2025-06-30',
      icon: '🚗',
      color: '#FACC15'
    }
  ]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([
    { id: '1', name: 'Primary Job', amount: 4500 },
    { id: '2', name: 'Freelance Work', amount: 500 }
  ]);
  const [newSource, setNewSource] = useState({ name: '', amount: '' });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const businessIndustries = [
    "Plumber", "Electrician", "Truck Driver", "Insurance Agent",
    "Real Estate Agent", "Graphic Designer", "Software Developer",
    "Restaurant Owner", "Retail Store", "Construction", "Consultant",
    "Landscaping", "Auto Mechanic", "Other"
  ];

  const plans = getSubscriptionPlans();
  const currentPlan = plans.find(plan => plan.name === user?.plan) || plans[0];

  const handleSaveEdit = () => {
    if (editingField) {
      setProfile(prev => ({
        ...prev,
        [editingField]: editValue
      }));
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleEditField = (field: keyof UserProfile, value: string | number) => {
    setEditingField(field);
    setEditValue(value.toString());
  };

  const handleAddGoal = () => {
    Alert.prompt(
      'Add New Goal',
      'Enter your financial goal name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (name?: string) => {
            if (name) {
              const newGoal: Goal = {
                id: Date.now().toString(),
                name,
                targetAmount: 1000,
                currentAmount: 0,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                icon: '🎯',
                color: Colors.primary
              };
              setGoals(prev => [...prev, newGoal]);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleUpgradePlan = (newPlan: string) => {
    if (user) {
      upgradePlan(newPlan as any);
    }
  };

  const handleAddIncomeSource = () => {
    if (newSource.name && newSource.amount) {
      const newIncomeSource: IncomeSource = {
        id: Date.now().toString(),
        name: newSource.name,
        amount: parseFloat(newSource.amount)
      };
      setIncomeSources(prev => [...prev, newIncomeSource]);
      setNewSource({ name: '', amount: '' });
    }
  };

  const handleRemoveIncomeSource = (id: string) => {
    setIncomeSources(prev => prev.filter(source => source.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: profile.currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateNetWorth = () => {
    const investmentValue = investments.reduce((sum, investment) => 
      sum + (investment.quantity * investment.currentPrice), 0);
    const cashBalance = 15000; 
    return Math.round(investmentValue + cashBalance);
  };

  const renderEditableField = (label: string, value: string | number, field: keyof UserProfile) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editingField === field ? (
        <View style={styles.editContainer}>
          {field === 'businessIndustry' ? (
            <View style={styles.pickerContainer}>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => {}}
              >
                <Text style={styles.pickerText}>{editValue || 'Select Industry'}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType={typeof value === 'number' ? 'numeric' : 'default'}
            />
          )}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingField(null)}>
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.valueContainer}>
          <Text style={styles.fieldValue}>
            {typeof value === 'number' && field === 'monthlyIncome' ? formatCurrency(value) : value}
            {typeof value === 'number' && field === 'savingsRate' ? '%' : ''}
          </Text>
          <TouchableOpacity onPress={() => handleEditField(field, value)}>
            <Ionicons name="pencil" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#FFF" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planText}>{currentPlan.name} Plan</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Subscription Plan */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Subscription Plan</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.linkText}>Manage</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{currentPlan.name}</Text>
          <Text style={styles.planPrice}>${currentPlan.price}/month</Text>
        </View>
        
        <Text style={styles.planFeaturesTitle}>Plan Features:</Text>
        {currentPlan.features.slice(0, 3).map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        
        {plans.filter(p => p.name !== currentPlan.name).length > 0 && (
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => {}}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Information */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Profile Information</Text>
        </View>
        
        {renderEditableField('Monthly Income', profile.monthlyIncome, 'monthlyIncome')}
        {renderEditableField('Savings Rate', profile.savingsRate, 'savingsRate')}
        {renderEditableField('Currency', profile.currency, 'currency')}
        {renderEditableField('Business Industry', profile.businessIndustry || 'General', 'businessIndustry')}
        {renderEditableField('Bio', profile.bio, 'bio')}
      </View>

      {/* Income Sources */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Income Sources</Text>
          <TouchableOpacity onPress={handleAddIncomeSource}>
            <Ionicons name="add" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        {incomeSources.map(source => (
          <View key={source.id} style={styles.incomeSourceRow}>
            <View style={styles.incomeSourceInfo}>
              <Text style={styles.incomeSourceName}>{source.name}</Text>
              <Text style={styles.incomeSourceAmount}>{formatCurrency(source.amount)}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveIncomeSource(source.id)}>
              <Ionicons name="trash" size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        
        <View style={styles.addSourceContainer}>
          <TextInput
            style={styles.sourceInput}
            placeholder="Source name"
            value={newSource.name}
            onChangeText={(text) => setNewSource({...newSource, name: text})}
          />
          <TextInput
            style={[styles.sourceInput, styles.amountInput]}
            placeholder="Amount"
            value={newSource.amount}
            onChangeText={(text) => setNewSource({...newSource, amount: text})}
            keyboardType="numeric"
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddIncomeSource}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Financial Overview */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Financial Overview</Text>
        </View>
        
        <View style={styles.overviewGrid}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Net Worth</Text>
            <Text style={styles.overviewValue}>{formatCurrency(calculateNetWorth())}</Text>
          </View>
          
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Investments</Text>
            <Text style={styles.overviewValue}>{formatCurrency(
              investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0)
            )}</Text>
          </View>
          
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Monthly Savings</Text>
            <Text style={styles.overviewValue}>{formatCurrency(
              profile.monthlyIncome * (profile.savingsRate / 100)
            )}</Text>
          </View>
        </View>
      </View>

      {/* Financial Goals */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Financial Goals</Text>
          <TouchableOpacity onPress={handleAddGoal}>
            <Ionicons name="add" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        {goals.map(goal => {
          const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          
          return (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalName}>{goal.name}</Text>
                  <Text style={styles.goalAmount}>
                    {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                  </Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: goal.color }]} />
              </View>
              <Text style={styles.progressText}>Deadline: {new Date(goal.deadline).toLocaleDateString()}</Text>
            </View>
          );
        })}
      </View>

      {/* Settings */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Settings</Text>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: Colors.primary }}
            thumbColor={notificationsEnabled ? '#FFF' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: Colors.primary }}
            thumbColor={darkMode ? '#FFF' : '#f4f3f4'}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 16,
  },
  header: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  planBadge: {
    backgroundColor: 'rgba(109, 40, 217, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  planText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  linkText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  planInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  planPrice: {
    fontSize: 16,
    color: '#94A3B8',
  },
  planFeaturesTitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#E2E8F0',
    marginLeft: 8,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  upgradeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  fieldLabel: {
    fontSize: 16,
    color: '#E2E8F0',
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldValue: {
    fontSize: 16,
    color: '#FFF',
    marginRight: 8,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 8,
    color: '#FFF',
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#334155',
  },
  saveButton: {
    backgroundColor: Colors.success,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: Colors.error,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  goalItem: {
    marginBottom: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 14,
    color: '#94A3B8',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  settingLabel: {
    fontSize: 16,
    color: '#E2E8F0',
  },
  // Picker styles
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    backgroundColor: '#0F172A',
    minWidth: 150,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#FFF',
  },
  // Income sources styles
  incomeSourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  incomeSourceInfo: {
    flex: 1,
  },
  incomeSourceName: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 4,
  },
  incomeSourceAmount: {
    fontSize: 14,
    color: '#94A3B8',
  },
  addSourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  sourceInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#334155',
  },
  amountInput: {
    flex: 0.5,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});