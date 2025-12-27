import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from "react";

export default function EmailVerification() {
  const router = useRouter();
  const { user: authUser } = useAuth(); // Our custom user object
  const { user, isLoaded } = useUser(); // Clerk user object
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [isLoaded, user]);

  const handleSendCode = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Check if email has changed
      if (email !== user.primaryEmailAddress?.emailAddress) {
        // Create new email address
        const emailResource = await user.createEmailAddress({ email });
        await emailResource.prepareVerification({ strategy: "email_code" });
        setPendingVerification(true);
        Alert.alert("Code Sent", `Verification code sent to ${email}`);
      } else {
        // Resend to existing email
        await user.primaryEmailAddress?.prepareVerification({ strategy: "email_code" });
        setPendingVerification(true);
        Alert.alert("Code Sent", `Verification code sent to ${email}`);
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!user || !code) return;
    setLoading(true);
    try {
      // Find the email address resource we are verifying
      const emailResource = user.emailAddresses.find(e => e.emailAddress === email);
      
      if (!emailResource) {
        throw new Error("Email address not found on user profile");
      }

      const result = await emailResource.attemptVerification({ code });
      
      if (result.verification.status === "verified") {
        // If it was a new email, set as primary
        if (email !== user.primaryEmailAddress?.emailAddress) {
          await user.update({ primaryEmailAddressId: emailResource.id });
        }
        
        Alert.alert("Success", "Email verified successfully!", [
          { text: "Continue", onPress: () => router.push("/onboarding/basic-info") }
        ]);
      } else {
        Alert.alert("Verification Failed", "Invalid code. Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Verification?",
      "You can verify your email later, but some features may be limited.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Skip", onPress: () => router.push("/onboarding/basic-info") }
      ]
    );
  };

  if (!isLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#0F172A', '#020617']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={user?.primaryEmailAddress?.verification.status === 'verified' ? "checkmark-circle" : "mail"} 
                size={64} 
                color={user?.primaryEmailAddress?.verification.status === 'verified' ? "#22C55E" : Colors.primary} 
              />
            </View>
            
            <Text style={styles.title}>
              {user?.primaryEmailAddress?.verification.status === 'verified' ? "Email Verified!" : "Verify Your Email"}
            </Text>
            
            <Text style={styles.subtitle}>
              {user?.primaryEmailAddress?.verification.status === 'verified' 
                ? "Your email address has been successfully verified."
                : "Please verify your email address to secure your account."}
            </Text>

            {!user?.primaryEmailAddress?.verification.status || user.primaryEmailAddress.verification.status !== 'verified' ? (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#64748B"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!pendingVerification}
                  />
                </View>

                {pendingVerification && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Verification Code</Text>
                    <TextInput
                      style={styles.input}
                      value={code}
                      onChangeText={setCode}
                      placeholder="123456"
                      placeholderTextColor="#64748B"
                      keyboardType="number-pad"
                    />
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={pendingVerification ? handleVerify : handleSendCode}
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
                      <Text style={styles.buttonText}>
                        {pendingVerification ? "Verify Code" : "Send Verification Code"}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {pendingVerification && (
                  <TouchableOpacity onPress={() => setPendingVerification(false)} style={styles.linkButton}>
                    <Text style={styles.linkText}>Change Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.button}
                onPress={() => router.push("/onboarding/basic-info")}
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
            )}

            {(!user?.primaryEmailAddress?.verification.status || user.primaryEmailAddress.verification.status !== 'verified') && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            )}
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
  content: {
    flexGrow: 1,
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
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  form: {
    width: '100%',
    marginBottom: 24,
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
    borderRadius: 16,
    padding: 20,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: '100%',
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
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 16,
  },
  skipButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
});    color: '#94A3B8',
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
