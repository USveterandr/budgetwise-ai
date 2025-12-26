import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { cloudflare } from './lib/cloudflare';

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [income, setIncome] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [industry, setIndustry] = useState('General');
  const [loading, setLoading] = useState(false);

  // Sync name from user object if it becomes available after mount
  React.useEffect(() => {
    if (user?.name && !name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleComplete = async () => {
    // Sanitize income (remove commas, currency symbols, etc.)
    const cleanIncome = income.replace(/[^0-9.]/g, '');
    const incomeVal = parseFloat(cleanIncome);

    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please provide your name.');
      return;
    }
    if (!cleanIncome || isNaN(incomeVal) || incomeVal <= 0) {
      Alert.alert('Invalid Income', 'Please provide a valid monthly income greater than 0.');
      return;
    }

    setLoading(true);
    try {
      console.log('Completing onboarding for user:', user?.id);
      const updateData = {
        user_id: user?.id,
        name: name.trim(),
        email: user?.email,
        monthly_income: incomeVal,
        currency,
        business_industry: industry,
        updated_at: new Date().toISOString()
      };
      
      const result = await cloudflare.updateProfile(updateData);
      console.log('Profile update result:', result);
      
      if (result.success) {
        // Refresh the global auth state
        await refreshProfile();
        console.log('Profile refreshed in AuthContext');
        
        // Give a small delay to ensure state updates before navigation
        setTimeout(() => {
          router.replace('/(tabs)/dashboard');
        }, 500);
      } else {
        throw new Error(result.error || 'Server returned failure');
      }
    } catch (error: any) {
      console.error('Onboarding error details:', error);
      Alert.alert('Setup Failed', `We couldn't save your profile: ${error.message || 'Network error'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to Budgetwise</Text>
              <Text style={styles.subtitle}>Let's set up your profile to give you personalized financial insights.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>What's your full name?</Text>
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
                  {['USD', 'EUR', 'GBP'].map((curr) => (
                    <TouchableOpacity 
                      key={curr}
                      style={[styles.currencyChip, currency === curr && styles.activeChip]}
                      onPress={() => setCurrency(curr)}
                    >
                      <Text style={[styles.chipText, currency === curr && styles.activeChipText]}>{curr}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business or Profession</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.industrySelector}>
                  {[
                    "Plumber", "Electrician", "Truck Driver", "Insurance Agent",
                    "Real Estate Agent", "Graphic Designer", "Software Developer",
                    "Restaurant Owner", "Retail Store", "Construction", "Consultant",
                    "Landscaping", "Auto Mechanic", "Other"
                  ].map((ind) => (
                    <TouchableOpacity 
                      key={ind}
                      style={[styles.industryChip, industry === ind && styles.activeChip]}
                      onPress={() => setIndustry(ind)}
                    >
                      <Text style={[styles.chipText, industry === ind && styles.activeChipText]}>{ind}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleComplete}
                disabled={loading}
              >
                <LinearGradient
                  colors={[Colors.primary, '#6366F1']}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Setting up...' : 'Complete Profile'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 20,
    color: '#FFF',
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  incomeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    gap: 12,
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
