import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, 
  KeyboardAvoidingView, Platform, ScrollView, Alert, Modal, FlatList 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

// FIXED PATH
import { cloudflare } from './lib/cloudflare';

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, refreshProfile, getToken } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [income, setIncome] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [industry, setIndustry] = useState('General');
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const INDUSTRIES = [
    "Plumber","Electrician","Truck Driver","Insurance Agent","Real Estate Agent",
    "Graphic Designer","Software Developer","Restaurant Owner","Retail Store",
    "Construction","Consultant","Landscaping","Auto Mechanic","Other"
  ];

  // Sync updated user name if late-loaded
  useEffect(() => {
    if (user?.name && !name) setName(user.name);
  }, [user]);

  // Auto navigate if already completed
  useEffect(() => {
    if (user?.onboardingComplete) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user?.onboardingComplete]);

  const handleComplete = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please provide your name.');
      return;
    }

    const cleanIncome = (income || '').replace(/[^0-9.]/g, '');
    const incomeVal = parseFloat(cleanIncome);

    if (!cleanIncome || isNaN(incomeVal) || incomeVal <= 0) {
      Alert.alert('Invalid Income', 'Please enter a valid monthly income greater than 0.');
      return;
    }

    if (!user?.id || !user?.email) {
      Alert.alert('Error', 'User session missing. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const idToken = await getToken();
      if (!idToken) throw new Error('Authentication token missing');

      const updateData = {
        user_id: user.id,
        name: name.trim(),
        email: user.email,
        monthly_income: incomeVal,
        currency,
        business_industry: industry,
        updated_at: new Date().toISOString()
      };

      const result = await cloudflare.updateProfile(updateData, idToken);

      if (!result || !result.success) {
        throw new Error(result?.error || 'Profile update failed');
      }

      await refreshProfile();

      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Profile updated! Redirecting to dashboard...');
      }

      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      let msg = err?.message ?? 'Unexpected error occurred';

      if (err?.response) {
        try {
          const json = await err.response.json();
          msg = json?.message || json?.error || msg;
        } catch {}
      }

      Alert.alert('Setup Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#020617', '#0F172A', '#020617']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to Budgetwise</Text>
              <Text style={styles.subtitle}>
                Let's set up your profile to give you personalized financial insights.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#64748B"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monthly Net Income</Text>
                <View style={styles.incomeInputContainer}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    style={styles.incomeInput}
                    placeholder="5000"
                    placeholderTextColor="#64748B"
                    value={income}
                    onChangeText={setIncome}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Preferred Currency</Text>
                <View style={styles.currencySelector}>
                  {['USD','EUR','GBP'].map(curr => (
                    <TouchableOpacity
                      key={curr}
                      style={[styles.currencyChip, currency === curr && styles.activeChip]}
                      onPress={() => setCurrency(curr)}
                    >
                      <Text style={[styles.chipText, currency === curr && styles.activeChipText]}>
                        {curr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Profession / Industry</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowIndustryPicker(true)}>
                  <Text style={styles.dropdownButtonText}>{industry}</Text>
                  <Ionicons name="chevron-down" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                disabled={loading}
                onPress={handleComplete}
              >
                <LinearGradient
                  colors={[Colors.primary, '#6366F1']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Saving...' : 'Complete Profile'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal visible={showIndustryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Profession</Text>
              <TouchableOpacity onPress={() => setShowIndustryPicker(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={INDUSTRIES}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.modalListContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, industry === item && styles.modalItemActive]}
                  onPress={() => {
                    setIndustry(item);
                    setShowIndustryPicker(false);
                  }}
                >
                  <Text style={[styles.modalItemText, industry === item && styles.modalItemTextActive]}>
                    {item}
                  </Text>
                  {industry === item && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 32,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 20,
    padding: 20,
    color: '#FFF',
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  closeButton: {
    padding: 4,
  },
  modalListContent: {
    padding: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  modalItemText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  modalItemTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  incomeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  currencyPrefix: {
    fontSize: 20,
    color: '#94A3B8',
    marginRight: 8,
  },
  incomeInput: {
    flex: 1,
    height: 60,
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  currencySelector: {
    flexDirection: 'row',
  },
  industrySelector: {
    flexDirection: 'row',
    marginTop: 4,
  },
  currencyChip: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
  },
  industryChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: '#94A3B8',
    fontWeight: '700',
  },
  activeChipText: {
    color: '#FFF',
  },
  button: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
