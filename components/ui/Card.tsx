import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { DashboardColors } from '../../constants/Colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'dark';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[
      styles.card,
      variant === 'dark' && styles.darkCard,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DashboardColors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.9)',
  },
});
