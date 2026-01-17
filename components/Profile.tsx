import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../AuthContext';
import { useFinance } from '../context/FinanceContext';
import { cloudflare } from '../app/lib/cloudflare';
import { LinearGradient } from 'expo-linear-gradient';

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
  const { currentUser, userProfile, refreshProfile, getToken } = useAuth() as any;
  
  // Map auth context user to component expected user format
  const user = { 
    id: currentUser?.uid, 
    ...currentUser, 
    ...userProfile,
    plan: userProfile?.subscription_tier || 'Starter'
  };

  const getSubscriptionPlans = () => [
    { name: 'Starter', price: 0, period: 'month', features: ['Basic Budgeting', 'Manual Tracking'], limits: {} },
    { name: 'Professional', price: 9.99, period: 'month', features: ['AI Advisor', 'Unlimited Budgets'], limits: {} }
  ];

  const upgradePlan = async (plan: any) => {
    Alert.alert('Coming Soon', 'Subscription upgrades will be available shortly.');
  };

  const { investments } = useFinance();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    monthlyIncome: 0,
    savingsRate: 0,
    currency: 'USD',
    bio: '',
    businessIndustry: 'General'
  });

  React.useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        try {
          const idToken = await getToken();
          if (!idToken) return;
          
          const data = await cloudflare.getProfile(user.id, idToken);
          if (data) {
            setProfileData(data);
            setProfile({
              monthlyIncome: data.monthly_income || 0,
              savingsRate: data.savings_rate || 0,
              currency: data.currency || 'USD',
              bio: data.bio || '',
              businessIndustry: data.business_industry || 'General'
            });
          }
        } catch (e) {
          console.error('Error loading profile:', e);
        }
      }
    };
    loadProfile();
  }, [user?.id]);
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

  const handleSaveEdit = async () => {
    if (editingField && user?.id) {
      const newValue = editingField === 'monthlyIncome' || editingField === 'savingsRate' 
        ? parseFloat(editValue) 
        : editValue;
        
      try {
        setLoading(true);
        const idToken = await getToken();
        if (!idToken) return;

        const updatedProfile = {
          ...profileData,
          user_id: user.id,
          name: user.name,
          email: user.email,
          [editingField === 'monthlyIncome' ? 'monthly_income' : 
           editingField === 'savingsRate' ? 'savings_rate' : 
           editingField === 'businessIndustry' ? 'business_industry' : 
           editingField]: newValue
        };
        
        await cloudflare.updateProfile(updatedProfile, idToken);
        setProfileData(updatedProfile);
        setProfile(prev => ({
          ...prev,
          [editingField]: newValue
        }));
        await refreshProfile();
        setEditingField(null);
        setEditValue('');
      } catch (e) {
        console.error('Error saving profile:', e);
        Alert.alert('Error', 'Failed to save profile changes.');
      } finally {
        setLoading(false);
      }
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
              keyboardType={typeof value === 'number' ? 'decimal-pad' : 'default'}
              placeholderTextColor="#64748B"
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
            <Ionicons name="pencil" size={16} color={Colors.primaryLight} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#020617', '#0F172A', '#020617']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color="#FFF" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <LinearGradient 
                  colors={['rgba(124, 58, 237, 0.3)', 'rgba(79, 70, 229, 0.3)']} 
                  style={styles.planBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.planText}>{currentPlan.name} Plan</Text>
                </LinearGradient>
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
                <LinearGradient 
                  colors={[Colors.primary, Colors.secondary]} 
                  style={styles.upgradeButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
                </LinearGradient>
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
                <Ionicons name="add" size={24} color={Colors.primaryLight} />
              </TouchableOpacity>
            </View>
            
            {incomeSources.map(source => (
              <View key={source.id} style={styles.incomeSourceRow}>
                <View style={styles.incomeSourceInfo}>
                  <Text style={styles.incomeSourceName}>{source.name}</Text>
                  <Text style={styles.incomeSourceAmount}>{formatCurrency(source.amount)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveIncomeSource(source.id)}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            
            <View style={styles.addSourceContainer}>
              <TextInput
                style={styles.sourceInput}
                placeholder="Source name"
                placeholderTextColor="#64748B"
                value={newSource.name}
                onChangeText={(text) => setNewSource({...newSource, name: text})}
              />
              <TextInput
                style={[styles.sourceInput, styles.amountInput]}
                placeholder="Amount"
                placeholderTextColor="#64748B"
                value={newSource.amount}
                onChangeText={(text) => setNewSource({...newSource, amount: text})}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddIncomeSource}
              >
                <Ionicons name="add" size={24} color="#FFF" />
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
                <Text style={styles.overviewLabel}>Savings</Text>
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
                <Ionicons name="add" size={24} color={Colors.primaryLight} />
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
                trackColor={{ false: '#334155', true: Colors.primary }}
                thumbColor="#FFF"
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#334155', true: Colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 10,
  },
  header: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 10,
    fontWeight: '500',
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  planText: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  linkText: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
  planInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  planPrice: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
  },
  planFeaturesTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '600',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#E2E8F0',
    marginLeft: 10,
    fontWeight: '500',
  },
  upgradeButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  fieldLabel: {
    fontSize: 15,
    color: '#94A3B8',
    flex: 1,
    fontWeight: '600',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldValue: {
    fontSize: 15,
    color: '#F1F5F9',
    marginRight: 10,
    fontWeight: '700',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
    padding: 10,
    color: '#FFF',
    minWidth: 120,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: Colors.success,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: Colors.error,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
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
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  goalItem: {
    marginBottom: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  goalIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLabel: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    minWidth: 160,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  pickerText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  incomeSourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  incomeSourceInfo: {
    flex: 1,
  },
  incomeSourceName: {
    fontSize: 16,
    color: '#F1F5F9',
    marginBottom: 4,
    fontWeight: '700',
  },
  incomeSourceAmount: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  addSourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  sourceInput: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 14,
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: 14,
  },
  amountInput: {
    flex: 0.6,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
});