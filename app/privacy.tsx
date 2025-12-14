import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function PrivacyPolicyScreen() {
  const lastUpdated = 'December 7, 2025';
  const contactEmail = 'isaac@isaac-trinidad.com';

  const sections = [
    {
      title: '1. Introduction',
      content: 'Budgetwise AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (the "Application"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.'
    },
    {
      title: '2. Collection of Your Information',
      content: 'We may collect information about you in a variety of ways. The information we may collect via the Application includes:\n\nPersonal Data\nPersonally identifiable information, such as your name, email address, and demographic information that you voluntarily give to us when you register with the Application or when you choose to participate in various activities related to the Application.\n\nFinancial Data\nFinancial information, such as data related to your income, expenses, budget limits, and transaction history that you input into the Application to utilize its budgeting features.\n\nDerivative Data\nInformation our servers automatically collect when you access the Application, such as your native actions that are integral to the Application, including liking, re-blogging, or replying to a post, as well as other interactions with the Application and with other users via server log files.'
    },
    {
      title: '3. App Permissions',
      content: 'The Application may request access to the following features on your mobile device:\n\nCamera: To capture images of receipts and documents for expense tracking.\nStorage: To store and retrieve captured receipts and documents.\nNotifications: To send you alerts about your budget limits, bill reminders, and app updates.\n\nYou can change your access permissions in your device settings at any time.'
    },
    {
      title: '4. Use of Your Information',
      content: 'Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:\n\n• Create and manage your account.\n• Process your financial records and generate AI-driven insights.\n• Email you regarding your account or order.\n• Enable user-to-user communications.\n• Generate a personal profile about you to make future visits to the Application more personalized.\n• Increase the efficiency and operation of the Application.\n• Monitor and analyze usage and trends to improve your experience.\n• Notify you of updates to the Application.'
    },
    {
      title: '5. Disclosure of Your Information',
      content: 'We may share information we have collected about you in certain situations. Your information may be disclosed as follows:\n\nBy Law or to Protect Rights\nIf we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.\n\nThird-Party Service Providers\nWe may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, customer service, and marketing assistance.'
    },
    {
      title: '6. Security of Your Information',
      content: 'We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.'
    },
    {
      title: '7. Contact Us',
      content: `If you have questions or comments about this Privacy Policy, please contact us at:\n\nEmail: ${contactEmail}`
    }
  ];

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
        
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Budgetwise AI. All rights reserved.</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryLight,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
