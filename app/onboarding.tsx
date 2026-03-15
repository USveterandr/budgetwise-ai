import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../AuthContext';

export default function OnboardingScreen() {
  const router = useRouter();
  const { userProfile, updateProfile, currentUser } = useAuth() as any;
  
  const [name, setName] = useState(userProfile?.name || '');
  const [income, setIncome] = useState(userProfile?.monthly_income?.toString() || '');
  const [currency, setCurrency] = useState(userProfile?.currency || 'USD');
  const [industry, setIndustry] = useState(userProfile?.business_industry || 'General');
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const INDUSTRIES = [
    "Plumber", "Electrician", "Truck Driver", "Insurance Agent",
    "Real Estate Agent", "Graphic Designer", "Software Developer",
    "Restaurant Owner", "Retail Store", "Construction", "Consultant",
    "Landscaping", "Auto Mechanic", "Other"
  ];

  const handleComplete = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please provide your name.');
      return;
    }
    
    const incomeVal = parseFloat(income.replace(/[^0-9.]/g, ''));
    if (isNaN(incomeVal) || incomeVal <= 0) {
      Alert.alert('Invalid Income', 'Please provide a valid monthly income.');
      return;
    }

    setLoading(true);
    try {
      const success = await updateProfile({
        name: name.trim(),
        monthly_income: incomeVal,
        currency: currency,
        business_industry: industry,
        onboarding_complete: true
      });
      
      if (success) {
        router.replace('/(app)/dashboard');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#09090b', '#1c1917', '#000000']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Ionicons name="diamond-outline" size={32} color={Colors.gold} style={{ marginBottom: 16 }} />
              <Text style={styles.title}>Refine Your Experience</Text>
              <Text style={styles.subtitle}>Let's calibrate your financial dashboard for maximum precision.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alexander Hamilton"
                  placeholderTextColor="#64748B"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monthly Net Income</Text>
                <View style={styles.incomeInputContainer}>
                  <Text style={styles.currencyPrefix}>{currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}</Text>
                  <TextInput
                    style={styles.incomeInput}
                    placeholder="10000"
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
                <Text style={styles.label}>Industry / Profession</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowIndustryPicker(true)}
                >
                  <Text style={styles.dropdownButtonText}>{industry}</Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.gold} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleComplete}
                disabled={loading}
              >
                <LinearGradient
                  colors={[Colors.gold, '#B8860B']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.black} />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Complete Setup</Text>
                      <Ionicons name="arrow-forward" size={20} color={Colors.black} style={{ marginLeft: 8 }} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal
        visible={showIndustryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIndustryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Profession</Text>
              <TouchableOpacity onPress={() => setShowIndustryPicker(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={INDUSTRIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.modalItem, industry === item && styles.modalItemActive]}
                  onPress={() => {
                    setIndustry(item);
                    setShowIndustryPicker(false);
                  }}
                >
                  <Text style={[styles.modalItemText, industry === item && styles.modalItemTextActive]}>{item}</Text>
                  {industry === item && <Ionicons name="checkmark" size={20} color={Colors.gold} />}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalListContent}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: 32, paddingTop: 60 },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '700', color: Colors.white, marginBottom: 12 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 32 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.gold, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: 18, color: '#FFF', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  incomeInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, paddingHorizontal: 18, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  currencyPrefix: { fontSize: 20, color: Colors.gold, marginRight: 8 },
  incomeInput: { flex: 1, height: 60, color: '#FFF', fontSize: 20, fontWeight: '400' },
  currencySelector: { flexDirection: 'row', gap: 12 },
  currencyChip: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  activeChip: { backgroundColor: 'rgba(212, 175, 55, 0.15)', borderColor: Colors.gold },
  chipText: { color: Colors.textSecondary, fontWeight: '600' },
  activeChipText: { color: Colors.gold },
  dropdownButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  dropdownButtonText: { color: '#FFF', fontSize: 16 },
  button: { marginTop: 16, borderRadius: 18, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.5 },
  gradientButton: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: Colors.black, fontSize: 18, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1c1917', borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '80%', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.1)' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  closeButton: { padding: 4 },
  modalListContent: { padding: 16 },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 12, marginBottom: 8 },
  modalItemActive: { backgroundColor: 'rgba(212, 175, 55, 0.05)' },
  modalItemText: { fontSize: 16, color: Colors.textSecondary },
  modalItemTextActive: { color: Colors.gold, fontWeight: '600' },
});
