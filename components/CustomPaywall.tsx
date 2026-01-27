import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SubscriptionPlan, SubscriptionTier } from '../types';
import { getAllPlans, getBillingOptions, formatPrice, calculateAnnualSavings } from '../services/subscriptionPlans';
import { revenueCat } from '../services/revenueCatService';
import { useAuth } from '../AuthContext';
import { cloudflare } from '../app/lib/cloudflare';

interface CustomPaywallProps {
  onDismiss: () => void;
  onPurchaseSuccess?: (planId: string) => void;
}

export const CustomPaywall = ({ onDismiss, onPurchaseSuccess }: CustomPaywallProps) => {
  const { updateProfile, getToken, userProfile } = useAuth() as any;
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  
  // Timer for limited-time offer
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [offerExpired, setOfferExpired] = useState(false);

  useEffect(() => {
    loadPlans();
    loadRevenueCatPackages();
    
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setOfferExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadPlans = () => {
    const allPlans = getAllPlans();
    setPlans(allPlans);
    setSelectedPlan(allPlans.find(p => p.popular) || allPlans[0]);
  };

  const loadRevenueCatPackages = async () => {
    try {
      const packages = await revenueCat.getOfferings();
      setAvailablePackages(packages);
    } catch (error) {
      console.error('Failed to load RevenueCat packages:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePurchase = async () => {
    if (!selectedPlan) return;
    
    setLoading(true);
    try {
      // Find matching RevenueCat package
      const packageName = selectedPlan.id; // Should match RevenueCat product identifiers
      const packageToPurchase = availablePackages.find(pkg => 
        pkg.identifier.toLowerCase().includes(packageName.toLowerCase())
      );

      if (packageToPurchase) {
        const success = await revenueCat.purchasePackage(packageToPurchase);
        if (success) {
          // Update backend
          try {
            const token = await getToken();
            if (token) {
              await cloudflare.updateProfile({ subscription_status: 'active' }, token);
              updateProfile({ subscription_status: 'active' });
            }
          } catch (e) {
            console.error("Failed to sync subscription to backend", e);
          }
          
          Alert.alert("Success", selectedPlan?.id === 'individual' ? "Your 7-day free trial has started!" : "Welcome to BudgetWise Pro!");
          onPurchaseSuccess?.(selectedPlan?.id || '');
          onDismiss();
        }
      } else {
        Alert.alert("Error", "Subscription package not found");
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert("Error", "Purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const success = await revenueCat.restorePurchases();
      if (success) {
        try {
          const token = await getToken();
          if (token) {
            await cloudflare.updateProfile({ subscription_status: 'active' }, token);
            updateProfile({ subscription_status: 'active' });
          }
        } catch (e) {
          console.error("Failed to sync subscription", e);
        }
        Alert.alert("Success", "Subscription restored!");
        onPurchaseSuccess?.('restored');
        onDismiss();
      } else {
        Alert.alert("No purchases found", "No previous purchases were found for your account.");
      }
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert("Error", "Restore failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
  };

  const getSavings = (plan: SubscriptionPlan) => {
    return calculateAnnualSavings(plan);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Limited Time Offer Banner */}
      {!offerExpired && (
        <View style={styles.offerBanner}>
          <Ionicons name="timer" size={20} color="#FBBF24" />
          <Text style={styles.offerText}>
            7-Day Free Trial on ALL Plans! <Text style={styles.timer}>{formatTime(timeLeft)}</Text> remaining
          </Text>
        </View>
      )}

      {/* Billing Cycle Toggle */}
      <View style={styles.billingToggle}>
        <TouchableOpacity 
          style={[styles.toggleButton, billingCycle === 'monthly' && styles.activeToggleButton]}
          onPress={() => setBillingCycle('monthly')}
        >
          <Text style={[styles.toggleText, billingCycle === 'monthly' && styles.activeToggleText]}>
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, billingCycle === 'yearly' && styles.activeToggleButton]}
          onPress={() => setBillingCycle('yearly')}
        >
          <Text style={[styles.toggleText, billingCycle === 'yearly' && styles.activeToggleText]}>
            Yearly <Text style={styles.discount}>(Save up to 20%)</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Plans Grid */}
      <ScrollView style={styles.plansContainer} showsVerticalScrollIndicator={false}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan?.id === plan.id && styles.selectedPlan,
              plan.highlight && styles.highlightedPlan
            ]}
            onPress={() => setSelectedPlan(plan)}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            
            {plan.highlight && (
              <LinearGradient
                colors={['#7e22ce', '#c084fc']}
                style={styles.highlightBadge}
              >
                <Text style={styles.highlightText}>PREMIUM</Text>
              </LinearGradient>
            )}

            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{formatPrice(getPrice(plan), billingCycle)}</Text>
                {billingCycle === 'yearly' && (
                  <Text style={styles.savingsText}>Save ${getSavings(plan).toFixed(2)}/yr</Text>
                )}
              </View>
              <View style={styles.trialBadge}>
                <Text style={styles.trialText}>7-DAY FREE TRIAL</Text>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.trialInfo}>
              <Ionicons name="information-circle" size={16} color="#93C5FD" />
              <Text style={styles.trialInfoText}>
                Start your 7-day free trial today. No credit card required. Try all features risk-free!
              </Text>
            </View>

            {selectedPlan?.id === plan.id && (
              <View style={styles.selectedIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.purchaseButton, loading && styles.disabledButton]}
          onPress={handlePurchase}
          disabled={loading}
        >
          <LinearGradient
            colors={selectedPlan?.highlight ? ['#7e22ce', '#c084fc'] : [Colors.primary, Colors.secondary]}
            style={styles.purchaseGradient}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.purchaseText}>
                {selectedPlan ? `Get ${selectedPlan.name}` : 'Select a Plan'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={loading}
        >
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Subscriptions renew automatically. Cancel anytime in settings. 7-day free trial available on all plans.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)'
  },
  offerText: {
    color: '#FBBF24',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1
  },
  timer: {
    fontWeight: 'bold',
    color: '#F59E0B'
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  activeToggleButton: {
    backgroundColor: 'rgba(109, 40, 217, 0.3)'
  },
  toggleText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14
  },
  activeToggleText: {
    color: Colors.primary
  },
  discount: {
    color: '#22C55E',
    fontSize: 12
  },
  plansContainer: {
    flex: 1,
    paddingHorizontal: 20
  },
  planCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative'
  },
  selectedPlan: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(109, 40, 217, 0.1)',
    transform: [{ scale: 1.02 }]
  },
  highlightedPlan: {
    borderColor: '#c084fc'
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 1
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  highlightBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 1
  },
  highlightText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  planHeader: {
    marginBottom: 20
  },
  planName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8
  },
  price: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold'
  },
  savingsText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '600'
  },
  featuresContainer: {
    gap: 12
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  featureText: {
    color: '#E2E8F0',
    fontSize: 15,
    flex: 1
  },
  selectedIndicator: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionsContainer: {
    padding: 20,
    gap: 16
  },
  purchaseButton: {
    borderRadius: 16,
    overflow: 'hidden'
  },
  purchaseGradient: {
    padding: 18,
    alignItems: 'center'
  },
  purchaseText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  disabledButton: {
    opacity: 0.7
  },
  restoreButton: {
    padding: 16,
    alignItems: 'center'
  },
  restoreText: {
    color: '#94A3B8',
    fontSize: 16,
    textDecorationLine: 'underline'
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18
  },
  trialBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  trialText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8
  },
  trialInfoText: {
    color: '#93C5FD',
    fontSize: 13,
    flex: 1,
    lineHeight: 18
  }
});