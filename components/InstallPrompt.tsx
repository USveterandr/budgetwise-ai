import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_DURATION_DAYS = 7;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const slideAnim = useState(new Animated.Value(100))[0]; // Start 100px below

  useEffect(() => {
    // Only run on web
    if (Platform.OS !== 'web') return;

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed the prompt (with expiry)
    const dismissedUntil = localStorage.getItem('install-prompt-dismissed-until');
    if (dismissedUntil) {
      const dismissedTimestamp = parseInt(dismissedUntil, 10);
      if (Date.now() < dismissedTimestamp) {
        return; // Still within dismissal period
      } else {
        // Dismissal period expired, clear it
        localStorage.removeItem('install-prompt-dismissed-until');
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
        // Animate slide up
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      }, 3000);
    };

    // Listen for successful app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('install-prompt-dismissed-until');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [slideAnim]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
      localStorage.removeItem('install-prompt-dismissed-until');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the saved prompt since it can only be used once
    setDeferredPrompt(null);
    animateOut();
  };

  const handleDismiss = () => {
    // Remember user dismissed for 7 days
    const dismissUntil = Date.now() + (DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000);
    localStorage.setItem('install-prompt-dismissed-until', dismissUntil.toString());
    animateOut();
  };

  const animateOut = () => {
    Animated.timing(slideAnim, {
      toValue: 100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowPrompt(false));
  };

  // Don't show on native apps or if already installed
  if (Platform.OS !== 'web' || isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.15)', 'rgba(30, 27, 75, 0.95)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <LinearGradient
            colors={['#7C3AED', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name="download-outline" size={28} color="#FFF" />
          </LinearGradient>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Install Budgetwise AI</Text>
            <Text style={styles.subtitle}>Quick access • Offline mode • Native experience</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={handleInstallClick} 
              style={styles.installButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7C3AED', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.installGradient}
              >
                <Text style={styles.installText}>Install</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDismiss} 
              style={styles.dismissButton}
              activeOpacity={0.6}
            >
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as any,
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  gradient: {
    borderRadius: 20,
    padding: 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 18,
    padding: 16,
    backdropFilter: 'blur(20px)' as any,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  installButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  installGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  installText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dismissButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
