import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Button } from '../components/ui/Button';

export default function LearnMorePage() {
  const router = useRouter();

  const features = [
    {
      title: "AI-Powered Financial Insights",
      description: "Our advanced AI analyzes your spending patterns, identifies savings opportunities, and provides personalized recommendations to optimize your financial health."
    },
    {
      title: "Smart Budgeting Tools",
      description: "Automatically categorize expenses, set realistic budgets, and receive alerts when you're approaching spending limits."
    },
    {
      title: "Investment Portfolio Tracking",
      description: "Monitor all your investments in one place with real-time updates, performance analytics, and predictive modeling."
    },
    {
      title: "Receipt Scanning & Expense Logging",
      description: "Simply snap a photo of your receipt and our OCR technology extracts all the details for automatic expense logging."
    },
    {
      title: "Comprehensive Reporting",
      description: "Generate detailed financial reports with customizable date ranges, categories, and visualization options."
    },
    {
      title: "Security & Privacy",
      description: "Bank-level encryption and strict privacy controls ensure your financial data remains secure and private."
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About BudgetWise AI</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.title}>Transform Your Financial Future</Text>
      <Text style={styles.subtitle}>
        BudgetWise AI is the ultimate personal finance companion that leverages artificial intelligence 
        to help you take control of your finances, save more money, and achieve your financial goals.
      </Text>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Transform Your Finances?</Text>
        <Text style={styles.ctaSubtitle}>
          Join thousands of users who have already taken control of their financial future with BudgetWise AI.
        </Text>
        <Button 
          title="Get Started Free" 
          onPress={() => router.push('/(auth)/signup')} 
          size="large" 
          style={styles.ctaButton}
        />
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.signInText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ctaSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButton: {
    width: '100%',
    marginBottom: 16,
  },
  signInText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});