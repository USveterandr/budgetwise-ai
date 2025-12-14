import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Transform your financial management with BudgetWise AI</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Why BudgetWise AI is a Must-Have</Text>
          <Text style={styles.heroSubtitle}>
            Join thousands of individuals and businesses who have revolutionized their financial management
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan, index) => {
            const isCurrentPlan = user?.plan === plan.name;
            const isHigherPlan = index > getCurrentPlanIndex();
            
            return (
              <Card key={plan.name} style={styles.planCard}>
                <View style={[styles.planContent, isCurrentPlan && styles.currentPlanCard]}>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {isCurrentPlan && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.planPrice}>
                  ${plan.price}/{plan.period}
                </Text>
                
                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Text style={[styles.featureText, plan.name === 'Business' && styles.businessFeature]}>
                        {plan.name === 'Business' ? '🏢 ' : ''}{feature}
                      </Text>
                    </View>
                  ))}
                </View>
                
                {!isCurrentPlan && (
                  <Button
                    title={`Get ${plan.name} Plan`}
                    onPress={() => handleUpgrade(plan.name as 'Starter' | 'Professional' | 'Business' | 'Enterprise')}
                    variant={isHigherPlan ? "primary" : "outline"}
                    style={styles.planButton}
                  />
                )}
                {isCurrentPlan && (
                  <Button
                    title="Current Plan"
                    onPress={() => {}} // Dummy onPress to satisfy prop requirement
                    variant="outline"
                    style={styles.planButton}
                    disabled={true}
                  />
                )}
                </View>
              </Card>
            );
          })}
        </View>
        
        <View style={styles.testimonialSection}>
          <Text style={styles.testimonialTitle}>What Our Customers Say</Text>
          <Card style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>
              "BudgetWise AI transformed how our company manages finances. The AI insights alone saved us over $50,000 in operational costs in the first year!"
            </Text>
            <Text style={styles.testimonialAuthor}>- Sarah Johnson, CFO at TechStart Inc.</Text>
          </Card>
        </View>
        
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          <Card style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Can I change my plan later?</Text>
            <Text style={styles.faqAnswer}>
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </Text>
          </Card>
          <Card style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Is there a long-term commitment?</Text>
            <Text style={styles.faqAnswer}>
              No! All plans are month-to-month. Cancel anytime with no penalties.
            </Text>
          </Card>
        </View>
        
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Need Help Choosing?</Text>
          <Text style={styles.infoText}>
            Our financial experts are standing by to help you select the perfect plan for your needs.
          </Text>
          <Button 
            title="Chat with an Expert" 
            variant="primary" 
            style={styles.supportButton}
            onPress={() => {}}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DashboardColors.background, padding: 16 },
  header: { marginBottom: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: DashboardColors.text, textAlign: 'center' },
  subtitle: { fontSize: 16, color: DashboardColors.textSecondary, marginTop: 8, textAlign: 'center' },
  heroSection: { 
    backgroundColor: Colors.primary, 
    borderRadius: 16, 
    padding: 24, 
    marginBottom: 24,
    alignItems: 'center'
  },
  heroTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#FFF', 
    textAlign: 'center',
    marginBottom: 12
  },
  heroSubtitle: { 
    fontSize: 16, 
    color: '#F0F0F0', 
    textAlign: 'center',
    lineHeight: 24
  },
  plansContainer: { marginBottom: 24 },
  planCard: { marginBottom: 16 },
  planContent: {},
  currentPlanCard: { borderColor: Colors.primary, borderWidth: 2 },
  planHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  planName: { fontSize: 22, fontWeight: '800', color: DashboardColors.text },
  currentBadge: { 
    backgroundColor: Colors.primary, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16 
  },
  currentBadgeText: { 
    color: '#FFF', 
    fontSize: 12, 
    fontWeight: '700' 
  },
  planPrice: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: DashboardColors.text, 
    marginBottom: 16,
    textAlign: 'center'
  },
  featuresContainer: { marginBottom: 20 },
  featureItem: { marginVertical: 6 },
  featureText: { fontSize: 15, color: DashboardColors.textSecondary, lineHeight: 22 },
  businessFeature: { fontWeight: '600', color: DashboardColors.text },
  planButton: { marginTop: 8 },
  testimonialSection: { marginBottom: 24 },
  testimonialTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: DashboardColors.text, 
    marginBottom: 16,
    textAlign: 'center'
  },
  testimonialCard: { 
    padding: 20,
    backgroundColor: Colors.surfaceLight
  },
  testimonialText: { 
    fontSize: 16, 
    fontStyle: 'italic',
    color: DashboardColors.text,
    marginBottom: 12,
    lineHeight: 24
  },
  testimonialAuthor: { 
    fontSize: 14, 
    color: DashboardColors.textSecondary,
    textAlign: 'right'
  },
  faqSection: { marginBottom: 24 },
  faqTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: DashboardColors.text, 
    marginBottom: 16,
    textAlign: 'center'
  },
  faqCard: { 
    padding: 16,
    marginBottom: 12
  },
  faqQuestion: { 
    fontSize: 16, 
    fontWeight: '700',
    color: DashboardColors.text,
    marginBottom: 8
  },
  faqAnswer: { 
    fontSize: 14, 
    color: DashboardColors.textSecondary,
    lineHeight: 20
  },
  infoCard: { padding: 20, backgroundColor: Colors.primary },
  infoTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#FFF', 
    marginBottom: 12,
    textAlign: 'center'
  },
  infoText: { 
    fontSize: 16, 
    color: '#F0F0F0', 
    marginBottom: 16,
    lineHeight: 22,
    textAlign: 'center'
  },
  supportButton: { 
    alignSelf: 'center',
    backgroundColor: '#FFF'
  }
});