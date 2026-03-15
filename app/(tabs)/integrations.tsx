import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Switch } from 'react-native';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

interface Integration {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
}

export default function IntegrationsScreen() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Sync your financial data with QuickBooks',
      enabled: false,
      icon: ' qb'
    },
    {
      id: 'xero',
      name: 'Xero',
      description: 'Connect your Xero accounting software',
      enabled: false,
      icon: ' xe'
    },
    {
      id: 'freshbooks',
      name: 'FreshBooks',
      description: 'Import invoices and expenses from FreshBooks',
      enabled: false,
      icon: ' fb'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Automatically import Stripe transactions',
      enabled: false,
      icon: ' st'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Sync PayPal transactions with your records',
      enabled: false,
      icon: ' pp'
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Import sales data from your Shopify store',
      enabled: false,
      icon: ' sh'
    }
  ]);

  const handleToggleIntegration = (id: string) => {
    // Check if user is on Business plan or higher
    const eligiblePlans = ['Business', 'Enterprise'];
    if (!user || !eligiblePlans.includes(user.plan)) {
      Alert.alert(
        'Upgrade Required',
        'Custom integrations are only available on Business and Enterprise plans. Please upgrade your subscription.',
        [{ text: 'Upgrade', onPress: () => {} }] // Would navigate to subscription page
      );
      return;
    }

    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, enabled: !integration.enabled } 
          : integration
      )
    );
  };

  const handleConfigureIntegration = (id: string) => {
    // Check if user is on Business plan or higher
    const eligiblePlans = ['Business', 'Enterprise'];
    if (!user || !eligiblePlans.includes(user.plan)) {
      Alert.alert(
        'Upgrade Required',
        'Custom integrations are only available on Business and Enterprise plans. Please upgrade your subscription.',
        [{ text: 'Upgrade', onPress: () => {} }] // Would navigate to subscription page
      );
      return;
    }

    Alert.alert(
      'Configure Integration',
      `Configure your ${integrations.find(i => i.id === id)?.name} integration`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Configure', onPress: () => console.log(`Configure ${id}`) }
      ]
    );
  };

  const handleRequestIntegration = () => {
    // Check if user is on Business plan or higher
    const eligiblePlans = ['Business', 'Enterprise'];
    if (!user || !eligiblePlans.includes(user.plan)) {
      Alert.alert(
        'Upgrade Required',
        'Custom integration requests are only available on Business and Enterprise plans. Please upgrade your subscription.',
        [{ text: 'Upgrade', onPress: () => {} }] // Would navigate to subscription page
      );
      return;
    }

    Alert.alert(
      'Request Custom Integration',
      'Tell us which service you would like to integrate with BudgetWise AI:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit Request', onPress: () => console.log('Submit integration request') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Custom Integrations</Text>
        <Text style={styles.subtitle}>Connect your favorite business tools</Text>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Enterprise-Level Integration</Text>
          <Text style={styles.infoText}>
            As a Business or Enterprise user, you have access to custom integrations with popular business tools.
          </Text>
        </Card>

        <View style={styles.integrationsList}>
          {integrations.map(integration => (
            <Card key={integration.id} style={styles.integrationCard}>
              <View style={styles.integrationHeader}>
                <View style={styles.integrationIcon}>
                  <Text style={styles.iconText}>{integration.icon}</Text>
                </View>
                <View style={styles.integrationInfo}>
                  <Text style={styles.integrationName}>{integration.name}</Text>
                  <Text style={styles.integrationDescription}>{integration.description}</Text>
                </View>
                <Switch
                  trackColor={{ false: DashboardColors.border, true: Colors.primary }}
                  thumbColor={integration.enabled ? '#FFF' : '#FFF'}
                  ios_backgroundColor={DashboardColors.border}
                  onValueChange={() => handleToggleIntegration(integration.id)}
                  value={integration.enabled}
                />
              </View>
              
              {integration.enabled && (
                <Button
                  title="Configure"
                  variant="outline"
                  size="small"
                  onPress={() => handleConfigureIntegration(integration.id)}
                  style={styles.configureButton}
                />
              )}
            </Card>
          ))}
        </View>

        <Card style={styles.requestCard}>
          <Text style={styles.cardTitle}>Don't see your integration?</Text>
          <Text style={styles.requestText}>
            Request a custom integration with any service you use.
          </Text>
          <Button
            title="Request Integration"
            variant="primary"
            onPress={handleRequestIntegration}
            style={styles.requestButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DashboardColors.background,
  },
  scroll: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: DashboardColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: DashboardColors.textSecondary,
    marginBottom: 24,
  },
  infoCard: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DashboardColors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
    lineHeight: 20,
  },
  integrationsList: {
    gap: 16,
    marginBottom: 20,
  },
  integrationCard: {},
  integrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  integrationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  integrationInfo: {
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '600',
    color: DashboardColors.text,
    marginBottom: 4,
  },
  integrationDescription: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
  },
  configureButton: {
    alignSelf: 'flex-start',
  },
  requestCard: {},
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DashboardColors.text,
    marginBottom: 8,
  },
  requestText: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  requestButton: {
    alignSelf: 'flex-start',
  },
});