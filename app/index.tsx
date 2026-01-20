import React, { useEffect } from 'react';
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
  const { currentUser } = useAuth();

  // Hypnotic Animation Values
  const glowOpacity = useSharedValue(0.3);
  const orbScale = useSharedValue(1);
  const orbRotate = useSharedValue(0);

  useEffect(() => {
    glowOpacity.value = withRepeat(
        withSequence(
            withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
    );
    
    orbScale.value = withRepeat(
        withSequence(
            withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
    );

    orbRotate.value = withRepeat(
        withTiming(360, { duration: 20000, easing: Easing.linear }),
        -1
    );
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: orbScale.value }, { rotate: `${orbRotate.value}deg` }] 
  }));

  if (currentUser) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <View style={styles.container}>
      {/* Hypnotic Background */}
      <LinearGradient colors={['#000000', '#0f172a', '#020617']} style={StyleSheet.absoluteFill} />
      
      {/* Animated Orbs */}
      <Animated.View style={[styles.orb, styles.orb1, animatedGlowStyle]} />
      <Animated.View style={[styles.orb, styles.orb2, { transform: [{ scale: orbScale.value }] }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Luxury Header */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
            <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.navBar}
            >
                <View style={styles.logoRow}>
                    <Ionicons name="diamond-outline" size={24} color={GOLD} />
                    <Text style={styles.logoText}>BUDGETWISE</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text style={styles.loginText}>SIGN IN</Text>
                </TouchableOpacity>
            </LinearGradient>
        </Animated.View>

        {/* Hero Section */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.heroSection}>
            <View style={styles.exclusiveBadge}>
                <Ionicons name="star" size={12} color={GOLD} />
                <Text style={styles.exclusiveText}>PRIVATE WEALTH MANAGEMENT AI</Text>
            </View>

            <Text style={styles.headline}>
                Master Your <Text style={{ color: GOLD }}>Fortune</Text>
            </Text>
            <Text style={styles.subheadline}>
                The AI-powered financial concierge for those who demand excellence. Experience the future of wealth today.
            </Text>

            {/* CTA Buttons */}
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

             <Text style={styles.guaranteeText}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#94A3B8" /> 7-Day Complimentary Access. Cancel Anytime.
            </Text>
        </Animated.View>

        {/* Hypnotic App Preview */}
        <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.phoneContainer}>
            <View style={styles.glowBehindPhone} />
            <Image 
                source={{ uri: DEMO_PHONE_IMAGE }} 
                style={styles.phoneImage} 
                contentFit="contain"
            />
             {/* Floating Features */}
            <BlurView intensity={20} tint="dark" style={[styles.floatCard, styles.floatCardLeft]}>
                 <Ionicons name="scan-outline" size={24} color={GOLD} />
                 <Text style={styles.floatTitle}>AI Scanning</Text>
                 <Text style={styles.floatDesc}>Receipts to Data</Text>
            </BlurView>

            <BlurView intensity={20} tint="dark" style={[styles.floatCard, styles.floatCardRight]}>
                 <Ionicons name="trending-up" size={24} color="#10B981" />
                 <Text style={styles.floatTitle}>+42% Growth</Text>
                 <Text style={styles.floatDesc}>Portfolio Insight</Text>
            </BlurView>
        </Animated.View>

        {/* Luxury Features Grid */}
        <View style={styles.featuresGrid}>
            <FeatureTile 
                icon="analytics-outline" 
                title="Executive Insights" 
                desc="Deep learning algorithms analyze your spending patterns to reveal hidden capital."
            />
            <FeatureTile 
                icon="lock-closed-outline" 
                title="Bank-Grade Security" 
                desc="Your financial data is encrypted with military-grade protocols purely for your eyes." 
            />
            <FeatureTile 
                icon="sync-outline" 
                title="Real-Time Sync" 
                desc="Connect your accounts seamlessly. Your net worth, updated to the second." 
            />
        </View>

        {/* Final CTA */}
        <View style={styles.finalCta}>
             <Text style={styles.finalTitle}>Join the Elite.</Text>
             <Text style={styles.finalDesc}>Your journey to financial sovereignty begins now.</Text>
             <TouchableOpacity style={styles.finalBtn} onPress={() => router.push('/signup')}>
                <Text style={styles.finalBtnText}>Claim Access</Text>
             </TouchableOpacity>
        </View>

        <View style={styles.footer}>
             <Text style={styles.footerText}>© 2026 BudgetWise AI. New York • London • Tokyo</Text>
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
  footerText: { color: '#475569', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }
});
