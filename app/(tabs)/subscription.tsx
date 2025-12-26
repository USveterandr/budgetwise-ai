import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, getSubscriptionPlans, upgradePlan } = useAuth();
  const plans = getSubscriptionPlans();

  const handleUpgrade = async (planName: 'Starter' | 'Professional' | 'Business' | 'Enterprise') => {
    Alert.alert(
      'Upgrade Plan',
      `Are you sure you want to upgrade to the ${planName} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade Now',
          onPress: async () => {
            // In a real app, this would integrate with a payment processor
            Alert.alert(
              'Payment Required', 
              'In a production environment, you would be redirected to our secure payment processor to complete your subscription.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Proceed to Payment', 
                  onPress: () => {
                    Alert.alert(
                      'Success!', 
                      `Thank you for choosing the ${planName} plan! Your subscription is now active.`,
                      [{ text: 'Continue', onPress: () => router.replace('/(tabs)/dashboard') }]
                    );
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const getCurrentPlanIndex = () => {
    if (!user) return 0;
    return plans.findIndex(plan => plan.name === user.plan);
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Premium Plans</Text>
          <Text style={styles.subtitle}>Unlock the full potential of your financial journey</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.plansContainer}>
            {plans.map((plan, index) => {
              const isCurrentPlan = user?.plan === plan.name;
              const isHigherPlan = index > getCurrentPlanIndex();
              const isProfessional = plan.name === 'Professional';
              
              return (
                <Card key={plan.name} style={[styles.planCard, isProfessional && styles.professionalCard]}>
                  {isProfessional && (
                    <LinearGradient 
                      colors={[Colors.primary, Colors.secondary]} 
                      style={styles.recommendedBadge}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.recommendedText}>MOST POPULAR</Text>
                    </LinearGradient>
                  )}
                  
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {isCurrentPlan && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>/{plan.period}</Text>
                  </View>
                  
                  <View style={styles.featuresContainer}>
                    {plan.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={18} color={isProfessional ? Colors.primaryLight : Colors.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.actionButton, 
                      isCurrentPlan ? styles.disabledButton : (isProfessional ? styles.professionalButton : styles.outlineButton)
                    ]}
                    onPress={() => !isCurrentPlan && handleUpgrade(plan.name as any)}
                    disabled={isCurrentPlan}
                  >
                    <Text style={[styles.actionButtonText, isProfessional && !isCurrentPlan ? styles.professionalButtonText : styles.outlineButtonText]}>
                      {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
                    </Text>
                  </TouchableOpacity>
                </Card>
              );
            })}
          </View>
          
          <View style={styles.testimonialSection}>
            <Text style={styles.sectionTitle}>What Our Users Say</Text>
            <Card style={styles.testimonialCard}>
              <Ionicons name="chatbubble-ellipses" size={24} color={Colors.primaryLight} style={{ marginBottom: 10 }} />
              <Text style={styles.testimonialText}>
                "BudgetWise AI transformed how I manage my wealth. The AI advisor identified $400 in recurring subscriptions I'd forgotten about!"
              </Text>
              <Text style={styles.testimonialAuthor}>— David K., Professional Plan User</Text>
            </Card>
          </View>
          
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>FAQ</Text>
            <Card style={styles.faqCard}>
              <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
              <Text style={styles.faqAnswer}>
                Yes, our subscriptions are month-to-month and can be canceled at any time from your settings.
              </Text>
            </Card>
            <Card style={styles.faqCard}>
              <Text style={styles.faqQuestion}>Is my data secure?</Text>
              <Text style={styles.faqAnswer}>
                Absolutely. We use bank-grade encryption and Firebase security protocols to keep your data private.
              </Text>
            </Card>
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: { 
    padding: 24, 
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#94A3B8', marginTop: 6, textAlign: 'center', fontWeight: '500' },
  scrollContent: {
    padding: 16,
  },
  plansContainer: { marginTop: 10 },
  planCard: { 
    marginBottom: 20, 
    padding: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  professionalCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recommendedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  planHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  planName: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  currentBadge: { 
    backgroundColor: 'rgba(16, 185, 129, 0.2)', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  currentBadgeText: { 
    color: '#10B981', 
    fontSize: 12, 
    fontWeight: '700' 
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: '600',
    marginRight: 2,
  },
  planPrice: { 
    fontSize: 42, 
    fontWeight: '900', 
    color: '#FFF', 
  },
  planPeriod: { 
    fontSize: 16, 
    color: '#94A3B8',
    fontWeight: '600',
  },
  featuresContainer: { marginBottom: 24 },
  featureItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 8 
  },
  featureText: { fontSize: 15, color: '#E2E8F0', marginLeft: 10, fontWeight: '500' },
  actionButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  professionalButton: {
    backgroundColor: Colors.primary,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  professionalButtonText: {
    color: '#FFF',
  },
  outlineButtonText: {
    color: '#F8FAFC',
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#FFF', 
    marginBottom: 16,
    marginTop: 10,
    textAlign: 'center'
  },
  testimonialSection: { marginBottom: 30 },
  testimonialCard: { 
    padding: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 20,
  },
  testimonialText: { 
    fontSize: 16, 
    fontStyle: 'italic',
    color: '#F1F5F9',
    marginBottom: 16,
    lineHeight: 24
  },
  testimonialAuthor: { 
    fontSize: 14, 
    color: '#94A3B8',
    fontWeight: '600',
  },
  faqSection: { marginBottom: 30 },
  faqCard: { 
    padding: 18,
    marginBottom: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
  },
  faqQuestion: { 
    fontSize: 16, 
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8
  },
  faqAnswer: { 
    fontSize: 14, 
    color: '#94A3B8',
    lineHeight: 22
  },
});