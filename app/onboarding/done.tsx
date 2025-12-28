import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, useEffect } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import { cloudflare } from '../lib/cloudflare';
import { useState } from "react";

export default function Done() {
  const router = useRouter();
  const { data } = useOnboarding();
  const { user, getToken, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);

  const handleFinish = async (redirectRoute: string) => {
    if (!user?.id) {
      Alert.alert("Error", "User session not found. Please try logging in again.");
      return;
    }

    setLoading(true);
    try {
      const idToken = await getToken();
      if (!idToken) throw new Error('Authentication token missing');

      // Upload Avatar if exists
      if (data.avatarUri) {
        try {
          await cloudflare.uploadAvatar(user.id, data.avatarUri, idToken);
        } catch (avatarErr) {
          console.error('Avatar upload failed:', avatarErr);
        }
      }

      const cleanIncome = (data.income || '').replace(/[^0-9.]/g, '');
      const incomeVal = parseFloat(cleanIncome);

      const updateData = {
        user_id: user.id,
        name: data.name.trim(),
        email: user.email,
        monthly_income: incomeVal,
        currency: data.currency,
        business_industry: data.industry,
        bio: data.goals,
        updated_at: new Date().toISOString()
      };

      console.log("Updating profile with:", updateData);
      const result = await cloudflare.updateProfile(updateData, idToken);

      if (!result || !result.success) {
        throw new Error(result?.error || 'Profile update failed');
      }

      await refreshProfile();
      setProfileUpdated(true);
      
      console.log("Profile updated, waiting for context update...");
    } catch (err: any) {
      console.error("Onboarding Error:", err);
      Alert.alert('Setup Failed', err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Watch for changes in user.onboardingComplete status and navigate when updated
  useEffect(() => {
    if (profileUpdated && user?.onboardingComplete) {
      console.log("Navigation triggered: Onboarding complete detected in user context");
      router.replace("/(tabs)/dashboard");
    }
  }, [user?.onboardingComplete, profileUpdated]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#0F172A', '#020617']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-done-circle" size={80} color="#22C55E" />
          </View>
          
          <Text style={styles.title}>Profile Completed 🎉</Text>
          <Text style={styles.subtitle}>
            You’re all set. Let’s start managing your money smarter.
          </Text>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={() => handleFinish("/(tabs)/dashboard")}
            disabled={loading}
          >
            <LinearGradient
              colors={[Colors.primary, '#6366F1']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Go to Dashboard</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </>
              )}
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
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
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
  buttonDisabled: {
    opacity: 0.7,
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
  secondaryButton: {
    marginTop: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
});
