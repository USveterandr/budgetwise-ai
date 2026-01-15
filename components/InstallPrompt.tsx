import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useInstall } from '../InstallContext';

export function InstallPrompt() {
  const { showBanner, promptToInstall, isIOS, dismissBanner, isInstalled } = useInstall();
  const slideAnim = React.useRef(new Animated.Value(200)).current;

  useEffect(() => {
    if (showBanner) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showBanner]);

  if (Platform.OS !== 'web' || isInstalled || !showBanner) {
    return null;
  }

  const handleInstallClick = () => {
    if (isIOS) {
      alert('To install on iOS:\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"');
    } else {
      promptToInstall();
    }
  };

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
            <Text style={styles.title}>{isIOS ? "Add to Home Screen" : "Install Budgetwise"}</Text>
            <Text style={styles.subtitle}>
              {isIOS ? "For the best full-screen experience" : "Quick access • Offline mode • Native experience"}
            </Text>
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
                <Text style={styles.installText}>{isIOS ? "How?" : "Install"}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={dismissBanner} 
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
