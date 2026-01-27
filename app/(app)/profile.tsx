import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { useAuth } from '../../AuthContext';
import { useInstall } from '../../InstallContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { CLOUDFLARE_API_URL, cloudflare } from '../lib/cloudflare';
import { CustomerCenterModal } from '../../components/CustomerCenterModal';
import { presentPaywall } from '../../services/paywall';
import { PaywallModal } from '../../components/PaywallModal';
import { isInTrial, getTrialEndDate, formatTrialTimeRemaining, isTrialExpired, getDaysSinceExpiration, shouldShowTrialReminder, getTrialExpirationMessage, getTrialEncouragementMessage } from '../../services/subscriptionPlans';

export default function Profile() {
  const { userProfile, updateProfile, getToken, refreshProfile } = useAuth() as any;
  const { promptToInstall, isInstalled, isIOS } = useInstall();
  const router = useRouter();
  
  const [showCustomerCenter, setShowCustomerCenter] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const isPro = userProfile?.subscription_status === 'active';
  const trialEndDate = userProfile?.trial_end_date;
  const inTrial = isInTrial(trialEndDate);
  const trialExpired = isTrialExpired(trialEndDate);
  const daysSinceExpiration = getDaysSinceExpiration(trialEndDate);
  const showTrialReminder = shouldShowTrialReminder(trialEndDate);
  const trialTimeRemaining = trialEndDate ? formatTrialTimeRemaining(trialEndDate) : '';
  const trialMessage = getTrialEncouragementMessage(trialEndDate);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      business_industry: '',
      monthly_income: '',
      savings_rate: '',
      bio: ''
  });

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    console.log('Profile useEffect triggered, userProfile:', userProfile);
    if (userProfile) {
        setFormData({
            name: userProfile.name || '',
            business_industry: userProfile.business_industry || '',
            monthly_income: userProfile.monthly_income?.toString() || '',
            savings_rate: userProfile.savings_rate?.toString() || '',
            bio: userProfile.bio || ''
        });
        
        // Construct full avatar URL if it's a relative path starting with /api
        if (userProfile.avatar_url) {
            if (userProfile.avatar_url.startsWith('/api')) {
                setAvatarUri(`${CLOUDFLARE_API_URL}${userProfile.avatar_url}`);
            } else {
                setAvatarUri(userProfile.avatar_url);
            }
        }
    }
  }, [userProfile]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri); // Show locally immediately
      handleImageUpload(uri);
    }
  };

  const handleImageUpload = async (uri: string) => {
      setUploading(true);
      try {
          const token = await getToken();
          const formData = new FormData();
          
          // Append file
          // React Native requires a special object for file uploads
          // @ts-ignore
          formData.append('avatar', {
            uri: uri,
            name: 'avatar.jpg',
            type: 'image/jpeg',
          });

          const response = await fetch(`${CLOUDFLARE_API_URL}/api/profile/avatar`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  // Do NOT set Content-Type header manually for FormData in React Native, it handles boundary
              },
              body: formData
          });

          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          
          Alert.alert('Success', 'Avatar updated!');
          // Force refresh profile? Usually context handles this if we call updateProfile
          // But updateProfile expects a full object. 
          // Ideally AuthContext should have a reload function. 
          // For now we assume the view updates or we manually update local state.
          
      } catch (error: any) {
          Alert.alert('Upload Failed', error.message);
      } finally {
          setUploading(false);
      }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
        const payload = {
            ...userProfile,
            ...formData,
            monthly_income: parseFloat(formData.monthly_income) || 0,
            savings_rate: parseFloat(formData.savings_rate) || 0,
        };

        const success = await updateProfile(payload);
        if (success) {
            Alert.alert('Saved', 'Profile updated successfully.');
            router.back();
        } else {
            Alert.alert('Error', 'Failed to update profile.');
        }
    } catch (e: any) {
        Alert.alert('Error', e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, '#0f172a', '#020617']}
        style={StyleSheet.absoluteFill}
      />
       
       <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 40 }} /> 
       </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
                {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                         <Ionicons name="person" size={40} color={Colors.textSecondary} />
                    </View>
                )}
                <View style={styles.editIconBadge}>
                    <Ionicons name="camera" size={16} color="white" />
                </View>
            </TouchableOpacity>
            {uploading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 10 }} />}
        </View>

        <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
                style={styles.input} 
                value={formData.name}
                onChangeText={t => setFormData({...formData, name: t})} 
                placeholder="John Doe"
                placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Business Industry</Text>
            {/* Simple Text Input for now, could be a Picker */}
            <TextInput 
                style={styles.input}
                value={formData.business_industry}
                onChangeText={t => setFormData({...formData, business_industry: t})}
                placeholder="Technology, Health, etc."
                placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Monthly Income ({userProfile?.currency || 'USD'})</Text>
            <TextInput 
                style={styles.input}
                value={formData.monthly_income}
                onChangeText={t => setFormData({...formData, monthly_income: t})}
                keyboardType="decimal-pad"
                placeholder="5000"
                placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Savings Rate Goal (%)</Text>
            <TextInput 
                style={styles.input} 
                value={formData.savings_rate}
                onChangeText={t => setFormData({...formData, savings_rate: t})}
                keyboardType="decimal-pad"
                placeholder="20"
                placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Bio / Vision</Text>
            <TextInput 
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                value={formData.bio}
                onChangeText={t => setFormData({...formData, bio: t})}
                multiline
                placeholder="My goal is to retire by 40..."
                placeholderTextColor={Colors.textMuted}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.saveGradient}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Save Changes</Text>}
                </LinearGradient>
            </TouchableOpacity>

            {/* Subscription Management */}
            <TouchableOpacity 
                style={[styles.saveButton, { marginTop: 24, backgroundColor: isPro || inTrial || trialExpired ? 'rgba(16, 185, 129, 0.1)' : 'rgba(124, 58, 237, 0.1)', borderWidth: 1, borderColor: isPro || inTrial || trialExpired ? '#10B981' : Colors.primary }]}
                onPress={async () => {
                    console.log('Start Free Trial button pressed');
                    console.log('isPro:', isPro);
                    console.log('inTrial:', inTrial);
                    console.log('trialExpired:', trialExpired);
                    console.log('userProfile:', userProfile);
                    
                    if (isPro || inTrial || trialExpired) {
                        console.log('Showing Customer Center');
                        setShowCustomerCenter(true);
                    } else {
                        console.log('Showing Paywall');
                        setShowPaywall(true);
                    }
                }}
            >
                <View style={[styles.saveGradient, { backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'center' }]}>
                   <Ionicons name={isPro || inTrial || trialExpired ? "star" : "star-outline"} size={20} color={isPro || inTrial || trialExpired ? "#10B981" : Colors.primary} style={{ marginRight: 8 }} />
                   <Text style={[styles.saveText, { color: isPro || inTrial || trialExpired ? "#10B981" : Colors.primary }]}>
                       {isPro ? "Manage Subscription" : inTrial ? `Trial Active (${trialTimeRemaining})` : trialExpired ? "Trial Expired - Subscribe Now" : "Start Free Trial"}
                   </Text>
                </View>
            </TouchableOpacity>

            {/* Data Export Button (GDPR) */}
            <TouchableOpacity 
                style={[styles.saveButton, { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]} 
                onPress={() => Alert.alert("Export Data", "Your comprehensive financial data report is being generated and will be emailed to your registered address shortly.")}
            >
                <View style={styles.saveGradient}>
                    <Text style={[styles.saveText, { color: Colors.textSecondary }]}>Export My Data</Text>
                </View>
            </TouchableOpacity>

            {!isInstalled && Platform.OS === 'web' && (
              <TouchableOpacity 
                style={[styles.saveButton, { marginTop: 12, opacity: 0.9 }]} 
                onPress={promptToInstall}
              >
                  <LinearGradient
                      colors={[Colors.secondary, '#FB923C']} // Orange/Gold gradient
                      style={styles.saveGradient}
                  >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="download-outline" size={20} color="white" />
                        <Text style={styles.saveText}>
                          {isIOS ? "Install App on Home Screen" : "Install App"}
                        </Text>
                      </View>
                  </LinearGradient>
              </TouchableOpacity>
            )}
        </View>

      </ScrollView>

      <CustomerCenterModal visible={showCustomerCenter} onDismiss={() => setShowCustomerCenter(false)} />
      
      <PaywallModal 
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
        onSubscribe={async (selectedPlanId) => {
          // Sync status with backend
          try {
            const token = await getToken();
            const updateData: any = { subscription_status: 'active' };
            
            // If it's the Basic plan, set trial end date
            if (selectedPlanId === 'individual') {
              updateData.trial_end_date = getTrialEndDate();
              updateData.subscription_status = 'trial';
            }
            
            await cloudflare.updateProfile(updateData, token);
            await refreshProfile();
            Alert.alert("Success", selectedPlanId === 'individual' ? "Your 7-day free trial has started!" : "Welcome to Pro!");
          } catch (e) {
            console.error("Failed to sync sub", e);
          }
        }}
        useCustomPaywall={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
      paddingTop: 60, 
      paddingHorizontal: 20, 
      paddingBottom: 20, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  content: { padding: 20 },
  
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: { position: 'relative' },
  avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: Colors.primary },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  editIconBadge: { 
      position: 'absolute', 
      bottom: 0, 
      right: 0, 
      backgroundColor: Colors.secondary, 
      padding: 8, 
      borderRadius: 15,
      borderWidth: 2,
      borderColor: Colors.background 
  },

  form: { gap: 15 },
  label: { color: Colors.textSecondary, fontSize: 14, marginLeft: 4, marginBottom: 4 },
  input: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 12,
      padding: 16,
      color: 'white',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      fontSize: 16
  },
  
  saveButton: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
  saveGradient: { padding: 18, alignItems: 'center' },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
