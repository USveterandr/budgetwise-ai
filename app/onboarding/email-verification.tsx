import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from "react";

export default function EmailVerification() {
  const router = useRouter();
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleContinue = () => {
    if (user?.emailVerified) {
      router.push("/onboarding/basic-info");
    } else {
      // In a real app, we might force verification or resend email here.
      // For now, we'll allow skipping or just warn.
      Alert.alert(
        "Email Not Verified",
        "Please verify your email address to secure your account. You can continue for now.",
        [
          { text: "Check Again", onPress: () => setChecking(true) }, // In reality, this would re-fetch user
          { text: "Continue Anyway", onPress: () => router.push("/onboarding/basic-info") }
        ]
      );
    }
  };

  useEffect(() => {
    if (user?.emailVerified) {
      // Auto-advance if already verified? Maybe just show success state.
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#0F172A', '#020617']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={user?.emailVerified ? "checkmark-circle" : "mail"} 
              size={64} 
              color={user?.emailVerified ? "#22C55E" : Colors.primary} 
            />
          </View>
          
          <Text style={styles.title}>
            {user?.emailVerified ? "Email Verified!" : "Verify Your Email"}
          </Text>
          
          <Text style={styles.subtitle}>
            {user?.emailVerified 
              ? "Your email address has been successfully verified."
              : `We sent a verification link to ${user?.email}. Please check your inbox.`}
          </Text>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleContinue}
          >
            <LinearGradient
              colors={[Colors.primary, '#6366F1']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 48,
  },
  button: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
