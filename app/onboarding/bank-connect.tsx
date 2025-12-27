import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function BankConnect() {
  const router = useRouter();

  const handleConnect = () => {
    // Placeholder for Plaid or other integration
    router.push("/onboarding/goals");
  };

  const handleSkip = () => {
    router.push("/onboarding/goals");
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#0F172A', '#020617']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.stepText}>Step 3 of 4</Text>
            <Text style={styles.title}>Connect Your Bank</Text>
            <Text style={styles.subtitle}>
              Securely link your accounts to automatically track expenses and income.
            </Text>
          </View>

          <View style={styles.illustration}>
            <Ionicons name="card" size={80} color={Colors.primary} />
            <View style={styles.shieldContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#22C55E" />
            </View>
          </View>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
              <Text style={styles.featureText}>Bank-level security</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
              <Text style={styles.featureText}>Automatic categorization</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
              <Text style={styles.featureText}>Real-time updates</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.button}
              onPress={handleConnect}
            >
              <LinearGradient
                colors={[Colors.primary, '#6366F1']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Connect Account</Text>
                <Ionicons name="link" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
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
    flexGrow: 1,
  },
  header: {
    marginBottom: 48,
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
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    height: 160,
  },
  shieldContainer: {
    position: 'absolute',
    bottom: 20,
    right: '35%',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 4,
  },
  features: {
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
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
