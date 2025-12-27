import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../context/OnboardingContext';

export default function Goals() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();

  const handleNext = () => {
    router.push("/onboarding/done");
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
              <Text style={styles.stepText}>Step 4 of 4</Text>
              <Text style={styles.title}>Your Goals</Text>
              <Text style={styles.subtitle}>What are you aiming for?</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Main Financial Goal</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Save for a house, Pay off debt"
                  placeholderTextColor="#64748B"
                  value={data.goals}
                  onChangeText={(text) => updateData({ goals: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, !data.goals.trim() && styles.buttonDisabled]}
                onPress={handleNext}
                disabled={!data.goals.trim()}
              >
                <LinearGradient
                  colors={[Colors.primary, '#6366F1']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Finish Setup</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.skipButton}
                onPress={handleNext}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
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
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 20,
    padding: 20,
    color: '#FFF',
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    fontWeight: '600',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  actions: {
    marginTop: 'auto',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 16,
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
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
});
