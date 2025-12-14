import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

interface SubscriptionTier {
  id: 'individual' | 'family' | 'business' | 'enterprise';
  name: string;
  basePrice: number;
  features: string[];
}

const BASE_TIERS: SubscriptionTier[] = [
  {
    id: 'individual',
    name: 'Individual',
    basePrice: 9.99,
    features: ['Personal AI Advisor', 'Unlimited Receipt Scans', 'Budget Tracking', '1 User Account']
  },
  {
    id: 'family',
    name: 'Couple & Family',
    basePrice: 19.99,
    features: ['All Individual Features', 'Shared Budgets & Goals', 'Up to 5 Users', 'Family Net Worth View']
  },
  {
    id: 'business',
    name: 'Small Business',
    basePrice: 49.99,
    features: ['All Family Features', 'Tax Export & Reports', 'Expense Categorization', 'Up to 10 Users']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    basePrice: 199.99,
    features: ['All Business Features', 'Dedicated API Access', 'Custom Integrations', 'Unlimited Users']
  }
];

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tier: string) => void;
  forceSubscription?: boolean;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  forceSubscription = false 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'individual' | 'family' | 'business' | 'enterprise'>('individual');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [step, setStep] = useState<'SELECT' | 'PAYMENT'>('SELECT');
  const [error, setError] = useState('');
  
  // Timer State for "One Time Offer"
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [offerExpired, setOfferExpired] = useState(false);

  // Initialize timer
  useEffect(() => {
    if (!isOpen) return;
    
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
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePurchase = async () => {
    if (!user) {
      setError('You must be logged in to subscribe');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real app, this would connect to a payment processor
      // For now, we'll simulate a successful purchase
      setTimeout(() => {
        onSuccess(selectedTier);
        setLoading(false);
        onClose();
        Alert.alert('Success', `You've successfully upgraded to the ${BASE_TIERS.find(t => t.id === selectedTier)?.name} plan!`);
      }, 1500);
    } catch (err) {
      setError('Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          {!forceSubscription && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Billing Cycle Toggle */}
        <View style={styles.billingToggle}>
          <TouchableOpacity 
            style={[styles.toggleButton, billingCycle === 'monthly' && styles.activeToggleButton]}
            onPress={() => setBillingCycle('monthly')}
          >
            <Text style={[styles.toggleText, billingCycle === 'monthly' && styles.activeToggleText]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, billingCycle === 'yearly' && styles.activeToggleButton]}
            onPress={() => setBillingCycle('yearly')}
          >
            <Text style={[styles.toggleText, billingCycle === 'yearly' && styles.activeToggleText]}>
              Yearly <Text style={styles.discount}>(Save 20%)</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* One Time Offer Timer */}
        {!offerExpired && (
          <View style={styles.offerBanner}>
            <Ionicons name="flash" size={16} color="#FBBF24" />
            <Text style={styles.offerText}>
              One Time Offer: <Text style={styles.timer}>{formatTime(timeLeft)}</Text> remaining
            </Text>
          </View>
        )}

        {/* Tier Selection */}
        <ScrollView style={styles.tiersContainer}>
          {BASE_TIERS.map((tier) => (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.tierCard,
                selectedTier === tier.id && styles.selectedTier
              ]}
              onPress={() => setSelectedTier(tier.id)}
            >
              <View style={styles.tierHeader}>
                <Text style={styles.tierName}>{tier.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>
                    ${(billingCycle === 'yearly' ? tier.basePrice * 10 : tier.basePrice).toFixed(2)}
                  </Text>
                  <Text style={styles.billingPeriod}>
                    /{billingCycle === 'yearly' ? 'yr' : 'mo'}
                  </Text>
                </View>
                {billingCycle === 'yearly' && (
                  <Text style={styles.savings}>Save ${(tier.basePrice * 2.4).toFixed(2)}</Text>
                )}
              </View>

              <View style={styles.featuresList}>
                {tier.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Error Message */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Purchase Button */}
        <TouchableOpacity
          style={[styles.purchaseButton, loading && styles.disabledButton]}
          onPress={handlePurchase}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.purchaseButtonText}>Processing...</Text>
          ) : (
            <Text style={styles.purchaseButtonText}>
              Get {BASE_TIERS.find(t => t.id === selectedTier)?.name} Plan
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          Cancel anytime.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    padding: 4,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#FFF',
  },
  discount: {
    color: '#FBBF24',
    fontWeight: 'normal',
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  offerText: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  timer: {
    fontWeight: 'bold',
  },
  tiersContainer: {
    marginBottom: 16,
  },
  tierCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedTier: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(109, 40, 217, 0.1)',
  },
  tierHeader: {
    marginBottom: 16,
  },
  tierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  billingPeriod: {
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 4,
  },
  savings: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
  featuresList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#E2E8F0',
    marginLeft: 8,
  },
  error: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  purchaseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});