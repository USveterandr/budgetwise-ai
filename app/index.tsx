import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Redirect } from 'expo-router';
import { Image } from 'expo-image';
import { Colors } from '../constants/Colors';
import { useAuth } from '../AuthContext';
import { BlurView } from 'expo-blur';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    withSequence,
    Easing,
    useAnimatedReaction,
    FadeInUp
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const DEMO_PHONE_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/6931d42fc95edfeb0aaaa606_1764873445881_ef508941.webp';

// Luxury Gold Palette
const GOLD = '#D4AF37';
const OBSIDIAN = '#020617';

export default function LandingPage() {
  const { currentUser, loading: authLoading } = useAuth();

  // Only redirect if not loading auth
  if (currentUser && !authLoading) {
    return <Redirect href="/(app)/dashboard" />;
  }

  return (
    <View style={styles.container}>
      {/* Hypnotic Background */}
      <LinearGradient colors={['#000000', '#0f172a', '#020617']} style={StyleSheet.absoluteFill} />
      
      {/* Animated Orbs */}
      <Animated.View entering={FadeInUp.duration(1000)} style={[styles.orb, styles.orb1]} />
      <Animated.View entering={FadeInUp.delay(500).duration(1000)} style={[styles.orb, styles.orb2]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Navigation / Header */}
        <View style={styles.header}>
            <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.navBar}
            >
                <View style={styles.logoRow}>
                    <Ionicons name="wallet" size={24} color={GOLD} />
                    <Text style={styles.logoText}>BUDGETWISE</Text>
                </View>
                <View style={styles.navLinks}>
                    <TouchableOpacity onPress={() => router.push('/login')}>
                        <Text style={styles.loginText}>SIGN IN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/signup')}>
                        <Text style={styles.navBtnText}>GET STARTED</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
            <View style={styles.exclusiveBadge}>
                <Ionicons name="sparkles" size={12} color={GOLD} />
                <Text style={styles.exclusiveText}>AI-POWERED FINANCIAL INTELLIGENCE</Text>
            </View>

            <Text style={styles.headline}>
                Your Personal <Text style={{ color: GOLD }}>AI Financial Advisor</Text>
            </Text>
            <Text style={styles.subheadline}>
                Budgetwise analyzes your spending patterns, predicts future trends, and creates personalized budgets using advanced machine learning.
            </Text>

            <View style={styles.ctaContainer}>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/signup')}>
                    <LinearGradient
                        colors={[GOLD, '#B4941F']}
                        style={styles.gradientBtn}
                    >
                        <Text style={styles.primaryBtnText}>Start Free Trial</Text>
                        <Ionicons name="arrow-forward" size={20} color={OBSIDIAN} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>

        {/* Features / Benefits Grid */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Why Choose Budgetwise?</Text>
            <View style={styles.featuresGrid}>
                <FeatureTile 
                    icon="brain-outline" 
                    title="AI-Powered Insights" 
                    desc="Machine learning algorithms provide personalized recommendations and predict future expenses."
                />
                <FeatureTile 
                    icon="shield-checkmark-outline" 
                    title="Bank-Level Security" 
                    desc="256-bit encryption and read-only access ensure your financial data stays secure." 
                />
                <FeatureTile 
                    icon="sync-outline" 
                    title="Real-Time Sync" 
                    desc="Connect unlimited bank accounts for instant transaction tracking across all institutions." 
                />
            </View>
        </View>

        {/* Pricing Preview */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Simple Pricing</Text>
            <View style={styles.pricingCard}>
                <Text style={styles.pricingLevel}>Professional</Text>
                <Text style={styles.pricingPrice}>$12<Text style={styles.pricingPeriod}>/mo</Text></Text>
                <View style={styles.pricingFeatures}>
                    <Text style={styles.pricingFeature}>• Unlimited Bank Connections</Text>
                    <Text style={styles.pricingFeature}>• Advanced AI Analytics</Text>
                    <Text style={styles.pricingFeature}>• Investment Portfolio Tracking</Text>
                    <Text style={styles.pricingFeature}>• Priority AI Support</Text>
                </View>
                <TouchableOpacity style={styles.pricingBtn} onPress={() => router.push('/signup')}>
                    <Text style={styles.pricingBtnText}>Start 14-Day Free Trial</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
             <Text style={styles.footerText}>© 2026 BudgetWise AI. All Rights Reserved.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const FeatureTile = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <View style={styles.featureTile}>
        <LinearGradient
            colors={['rgba(255,255,255,0.03)', 'rgba(0,0,0,0)']}
            style={styles.featureGradient}
        >
            <View style={styles.iconCircle}>
                <Ionicons name={icon} size={28} color={GOLD} />
            </View>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDesc}>{desc}</Text>
        </LinearGradient>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: OBSIDIAN },
  scroll: { flexGrow: 1 },
  
  // Orbs
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.4 },
  orb1: { width: 500, height: 500, backgroundColor: '#4338ca', top: -100, left: -200 },
  orb2: { width: 400, height: 400, backgroundColor: GOLD, bottom: 0, right: -150, opacity: 0.15 },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 60, marginBottom: 40 },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoText: { color: 'white', fontWeight: 'bold', letterSpacing: 2, fontSize: 16 },
  loginText: { color: '#94A3B8', fontWeight: '600', letterSpacing: 1, fontSize: 12 },

  // Hero
  heroSection: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 40 },
  exclusiveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
  exclusiveText: { color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  headline: { fontSize: 48, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 56, marginBottom: 16 },
  subheadline: { fontSize: 16, color: '#94A3B8', textAlign: 'center', lineHeight: 26, maxWidth: 320, marginBottom: 32 },
  
  ctaContainer: { width: '100%', maxWidth: 300 },
  primaryBtn: { height: 56, borderRadius: 28, overflow: 'hidden', shadowColor: GOLD, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  gradientBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  primaryBtnText: { color: OBSIDIAN, fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  guaranteeText: { marginTop: 20, color: '#64748B', fontSize: 12 },

  // Phone
  phoneContainer: { alignItems: 'center', marginVertical: 40, height: 400 },
  phoneImage: { width: width * 0.9, height: 400, zIndex: 10 },
  glowBehindPhone: { position: 'absolute', width: 300, height: 300, backgroundColor: GOLD, top: 50, borderRadius: 150, opacity: 0.1 },
  
  floatCard: { position: 'absolute', padding: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 20, width: 140 },
  floatCardLeft: { top: 60, left: 20 },
  floatCardRight: { bottom: 80, right: 20 },
  floatTitle: { color: 'white', fontWeight: 'bold', fontSize: 14, marginTop: 8 },
  floatDesc: { color: '#94A3B8', fontSize: 10 },

  // Grid
  featuresGrid: { paddingHorizontal: 20, gap: 16, marginBottom: 60 },
  featureTile: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.01)' },
  featureGradient: { padding: 32, alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(212, 175, 55, 0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.1)' },
  featureTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 12, letterSpacing: 0.5 },
  featureDesc: { color: '#94A3B8', textAlign: 'center', lineHeight: 24, fontSize: 14 },

  // Final CTA
  finalCta: { padding: 40, alignItems: 'center', marginBottom: 40 },
  finalTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 12 },
  finalDesc: { color: '#64748B', textAlign: 'center', marginBottom: 32 },
  finalBtn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, borderWidth: 1, borderColor: GOLD, backgroundColor: 'rgba(212, 175, 55, 0.05)' },
  finalBtnText: { color: GOLD, fontWeight: 'bold', letterSpacing: 1 },

  footer: { alignItems: 'center', paddingBottom: 40 },
  footerText: { color: '#475569', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },

  // New Styles
  sectionContainer: { paddingHorizontal: 20, marginVertical: 40 },
  sectionTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  navBtn: { backgroundColor: GOLD, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  navBtnText: { color: OBSIDIAN, fontSize: 10, fontWeight: 'bold' },
  
  pricingCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 32, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center' },
  pricingLevel: { color: GOLD, fontSize: 14, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  pricingPrice: { color: 'white', fontSize: 48, fontWeight: 'bold', marginBottom: 24 },
  pricingPeriod: { fontSize: 16, color: '#94A3B8' },
  pricingFeatures: { gap: 12, marginBottom: 32 },
  pricingFeature: { color: '#94A3B8', fontSize: 14 },
  pricingBtn: { backgroundColor: GOLD, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 24 },
  pricingBtnText: { color: OBSIDIAN, fontWeight: 'bold', fontSize: 16 }
});
