import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Modal, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../context/OnboardingContext';
import { useState } from "react";

export default function FinancialSetup() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);

  const INDUSTRIES = [
    "Plumber","Electrician","Truck Driver","Insurance Agent","Real Estate Agent",
    "Graphic Designer","Software Developer","Restaurant Owner","Retail Store",
    "Construction","Consultant","Landscaping","Auto Mechanic","Other"
  ];

  const handleNext = () => {
    const cleanIncome = (data.income || '').replace(/[^0-9.]/g, '');
    const incomeVal = parseFloat(cleanIncome);

    if (!cleanIncome || isNaN(incomeVal) || incomeVal <= 0) {
      // Show error
      return;
    }
    router.push("/onboarding/bank-connect");
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#0F172A', '#020617']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.stepText}>Step 2 of 4</Text>
              <Text style={styles.title}>Financial Setup</Text>
              <Text style={styles.subtitle}>Help us understand your financial baseline.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monthly Net Income</Text>
                <View style={styles.incomeInputContainer}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    style={styles.incomeInput}
                    placeholder="5000"
                    placeholderTextColor="#64748B"
                    value={data.income}
                    onChangeText={(text) => updateData({ income: text })}
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
                      style={[styles.currencyChip, data.currency === curr && styles.activeChip]}
                      onPress={() => updateData({ currency: curr })}
                    >
                      <Text style={[styles.chipText, data.currency === curr && styles.activeChipText]}>
                        {curr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Profession / Industry</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowIndustryPicker(true)}>
                  <Text style={styles.dropdownButtonText}>{data.industry || 'Select Industry'}</Text>
                  <Ionicons name="chevron-down" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, !data.income && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={!data.income}
            >
              <LinearGradient
                colors={[Colors.primary, '#6366F1']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
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
                  style={[styles.modalItem, data.industry === item && styles.modalItemActive]}
                  onPress={() => {
                    updateData({ industry: item });
                    setShowIndustryPicker(false);
                  }}
                >
                  <Text style={[styles.modalItemText, data.industry === item && styles.modalItemTextActive]}>
                    {item}
                  </Text>
                  {data.industry === item && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
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
    flexGrow: 1,
  },
  header: {
    marginBottom: 32,
  },
  stepText: {
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: 8,
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
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
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
  currencyChip: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
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
  button: {
    marginTop: 'auto',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
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
});
