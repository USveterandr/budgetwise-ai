import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../../AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { BlurView } from 'expo-blur';
import { CLOUDFLARE_API_URL, cloudflare } from '../lib/cloudflare';
import { PaywallModal } from '../../components/PaywallModal';
import { tokenCache } from '../../utils/tokenCache';

const { width } = Dimensions.get('window');

const INDUSTRY_INSIGHTS: Record<string, string> = {
    'Technology': 'Tech professionals often have irregular vesting schedules. Use a "sinking fund" for RSUs to smooth out income.',
    'Healthcare': 'High liability risk? Ensure your emergency fund covers 6+ months and review professional liability insurance.',
    'Education': 'Maximize 403(b) contributions and look for loan forgiveness programs like PSLF.',
    'Finance': 'Bonus-heavy compensation? Live on your base salary and save 100% of your bonuses.',
    'Real Estate': 'Variable income is the challenge. Base your budget on your lowest earning month, not the average.',
    'General': 'The 50/30/20 rule is a great starting point: 50% Needs, 30% Wants, 20% Savings.'
};

export default function Dashboard() {
  const { logout, userProfile, trialStatus, isAuthenticated, currentUser } = useAuth();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Fetch transactions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
        if (currentUser?.uid) {
            fetchTransactions();
        }
    }, [currentUser])
  );

  const fetchTransactions = async () => {
      try {
          const token = await tokenCache.getToken("budgetwise_jwt_token");
          if (token && currentUser?.uid) {
             setLoadingTransactions(true);
             const data = await cloudflare.getTransactions(currentUser.uid, token);
             if (Array.isArray(data)) {
                 setTransactions(data);
             }
          }
      } catch (e) {
          console.error("Failed to fetch transactions", e);
      } finally {
          setLoadingTransactions(false);
      }
  };

  const handleLogout = async () => {
      setMenuVisible(false);
      await logout();
      router.replace('/login');
  };

  const handleEditProfile = () => {
      setMenuVisible(false);
      router.push('/profile');
  }

  const industry = userProfile?.business_industry || 'General';
  const insight = INDUSTRY_INSIGHTS[industry] || INDUSTRY_INSIGHTS['General'];

  const getAvatarSource = () => {
      if (userProfile?.avatar_url) {
          if (userProfile.avatar_url.startsWith('/api')) {
              return { uri: `${CLOUDFLARE_API_URL}${userProfile.avatar_url}` };
          }
          return { uri: userProfile.avatar_url };
      }
      return null;
  };

  return (
    <View style={styles.container}>
      <PaywallModal 
        visible={trialStatus?.isExpired} 
        onSubscribe={() => {
             // In real app, trigger IAP or Stripe link
             alert('Redirecting to subscription portal...');
        }}
      />

      {/* Background Ambience - Luxury Dark */}
      <LinearGradient
        colors={['#09090b', '#1c1917', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Decorative Golden Glows */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
            {/* Left: Welcome Message */}
            <View style={styles.welcomeContainer}>
                <Ionicons name="diamond-outline" size={16} color={Colors.gold} style={{ marginBottom: 4 }} />
                <Text style={styles.greeting}>Welcome Back</Text>
            </View>

            {/* Right: Profile & Name */}
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.headerProfileContainer}>
                <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                    <Text style={styles.username}>{userProfile?.name?.split(' ')[0] || userProfile?.email?.split('@')[0] || 'User'}</Text>
                    <Text style={styles.badgeText}>{industry}</Text>
                </View>
                
                {getAvatarSource() ? (
                    <Image source={getAvatarSource()} style={styles.headerAvatar} />
                ) : (
                    <View style={styles.headerAvatarPlaceholder}>
                        <Ionicons name="person" size={20} color={Colors.gold} />
                    </View>
                )}
            </TouchableOpacity>

          {/* Dropdown Menu */}
          {menuVisible && (
              <View style={styles.dropdownMenu}>
                  <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
                       <Ionicons name="person-outline" size={18} color={Colors.gold} />
                       <Text style={styles.menuText}>Edit Profile</Text>
                  </TouchableOpacity>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                       <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                       <Text style={[styles.menuText, { color: Colors.error }]}>Log Out</Text>
                  </TouchableOpacity>
              </View>
          )}
        </View>

        {/* Stats "Luxury Cards" */}
        <View style={styles.statsRow}>
            <View style={styles.statOrbContainer}>
                <LinearGradient
                    colors={['rgba(212, 175, 55, 0.15)', 'rgba(0,0,0,0)']}
                    style={styles.statOrb}
                >
                    <Ionicons name="wallet-outline" size={32} color={Colors.gold} />
                    <Text style={styles.statValue}>
                         {userProfile?.currency || '$'}{userProfile?.monthly_income?.toLocaleString() || '0'}
                    </Text>
                    <Text style={styles.statLabel}>Monthly Flow</Text>
                </LinearGradient>
            </View>

            <View style={styles.statOrbContainer}>
                 <LinearGradient
                    colors={['rgba(226, 232, 240, 0.15)', 'rgba(0, 0, 0, 0)']}
                    style={styles.statOrb}
                >
                    <Ionicons name="trending-up-outline" size={32} color={Colors.platinum} />
                    <Text style={[styles.statValue, { color: Colors.platinum }]}>
                        {userProfile?.savings_rate || '0'}%
                    </Text>
                    <Text style={styles.statLabel}>Savings Rate</Text>
                </LinearGradient>
            </View>
        </View>

        {/* Elegant Insight Card */}
        <View style={styles.glassCard}>
             <LinearGradient
                colors={['rgba(212, 175, 55, 0.08)', 'rgba(0,0,0,0.2)']}
                style={styles.cardGradient}
             >
                <View style={styles.insightHeader}>
                    <Ionicons name="sparkles-outline" size={18} color={Colors.gold} />
                    <Text style={styles.insightTitle}>Executive Insight</Text>
                </View>
                <Text style={styles.insightText}>{insight}</Text>
             </LinearGradient>
        </View>

        {/* Action Spheres */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Concierge Services</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionScroll}>
                <TouchableOpacity style={styles.actionContainer} onPress={() => router.push('/add-transaction')}>
                    <View style={[styles.actionCircle, { borderColor: Colors.gold }]}>
                        <Ionicons name="add" size={28} color={Colors.gold} />
                    </View>
                    <Text style={styles.actionLabel}>Add</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionContainer} onPress={() => router.push('/budget')}>
                    <View style={[styles.actionCircle, { borderColor: Colors.platinum }]}>
                        <Ionicons name="pie-chart-outline" size={24} color={Colors.platinum} />

            {loadingTransactions ? (
                <View style={{ padding: 20 }}>
                     <ActivityIndicator color={Colors.gold} />
                </View>
            ) : transactions.length > 0 ? (
                <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                    {transactions.slice(0, 5).map((tx, index) => (
                        <View key={tx.id || index} style={{ 
                            flexDirection: 'row', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            paddingVertical: 12,
                            borderBottomWidth: index !== transactions.length - 1 ? 1 : 0,
                            borderBottomColor: 'rgba(255,255,255,0.05)'
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ 
                                    width: 36, height: 36, borderRadius: 18, 
                                    backgroundColor: tx.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    justifyContent: 'center', alignItems: 'center'
                                }}>
                                    <Ionicons 
                                        name={tx.type === 'income' ? "arrow-down" : "arrow-up"} 
                                        size={18} 
                                        color={tx.type === 'income' ? '#10B981' : '#EF4444'} 
                                    />
                                </View>
                                <View>
                                    <Text style={{ color: 'white', fontWeight: '500', fontSize: 14 }}>{tx.description}</Text>
                                    <Text style={{ color: Colors.textMuted, fontSize: 11 }}>{tx.category}</Text>
                                </View>
                            </View>
                            <Text style={{ 
                                color: tx.type === 'income' ? '#10B981' : 'white', 
                                fontWeight: '600',
                                fontSize: 15
                            }}>
                                {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconBg}>
                        <Ionicons name="document-text-outline" size={24} color={Colors.textMuted} />
                    </View>
                    <Text style={styles.placeholderText}>No transactions recorded</Text>
                </View>
            )}     <Ionicons name="scan-outline" size={24} color={Colors.gold} />
                    </View>
                    <Text style={styles.actionLabel}>Scan</Text>
                </TouchableOpacity>

                 <TouchableOpacity style={styles.actionContainer} onPress={() => router.push('/analyze')}>
                     <View style={[styles.actionCircle, { borderColor: Colors.platinum }]}>
                        <Ionicons name="analytics-outline" size={24} color={Colors.platinum} />
                    </View>
                    <Text style={styles.actionLabel}>Analyze</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>

        {/* Transactions Portal */}
        <View style={[styles.glassCard, { marginTop: 20, marginBottom: 40 }]}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Recent Activity</Text>
                <TouchableOpacity>
                    <Text style={styles.linkText}>View Ledger</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                    <Ionicons name="document-text-outline" size={24} color={Colors.textMuted} />
                </View>
                <Text style={styles.placeholderText}>No transactions recorded</Text>
            </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  contentContainer: { paddingTop: 60, paddingBottom: 40 },
  
  // Luxury Ambient Glows
  orb: {
      position: 'absolute',
      borderRadius: 999,
      opacity: 0.15,
  },
  orb1: {
      width: 400,
      height: 400,
      backgroundColor: Colors.gold,
      top: -150,
      right: -100,
      transform: [{ scale: 1.2 }],
      blurRadius: 80,
  },
  orb2: {
      width: 300,
      height: 300,
      backgroundColor: '#4338ca', // Deep Indigo for contrast with Gold
      bottom: 0,
      left: -50,
      opacity: 0.1,
      blurRadius: 60,
  },

  header: { 
      paddingHorizontal: 28, 
      marginBottom: 40, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      zIndex: 100 
  },
  welcomeContainer: { justifyContent: 'center' },
  headerProfileContainer: { flexDirection: 'row', alignItems: 'center' },
  
  headerAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: Colors.gold },
  headerAvatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.gold },
  
  greeting: { fontSize: 13, color: Colors.gold, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '600' },
  username: { fontSize: 20, color: Colors.white, fontWeight: 'bold', textAlign: 'right', letterSpacing: 0.5 },
  badgeText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '500', textAlign: 'right', marginTop: 2, letterSpacing: 1, textTransform: 'uppercase' },
  
  // Dropdown Styled as Black Card
  dropdownMenu: {
      position: 'absolute',
      top: 60,
      right: 28, // Align with avatar
      width: 180,
      backgroundColor: '#1c1917',
      borderRadius: 16,
      padding: 8,
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.2)', // Gold border
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 20,
      zIndex: 200
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8 },
  menuText: { color: Colors.platinum, fontSize: 14, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 4 },

  statsRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      paddingHorizontal: 24, 
      gap: 16,
      marginBottom: 32
  },
  statOrbContainer: { flex: 1, aspectRatio: 1.1 },
  statOrb: { 
      flex: 1, 
      borderRadius: 30, // Softer curves but not fully round
      justifyContent: 'center', 
      alignItems: 'center', 
      borderWidth: 1, 
      borderColor: 'rgba(255,255,255,0.05)',
      backgroundColor: 'rgba(20, 20, 23, 0.6)'
  },
  statValue: { fontSize: 24, fontWeight: '300', color: Colors.gold, marginTop: 12, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }, // Thin elegant font
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' },

  glassCard: {
      marginHorizontal: 24,
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      backgroundColor: 'rgba(10, 10, 10, 0.5)'
  },
  cardGradient: { padding: 24 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  insightTitle: { color: Colors.gold, fontWeight: '600', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  insightText: { color: '#d4d4d8', fontSize: 15, lineHeight: 26, fontWeight: '300' },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.white, marginLeft: 28, marginBottom: 24, letterSpacing: 1, textTransform: 'uppercase' },
  actionScroll: { paddingHorizontal: 24, paddingBottom: 10 },
  actionContainer: { alignItems: 'center', marginRight: 28 },
  actionCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      backgroundColor: 'rgba(0,0,0,0.3)'
  },
  actionLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '500', letterSpacing: 0.5 },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Colors.white, letterSpacing: 0.5 },
  linkText: { color: Colors.gold, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyIconBg: { 
      width: 48, 
      height: 48, 
      borderRadius: 24, 
      backgroundColor: 'rgba(255,255,255,0.03)', 
      justifyContent: 'center', 
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)'
  },
  placeholderText: { color: Colors.textMuted, fontSize: 13, fontWeight: '300' }
});
