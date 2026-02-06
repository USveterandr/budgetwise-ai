import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { getAllPlans } from '../services/subscriptionPlans';
import { purchasePlanWeb } from '../services/paywall';
import { useAuth } from '../AuthContext';
import { cloudflare } from '../app/lib/cloudflare';
import { useRouter } from 'expo-router';

// Map the subscription plans to the format expected by WebPaywall
const SUBSCRIPTION_PLANS = getAllPlans().map(plan => ({
  id: plan.id,
  name: plan.name,
  price: `$${plan.price.monthly.toFixed(2)}`,
  period: 'month',
  features: plan.features,
  popular: plan.popular || false
}));

interface WebPaywallProps {
  onDismiss: () => void;
  onSuccess?: () => void;
}

export const WebPaywall: React.FC<WebPaywallProps> = ({ onDismiss, onSuccess }) => {
  console.log('WebPaywall component rendered');
  
  const { updateProfile, getToken } = useAuth() as any;
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    setProcessingPlan(planId);
    setLoading(true);

    try {
      // Simulate payment processing
      const success = await purchasePlanWeb(planId);

      if (success) {
        // Update user subscription in the backend
        const token = await getToken();
        if (token) {
          try {
            // Get the current user ID from the token or context
            const user = await cloudflare.getProfile(token);
            
            // Determine if this should be a trial based on the selected plan
            // Only the 'individual' plan starts as a trial, other plans are active immediately
            const isTrial = selectedPlan === 'individual';
            
            await cloudflare.updateSubscription(
              user.user_id || user.userId,
              { 
                tier: selectedPlan, // Use the selected plan
                billingCycle: 'monthly', // Default to monthly for web
                isTrial: isTrial,
                status: isTrial ? 'trial' : 'active',
                email: user.email,
                name: user.name
              },
              token
            );
            updateProfile({ 
              subscription_status: isTrial ? 'trial' : 'active', 
              subscription_plan: selectedPlan 
            });
          } catch (error) {
            console.error('Error updating subscription:', error);
            Alert.alert('Error', 'Subscription was successful but profile update failed. Please refresh your profile.');
          }
        }

        // Call success callbacks and navigate to dashboard
        onSuccess?.();
        onDismiss();
        
        // Navigate to dashboard to show updated subscription status
        router.push('/dashboard');
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert(
            'Success!',
            `You've successfully upgraded to the ${SUBSCRIPTION_PLANS.find(p => p.id === planId)?.name} plan!`
          );
        }, 500);
      } else {
        Alert.alert('Payment Failed', 'Unable to process your payment. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'An error occurred during payment processing. Please try again.');
    } finally {
      setLoading(false);
      setProcessingPlan(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upgrade to Pro</Text>
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Unlock powerful AI features and advanced analytics to master your finances.
        </Text>

        {/* Plans Container */}
        <ScrollView style={styles.plansContainer} showsVerticalScrollIndicator={false}>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.selectedPlanCard,
                plan.popular && styles.popularPlanCard
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.7}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Ionicons name="star" size={14} color="#FCD34D" />
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}

              {/* Plan Header */}
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{plan.price}</Text>
                  <Text style={styles.period}>/{plan.period}</Text>
                </View>
              </View>

              {/* Features List */}
              <View style={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={Colors.success}
                      style={styles.featureIcon}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Selection Indicator */}
              <View
                style={[
                  styles.selectionIndicator,
                  selectedPlan === plan.id && styles.selectedIndicator
                ]}
              >
                <Ionicons
                  name={selectedPlan === plan.id ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selectedPlan === plan.id ? Colors.primary : Colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaButton, (loading || processingPlan) && styles.ctaButtonDisabled]}
          onPress={() => handlePurchase(selectedPlan)}
          disabled={loading || processingPlan !== null}
        >
          {processingPlan === selectedPlan ? (
            <>
              <ActivityIndicator color="white" style={styles.buttonSpinner} />
              <Text style={styles.ctaButtonText}>Processing...</Text>
            </>
          ) : (
            <Text style={styles.ctaButtonText}>
              {selectedPlan === 'individual' ? 'Start Free Trial' : 'Subscribe Now'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Footer Text */}
        <Text style={styles.footerText}>
          7-day free trial. No credit card required. Cancel anytime.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}15`,
  },
  popularPlanCard: {
    borderColor: Colors.gold,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 16,
    backgroundColor: Colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  planHeader: {
    marginBottom: 16,
    marginTop: 4,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
  },
  period: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  featuresList: {
    gap: 12,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  selectionIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  selectedIndicator: {
    borderTopColor: Colors.primary,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  buttonSpinner: {
    marginRight: 8,
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
