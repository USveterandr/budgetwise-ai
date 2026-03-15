import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Clipboard } from 'react-native';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function ApiAccessScreen() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState(''); // Remove hardcoded API key
  const [showApiKey, setShowApiKey] = useState(false);

  const handleGenerateKey = () => {
    // Check if user is on Business plan or higher
    const eligiblePlans = ['Business', 'Enterprise'];
    if (!user || !eligiblePlans.includes(user.plan)) {
      Alert.alert(
        'Upgrade Required',
        'API access is only available on Business and Enterprise plans. Please upgrade your subscription.',
        [{ text: 'Upgrade', onPress: () => {} }] // Would navigate to subscription page
      );
      return;
    }

    // In a real app, this would generate a new API key
    const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 32);
    setApiKey(newKey);
    setShowApiKey(false);
    Alert.alert('Success', 'New API key generated');
  };

  const handleCopyKey = () => {
    if (!apiKey) {
      Alert.alert('Error', 'Please generate an API key first');
      return;
    }
    Clipboard.setString(apiKey);
    Alert.alert('Copied', 'API key copied to clipboard');
  };

  const handleRevokeKey = () => {
    if (!apiKey) {
      Alert.alert('Error', 'No API key to revoke');
      return;
    }
    
    Alert.alert(
      'Revoke API Key',
      'Are you sure you want to revoke this API key? This action cannot be undone and will immediately disable all applications using this key.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would revoke the API key on the server
            setApiKey('');
            Alert.alert('Success', 'API key revoked');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>API Access</Text>
        <Text style={styles.subtitle}>Integrate BudgetWise AI with your applications</Text>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>API Documentation</Text>
          <Text style={styles.infoText}>
            Access our comprehensive API documentation to learn how to integrate BudgetWise AI with your applications.
          </Text>
          <Button 
            title="View Documentation" 
            variant="primary" 
            style={styles.docButton}
            onPress={() => {}}
          />
        </Card>

        <Card style={styles.keyCard}>
          <Text style={styles.cardTitle}>API Key</Text>
          <Text style={styles.keyDescription}>
            Use this key to authenticate your API requests. Keep it secret and secure.
          </Text>
          
          {apiKey ? (
            <>
              <View style={styles.keyContainer}>
                <View style={styles.keyDisplay}>
                  <Text style={styles.keyText} numberOfLines={showApiKey ? 0 : 1}>
                    {showApiKey ? apiKey : '*'.repeat(32) + apiKey.substring(apiKey.length - 8)}
                  </Text>
                </View>
                <View style={styles.keyActions}>
                  <Button
                    title={showApiKey ? "Hide" : "Show"}
                    variant="outline"
                    size="small"
                    onPress={() => setShowApiKey(!showApiKey)}
                    style={styles.keyButton}
                  />
                  <Button
                    title="Copy"
                    variant="outline"
                    size="small"
                    onPress={handleCopyKey}
                    style={styles.keyButton}
                  />
                </View>
              </View>
              
              <View style={styles.keyButtons}>
                <Button
                  title="Generate New Key"
                  variant="primary"
                  onPress={handleGenerateKey}
                  style={styles.actionButton}
                />
                <Button
                  title="Revoke Key"
                  variant="outline"
                  onPress={handleRevokeKey}
                  style={styles.actionButton}
                />
              </View>
            </>
          ) : (
            <Button
              title="Generate API Key"
              variant="primary"
              onPress={handleGenerateKey}
              style={styles.generateButton}
            />
          )}
        </Card>

        <Card style={styles.endpointsCard}>
          <Text style={styles.cardTitle}>Available Endpoints</Text>
          <Text style={styles.endpointsDescription}>
            As a Business or Enterprise user, you have access to the following API endpoints:
          </Text>
          
          <View style={styles.endpointList}>
            <View style={styles.endpointItem}>
              <Text style={styles.endpointMethod}>GET</Text>
              <Text style={styles.endpointPath}>/api/v1/transactions</Text>
              <Text style={styles.endpointDesc}>Retrieve transaction data</Text>
            </View>
            <View style={styles.endpointItem}>
              <Text style={styles.endpointMethod}>POST</Text>
              <Text style={styles.endpointPath}>/api/v1/transactions</Text>
              <Text style={styles.endpointDesc}>Create new transactions</Text>
            </View>
            <View style={styles.endpointItem}>
              <Text style={styles.endpointMethod}>GET</Text>
              <Text style={styles.endpointPath}>/api/v1/budgets</Text>
              <Text style={styles.endpointDesc}>Retrieve budget data</Text>
            </View>
            <View style={styles.endpointItem}>
              <Text style={styles.endpointMethod}>GET</Text>
              <Text style={styles.endpointPath}>/api/v1/investments</Text>
              <Text style={styles.endpointDesc}>Retrieve investment data</Text>
            </View>
            <View style={styles.endpointItem}>
              <Text style={styles.endpointMethod}>GET</Text>
              <Text style={styles.endpointPath}>/api/v1/reports</Text>
              <Text style={styles.endpointDesc}>Generate financial reports</Text>
            </View>
            <View style={styles.endpointItem}>
              <Text style={styles.endpointMethod}>GET</Text>
              <Text style={styles.endpointPath}>/api/v1/analytics</Text>
              <Text style={styles.endpointDesc}>Access advanced analytics</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.rateCard}>
          <Text style={styles.cardTitle}>Rate Limits</Text>
          <Text style={styles.rateDescription}>
            Your API usage is subject to the following rate limits based on your plan:
          </Text>
          
          <View style={styles.ratePlans}>
            <View style={styles.ratePlan}>
              <Text style={styles.planName}>Business</Text>
              <Text style={styles.rateLimit}>1,000 requests/minute</Text>
              <Text style={styles.rateLimit}>10,000 requests/day</Text>
            </View>
            <View style={styles.ratePlan}>
              <Text style={styles.planName}>Enterprise</Text>
              <Text style={styles.rateLimit}>10,000 requests/minute</Text>
              <Text style={styles.rateLimit}>1,000,000 requests/day</Text>
            </View>
          </View>
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
    marginBottom: 16,
    lineHeight: 20,
  },
  docButton: {
    alignSelf: 'flex-start',
  },
  keyCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DashboardColors.text,
    marginBottom: 8,
  },
  keyDescription: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
    marginBottom: 16,
  },
  keyContainer: {
    marginBottom: 16,
  },
  keyDisplay: {
    backgroundColor: DashboardColors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  keyText: {
    fontSize: 14,
    color: DashboardColors.text,
    fontFamily: 'monospace',
  },
  keyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  keyButton: {
    marginLeft: 8,
  },
  keyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  generateButton: {
    alignSelf: 'flex-start',
  },
  endpointsCard: {
    marginBottom: 20,
  },
  endpointsDescription: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
    marginBottom: 16,
  },
  endpointList: {
    gap: 12,
  },
  endpointItem: {
    padding: 12,
    backgroundColor: DashboardColors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  endpointMethod: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  endpointPath: {
    fontSize: 14,
    fontWeight: '600',
    color: DashboardColors.text,
    marginBottom: 4,
  },
  endpointDesc: {
    fontSize: 12,
    color: DashboardColors.textSecondary,
  },
  rateCard: {},
  rateDescription: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
    marginBottom: 16,
  },
  ratePlans: {
    flexDirection: 'row',
    gap: 16,
  },
  ratePlan: {
    flex: 1,
    backgroundColor: DashboardColors.surface,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: DashboardColors.text,
    marginBottom: 8,
  },
  rateLimit: {
    fontSize: 14,
    color: DashboardColors.textSecondary,
    marginBottom: 4,
  },
});