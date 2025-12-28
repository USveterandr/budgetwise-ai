import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator, Linking } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import { cloudflare } from '../../app/lib/cloudflare';
import { useState, useEffect } from "react";

export default function Done() {
  const router = useRouter();
  const { data, resetData } = useOnboarding();
  const { user, getToken, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Validate that we have all required data
    if (data && data.name && data.income && data.currency && data.industry && data.goals) {
      setIsDataLoaded(true);
    }
    
    // Cleanup function
    return () => {
      // Reset retry count when component unmounts
      setRetryCount(0);
    };
  }, [data]);

  const handleComplete = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated. Please log in again.");
      return;
    }
    
    if (!isDataLoaded) {
      Alert.alert("Error", "Please complete all onboarding steps first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const idToken = await getToken();
      if (!idToken) {
        throw new Error("Authentication token missing");
      }

      // Clean and format income
      const cleanIncome = (data.income || '').replace(/[^0-9.]/g, '');
      const incomeVal = parseFloat(cleanIncome);
      
      // Prepare profile data
      const updateData = {
        user_id: user.id,
        name: data.name.trim(),
        email: user.email,
        monthly_income: isNaN(incomeVal) ? 0 : incomeVal,
        currency: data.currency || 'USD',
        business_industry: data.industry || 'General',
        bio: data.goals || 'No goals specified',
        updated_at: new Date().toISOString()
      };

      console.log("Updating profile with:", updateData);
      
      // Update profile in Cloudflare D1
      const result = await cloudflare.updateProfile(updateData, idToken);
      
      if (!result || !result.success) {
        throw new Error(result?.error || 'Profile update failed');
      }
      
      // Refresh the user profile in the auth context
      await refreshProfile();
      
      // Reset the onboarding data
      await resetData();
      
      // Navigate to the dashboard
      router.replace("/(tabs)/dashboard");
    } catch (err: any) {
      console.error("Onboarding Error:", err);
      
      // Handle specific error cases
      if (err.message.includes('token')) {
        // Token-related error - redirect to login
        setTimeout(() => {
          router.replace("/auth/login");
        }, 2000);
        
        setError("Authentication failed. Redirecting to login...");
      } else if (retryCount < 3) {
        // Retry mechanism
        setRetryCount(prev => prev + 1);
        setError(`Failed to save data. Auto-retrying (${retryCount + 1}/3)...`);
        
        setTimeout(() => {
          handleComplete();
        }, 2000);
      } else {
        // Show error message with retry option
        setError(err.message || 'Failed to save your data');
        Alert.alert(
          "Error", 
          `${err.message || "An error occurred while saving your data"}\n\nWould you like to try again?`,
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Retry", 
              onPress: () => {
                setRetryCount(0);
                setError(null);
                setLoading(false);
              }
            }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };


  if (!data) {
    return (
      <View style={[styles.container, { backgroundColor: '#0F172A' }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.content, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ color: '#FFF', marginTop: 16 }}>Loading onboarding data...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#0F172A', '#020617']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.checkContainer}>
              <Ionicons name="checkmark-done-circle" size={80} color="#22C55E" />
            </View>
            <Text style={styles.title}>Profile Completed 🎉</Text>
            <Text style={styles.subtitle}>
              You're all set. Let's start managing your money smarter.
            </Text>
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Ionicons name="person" size={24} color={Colors.primary} />
              <Text style={styles.summaryText}>{data.name || 'Your name'}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="cash" size={24} color={Colors.primary} />
              <Text style={styles.summaryText}>
                {data.income ? `$${parseFloat(cleanIncome).toLocaleString()}/mo` : 'Income not specified'}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="briefcase" size={24} color={Colors.primary} />
              <Text style={styles.summaryText}>{data.industry || 'Industry not specified'}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="flag" size={24} color={Colors.primary} />
              <Text style={styles.summaryText}>{data.goals || 'No specific goals'}</Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity 
            style={styles.button}
            onPress={handleComplete}
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
                  <Text style={styles.buttonText}>Complete Setup</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => {
              // Reset onboarding data but don't save to backend
              resetData();
              router.replace("/(tabs)/dashboard");
            }}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
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
  scrollContent: {
    padding: 32,
    alignItems: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  checkContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  summary: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    marginLeft: 12,
    color: '#FFF',
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    marginLeft: 8,
    color: '#EF4444',
    fontSize: 14,
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
    marginBottom: 16,
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
    width: '100%',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
});
