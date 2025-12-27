import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from "react";

export default function BasicInfo() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.name && !data.name) {
      updateData({ name: user.name });
    }
  }, [user]);

  const handleNext = () => {
    if (!data.name.trim()) {
      // Show error or just disable button
      return;
    }
    router.push("/onboarding/financial-setup");
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
              <Text style={styles.stepText}>Step 1 of 4</Text>
              <Text style={styles.title}>Basic Information</Text>
              <Text style={styles.subtitle}>Tell us a bit about yourself.</Text>
            </View>

            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#94A3B8" />
              </View>
              <TouchableOpacity style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Upload Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#64748B"
                  value={data.name}
                  onChangeText={(text) => updateData({ name: text })}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, !data.name.trim() && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={!data.name.trim()}
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  uploadButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  uploadButtonText: {
    color: '#FFF',
    fontWeight: '600',
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
});
