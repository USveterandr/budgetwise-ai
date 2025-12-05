import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, getSubscriptionPlans, upgradePlan } = useAuth();
  const plans = getSubscriptionPlans();

  const handleUpgrade = async (planName: 'Pro' | 'Premium') => {
    Alert.alert(
      'Upgrade Plan',
      `Are you sure you want to upgrade to the ${planName} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            const success = await upgradePlan(planName);
            if (success) {
              Alert.alert('Success', `You have been upgraded to the ${planName} plan!`);
            } else {
              Alert.alert('Error', 'Failed to upgrade plan. Please try again.');
            }
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
        <Text style={styles.title}>Subscription</Text>
        <Text style={styles.subtitle}>Manage your subscription plan</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.plansContainer}>
          {plans.map((plan, index) => {
            const isCurrentPlan = user?.plan === plan.name;
            const isHigherPlan = index > getCurrentPlanIndex();
            
            return (
              <Card key={plan.name} style={[
                styles.planCard, 
                isCurrentPlan && styles.currentPlanCard
              ]}>
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
                      <Text style={styles.featureText}>• {feature}</Text>
                    </View>
                  ))}
                </View>
                
                {!isCurrentPlan && (
                  <Button
                    title={isHigherPlan ? "Upgrade" : "Downgrade"}
                    onPress={() => handleUpgrade(plan.name as 'Pro' | 'Premium')}
                    variant={isHigherPlan ? "primary" : "outline"}
                    style={styles.planButton}
                    disabled={!isHigherPlan} // For now, only allow upgrades
                  />
                )}
              </Card>
            );
          })}
        </View>
        
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Need help?</Text>
          <Text style={styles.infoText}>
            If you have any questions about your subscription or need assistance, 
            please contact our support team.
          </Text>
          <Button 
            title="Contact Support" 
            variant="outline" 
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
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: DashboardColors.text },
  subtitle: { fontSize: 14, color: DashboardColors.textSecondary, marginTop: 4 },
  plansContainer: { marginBottom: 24 },
  planCard: { marginBottom: 16 },
  currentPlanCard: { borderColor: Colors.primary, borderWidth: 1 },
  planHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  planName: { fontSize: 20, fontWeight: '700', color: DashboardColors.text },
  currentBadge: { 
    backgroundColor: Colors.primary, 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  currentBadgeText: { 
    color: '#FFF', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  planPrice: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: DashboardColors.text, 
    marginBottom: 16 
  },
  featuresContainer: { marginBottom: 20 },
  featureItem: { marginVertical: 4 },
  featureText: { fontSize: 14, color: DashboardColors.textSecondary },
  planButton: { marginTop: 8 },
  infoCard: { padding: 20 },
  infoTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: DashboardColors.text, 
    marginBottom: 8 
  },
  infoText: { 
    fontSize: 14, 
    color: DashboardColors.textSecondary, 
    marginBottom: 16,
    lineHeight: 20
  },
  supportButton: { alignSelf: 'flex-start' }
});